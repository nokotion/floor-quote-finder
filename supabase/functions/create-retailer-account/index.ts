import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateRetailerAccountRequest {
  applicationId: string;
  adminId: string;
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
    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { applicationId, adminId }: CreateRetailerAccountRequest = await req.json();

    console.log('Creating retailer account for application:', applicationId);

    // 1. Fetch the application details
    const { data: application, error: appError } = await supabaseAdmin
      .from('retailer_applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (appError || !application) {
      console.error('Application fetch error:', appError);
      throw new Error('Application not found');
    }

    if (application.status !== 'pending') {
      throw new Error('Application is not in pending status');
    }

    // 2. Generate a temporary password
    const generateTempPassword = () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
      let password = '';
      for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return password;
    };

    const tempPassword = generateTempPassword();
    console.log('Generated temporary password for:', application.email);

    // 3. Create auth user with temporary password
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: application.email,
      password: tempPassword,
      email_confirm: true, // Auto-confirm email since it's admin approved
      user_metadata: {
        first_name: application.contact_name.split(' ')[0] || application.contact_name,
        last_name: application.contact_name.split(' ').slice(1).join(' ') || '',
        role: 'retailer',
        temp_password_generated: true,
        password_reset_required: true
      }
    });

    if (authError || !authUser.user) {
      console.error('Auth user creation error:', authError);
      throw new Error(`Failed to create user account: ${authError?.message}`);
    }

    console.log('Created auth user:', authUser.user.id);

    // 4. Create retailer record
    const { data: retailer, error: retailerError } = await supabaseAdmin
      .from('retailers')
      .insert({
        business_name: application.business_name,
        contact_name: application.contact_name,
        email: application.email,
        phone: application.phone,
        address: application.business_address,
        city: application.city,
        postal_code: application.postal_code,
        website: application.website,
        business_description: application.business_description,
        years_in_business: application.years_in_business,
        brands_carried: application.brands_carried,
        services_offered: application.services_offered,
        service_areas: application.service_areas,
        insurance_provider: application.insurance_provider,
        business_license: application.business_license,
        business_references: application.business_references,
        status: 'approved',
        user_id: authUser.user.id
      })
      .select()
      .single();

    if (retailerError) {
      console.error('Retailer creation error:', retailerError);
      // Cleanup: delete the auth user if retailer creation fails
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      throw new Error(`Failed to create retailer record: ${retailerError.message}`);
    }

    console.log('Created retailer record:', retailer.id);

    // 5. Update profile to link to retailer
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        retailer_id: retailer.id,
        password_reset_required: true,
        temp_password_generated_at: new Date().toISOString()
      })
      .eq('id', authUser.user.id);

    if (profileError) {
      console.error('Profile update error:', profileError);
      // Don't fail the entire process for profile update issues
    }

    // 6. Update application status
    const { error: updateAppError } = await supabaseAdmin
      .from('retailer_applications')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminId
      })
      .eq('id', applicationId);

    if (updateAppError) {
      console.error('Application update error:', updateAppError);
      throw new Error(`Failed to update application: ${updateAppError.message}`);
    }

    // 7. Send welcome email with credentials (call send-retailer-welcome function)
    try {
      const { error: emailError } = await supabaseAdmin.functions.invoke('send-retailer-welcome', {
        body: {
          email: application.email,
          businessName: application.business_name,
          contactName: application.contact_name,
          tempPassword: tempPassword,
          loginUrl: `${req.headers.get('origin') || 'https://your-domain.com'}/retailer/login`
        }
      });

      if (emailError) {
        console.error('Email sending error:', emailError);
        // Don't fail the entire process for email issues
      }
    } catch (emailErr) {
      console.error('Email function error:', emailErr);
    }

    console.log('Successfully created retailer account for:', application.email);

    return new Response(JSON.stringify({
      success: true,
      retailerId: retailer.id,
      userId: authUser.user.id,
      message: 'Retailer account created successfully'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in create-retailer-account function:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);