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
    console.log('=== VERIFY LEAD REQUEST START ===');
    const { leadId, token }: VerifyRequest = await req.json();
    console.log('Request data:', { leadId, token: `${token.substring(0, 3)}...` });

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the lead with verification details
    console.log('Fetching lead from database...');
    const { data: lead, error: fetchError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (fetchError || !lead) {
      console.error('Lead not found:', { leadId, fetchError });
      return new Response(
        JSON.stringify({ error: 'Lead not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log('Lead found:', {
      id: lead.id,
      status: lead.status,
      is_verified: lead.is_verified,
      verification_method: lead.verification_method,
      verification_sent_at: lead.verification_sent_at,
      verification_expires_at: lead.verification_expires_at,
      has_verification_token: !!lead.verification_token
    });

    // Check if already verified
    if (lead.is_verified) {
      console.log('Lead already verified');
      return new Response(
        JSON.stringify({ success: true, message: 'Lead already verified' }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Check if verification has expired
    const now = new Date();
    const expiresAt = new Date(lead.verification_expires_at);
    console.log('Time check:', { now: now.toISOString(), expiresAt: expiresAt.toISOString() });
    
    if (now > expiresAt) {
      console.log('Verification expired, updating status');
      await supabase
        .from('leads')
        .update({ status: 'expired' })
        .eq('id', leadId);

      return new Response(
        JSON.stringify({ error: 'Verification code has expired' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Handle cases where verification_method might be null but we can infer it
    let verificationMethod = lead.verification_method;
    if (!verificationMethod) {
      console.warn('Verification method is null, attempting to infer from contact info');
      if (lead.customer_phone && !lead.customer_email) {
        verificationMethod = 'sms';
        console.log('Inferred verification method as SMS based on phone presence');
      } else if (lead.customer_email) {
        verificationMethod = 'email';
        console.log('Inferred verification method as email based on email presence');
      } else {
        console.error('Cannot determine verification method');
        return new Response(
          JSON.stringify({ error: 'Verification method not found. Please request a new verification code.' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }
    }

    console.log(`Processing ${verificationMethod} verification...`);

    // Verify the token based on verification method
    if (verificationMethod === 'sms') {
      // Check for TEST_MODE
      const testMode = Deno.env.get('TEST_MODE') === 'true';
      if (testMode) {
        console.log('TEST_MODE: Accepting any 6-digit code for SMS verification');
        if (!/^\d{6}$/.test(token)) {
          return new Response(
            JSON.stringify({ error: 'Invalid verification code format. Must be 6 digits.' }),
            { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }
        console.log('✅ TEST_MODE SMS verification successful!');
      } else {
        // Use Twilio Verify for SMS verification
        const twilioSid = Deno.env.get('TWILIO_ACCOUNT_SID');
        const twilioAuth = Deno.env.get('TWILIO_AUTH_TOKEN');
        const twilioVerifyServiceSid = Deno.env.get('TWILIO_VERIFY_SERVICE_SID');
        
        if (!twilioSid || !twilioAuth || !twilioVerifyServiceSid) {
          console.error('Missing Twilio credentials');
          throw new Error('Twilio credentials not configured');
        }

        // Format phone number for verification check
        const formattedPhone = formatCanadianPhone(lead.customer_phone || '');
        console.log(`Verifying SMS code for phone: ${formattedPhone}`);

        const verifyResponse = await fetch(
          `https://verify.twilio.com/v2/Services/${twilioVerifyServiceSid}/VerificationCheck`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${btoa(`${twilioSid}:${twilioAuth}`)}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              To: formattedPhone,
              Code: token,
            }),
          }
        );

        console.log(`Twilio verification check response status: ${verifyResponse.status}`);

        if (!verifyResponse.ok) {
          const errorText = await verifyResponse.text();
          console.error('Twilio verification error:', errorText);
          
          // Try to parse error for more details
          try {
            const errorData = JSON.parse(errorText);
            console.error('Parsed Twilio error:', errorData);
          } catch (parseError) {
            console.error('Could not parse Twilio error response');
          }
          
          return new Response(
            JSON.stringify({ error: 'Failed to verify code with Twilio' }),
            { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }

        const verifyResult = await verifyResponse.json();
        console.log('Twilio verification check response:', verifyResult);
        
        if (verifyResult.status !== 'approved') {
          console.log(`Verification failed - status: ${verifyResult.status}`);
          return new Response(
            JSON.stringify({ error: 'Invalid verification code' }),
            { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }
        
        console.log('✅ SMS verification successful!');
      }
    } else {
      // For email verification, use the stored token
      console.log('Comparing email tokens...');
      console.log('Stored token:', lead.verification_token ? `${lead.verification_token.substring(0, 3)}...` : 'null');
      console.log('Provided token:', `${token.substring(0, 3)}...`);
      
      if (lead.verification_token !== token) {
        console.log('❌ Email token mismatch');
        return new Response(
          JSON.stringify({ error: 'Invalid verification code' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }
      
      console.log('✅ Email verification successful!');
    }

    // Mark as verified
    console.log('=== MARKING LEAD AS VERIFIED ===');
    const { data: updateResult, error: updateError } = await supabase
      .from('leads')
      .update({
        is_verified: true,
        status: 'verified',
        verification_token: null, // Clear the token for security
      })
      .eq('id', leadId)
      .select();

    if (updateError) {
      console.error('Failed to update lead verification status:', updateError);
      throw new Error(`Failed to verify lead: ${updateError.message}`);
    }

    console.log('Lead successfully marked as verified:', updateResult);

    // Now process the verified lead by calling the process-lead-submission function
    console.log('=== PROCESSING VERIFIED LEAD ===');
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

    console.log(`=== VERIFICATION COMPLETE ===`);
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

function formatCanadianPhone(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // If it's 10 digits, assume it's Canadian and add +1
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  
  // If it's 11 digits and starts with 1, format as North American
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  
  // Return as-is if already formatted or different format
  return phone.startsWith('+') ? phone : `+${digits}`;
}

serve(handler);