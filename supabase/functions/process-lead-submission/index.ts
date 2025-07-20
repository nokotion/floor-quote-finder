
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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

    const { leadData } = await req.json();
    logStep("Received lead data", { leadId: leadData.id });

    // Parse square footage and calculate price
    const squareFootage = parseSquareFootage(leadData.projectSize || "500");
    const leadPrice = calculateLeadPrice(squareFootage);
    logStep("Calculated lead price", { squareFootage, leadPrice });

    // Find matching retailers based on criteria
    const { data: retailers, error: retailersError } = await supabase
      .from('retailers')
      .select('*')
      .eq('status', 'active');

    if (retailersError) {
      throw new Error(`Failed to fetch retailers: ${retailersError.message}`);
    }

    logStep("Fetched retailers", { count: retailers?.length || 0 });

    // Get brand subscriptions for matching
    const { data: brandSubscriptions, error: brandError } = await supabase
      .from('brand_subscriptions')
      .select('retailer_id, brand_name, min_square_footage, max_square_footage, is_active')
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
        squareFootage >= (sub.min_square_footage || 0) &&
        squareFootage <= (sub.max_square_footage || 999999)
      );

      if (!hasBrandMatch) continue;

      // Check postal code match
      if (!postalCodeMatches(leadData.postalCode, retailer.postal_code_prefixes)) continue;

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

        // Record the distribution
        const { data: distribution, error: distError } = await supabase
          .from('lead_distributions')
          .insert({
            lead_id: leadData.id,
            retailer_id: retailer.id,
            lead_price: leadPrice,
            delivery_time: new Date().toISOString(),
            was_paid: false,
            payment_method: 'pending',
            charge_amount: leadPrice,
            status: 'sent'
          })
          .select()
          .single();

        if (distError) {
          logStep("Error recording distribution", { error: distError.message });
          continue;
        }

        distributionResults.push({
          retailer_id: retailer.id,
          business_name: retailer.business_name,
          was_paid: false,
          charge_amount: leadPrice
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
