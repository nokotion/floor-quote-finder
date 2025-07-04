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
  console.log(`[PURCHASE-CREDITS] ${step}${detailsStr}`);
};

// Lead credit packages
const CREDIT_PACKAGES = {
  '100': { credits: 100, price: 200, name: '100 Lead Credits' },
  '200': { credits: 200, price: 380, name: '200 Lead Credits' },
  '500': { credits: 500, price: 800, name: '500 Lead Credits' }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Create Supabase client using anon key for user authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Create service client for database writes
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Authenticate user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    logStep("User authenticated", { userId: user.id, email: user.email });

    const { packageType } = await req.json();

    if (!CREDIT_PACKAGES[packageType as keyof typeof CREDIT_PACKAGES]) {
      throw new Error("Invalid package type");
    }

    const selectedPackage = CREDIT_PACKAGES[packageType as keyof typeof CREDIT_PACKAGES];
    logStep("Package selected", selectedPackage);

    // Get retailer profile
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('retailer_id')
      .eq('id', user.id)
      .single();

    if (!profile?.retailer_id) {
      throw new Error("No retailer profile found");
    }

    // Get retailer information
    const { data: retailer } = await supabaseService
      .from('retailers')
      .select('*')
      .eq('id', profile.retailer_id)
      .single();

    if (!retailer) {
      throw new Error("Retailer not found");
    }

    logStep("Retailer found", { retailerId: retailer.id, businessName: retailer.business_name });

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check if customer exists, create if not
    let customerId = retailer.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: retailer.email,
        name: retailer.business_name,
        metadata: {
          retailer_id: retailer.id,
          business_name: retailer.business_name
        }
      });
      
      customerId = customer.id;
      
      // Update retailer with Stripe customer ID
      await supabaseService
        .from('retailers')
        .update({ stripe_customer_id: customerId })
        .eq('id', retailer.id);
        
      logStep("Created Stripe customer", { customerId });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "cad",
            product_data: { 
              name: selectedPackage.name,
              description: `${selectedPackage.credits} lead credits for ${retailer.business_name}`
            },
            unit_amount: selectedPackage.price * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/retailer/credits?success=true&credits=${selectedPackage.credits}`,
      cancel_url: `${req.headers.get("origin")}/retailer/credits?cancelled=true`,
      metadata: {
        retailer_id: retailer.id,
        package_type: packageType,
        credits: selectedPackage.credits.toString(),
        user_id: user.id
      }
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ 
      url: session.url,
      package: selectedPackage
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    logStep("ERROR", { message: error.message });
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});