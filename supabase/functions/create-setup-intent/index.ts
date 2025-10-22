import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, data?: any) => {
  console.log(JSON.stringify({ step, data, timestamp: new Date().toISOString() }));
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    const { retailer_id } = await req.json();
    logStep('create-setup-intent:start', { retailer_id });

    if (!retailer_id) {
      throw new Error('retailer_id is required');
    }

    // Get retailer details
    const { data: retailer, error: retailerError } = await supabaseClient
      .from('retailers')
      .select('id, email, business_name, stripe_customer_id')
      .eq('id', retailer_id)
      .single();

    if (retailerError) {
      logStep('create-setup-intent:retailer-error', { error: retailerError });
      throw new Error('Retailer not found');
    }

    let customerId = retailer.stripe_customer_id;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      logStep('create-setup-intent:creating-customer', { email: retailer.email });
      
      const customer = await stripe.customers.create({
        email: retailer.email,
        name: retailer.business_name,
        metadata: {
          retailer_id: retailer_id,
        },
      });

      customerId = customer.id;
      logStep('create-setup-intent:customer-created', { customer_id: customerId });

      // Update retailer with Stripe customer ID
      await supabaseClient
        .from('retailers')
        .update({ stripe_customer_id: customerId })
        .eq('id', retailer_id);
    }

    // Create Setup Intent
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
      metadata: {
        retailer_id: retailer_id,
      },
    });

    logStep('create-setup-intent:success', { 
      setup_intent_id: setupIntent.id,
      customer_id: customerId 
    });

    return new Response(
      JSON.stringify({
        clientSecret: setupIntent.client_secret,
        customerId: customerId,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    logStep('create-setup-intent:error', { error: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
