import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerificationRequest {
  leadId: string;
  method: 'email' | 'sms';
  contact: string; // email address or phone number
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('Verification request received:', req.method);

  try {
    // Validate request body
    const body = await req.json();
    console.log('Request body:', JSON.stringify(body, null, 2));

    const { leadId, method, contact }: VerificationRequest = body;

    // Validate required fields
    if (!leadId || !method || !contact) {
      throw new Error('Missing required fields: leadId, method, and contact are required');
    }

    if (!['email', 'sms'].includes(method)) {
      throw new Error('Invalid verification method. Must be "email" or "sms"');
    }

    // Validate environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase configuration');
      throw new Error('Server configuration error');
    }

    console.log(`Processing ${method} verification for lead ${leadId} to ${contact}`);

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    let result;
    let verificationToken = null;
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    
    // Send verification first, then update database
    try {
      if (method === 'email') {
        // For email, we generate our own token
        verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(`Generated email verification token: ${verificationToken}`);
        result = await sendEmailVerification(contact, verificationToken);
        console.log('Email verification sent successfully:', result);
      } else if (method === 'sms') {
        // For SMS, use Twilio Verify service
        console.log(`Sending SMS verification to: ${contact}`);
        result = await sendSMSVerification(contact);
        console.log('SMS verification sent successfully via Twilio:', result);
        
        // Log important Twilio response details
        if (result && result.status) {
          console.log(`Twilio verification status: ${result.status}, SID: ${result.sid}`);
        }
      }
    } catch (verificationError) {
      console.error(`CRITICAL: Failed to send ${method} verification:`, verificationError);
      console.error('Verification error stack:', verificationError.stack);
      throw new Error(`Failed to send ${method} verification: ${verificationError.message}`);
    }

    // Update lead with verification details - this is critical for the verification flow
    console.log('=== UPDATING LEAD DATABASE RECORD ===');
    console.log('Lead ID:', leadId);
    console.log('Verification method:', method);
    console.log('Verification token (email only):', verificationToken);
    console.log('Expires at:', expiresAt.toISOString());
    
    const updateData = {
      verification_token: verificationToken, // Only set for email
      verification_method: method,
      verification_sent_at: new Date().toISOString(),
      verification_expires_at: expiresAt.toISOString(),
      status: 'pending_verification'
    };
    
    console.log('Update data:', JSON.stringify(updateData, null, 2));
    
    const { data: updateResult, error: updateError } = await supabase
      .from('leads')
      .update(updateData)
      .eq('id', leadId)
      .select(); // Add select to see what was updated

    if (updateError) {
      console.error('CRITICAL: Database update error:', updateError);
      console.error('Update error details:', {
        code: updateError.code,
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint
      });
      
      // Even if DB update fails, if verification was sent successfully, 
      // we should inform user and log the issue for manual intervention
      console.error(`WARNING: ${method} verification was sent successfully but database update failed!`);
      console.error('Manual intervention may be required for lead:', leadId);
      
      // Return success with partial failure indicator instead of throwing error
      return new Response(
        JSON.stringify({ 
          success: true,
          partialFailure: true,
          message: `Verification code sent via ${method}, but database update failed`,
          warning: 'Please retry verification if you do not receive the code',
          verificationMethod: method,
          dbError: updateError.message
        }),
        {
          status: 200, // Return 200 because verification was sent successfully
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    console.log('=== DATABASE UPDATE SUCCESSFUL ===');
    console.log('Updated lead data:', JSON.stringify(updateResult, null, 2));
    console.log(`Verification sent successfully via ${method} to ${contact}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Verification code sent via ${method}`,
        expiresAt: expiresAt.toISOString(),
        verificationMethod: method
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
    console.error('Error in send-verification function:', error);
    console.error('Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Check edge function logs for more information'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

async function sendEmailVerification(email: string, token: string) {
  console.log(`Attempting to send email verification to: ${email}`);
  
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) {
    console.error('RESEND_API_KEY environment variable not found');
    throw new Error('RESEND_API_KEY not configured');
  }

  console.log('Resend API key found, sending email...');

  const emailPayload = {
    from: 'Price My Floor <onboarding@resend.dev>', // Using verified domain
    to: [email],
    subject: 'Verify Your Quote Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Verify Your Quote Request</h2>
        <p>Thank you for submitting your flooring quote request!</p>
        <p>To complete your submission, please enter this verification code:</p>
        <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="font-size: 36px; color: #EA580C; margin: 0; letter-spacing: 5px;">${token}</h1>
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this quote, you can safely ignore this email.</p>
        <hr style="margin: 30px 0;">
        <p style="color: #666; font-size: 14px;">
          Price My Floor - Connecting you with verified flooring retailers
        </p>
      </div>
    `,
  };

  console.log('Email payload prepared:', JSON.stringify(emailPayload, null, 2));

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    console.log(`Resend API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Resend API error response:', errorText);
      throw new Error(`Resend API returned ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('Email sent successfully via Resend:', result);
    return result;
  } catch (fetchError) {
    console.error('Error calling Resend API:', fetchError);
    throw new Error(`Network error sending email: ${fetchError.message}`);
  }
}

async function sendSMSVerification(phone: string) {
  console.log(`Attempting to send SMS verification to: ${phone}`);
  
  const twilioSid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const twilioAuth = Deno.env.get('TWILIO_AUTH_TOKEN');
  const twilioVerifyServiceSid = Deno.env.get('TWILIO_VERIFY_SERVICE_SID');
  
  console.log('Twilio environment check:', { 
    hasSid: !!twilioSid, 
    hasAuth: !!twilioAuth, 
    hasServiceSid: !!twilioVerifyServiceSid,
    sidValue: twilioSid ? `${twilioSid.substring(0, 10)}...` : 'missing',
    serviceSidValue: twilioVerifyServiceSid ? `${twilioVerifyServiceSid.substring(0, 10)}...` : 'missing'
  });
  
  if (!twilioSid || !twilioAuth) {
    console.error('Missing basic Twilio credentials');
    throw new Error('Twilio Account SID and Auth Token must be configured');
  }
  
  if (!twilioVerifyServiceSid) {
    console.error('Missing Twilio Verify Service SID - this needs to be created in Twilio Console');
    throw new Error('Twilio Verify Service not configured. Please create a Verify Service in your Twilio Console and add the Service SID to your secrets.');
  }

  // Format phone number for Canadian numbers
  const formattedPhone = formatCanadianPhone(phone);
  console.log(`Original phone: ${phone}, Formatted phone: ${formattedPhone}`);

  const twilioUrl = `https://verify.twilio.com/v2/Services/${twilioVerifyServiceSid}/Verifications`;
  const requestBody = new URLSearchParams({
    To: formattedPhone,
    Channel: 'sms',
  });

  console.log(`Calling Twilio API: ${twilioUrl}`);
  console.log(`Request body: ${requestBody.toString()}`);

  try {
    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${twilioSid}:${twilioAuth}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: requestBody,
    });

    console.log(`Twilio API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Twilio API error response:', errorText);
      
      // Try to parse Twilio error for more specific messages
      try {
        const errorData = JSON.parse(errorText);
        const errorCode = errorData.code;
        const errorMessage = errorData.message;
        
        console.error('Parsed Twilio error:', { code: errorCode, message: errorMessage });
        
        // Provide specific error messages for common issues
        if (errorCode === 60200) {
          throw new Error(`Invalid phone number format: ${formattedPhone}. Please ensure the number includes country code (+1 for Canada/US).`);
        } else if (errorCode === 60203) {
          throw new Error(`Phone number ${formattedPhone} is not verified. In trial mode, you can only send SMS to verified numbers. Please verify this number in your Twilio Console.`);
        } else if (errorCode === 20404) {
          throw new Error('Twilio Verify Service not found. Please check your TWILIO_VERIFY_SERVICE_SID.');
        } else {
          throw new Error(`Twilio error (${errorCode}): ${errorMessage}`);
        }
      } catch (parseError) {
        throw new Error(`Twilio API returned ${response.status}: ${errorText}`);
      }
    }

    const result = await response.json();
    console.log('SMS verification sent successfully via Twilio:', result);
    return result;
  } catch (fetchError) {
    console.error('Error calling Twilio API:', fetchError);
    throw new Error(`Network error sending SMS: ${fetchError.message}`);
  }
}

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