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

  try {
    const { leadId, method, contact }: VerificationRequest = await req.json();

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Generate 6-digit verification code
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Update lead with verification details
    const { error: updateError } = await supabase
      .from('leads')
      .update({
        verification_token: verificationToken,
        verification_method: method,
        verification_sent_at: new Date().toISOString(),
        verification_expires_at: expiresAt.toISOString(),
        status: 'pending_verification'
      })
      .eq('id', leadId);

    if (updateError) {
      throw new Error(`Failed to update lead: ${updateError.message}`);
    }

    let result;
    
    if (method === 'email') {
      result = await sendEmailVerification(contact, verificationToken);
    } else if (method === 'sms') {
      result = await sendSMSVerification(contact, verificationToken);
    } else {
      throw new Error('Invalid verification method');
    }

    console.log(`Verification sent via ${method} to ${contact}, token: ${verificationToken}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Verification code sent via ${method}`,
        expiresAt: expiresAt.toISOString()
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
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

async function sendEmailVerification(email: string, token: string) {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY not configured');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Price My Floor <noreply@pricemyfloor.ca>',
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
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send email: ${error}`);
  }

  return await response.json();
}

async function sendSMSVerification(phone: string, token: string) {
  const twilioSid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const twilioAuth = Deno.env.get('TWILIO_AUTH_TOKEN');
  const twilioPhone = Deno.env.get('TWILIO_PHONE_NUMBER');
  
  if (!twilioSid || !twilioAuth || !twilioPhone) {
    throw new Error('Twilio credentials not configured');
  }

  // Format phone number for Canadian numbers
  const formattedPhone = formatCanadianPhone(phone);

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${twilioSid}:${twilioAuth}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: twilioPhone,
        To: formattedPhone,
        Body: `Your Price My Floor verification code is: ${token}. This code expires in 10 minutes.`,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send SMS: ${error}`);
  }

  return await response.json();
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