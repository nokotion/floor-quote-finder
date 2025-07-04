import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROCESS-LEAD] ${step}${detailsStr}`);
};

// Calculate lead price based on square footage
const calculateLeadPrice = (squareFootage: number): number => {
  if (squareFootage <= 100) return 1.00;
  if (squareFootage <= 500) return 2.50;
  if (squareFootage <= 1000) return 3.50;
  if (squareFootage <= 5000) return 5.00;
  return 10.00;
};

// Parse square footage from string like "500 sq ft" or "1000-2000 sq ft"
const parseSquareFootage = (sizeString: string): number => {
  const match = sizeString.match(/(\d+)/);
  return match ? parseInt(match[1]) : 500; // Default to 500 if parsing fails
};

// Check if postal codes match (first 3 characters)
const postalCodeMatches = (leadPostal: string, retailerPrefixes: string[]): boolean => {
  if (!retailerPrefixes || retailerPrefixes.length === 0) return true; // No restrictions
  const leadPrefix = leadPostal.substring(0, 3).toUpperCase();
  return retailerPrefixes.some(prefix => prefix.substring(0, 3).toUpperCase() === leadPrefix);
};

// Check installation preference match
const installationMatches = (leadInstallation: string, retailerPref: string): boolean => {
  if (retailerPref === 'both') return true;
  if (retailerPref === 'supply_only' && leadInstallation === 'supply-only') return true;
  if (retailerPref === 'supply_and_install' && leadInstallation === 'supply-and-install') return true;
  return false;
};

// Check urgency preference match
const urgencyMatches = (leadTimeline: string, retailerPref: string): boolean => {
  if (retailerPref === 'any') return true;
  if (retailerPref === 'asap_only' && leadTimeline === 'As soon as possible') return true;
  if (retailerPref === 'flexible' && leadTimeline !== 'As soon as possible') return true;
  return false;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Initialize Supabase with service role for full access
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const { leadData } = await req.json();
    logStep("Received lead data", { leadId: leadData.id });

    // Parse square footage and calculate price
    const squareFootage = parseSquareFootage(leadData.projectSize || "500");
    const leadPrice = calculateLeadPrice(squareFootage);
    logStep("Calculated lead price", { squareFootage, leadPrice });

    // Find matching retailers based on criteria
    const { data: retailers, error: retailersError } = await supabase
      .from('retailers')
      .select(`
        id,
        business_name,
        email,
        contact_name,
        postal_code_prefixes,
        installation_preference,
        urgency_preference,
        stripe_customer_id,
        status
      `)
      .eq('status', 'active');

    if (retailersError) {
      throw new Error(`Failed to fetch retailers: ${retailersError.message}`);
    }

    logStep("Fetched retailers", { count: retailers?.length || 0 });

    // Get brand subscriptions for matching
    const { data: brandSubscriptions, error: brandError } = await supabase
      .from('brand_subscriptions')
      .select('retailer_id, brand_name, sqft_tier_min, sqft_tier_max, is_active')
      .eq('is_active', true);

    if (brandError) {
      throw new Error(`Failed to fetch brand subscriptions: ${brandError.message}`);
    }

    // Filter retailers based on matching criteria
    const matchingRetailers = [];
    
    for (const retailer of retailers || []) {
      // Check brand subscription match
      const hasBrandMatch = brandSubscriptions?.some(sub => 
        sub.retailer_id === retailer.id &&
        (sub.brand_name === leadData.brands?.[0] || leadData.brands?.includes('No preference - show me options')) &&
        squareFootage >= (sub.sqft_tier_min || 0) &&
        squareFootage <= (sub.sqft_tier_max || 999999)
      );

      if (!hasBrandMatch) continue;

      // Check postal code match
      if (!postalCodeMatches(leadData.postalCode, retailer.postal_code_prefixes)) continue;

      // Check installation preference match
      if (!installationMatches(leadData.installationType, retailer.installation_preference)) continue;

      // Check urgency preference match
      if (!urgencyMatches(leadData.timeline, retailer.urgency_preference)) continue;

      matchingRetailers.push(retailer);
    }

    logStep("Found matching retailers", { count: matchingRetailers.length });

    // Limit to 10 retailers
    const selectedRetailers = matchingRetailers.slice(0, 10);
    const distributionResults = [];

    // Process each selected retailer
    for (const retailer of selectedRetailers) {
      try {
        logStep("Processing retailer", { retailerId: retailer.id, businessName: retailer.business_name });

        // Check if retailer has credits
        const { data: creditData } = await supabase
          .from('retailer_lead_credits')
          .select('*')
          .eq('retailer_id', retailer.id)
          .single();

        let paymentMethod = 'stripe';
        let wasPaid = false;
        let chargeAmount = leadPrice;
        let stripePaymentIntentId = null;

        // If retailer has credits, use them
        if (creditData && creditData.credits_remaining > 0) {
          logStep("Using credit for retailer", { retailerId: retailer.id, creditsRemaining: creditData.credits_remaining });
          
          // Deduct credit
          await supabase
            .from('retailer_lead_credits')
            .update({
              credits_remaining: creditData.credits_remaining - 1,
              credits_used: creditData.credits_used + 1,
              updated_at: new Date().toISOString()
            })
            .eq('retailer_id', retailer.id);

          paymentMethod = 'credit';
          wasPaid = true;
          chargeAmount = 0;

        } else if (retailer.stripe_customer_id) {
          // Charge retailer via Stripe
          logStep("Charging retailer via Stripe", { retailerId: retailer.id, amount: leadPrice });

          try {
            const paymentIntent = await stripe.paymentIntents.create({
              amount: Math.round(leadPrice * 100), // Convert to cents
              currency: 'cad',
              customer: retailer.stripe_customer_id,
              confirm: true,
              payment_method_types: ['card'],
              description: `Lead for ${leadData.customer_name} - ${squareFootage} sq ft`,
              metadata: {
                retailer_id: retailer.id,
                lead_id: leadData.id,
                square_footage: squareFootage.toString()
              }
            });

            if (paymentIntent.status === 'succeeded') {
              wasPaid = true;
              stripePaymentIntentId = paymentIntent.id;
              logStep("Stripe payment successful", { paymentIntentId: paymentIntent.id });
            } else {
              logStep("Stripe payment failed", { status: paymentIntent.status });
              continue; // Skip this retailer
            }

          } catch (stripeError) {
            logStep("Stripe payment error", { error: stripeError.message });
            continue; // Skip this retailer
          }

        } else {
          logStep("Retailer has no payment method", { retailerId: retailer.id });
          continue; // Skip this retailer
        }

        // Record the distribution
        const { data: distribution, error: distError } = await supabase
          .from('lead_distributions')
          .insert({
            lead_id: leadData.id,
            retailer_id: retailer.id,
            lead_price: leadPrice,
            delivery_time: new Date().toISOString(),
            was_paid: wasPaid,
            payment_method: paymentMethod,
            charge_amount: chargeAmount,
            stripe_payment_intent_id: stripePaymentIntentId,
            status: 'sent'
          })
          .select()
          .single();

        if (distError) {
          logStep("Error recording distribution", { error: distError.message });
          continue;
        }

        // Send email to retailer with lead details
        try {
          await supabase.functions.invoke('send-lead-email', {
            body: {
              retailerEmail: retailer.email,
              retailerName: retailer.contact_name,
              leadData: leadData,
              paymentMethod: paymentMethod,
              chargeAmount: chargeAmount
            }
          });
          logStep("Email sent to retailer", { retailerId: retailer.id });
        } catch (emailError) {
          logStep("Email sending failed", { error: emailError });
        }

        distributionResults.push({
          retailer_id: retailer.id,
          business_name: retailer.business_name,
          payment_method: paymentMethod,
          was_paid: wasPaid,
          charge_amount: chargeAmount
        });

      } catch (retailerError) {
        logStep("Error processing retailer", { retailerId: retailer.id, error: retailerError.message });
      }
    }

    logStep("Lead processing completed", { 
      distributionsCreated: distributionResults.length,
      totalRetailersProcessed: selectedRetailers.length 
    });

    return new Response(JSON.stringify({
      success: true,
      lead_id: leadData.id,
      distributions_created: distributionResults.length,
      retailers_notified: distributionResults,
      total_matching_retailers: matchingRetailers.length
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    logStep("ERROR", { message: error.message, stack: error.stack });
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});