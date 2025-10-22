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

    const { payment_method_id, retailer_id } = await req.json();
    logStep('save-payment-method:start', { payment_method_id, retailer_id });

    if (!payment_method_id || !retailer_id) {
      throw new Error('payment_method_id and retailer_id are required');
    }

    // Get payment method details from Stripe
    const paymentMethod = await stripe.paymentMethods.retrieve(payment_method_id);
    logStep('save-payment-method:retrieved', { payment_method_id, card: paymentMethod.card });

    // Check if this is the first payment method for this retailer
    const { data: existingMethods } = await supabaseClient
      .from('payment_methods')
      .select('id')
      .eq('retailer_id', retailer_id);

    const isFirstMethod = !existingMethods || existingMethods.length === 0;

    // If this is the first payment method, set others to non-default
    if (isFirstMethod) {
      await supabaseClient
        .from('payment_methods')
        .update({ is_default: false })
        .eq('retailer_id', retailer_id);
    }

    // Save payment method to database
    const { data: savedMethod, error: saveError } = await supabaseClient
      .from('payment_methods')
      .insert({
        retailer_id: retailer_id,
        stripe_payment_method_id: payment_method_id,
        card_brand: paymentMethod.card?.brand || 'unknown',
        card_last4: paymentMethod.card?.last4 || '0000',
        card_exp_month: paymentMethod.card?.exp_month,
        card_exp_year: paymentMethod.card?.exp_year,
        is_default: isFirstMethod, // First card becomes default
      })
      .select()
      .single();

    if (saveError) {
      logStep('save-payment-method:error', { error: saveError });
      throw new Error('Failed to save payment method');
    }

    logStep('save-payment-method:success', { method_id: savedMethod.id });

    return new Response(
      JSON.stringify({ success: true, payment_method: savedMethod }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    logStep('save-payment-method:error', { error: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
