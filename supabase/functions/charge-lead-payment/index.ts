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

    const { retailer_id, lead_id, amount, distribution_id } = await req.json();
    logStep('charge-lead-payment:start', { retailer_id, lead_id, amount, distribution_id });

    if (!retailer_id || !lead_id || !amount || !distribution_id) {
      throw new Error('Missing required parameters');
    }

    // Step 1: Check retailer credits
    const { data: creditData, error: creditError } = await supabaseClient
      .from('retailer_lead_credits')
      .select('*')
      .eq('retailer_id', retailer_id)
      .single();

    if (creditError && creditError.code !== 'PGRST116') {
      logStep('charge-lead-payment:credit-check-error', { error: creditError });
    }

    const hasCredits = creditData && creditData.credits_remaining > 0;
    logStep('charge-lead-payment:credit-check', { 
      has_credits: hasCredits, 
      credits_remaining: creditData?.credits_remaining 
    });

    let paymentMethod = 'credits';
    let stripePaymentIntentId = null;
    let wasPaid = false;
    let chargeAmount = amount;

    if (hasCredits) {
      // Use credits
      logStep('charge-lead-payment:using-credits', { credits_before: creditData.credits_remaining });

      const { error: updateError } = await supabaseClient
        .from('retailer_lead_credits')
        .update({
          credits_remaining: creditData.credits_remaining - 1,
          credits_used: creditData.credits_used + 1,
        })
        .eq('retailer_id', retailer_id);

      if (updateError) {
        logStep('charge-lead-payment:credit-deduction-failed', { error: updateError });
        throw new Error('Failed to deduct credits');
      }

      paymentMethod = 'credits';
      wasPaid = true;

      // Record transaction
      await supabaseClient.from('payment_transactions').insert({
        retailer_id,
        lead_id,
        amount_cents: Math.round(amount * 100),
        payment_type: 'credit_deduction',
        status: 'completed',
        description: `Lead credit used for lead ${lead_id.substring(0, 8)}`,
      });

    } else {
      // No credits, charge card
      logStep('charge-lead-payment:no-credits-charging-card');

      // Get default payment method
      const { data: paymentMethodData, error: pmError } = await supabaseClient
        .from('payment_methods')
        .select('*')
        .eq('retailer_id', retailer_id)
        .eq('is_default', true)
        .single();

      if (pmError || !paymentMethodData) {
        logStep('charge-lead-payment:no-payment-method', { error: pmError });
        
        // No payment method, mark as unpaid but still distribute
        await supabaseClient
          .from('lead_distributions')
          .update({ 
            was_paid: false,
            payment_method: 'none',
            status: 'payment_pending'
          })
          .eq('id', distribution_id);

        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'No payment method available',
            was_paid: false 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get retailer's Stripe customer ID
      const { data: retailer, error: retailerError } = await supabaseClient
        .from('retailers')
        .select('stripe_customer_id, business_name')
        .eq('id', retailer_id)
        .single();

      if (retailerError || !retailer.stripe_customer_id) {
        throw new Error('Retailer Stripe customer not found');
      }

      // Create Payment Intent
      logStep('charge-lead-payment:creating-payment-intent', { 
        amount_cents: Math.round(amount * 100),
        customer: retailer.stripe_customer_id 
      });

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'cad',
        customer: retailer.stripe_customer_id,
        payment_method: paymentMethodData.stripe_payment_method_id,
        off_session: true,
        confirm: true,
        description: `Lead payment for ${retailer.business_name}`,
        metadata: {
          retailer_id,
          lead_id,
          distribution_id,
        },
      });

      logStep('charge-lead-payment:payment-intent-created', { 
        payment_intent_id: paymentIntent.id,
        status: paymentIntent.status 
      });

      stripePaymentIntentId = paymentIntent.id;
      paymentMethod = 'card';
      wasPaid = paymentIntent.status === 'succeeded';

      // Record transaction
      await supabaseClient.from('payment_transactions').insert({
        retailer_id,
        lead_id,
        amount_cents: Math.round(amount * 100),
        payment_type: 'lead_payment',
        status: wasPaid ? 'completed' : 'pending',
        stripe_payment_intent_id: paymentIntent.id,
        description: `Lead payment for lead ${lead_id.substring(0, 8)}`,
      });
    }

    // Update lead distribution with payment info
    await supabaseClient
      .from('lead_distributions')
      .update({
        was_paid: wasPaid,
        payment_method: paymentMethod,
        stripe_payment_intent_id: stripePaymentIntentId,
        charge_amount: chargeAmount,
        status: wasPaid ? 'sent' : 'payment_failed'
      })
      .eq('id', distribution_id);

    logStep('charge-lead-payment:success', { 
      was_paid: wasPaid, 
      payment_method: paymentMethod 
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        was_paid: wasPaid,
        payment_method: paymentMethod,
        stripe_payment_intent_id: stripePaymentIntentId 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    logStep('charge-lead-payment:error', { error: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
