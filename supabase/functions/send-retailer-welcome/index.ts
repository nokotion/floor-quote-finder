import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface WelcomeEmailRequest {
  email: string;
  businessName: string;
  contactName: string;
  tempPassword: string;
  loginUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    console.log('=== SEND RETAILER WELCOME START ===');
    
    // Validate environment
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not found in environment');
      throw new Error('Email service not configured');
    }

    const { email, businessName, contactName, tempPassword, loginUrl }: WelcomeEmailRequest = await req.json();

    // Validate required fields
    if (!email || !businessName || !contactName || !tempPassword || !loginUrl) {
      throw new Error('Missing required email parameters');
    }

    console.log('Sending welcome email to:', email, 'for business:', businessName);

    const emailContent = {
      from: 'Price My Floor <noreply@flooringdeals.ca>',
      to: email,
      subject: 'Welcome to Price My Floor - Your Account is Approved!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to Price My Floor!</h2>
          
          <p>Dear ${contactName},</p>
          
          <p>Congratulations! Your retailer application for <strong>${businessName}</strong> has been approved.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Your Login Credentials:</h3>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Temporary Password:</strong> <code style="background-color: #e5e7eb; padding: 4px 8px; border-radius: 4px;">${tempPassword}</code></p>
          </div>
          
          <p><strong>Important:</strong> For security reasons, you will be required to change your password when you first log in.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Login to Your Account
            </a>
          </div>
          
          <h3>Next Steps:</h3>
          <ol>
            <li>Click the login button above or visit: <a href="${loginUrl}">${loginUrl}</a></li>
            <li>Sign in with your email and temporary password</li>
            <li>Create a new secure password when prompted</li>
            <li>Complete your retailer profile setup</li>
            <li>Start receiving leads!</li>
          </ol>
          
          <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          
          <p>Welcome aboard!</p>
          <p><strong>The Price My Floor Team</strong></p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 12px; color: #6b7280;">
            This email contains sensitive login information. Please keep it secure and delete it after you've changed your password.
          </p>
        </div>
      `
    };

    console.log('Attempting to send email via Resend...');
    const { data, error } = await resend.emails.send(emailContent);
    
    if (error) {
      console.error('Resend API error:', error);
      throw new Error(`Resend API error: ${error.message}`);
    }

    console.log('Email sent successfully via Resend. Email ID:', data?.id);

    return new Response(JSON.stringify({
      success: true,
      message: 'Welcome email sent successfully',
      emailId: data?.id
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in send-retailer-welcome function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to send welcome email'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);