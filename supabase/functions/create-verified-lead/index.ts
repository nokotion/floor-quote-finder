
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface LeadData {
  customer_name: string
  customer_email: string
  customer_phone: string
  postal_code: string
  street_address?: string
  address_city?: string
  address_province?: string
  address_formatted?: string
  brand_requested: string
  project_type: string
  square_footage?: number
  installation_required?: boolean
  notes?: string
  attachment_urls?: string[]
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const leadData: LeadData = await req.json()

    console.log('Creating verified lead:', leadData)

    // Insert the verified lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert({
        customer_name: leadData.customer_name,
        customer_email: leadData.customer_email,
        customer_phone: leadData.customer_phone,
        postal_code: leadData.postal_code,
        street_address: leadData.street_address,
        address_city: leadData.address_city,
        address_province: leadData.address_province,
        address_formatted: leadData.address_formatted,
        brand_requested: leadData.brand_requested,
        project_type: leadData.project_type,
        square_footage: leadData.square_footage,
        installation_required: leadData.installation_required || false,
        notes: leadData.notes,
        attachment_urls: leadData.attachment_urls,
        status: 'verified',
        is_verified: true,
        verification_method: 'completed'
      })
      .select()
      .single()

    if (leadError) {
      console.error('Error creating lead:', leadError)
      throw leadError
    }

    console.log('Lead created successfully:', lead.id)

    // Find matching retailers for lead distribution
    const { data: brandSubscriptions, error: subscriptionError } = await supabase
      .from('brand_subscriptions')
      .select(`
        retailer_id,
        sqft_tier_min,
        sqft_tier_max,
        retailers!inner(
          id,
          business_name,
          postal_code_prefixes,
          installation_preference,
          status
        )
      `)
      .eq('brand_name', leadData.brand_requested)
      .eq('is_active', true)
      .eq('retailers.status', 'active')

    if (subscriptionError) {
      console.error('Error fetching brand subscriptions:', subscriptionError)
      throw subscriptionError
    }

    console.log(`Found ${brandSubscriptions?.length || 0} potential retailers for brand: ${leadData.brand_requested}`)

    const matchedRetailers = []
    const leadPostalPrefix = leadData.postal_code.substring(0, 3).toUpperCase()

    for (const subscription of brandSubscriptions || []) {
      const retailer = subscription.retailers
      
      // Check postal code match (first 3 characters)
      const postalMatches = (retailer as any).postal_code_prefixes?.some((prefix: string) => 
        leadPostalPrefix.startsWith(prefix.toUpperCase())
      ) || false

      // Check square footage range
      const sqftMatches = !leadData.square_footage || (
        leadData.square_footage >= (subscription.sqft_tier_min || 0) &&
        leadData.square_footage <= (subscription.sqft_tier_max || 999999)
      )

      // Check installation preference
      const installationMatches = 
        (retailer as any).installation_preference === 'both' ||
        (retailer as any).installation_preference === 'any' ||
        ((retailer as any).installation_preference === 'yes' && leadData.installation_required) ||
        ((retailer as any).installation_preference === 'no' && !leadData.installation_required)

      if (postalMatches && sqftMatches && installationMatches) {
        matchedRetailers.push({
          retailer_id: (retailer as any).id,
          business_name: (retailer as any).business_name
        })
      }
    }

    console.log(`Matched ${matchedRetailers.length} retailers for distribution`)

    // Insert lead distributions
    const distributions = []
    for (const retailer of matchedRetailers) {
      const { data: distribution, error: distError } = await supabase
        .from('lead_distributions')
        .insert({
          lead_id: lead.id,
          retailer_id: retailer.retailer_id,
          lead_price: 25.00, // Default lead price
          brand_matched: leadData.brand_requested,
          status: 'sent',
          distribution_method: 'auto'
        })
        .select()
        .single()

      if (distError) {
        console.error('Error creating distribution for retailer:', retailer.retailer_id, distError)
        continue
      }

      distributions.push(distribution)
      console.log(`Lead distributed to retailer: ${retailer.business_name}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        lead_id: lead.id,
        distributions_created: distributions.length,
        matched_retailers: matchedRetailers.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in create-verified-lead function:', error)
    return new Response(
      JSON.stringify({
        error: (error as Error).message,
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
