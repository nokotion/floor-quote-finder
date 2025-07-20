
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { email, phone, method } = await req.json();

    if (!email || !phone || !method) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields: email, phone, method' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log("Creating temporary lead for verification:", {
      customer_email: email,
      customer_phone: phone,
      verification_method: method
    });

    // Insert temporary lead using admin client (bypasses RLS)
    const { data: leadData, error: leadError } = await supabaseAdmin
      .from('leads')
      .insert([{
        customer_name: 'TEMP_VERIFICATION',
        customer_email: email,
        customer_phone: phone,
        postal_code: 'TEMP',
        status: 'pending_verification',
        is_verified: false,
        verification_method: method,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (leadError) {
      console.error('Lead creation error:', leadError);
      return new Response(
        JSON.stringify({ success: false, error: leadError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Temporary lead created successfully:', leadData.id);

    return new Response(
      JSON.stringify({ success: true, leadId: leadData.id }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Unexpected error in insert-temp-lead:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
