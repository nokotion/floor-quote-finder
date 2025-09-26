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
  contact: string;
}

// Timeout wrapper for external API calls
async function withTimeout<T>(
  promise: Promise<T>, 
  timeoutMs: number = 10000,
  timeoutMessage: string = 'Operation timed out'
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
  });
  
  return Promise.race([promise, timeoutPromise]);
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] Verification request started`);

  try {
    // Add timeout for request body parsing
    const body = await withTimeout(
      req.json(), 
      5000, 
      'Request body parsing timed out'
    );
    
    console.log(`[${requestId}] Request body:`, JSON.stringify(body, null, 2));

    const { leadId, method, contact }: VerificationRequest = body;

    // Validate required fields
    if (!leadId || !method || !contact) {
      const error = 'Missing required fields: leadId, method, and contact are required';
      console.error(`[${requestId}] Validation error:`, error);
      return new Response(
        JSON.stringify({ 
          success: false,
          error,
          errorType: 'VALIDATION_ERROR'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    if (!['email', 'sms'].includes(method)) {
      const error = 'Invalid verification method. Must be "email" or "sms"';
      console.error(`[${requestId}] Method validation error:`, error);
      return new Response(
        JSON.stringify({ 
          success: false,
          error,
          errorType: 'VALIDATION_ERROR'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Validate and format phone number for SMS
    let formattedContact = contact;
    if (method === 'sms') {
      // Remove all non-digits and log the process
      const digitsOnly = contact.replace(/\D/g, '');
      console.log(`[${requestId}] Phone validation - Original: "${contact}", Digits only: "${digitsOnly}", Length: ${digitsOnly.length}`);
      
      // Validate 10-digit or 11-digit (with country code) numbers
      if (digitsOnly.length === 10) {
        // 10-digit Canadian/US number
        formattedContact = `+1${digitsOnly}`;
        console.log(`[${requestId}] Formatted 10-digit number: ${formattedContact}`);
      } else if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
        // 11-digit number with country code
        formattedContact = `+${digitsOnly}`;
        console.log(`[${requestId}] Formatted 11-digit number: ${formattedContact}`);
      } else {
        console.error(`[${requestId}] Invalid phone number format - Original: "${contact}", Digits: "${digitsOnly}", Length: ${digitsOnly.length}`);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Invalid phone number. Please enter a valid 10-digit North American phone number',
            details: `Received: ${contact}, Digits extracted: ${digitsOnly}, Length: ${digitsOnly.length}`,
            errorType: 'VALIDATION_ERROR'
          }),
          { 
            status: 400, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders } 
          }
        );
      }
    }

    // Validate environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log(`[${requestId}] Environment check - SUPABASE_URL: ${supabaseUrl ? 'Set' : 'Missing'}, SERVICE_ROLE_KEY: ${supabaseKey ? 'Set' : 'Missing'}`);
    
    if (!supabaseUrl || !supabaseKey) {
      console.error(`[${requestId}] Missing Supabase configuration`);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Server configuration error - missing Supabase credentials',
          errorType: 'CONFIG_ERROR'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    console.log(`[${requestId}] Processing ${method} verification for lead ${leadId}`);

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    let result;
    let verificationToken = null;
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    
    // Send verification based on method with timeout protection
    try {
      if (method === 'email') {
        console.log(`[${requestId}] Sending email verification`);
        verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
        result = await withTimeout(
          sendEmailVerification(contact, verificationToken, requestId),
          15000,
          'Email verification timed out'
        );
        console.log(`[${requestId}] Email verification sent successfully`);
      } else if (method === 'sms') {
        console.log(`[${requestId}] Sending SMS verification to ${formattedContact}`);
        
        // Check for TEST_MODE
        const testMode = Deno.env.get('TEST_MODE') === 'true';
        if (testMode) {
          console.log(`[${requestId}] TEST_MODE: SMS would be sent to ${formattedContact} with Twilio Verify`);
          result = { status: 'pending', sid: 'test-verification-sid' };
        } else {
          result = await withTimeout(
            sendSMSVerification(formattedContact, requestId),
            15000,
            'SMS verification timed out'
          );
        }
        console.log(`[${requestId}] SMS verification sent successfully`);
      }
    } catch (verificationError) {
      const errorMessage = verificationError instanceof Error ? verificationError.message : String(verificationError);
      console.error(`[${requestId}] Verification send failed:`, errorMessage);
      
      // Provide more specific error messages based on the error type
      let userFriendlyError = `Failed to send ${method} verification`;
      let errorType = 'VERIFICATION_SEND_FAILED';
      
      if (errorMessage.includes('Authentication Error') || 
          errorMessage.includes('authentication failed') ||
          errorMessage.includes('20003')) {
        userFriendlyError = 'SMS service authentication failed. Please try email verification instead.';
        errorType = 'SMS_AUTH_FAILED';
      } else if (errorMessage.includes('Invalid phone number')) {
        userFriendlyError = 'Invalid phone number format. Please check your phone number.';
        errorType = 'INVALID_PHONE';
      } else if (errorMessage.includes('timed out')) {
        userFriendlyError = 'Request timed out. Please try again in a moment.';
        errorType = 'TIMEOUT';
      } else if (errorMessage.includes('Email service returned error')) {
        userFriendlyError = 'Email service is currently unavailable. Please try SMS verification instead.';
        errorType = 'EMAIL_SERVICE_FAILED';
      }
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: userFriendlyError,
          errorType: errorType,
          originalError: errorMessage // For debugging
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Update lead with verification details with timeout protection
    console.log(`[${requestId}] Updating lead database record`);
    
    const updateData = {
      verification_token: verificationToken,
      verification_method: method,
      verification_sent_at: new Date().toISOString(),
      verification_expires_at: expiresAt.toISOString(),
      status: 'pending_verification'
    };
    
    try {
      const { data: updateResult, error: updateError } = await supabase
        .from('leads')
        .update(updateData)
        .eq('id', leadId)
        .select();

      if (updateError) {
        console.error(`[${requestId}] Database update error:`, updateError);
        
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
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      console.log(`[${requestId}] Verification flow completed successfully`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Verification code sent via ${method}`,
          expiresAt: expiresAt.toISOString(),
          verificationMethod: method
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    } catch (dbError) {
      const errorMessage = dbError instanceof Error ? dbError.message : String(dbError);
      console.error(`[${requestId}] Database operation failed:`, errorMessage);
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Database operation failed',
          details: errorMessage.includes('timed out') ? 
            'Database operation timed out. Please try again.' :
            'Database error occurred. Please try again.',
          errorType: 'DATABASE_ERROR'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }
  } catch (error: any) {
    console.error(`[${requestId}] Verification flow failed:`, error.message);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Verification failed',
        errorType: 'GENERAL_ERROR'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

async function sendEmailVerification(email: string, token: string, requestId: string) {
  console.log(`[${requestId}] Sending email to ${email}`);
  
  // Use the leadId from secure-lead-handler (passed as requestId parameter)
  const leadId = requestId;
  
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) {
    throw new Error('Email service not configured - missing API key');
  }

  // Get the base URL for verification links  
  const verificationUrl = `https://syjxtyvsencbmhuprnyu.lovable.app/verify?leadId=${leadId}&method=email&contact=${encodeURIComponent(email)}`;

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
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #EA580C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Click Here to Verify
          </a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; color: #666; font-size: 14px;">${verificationUrl}</p>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this quote, you can safely ignore this email.</p>
        <hr style="margin: 30px 0;">
        <p style="color: #666; font-size: 14px;">
          Price My Floor - Connecting you with verified flooring retailers
        </p>
      </div>
    `,
  };

  console.log(`[${requestId}] Calling Resend API`);

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(emailPayload),
  });

  console.log(`[${requestId}] Resend API response status: ${response.status}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[${requestId}] Resend API error:`, errorText);
    throw new Error(`Email service returned error ${response.status}: ${errorText}`);
  }

  const result = await response.json();
  console.log(`[${requestId}] Email sent successfully:`, result);
  return result;
}

async function sendSMSVerification(phone: string, requestId: string) {
  console.log(`[${requestId}] Sending SMS to ${phone}`);
  
  const twilioSid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const twilioAuth = Deno.env.get('TWILIO_AUTH_TOKEN');
  const twilioVerifyServiceSid = Deno.env.get('TWILIO_VERIFY_SERVICE_SID');
  
  console.log(`[${requestId}] Twilio credentials check - SID: ${twilioSid ? 'Set' : 'Missing'}, Auth: ${twilioAuth ? 'Set' : 'Missing'}, Service: ${twilioVerifyServiceSid ? 'Set' : 'Missing'}`);
  
  if (!twilioSid || !twilioAuth) {
    throw new Error('Authentication Error: SMS service credentials not configured');
  }
  
  if (!twilioVerifyServiceSid) {
    throw new Error('Authentication Error: Twilio Verify Service not configured');
  }

  const formattedPhone = formatCanadianPhone(phone);
  console.log(`[${requestId}] Formatted phone: ${formattedPhone}`);

  const twilioUrl = `https://verify.twilio.com/v2/Services/${twilioVerifyServiceSid}/Verifications`;
  const requestBody = new URLSearchParams({
    To: formattedPhone,
    Channel: 'sms',
  });

  console.log(`[${requestId}] Calling Twilio API`);

  const response = await fetch(twilioUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`${twilioSid}:${twilioAuth}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: requestBody,
  });

  console.log(`[${requestId}] Twilio API response status: ${response.status}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[${requestId}] Twilio API error:`, errorText);
    
    try {
      const errorData = JSON.parse(errorText);
      const errorCode = errorData.code;
      const errorMessage = errorData.message;
      
      if (errorCode === 60200) {
        throw new Error(`Invalid phone number format: ${formattedPhone}`);
      } else if (errorCode === 60203) {
        throw new Error(`Phone number ${formattedPhone} is not verified for trial account`);
      } else if (errorCode === 20404) {
        throw new Error('Twilio Verify Service not found');
      } else if (errorCode === 20003) {
        throw new Error('Authentication Error: Twilio authentication failed - please check credentials');
      } else {
        throw new Error(`Twilio error (${errorCode}): ${errorMessage}`);
      }
    } catch (parseError) {
      // If we can't parse the error, it might be an auth issue
      if (response.status === 401) {
        throw new Error('Authentication Error: Invalid Twilio credentials');
      }
      throw new Error(`SMS service returned error ${response.status}: ${errorText}`);
    }
  }

  const result = await response.json();
  console.log(`[${requestId}] SMS sent successfully:`, result);
  return result;
}

function formatCanadianPhone(phone: string): string {
  try {
    const phoneNumber = parsePhoneNumber(phone, 'CA');
    
    if (!phoneNumber || !phoneNumber.isValid()) {
      return fallbackPhoneFormat(phone);
    }
    
    return phoneNumber.format('E.164');
  } catch (error) {
    return fallbackPhoneFormat(phone);
  }
}

function fallbackPhoneFormat(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  
  return phone;
}

serve(handler);
