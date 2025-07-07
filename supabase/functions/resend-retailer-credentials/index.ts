import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface ResendCredentialsRequest {
  retailerId: string;
}

// Generate a random temporary password
function generateTempPassword(): string {
  const length = 12;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { retailerId }: ResendCredentialsRequest = await req.json();

    if (!retailerId) {
      return new Response(JSON.stringify({ error: 'Retailer ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get retailer details
    const { data: retailer, error: retailerError } = await supabase
      .from('retailers')
      .select('*')
      .eq('id', retailerId)
      .single();

    if (retailerError || !retailer) {
      console.error('Retailer not found:', retailerError);
      return new Response(JSON.stringify({ error: 'Retailer not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (retailer.status !== 'approved') {
      return new Response(JSON.stringify({ error: 'Retailer is not approved' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate new temporary password
    const tempPassword = generateTempPassword();

    // Get or create auth user
    let authUser;
    const { data: existingUser } = await supabase.auth.admin.getUserByEmail(retailer.email);
    
    if (existingUser.user) {
      // Update existing user with new password
      const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
        existingUser.user.id,
        { 
          password: tempPassword,
          user_metadata: { 
            password_reset_required: true,
            temp_password_generated_at: new Date().toISOString()
          }
        }
      );
      if (updateError) throw updateError;
      authUser = updatedUser.user;
    } else {
      // Create new auth user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: retailer.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          first_name: retailer.contact_name.split(' ')[0],
          last_name: retailer.contact_name.split(' ').slice(1).join(' '),
          role: 'retailer',
          password_reset_required: true,
          temp_password_generated_at: new Date().toISOString()
        }
      });
      if (createError) throw createError;
      authUser = newUser.user;
    }

    // Update profile with temp password info
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authUser!.id,
        retailer_id: retailer.id,
        first_name: retailer.contact_name.split(' ')[0],
        last_name: retailer.contact_name.split(' ').slice(1).join(' '),
        role: 'retailer',
        password_reset_required: true,
        temp_password_generated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('Profile update error:', profileError);
    }

    // Send welcome email
    const loginUrl = `${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.lovable.app') || 'https://your-app.lovable.app'}/retailer/login`;
    
    const emailContent = {
      from: 'Price My Floor <onboarding@resend.dev>',
      to: retailer.email,
      subject: 'Price My Floor - Your Login Credentials',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Price My Floor - Login Credentials</h2>
          
          <p>Dear ${retailer.contact_name},</p>
          
          <p>Here are your updated login credentials for <strong>${retailer.business_name}</strong>:</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Your Login Credentials:</h3>
            <p><strong>Email:</strong> ${retailer.email}</p>
            <p><strong>Temporary Password:</strong> <code style="background-color: #e5e7eb; padding: 4px 8px; border-radius: 4px;">${tempPassword}</code></p>
          </div>
          
          <p><strong>Important:</strong> For security reasons, you will be required to change your password when you log in.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Login to Your Account
            </a>
          </div>
          
          <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          
          <p>Best regards,</p>
          <p><strong>The Price My Floor Team</strong></p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 12px; color: #6b7280;">
            This email contains sensitive login information. Please keep it secure and delete it after you've changed your password.
          </p>
        </div>
      `
    };

    const { data: emailData, error: emailError } = await resend.emails.send(emailContent);
    
    if (emailError) {
      console.error('Resend error:', emailError);
      throw new Error(`Failed to send email: ${emailError.message}`);
    }

    console.log('Credentials email sent successfully:', emailData);

    return new Response(JSON.stringify({
      success: true,
      message: 'Login credentials sent successfully',
      emailId: emailData?.id
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in resend-retailer-credentials function:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Failed to resend credentials'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);