import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyRequest {
  leadId: string;
  token: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { leadId, token }: VerifyRequest = await req.json();

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the lead with verification details
    const { data: lead, error: fetchError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (fetchError || !lead) {
      return new Response(
        JSON.stringify({ error: 'Lead not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Check if already verified
    if (lead.is_verified) {
      return new Response(
        JSON.stringify({ success: true, message: 'Lead already verified' }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Check if verification has expired
    const now = new Date();
    const expiresAt = new Date(lead.verification_expires_at);
    
    if (now > expiresAt) {
      await supabase
        .from('leads')
        .update({ status: 'expired' })
        .eq('id', leadId);

      return new Response(
        JSON.stringify({ error: 'Verification code has expired' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Check if token matches
    if (lead.verification_token !== token) {
      return new Response(
        JSON.stringify({ error: 'Invalid verification code' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Mark as verified
    const { error: updateError } = await supabase
      .from('leads')
      .update({
        is_verified: true,
        status: 'verified',
        verification_token: null, // Clear the token for security
      })
      .eq('id', leadId);

    if (updateError) {
      throw new Error(`Failed to verify lead: ${updateError.message}`);
    }

    // Now process the verified lead by calling the process-lead-submission function
    try {
      const { data: processResult, error: processError } = await supabase.functions.invoke('process-lead-submission', {
        body: {
          leadData: {
            ...lead,
            is_verified: true,
            status: 'verified'
          }
        }
      });

      if (processError) {
        console.error('Error processing verified lead:', processError);
        // Don't return error to user since verification was successful
      } else {
        console.log('Lead processing result:', processResult);
      }
    } catch (processError) {
      console.error('Error invoking process-lead-submission:', processError);
      // Don't return error to user since verification was successful
    }

    console.log(`Lead ${leadId} verified successfully and processing initiated`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Verification successful! Your quote request is now being processed.',
        leadId: leadId
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error('Error in verify-lead function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);