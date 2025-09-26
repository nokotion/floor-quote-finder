
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

// Map square footage to sqft_tier enum values
const getSquareFootageTier = (squareFootage: number): string => {
  if (squareFootage <= 100) return '0-100';
  if (squareFootage <= 500) return '100-500';
  if (squareFootage <= 1000) return '500-1000';
  if (squareFootage <= 5000) return '1000-5000';
  return '5000+';
};

// Parse square footage from string like "500-1000" or "1000"
const parseSquareFootage = (sizeString: string): number => {
  // Handle range format like "500-1000"
  const rangeMatch = sizeString.match(/(\d+)-(\d+)/);
  if (rangeMatch) {
    return parseInt(rangeMatch[1]); // Use the lower bound for tier calculation
  }
  
  // Handle single number format
  const match = sizeString.match(/(\d+)/);
  return match ? parseInt(match[1]) : 500; // Default to 500 if parsing fails
};

// Check if postal codes match (first 3 characters) - NOW WITH SAFETY CHECKS
const postalCodeMatches = (leadPostal: string, retailerPrefixes: string[]): boolean => {
  // Safety checks for lead postal code
  if (!leadPostal || typeof leadPostal !== 'string') return false;
  if (!retailerPrefixes || retailerPrefixes.length === 0) return true; // No restrictions
  
  const leadPrefix = leadPostal.substring(0, 3).toUpperCase();
  return retailerPrefixes.some(prefix => {
    // Safety check for each prefix
    if (!prefix || typeof prefix !== 'string') return false;
    return prefix.substring(0, 3).toUpperCase() === leadPrefix;
  });
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

    // CRITICAL INPUT VALIDATION - Added to prevent crashes
    if (!leadData.postalCode || typeof leadData.postalCode !== 'string') {
      logStep("ERROR - Missing postal code", { postalCode: leadData.postalCode });
      return new Response(JSON.stringify({ 
        error: 'Postal code is required for lead matching',
        success: false 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const leadBrand = leadData.brands?.[0] || leadData.brand_requested;
    if (!leadBrand || typeof leadBrand !== 'string') {
      logStep("ERROR - Missing brand", { 
        brands: leadData.brands, 
        brand_requested: leadData.brand_requested 
      });
      return new Response(JSON.stringify({ 
        error: 'Brand selection is required for lead matching',
        success: false 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Parse square footage and determine tier
    const squareFootage = parseSquareFootage(leadData.projectSize || leadData.square_footage?.toString() || "500");
    const sqftTier = getSquareFootageTier(squareFootage);
    const requiresInstallation = leadData.installation_required || false;
    
    logStep("Lead requirements", { 
      squareFootage, 
      sqftTier, 
      brand: leadBrand,
      postalCode: leadData.postalCode,
      requiresInstallation 
    });

    // Find retailers with active brand subscriptions that match lead criteria
    const { data: brandSubscriptions, error: brandError } = await supabase
      .from('brand_subscriptions')
      .select(`
        retailer_id,
        brand_name,
        sqft_tier,
        lead_price,
        accepts_installation,
        installation_surcharge,
        is_active,
        retailers!inner (
          id,
          business_name,
          postal_code_prefixes,
          status
        )
      `)
      .eq('is_active', true)
      .eq('retailers.status', 'active');

    if (brandError) {
      throw new Error(`Failed to fetch brand subscriptions: ${brandError.message}`);
    }

    logStep("Fetched brand subscriptions", { count: brandSubscriptions?.length || 0 });

    // Apply 4-criteria matching logic
    const matchingRetailers = [];
    
    for (const subscription of brandSubscriptions || []) {
      const retailer = subscription.retailers;
      
      // Criterion 1: Brand match
      const brandMatch = subscription.brand_name === leadBrand || 
                        leadBrand === 'No preference - show me options';
      
      // Criterion 2: Square footage tier match
      const sqftMatch = subscription.sqft_tier === sqftTier;
      
      // Criterion 3: Postal code prefix match (NOW SAFE)
      const postalMatch = postalCodeMatches(leadData.postalCode, (retailer as any).postal_code_prefixes);
      
      // Criterion 4: Installation preference match
      const installationMatch = requiresInstallation ? 
        subscription.accepts_installation === true : true;

      logStep("Matching criteria check", {
        retailerId: (retailer as any).id,
        businessName: (retailer as any).business_name,
        brandMatch,
        sqftMatch,
        postalMatch,
        installationMatch,
        subscription: {
          brand: subscription.brand_name,
          tier: subscription.sqft_tier,
          accepts_installation: subscription.accepts_installation
        }
      });

      // All 4 criteria must match
      if (brandMatch && sqftMatch && postalMatch && installationMatch) {
        // Calculate dynamic pricing
        let finalPrice = subscription.lead_price || 0;
        if (requiresInstallation && subscription.accepts_installation) {
          finalPrice += (subscription.installation_surcharge || 0.50);
        }

        matchingRetailers.push({
          retailer_id: (retailer as any).id,
          business_name: (retailer as any).business_name,
          brand_matched: subscription.brand_name,
          lead_price: finalPrice,
          subscription_id: subscription.retailer_id
        });

        logStep("Retailer matched", {
          retailerId: (retailer as any).id,
          businessName: (retailer as any).business_name,
          finalPrice,
          installationSurcharge: requiresInstallation ? (subscription.installation_surcharge || 0.50) : 0
        });
      }
    }

    logStep("Matching completed", { totalMatches: matchingRetailers.length });

    // Limit to 10 retailers and create distributions
    const selectedRetailers = matchingRetailers.slice(0, 10);
    const distributionResults = [];

    for (const match of selectedRetailers) {
      try {
        logStep("Creating distribution", { 
          retailerId: match.retailer_id, 
          businessName: match.business_name,
          leadPrice: match.lead_price
        });

        // Record the distribution
        const { data: distribution, error: distError } = await supabase
          .from('lead_distributions')
          .insert({
            lead_id: leadData.id,
            retailer_id: match.retailer_id,
            lead_price: match.lead_price,
            delivery_time: new Date().toISOString(),
            sent_at: new Date().toISOString(),
            was_paid: false,
            payment_method: 'pending',
            charge_amount: match.lead_price,
            status: 'sent',
            brand_matched: match.brand_matched,
            distribution_method: 'automated'
          })
          .select()
          .single();

        if (distError) {
          logStep("Error recording distribution", { error: distError.message });
          continue;
        }

        distributionResults.push({
          retailer_id: match.retailer_id,
          business_name: match.business_name,
          was_paid: false,
          charge_amount: match.lead_price,
          brand_matched: match.brand_matched,
          installation_surcharge_applied: requiresInstallation
        });

      } catch (retailerError) {
        logStep("Error processing retailer", { 
          retailerId: match.retailer_id, 
          error: (retailerError as Error).message 
        });
      }
    }

    logStep("Lead processing completed", { 
      distributionsCreated: distributionResults.length,
      totalRetailersProcessed: selectedRetailers.length,
      matchingCriteria: {
        brand: leadBrand,
        sqftTier,
        postalCode: leadData.postalCode,
        requiresInstallation
      }
    });

    return new Response(JSON.stringify({
      success: true,
      lead_id: leadData.id,
      distributions_created: distributionResults.length,
      retailers_notified: distributionResults,
      total_matching_retailers: matchingRetailers.length,
      matching_criteria: {
        brand: leadBrand,
        square_footage_tier: sqftTier,
        postal_code_prefix: leadData.postalCode ? leadData.postalCode.substring(0, 3) : 'unknown',
        requires_installation: requiresInstallation
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    logStep("ERROR", { message: (error as Error).message, stack: (error as Error).stack });
    return new Response(JSON.stringify({ 
      error: (error as Error).message,
      success: false 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
