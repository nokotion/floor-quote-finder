
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';
import { parsePhoneNumber } from "https://esm.sh/libphonenumber-js@1.10.51";

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

  console.log('=== VERIFICATION REQUEST STARTED ===');
  console.log('Request method:', req.method);

  try {
    // Validate request body
    const body = await req.json();
    console.log('Request body received:', JSON.stringify(body, null, 2));

    const { leadId, method, contact }: VerificationRequest = body;

    // Validate required fields
    if (!leadId || !method || !contact) {
      const error = 'Missing required fields: leadId, method, and contact are required';
      console.error('VALIDATION ERROR:', error);
      throw new Error(error);
    }

    if (!['email', 'sms'].includes(method)) {
      const error = 'Invalid verification method. Must be "email" or "sms"';
      console.error('VALIDATION ERROR:', error);
      throw new Error(error);
    }

    // Validate environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('CRITICAL: Missing Supabase configuration');
      throw new Error('Server configuration error - Supabase not configured');
    }

    console.log(`=== PROCESSING ${method.toUpperCase()} VERIFICATION ===`);
    console.log('Lead ID:', leadId);
    console.log('Contact:', contact);
    console.log('Method:', method);

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    let result;
    let verificationToken = null;
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    
    // Send verification based on method
    try {
      if (method === 'email') {
        console.log('=== SENDING EMAIL VERIFICATION ===');
        verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(`Generated email verification token: ${verificationToken}`);
        result = await sendEmailVerification(contact, verificationToken);
        console.log('Email verification sent successfully:', result);
      } else if (method === 'sms') {
        console.log('=== SENDING SMS VERIFICATION ===');
        console.log(`Target phone number: ${contact}`);
        result = await sendSMSVerification(contact);
        console.log('SMS verification sent successfully via Twilio Verify:', result);
        
        if (result && result.status) {
          console.log(`Twilio verification status: ${result.status}, SID: ${result.sid}`);
        }
      }
    } catch (verificationError) {
      console.error(`CRITICAL: Failed to send ${method} verification:`, verificationError);
      console.error('Verification error details:', {
        message: verificationError.message,
        stack: verificationError.stack,
        cause: verificationError.cause
      });
      
      // Return detailed error to frontend
      return new Response(
        JSON.stringify({ 
          success: false,
          error: `Failed to send ${method} verification: ${verificationError.message}`,
          details: verificationError.message.includes('Phone number') ? 
            'Please check your phone number format and try again.' :
            'Please try again or contact support if the issue persists.',
          errorType: 'VERIFICATION_SEND_FAILED'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    // Update lead with verification details
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
    
    console.log('Database update data:', JSON.stringify(updateData, null, 2));
    
    const { data: updateResult, error: updateError } = await supabase
      .from('leads')
      .update(updateData)
      .eq('id', leadId)
      .select();

    if (updateError) {
      console.error('CRITICAL: Database update error:', updateError);
      console.error('Update error details:', {
        code: updateError.code,
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint
      });
      
      // Return partial success with warning
      console.error(`WARNING: ${method} verification was sent successfully but database update failed!`);
      console.error('Manual intervention may be required for lead:', leadId);
      
      return new Response(
        JSON.stringify({ 
          success: true,
          partialFailure: true,
          message: `Verification code sent via ${method}, but there was an issue saving the request`,
          warning: 'Your verification code was sent successfully. If you encounter issues, please contact support.',
          verificationMethod: method,
          errorType: 'DATABASE_UPDATE_FAILED'
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    console.log('=== DATABASE UPDATE SUCCESSFUL ===');
    console.log('Updated lead data:', JSON.stringify(updateResult, null, 2));
    console.log(`=== VERIFICATION FLOW COMPLETED SUCCESSFULLY ===`);
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
    console.error('=== VERIFICATION FLOW FAILED ===');
    console.error('Error in send-verification function:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Verification failed',
        details: 'Please check your information and try again. If the issue persists, contact support.',
        errorType: 'GENERAL_ERROR'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

async function sendEmailVerification(email: string, token: string) {
  console.log(`=== EMAIL VERIFICATION PROCESS ===`);
  console.log(`Target email: ${email}`);
  
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) {
    console.error('CRITICAL: RESEND_API_KEY environment variable not found');
    throw new Error('Email service not configured - missing API key');
  }

  console.log('Resend API key found, preparing email...');

  const emailPayload = {
    from: 'Price My Floor <onboarding@resend.dev>',
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

  console.log('Email payload prepared, sending via Resend API...');

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
      throw new Error(`Email service returned error ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('Email sent successfully via Resend:', result);
    return result;
  } catch (fetchError) {
    console.error('Error calling Resend API:', fetchError);
    throw new Error(`Failed to send email: ${fetchError.message}`);
  }
}

async function sendSMSVerification(phone: string) {
  console.log(`=== SMS VERIFICATION PROCESS ===`);
  console.log(`Target phone number: ${phone}`);
  
  // Check Twilio credentials
  const twilioSid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const twilioAuth = Deno.env.get('TWILIO_AUTH_TOKEN');
  const twilioVerifyServiceSid = Deno.env.get('TWILIO_VERIFY_SERVICE_SID');
  
  console.log('Twilio credentials check:', { 
    hasSid: !!twilioSid, 
    hasAuth: !!twilioAuth, 
    hasServiceSid: !!twilioVerifyServiceSid,
    sidValue: twilioSid ? `${twilioSid.substring(0, 10)}...` : 'MISSING',
    serviceSidValue: twilioVerifyServiceSid ? `${twilioVerifyServiceSid.substring(0, 10)}...` : 'MISSING'
  });
  
  if (!twilioSid || !twilioAuth) {
    console.error('CRITICAL: Missing basic Twilio credentials');
    throw new Error('SMS service not configured - missing Twilio Account SID or Auth Token');
  }
  
  if (!twilioVerifyServiceSid) {
    console.error('CRITICAL: Missing Twilio Verify Service SID');
    throw new Error('SMS service not configured - missing Twilio Verify Service SID. Please create a Verify Service in your Twilio Console.');
  }

  // Format and validate phone number
  const formattedPhone = formatCanadianPhone(phone);
  console.log(`Phone formatting: "${phone}" -> "${formattedPhone}"`);
  
  if (!formattedPhone || formattedPhone === phone) {
    console.log('Phone number formatting may have failed, proceeding with original number');
  }

  // Prepare Twilio API call
  const twilioUrl = `https://verify.twilio.com/v2/Services/${twilioVerifyServiceSid}/Verifications`;
  const requestBody = new URLSearchParams({
    To: formattedPhone,
    Channel: 'sms',
  });

  console.log('Twilio API call details:');
  console.log('URL:', twilioUrl);
  console.log('Phone number being sent:', formattedPhone);
  console.log('Service SID:', twilioVerifyServiceSid);

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
      
      // Parse Twilio error for specific messages
      try {
        const errorData = JSON.parse(errorText);
        const errorCode = errorData.code;
        const errorMessage = errorData.message;
        
        console.error('Parsed Twilio error:', { code: errorCode, message: errorMessage });
        
        // Provide specific error messages for common issues
        if (errorCode === 60200) {
          throw new Error(`Invalid phone number format: ${formattedPhone}. Please ensure the number includes country code.`);
        } else if (errorCode === 60203) {
          throw new Error(`Phone number ${formattedPhone} is not verified. In Twilio trial mode, you can only send SMS to verified numbers.`);
        } else if (errorCode === 20404) {
          throw new Error('Twilio Verify Service not found. Please check your service configuration.');
        } else if (errorCode === 20003) {
          throw new Error('Twilio authentication failed. Please check your Account SID and Auth Token.');
        } else {
          throw new Error(`Twilio error (${errorCode}): ${errorMessage}`);
        }
      } catch (parseError) {
        console.error('Failed to parse Twilio error response:', parseError);
        throw new Error(`SMS service returned error ${response.status}: ${errorText}`);
      }
    }

    const result = await response.json();
    console.log('SMS verification sent successfully via Twilio:', result);
    console.log('Verification SID:', result.sid);
    console.log('Verification status:', result.status);
    return result;
  } catch (fetchError) {
    console.error('Network error calling Twilio API:', fetchError);
    throw new Error(`Failed to send SMS: ${fetchError.message}`);
  }
}

function formatCanadianPhone(phone: string): string {
  console.log(`Formatting phone number: "${phone}"`);
  
  try {
    // Parse the phone number with Canadian default
    const phoneNumber = parsePhoneNumber(phone, 'CA');
    
    if (!phoneNumber) {
      console.log('libphonenumber failed to parse, trying fallback logic');
      return fallbackPhoneFormat(phone);
    }
    
    if (!phoneNumber.isValid()) {
      console.log('Phone number is not valid according to libphonenumber');
      return fallbackPhoneFormat(phone);
    }
    
    // Return E.164 format
    const formatted = phoneNumber.format('E.164');
    console.log('Successfully formatted phone:', phone, '->', formatted);
    return formatted;
  } catch (error) {
    console.error('Error in libphonenumber formatting:', error);
    return fallbackPhoneFormat(phone);
  }
}

function fallbackPhoneFormat(phone: string): string {
  console.log(`Using fallback formatting for: "${phone}"`);
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  console.log('Extracted digits:', digits);
  
  // Handle different digit lengths
  if (digits.length === 10) {
    const formatted = `+1${digits}`;
    console.log('10-digit number formatted to:', formatted);
    return formatted;
  }
  
  if (digits.length === 11 && digits.startsWith('1')) {
    const formatted = `+${digits}`;
    console.log('11-digit number formatted to:', formatted);
    return formatted;
  }
  
  if (digits.length === 12 && digits.startsWith('1')) {
    const formatted = `+${digits}`;
    console.log('12-digit number formatted to:', formatted);
    return formatted;
  }
  
  console.log('Unable to format phone number, returning original:', phone);
  return phone;
}

serve(handler);
