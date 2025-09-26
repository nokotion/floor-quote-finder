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
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      throw new Error("No Stripe signature found");
    }

    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, Deno.env.get("STRIPE_WEBHOOK_SECRET") || "");
    } catch (err) {
      logStep("Webhook signature verification failed", { error: (err as Error).message });
      return new Response(`Webhook Error: ${(err as Error).message}`, { status: 400 });
    }

    logStep("Event received", { type: event.type, id: event.id });

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Processing checkout session", { sessionId: session.id });

        if (session.metadata?.retailer_id && session.metadata?.credits) {
          const retailerId = session.metadata.retailer_id;
          const credits = parseInt(session.metadata.credits);
          const packageType = session.metadata.package_type;

          logStep("Adding credits to retailer", { retailerId, credits, packageType });

          // Get existing credits or create new record
          const { data: existingCredits } = await supabase
            .from('retailer_lead_credits')
            .select('*')
            .eq('retailer_id', retailerId)
            .single();

          if (existingCredits) {
            // Update existing credits
            await supabase
              .from('retailer_lead_credits')
              .update({
                credits_remaining: existingCredits.credits_remaining + credits,
                last_purchase_date: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq('retailer_id', retailerId);
          } else {
            // Create new credit record
            await supabase
              .from('retailer_lead_credits')
              .insert({
                retailer_id: retailerId,
                credits_remaining: credits,
                credits_used: 0,
                last_purchase_date: new Date().toISOString()
              });
          }

          // Record the transaction
          await supabase
            .from('payment_transactions')
            .insert({
              retailer_id: retailerId,
              amount_cents: session.amount_total || 0,
              currency: session.currency || 'cad',
              payment_type: 'credit_purchase',
              status: 'completed',
              stripe_payment_intent_id: session.payment_intent as string,
              description: `Purchase of ${credits} lead credits (${packageType})`
            });

          logStep("Credits added successfully", { retailerId, newCredits: credits });
        }
        break;

      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        logStep("Payment intent succeeded", { paymentIntentId: paymentIntent.id });

        // Update any existing payment records
        if (paymentIntent.metadata?.retailer_id && paymentIntent.metadata?.lead_id) {
          await supabase
            .from('payment_transactions')
            .update({
              status: 'completed',
              net_amount_cents: paymentIntent.amount_received,
              stripe_fee_cents: paymentIntent.charges.data[0]?.balance_transaction 
                ? (await stripe.balanceTransactions.retrieve(paymentIntent.charges.data[0].balance_transaction as string)).fee
                : null
            })
            .eq('stripe_payment_intent_id', paymentIntent.id);
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        logStep("Payment intent failed", { paymentIntentId: failedPayment.id });

        // Update payment record status
        await supabase
          .from('payment_transactions')
          .update({
            status: 'failed'
          })
          .eq('stripe_payment_intent_id', failedPayment.id);
        break;

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    logStep("ERROR", { message: (error as Error).message, stack: (error as Error).stack });
    return new Response(JSON.stringify({ 
      error: (error as Error).message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});