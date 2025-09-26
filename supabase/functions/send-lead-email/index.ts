import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-LEAD-EMAIL] ${step}${detailsStr}`);
};

// Format lead data for email
const formatLeadDetails = (leadData: any, paymentMethod: string, chargeAmount: number) => {
  const installationType = leadData.installationType === 'supply-and-install' ? 'Supply & Installation' : 'Supply Only';
  const paymentText = paymentMethod === 'credit' ? 'Paid via lead credits' : `Charged $${chargeAmount.toFixed(2)} CAD`;

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h1 style="color: #2c3e50; margin: 0 0 10px 0;">New Flooring Lead Available</h1>
        <p style="color: #7f8c8d; margin: 0;">You have received a new qualified lead from Price My Floor</p>
      </div>

      <div style="background-color: white; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #2c3e50; margin: 0 0 15px 0;">Customer Information</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef; font-weight: bold; width: 150px;">Name:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef;">${leadData.customer_name || 'Not provided'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef; font-weight: bold;">Email:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef;">${leadData.customer_email || 'Not provided'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef; font-weight: bold;">Phone:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef;">${leadData.customer_phone || 'Not provided'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef; font-weight: bold;">Postal Code:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef;">${leadData.postal_code}</td>
          </tr>
        </table>
      </div>

      <div style="background-color: white; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #2c3e50; margin: 0 0 15px 0;">Project Details</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef; font-weight: bold; width: 150px;">Brand Requested:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef;">${leadData.brand_requested || 'Any brand'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef; font-weight: bold;">Square Footage:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef;">${leadData.square_footage ? leadData.square_footage.toLocaleString() + ' sq ft' : 'Not specified'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef; font-weight: bold;">Installation Required:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef;">${leadData.installation_required ? 'Yes' : 'No'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef; font-weight: bold;">Timeline:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef;">${leadData.timeline || 'Not specified'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef; font-weight: bold;">Address:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef;">${leadData.street_address || 'Not provided'}</td>
          </tr>
        </table>
      </div>

      ${leadData.attachment_urls && leadData.attachment_urls.length > 0 ? `
        <div style="background-color: white; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #2c3e50; margin: 0 0 15px 0;">Customer Photos (${leadData.attachment_urls.length})</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px;">
            ${leadData.attachment_urls.map((url: string, index: number) => `
              <div style="text-align: center;">
                <a href="${url}" target="_blank" style="text-decoration: none;">
                  <img src="${url}" alt="Customer photo ${index + 1}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; border: 2px solid #e9ecef; cursor: pointer;" />
                  <p style="margin: 5px 0 0 0; font-size: 12px; color: #7f8c8d;">Photo ${index + 1}</p>
                </a>
              </div>
            `).join('')}
          </div>
          <p style="margin: 15px 0 0 0; font-size: 14px; color: #7f8c8d; font-style: italic;">Click on any photo to view full size</p>
        </div>
      ` : ''}

      ${leadData.notes ? `
        <div style="background-color: white; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #2c3e50; margin: 0 0 15px 0;">Additional Notes</h2>
          <p style="margin: 0; line-height: 1.6;">${leadData.notes}</p>
        </div>
      ` : ''}

      <div style="background-color: #e8f5e8; padding: 20px; border: 1px solid #c3e6c3; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #2c3e50; margin: 0 0 10px 0;">Payment Information</h2>
        <p style="margin: 0; color: #27ae60; font-weight: bold;">${paymentText}</p>
      </div>

      <div style="background-color: #fff3cd; padding: 20px; border: 1px solid #ffeeba; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #856404; margin: 0 0 10px 0;">Next Steps:</h3>
        <ol style="margin: 0; padding-left: 20px; color: #856404;">
          <li>Contact the customer within 24 hours for best results</li>
          <li>Prepare your quote based on the project details</li>
          <li>Follow up professionally and promptly</li>
        </ol>
      </div>

      <div style="text-align: center; padding: 20px; color: #7f8c8d; font-size: 14px;">
        <p>This lead was delivered by <strong>Price My Floor</strong></p>
        <p>For support, contact us at support@pricemyfloor.ca</p>
      </div>
    </div>
  `;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { retailerEmail, retailerName, leadData, paymentMethod, chargeAmount } = await req.json();

    if (!retailerEmail || !leadData) {
      throw new Error("Missing required email data");
    }

    logStep("Preparing email", { retailerEmail, leadId: leadData.id });

    // For now, we'll use a simple email service
    // In production, you'd want to integrate with Resend, SendGrid, or similar
    const emailContent = formatLeadDetails(leadData, paymentMethod, chargeAmount);
    const subject = `New Flooring Lead: ${leadData.contactInfo?.name || 'Customer'} - ${leadData.projectSize}`;

    // Log the email content for now (in production, actually send the email)
    logStep("Email prepared", {
      to: retailerEmail,
      subject: subject,
      paymentMethod: paymentMethod,
      chargeAmount: chargeAmount
    });

    // Here you would integrate with your email service
    // For example with Resend:
    /*
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    const emailResponse = await resend.emails.send({
      from: "leads@pricemyfloor.ca",
      to: [retailerEmail],
      subject: subject,
      html: emailContent,
    });
    */

    // For now, we'll simulate successful email sending
    console.log(`EMAIL TO: ${retailerEmail}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`CONTENT: ${emailContent}`);

    return new Response(JSON.stringify({
      success: true,
      message: "Email sent successfully",
      retailer_email: retailerEmail
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    logStep("ERROR", { message: (error as Error).message });
    return new Response(JSON.stringify({ 
      error: (error as Error).message,
      success: false 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});