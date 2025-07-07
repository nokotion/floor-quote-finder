import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    console.log('=== RESEND CREDENTIALS FUNCTION START ===');
    
    // Check environment variables first
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    console.log('Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      hasResendKey: !!resendApiKey
    });

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not found in environment');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('Supabase client created successfully');

    const { retailerId }: ResendCredentialsRequest = await req.json();
    console.log('Processing request for retailer:', retailerId);

    if (!retailerId) {
      return new Response(JSON.stringify({ error: 'Retailer ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get retailer details
    console.log('Fetching retailer details...');
    const { data: retailer, error: retailerError } = await supabase
      .from('retailers')
      .select('*')
      .eq('id', retailerId)
      .single();

    if (retailerError) {
      console.error('Retailer query error:', retailerError);
      return new Response(JSON.stringify({ 
        error: 'Failed to fetch retailer', 
        details: retailerError.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!retailer) {
      console.error('Retailer not found for ID:', retailerId);
      return new Response(JSON.stringify({ error: 'Retailer not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Found retailer:', retailer.business_name, retailer.email);

    if (retailer.status !== 'approved') {
      console.log('Retailer status not approved:', retailer.status);
      return new Response(JSON.stringify({ error: 'Retailer is not approved' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate new temporary password
    const tempPassword = generateTempPassword();
    console.log('Generated temp password for:', retailer.email);

    // Handle auth user operations with better error handling
    console.log('Starting auth user operations...');
    let authUser;
    
    try {
      // Find existing user by email
      const { data: userList, error: listError } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 100 // Limit to avoid large responses
      });
      
      if (listError) {
        console.error('Error listing users:', listError);
        throw new Error(`Failed to list users: ${listError.message}`);
      }
      
      const existingUser = userList.users?.find(user => user.email === retailer.email);
      
      if (existingUser) {
        console.log('Found existing user, updating password');
        const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
          existingUser.id,
          { 
            password: tempPassword,
            user_metadata: { 
              ...existingUser.user_metadata,
              password_reset_required: true,
              temp_password_generated_at: new Date().toISOString()
            }
          }
        );
        if (updateError) {
          console.error('Error updating user:', updateError);
          throw new Error(`Failed to update user: ${updateError.message}`);
        }
        authUser = updatedUser.user;
        console.log('User password updated successfully');
      } else {
        console.log('Creating new auth user');
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: retailer.email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            first_name: retailer.contact_name.split(' ')[0] || retailer.contact_name,
            last_name: retailer.contact_name.split(' ').slice(1).join(' ') || '',
            role: 'retailer',
            password_reset_required: true,
            temp_password_generated_at: new Date().toISOString()
          }
        });
        if (createError) {
          console.error('Error creating user:', createError);
          throw new Error(`Failed to create user: ${createError.message}`);
        }
        authUser = newUser.user;
        console.log('New auth user created successfully');
      }
    } catch (authError: any) {
      console.error('Auth operation failed:', authError);
      return new Response(JSON.stringify({ 
        error: 'Auth operation failed', 
        details: authError.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update profile with temp password info
    console.log('Updating profile...');
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authUser!.id,
          retailer_id: retailer.id,
          first_name: retailer.contact_name.split(' ')[0] || retailer.contact_name,
          last_name: retailer.contact_name.split(' ').slice(1).join(' ') || '',
          role: 'retailer',
          password_reset_required: true,
          temp_password_generated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('Profile update error:', profileError);
        // Continue with email sending even if profile update fails
      } else {
        console.log('Profile updated successfully');
      }
    } catch (profileErr: any) {
      console.error('Profile update exception:', profileErr);
      // Continue with email sending even if profile update fails
    }

    // Send email using fetch to Resend API
    console.log('Preparing to send email...');
    const loginUrl = `${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.lovable.app') || 'https://your-app.lovable.app'}/retailer/login`;
    
    const emailHtml = `
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
    `;

    console.log('Sending email via Resend API...');
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Price My Floor <noreply@flooringdeals.ca>',
        to: [retailer.email],
        subject: 'Price My Floor - Your Login Credentials',
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Resend API error:', errorText);
      return new Response(JSON.stringify({ 
        error: 'Failed to send email', 
        details: errorText 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const emailData = await emailResponse.json();
    console.log('Email sent successfully:', emailData);

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
      error: error.message || 'Failed to resend credentials',
      stack: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);