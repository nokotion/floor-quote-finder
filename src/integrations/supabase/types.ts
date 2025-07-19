export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      analytics_config: {
        Row: {
          anonymize_ip: boolean | null
          created_at: string
          ga4_measurement_id: string | null
          gtm_container_id: string | null
          id: string
          is_ga4_enabled: boolean | null
          is_gtm_enabled: boolean | null
          is_plausible_enabled: boolean | null
          is_posthog_enabled: boolean | null
          plausible_domain: string | null
          posthog_api_key: string | null
          require_cookie_consent: boolean | null
          updated_at: string
        }
        Insert: {
          anonymize_ip?: boolean | null
          created_at?: string
          ga4_measurement_id?: string | null
          gtm_container_id?: string | null
          id?: string
          is_ga4_enabled?: boolean | null
          is_gtm_enabled?: boolean | null
          is_plausible_enabled?: boolean | null
          is_posthog_enabled?: boolean | null
          plausible_domain?: string | null
          posthog_api_key?: string | null
          require_cookie_consent?: boolean | null
          updated_at?: string
        }
        Update: {
          anonymize_ip?: boolean | null
          created_at?: string
          ga4_measurement_id?: string | null
          gtm_container_id?: string | null
          id?: string
          is_ga4_enabled?: boolean | null
          is_gtm_enabled?: boolean | null
          is_plausible_enabled?: boolean | null
          is_posthog_enabled?: boolean | null
          plausible_domain?: string | null
          posthog_api_key?: string | null
          require_cookie_consent?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string
          event_category: string
          event_data: Json | null
          event_name: string
          id: string
          ip_address: string | null
          page_url: string | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          created_at?: string
          event_category: string
          event_data?: Json | null
          event_name: string
          id?: string
          ip_address?: string | null
          page_url?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          created_at?: string
          event_category?: string
          event_data?: Json | null
          event_name?: string
          id?: string
          ip_address?: string | null
          page_url?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action_details: Json | null
          action_type: string
          admin_id: string
          created_at: string
          id: string
          ip_address: string | null
          retailer_id: string | null
          user_agent: string | null
        }
        Insert: {
          action_details?: Json | null
          action_type: string
          admin_id: string
          created_at?: string
          id?: string
          ip_address?: string | null
          retailer_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action_details?: Json | null
          action_type?: string
          admin_id?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          retailer_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_retailer_id_fkey"
            columns: ["retailer_id"]
            isOneToOne: false
            referencedRelation: "retailers"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_records: {
        Row: {
          amount: number
          billing_period_end: string | null
          billing_period_start: string | null
          billing_type: string
          created_at: string
          id: string
          lead_distribution_id: string | null
          retailer_id: string | null
          status: string | null
        }
        Insert: {
          amount: number
          billing_period_end?: string | null
          billing_period_start?: string | null
          billing_type: string
          created_at?: string
          id?: string
          lead_distribution_id?: string | null
          retailer_id?: string | null
          status?: string | null
        }
        Update: {
          amount?: number
          billing_period_end?: string | null
          billing_period_start?: string | null
          billing_type?: string
          created_at?: string
          id?: string
          lead_distribution_id?: string | null
          retailer_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_records_lead_distribution_id_fkey"
            columns: ["lead_distribution_id"]
            isOneToOne: false
            referencedRelation: "lead_distributions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_records_retailer_id_fkey"
            columns: ["retailer_id"]
            isOneToOne: false
            referencedRelation: "retailers"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_subscriptions: {
        Row: {
          brand_name: string
          created_at: string
          id: string
          is_active: boolean | null
          lead_price: number | null
          max_square_footage: number | null
          min_square_footage: number | null
          retailer_id: string | null
          sqft_tier_max: number | null
          sqft_tier_min: number | null
          updated_at: string
        }
        Insert: {
          brand_name: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          lead_price?: number | null
          max_square_footage?: number | null
          min_square_footage?: number | null
          retailer_id?: string | null
          sqft_tier_max?: number | null
          sqft_tier_min?: number | null
          updated_at?: string
        }
        Update: {
          brand_name?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          lead_price?: number | null
          max_square_footage?: number | null
          min_square_footage?: number | null
          retailer_id?: string | null
          sqft_tier_max?: number | null
          sqft_tier_min?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_subscriptions_retailer_id_fkey"
            columns: ["retailer_id"]
            isOneToOne: false
            referencedRelation: "retailers"
            referencedColumns: ["id"]
          },
        ]
      }
      brands_backup: {
        Row: {
          categories: string | null
          id: string | null
          installation: string | null
          logo_url: string | null
          name: string | null
          website: string | null
        }
        Insert: {
          categories?: string | null
          id?: string | null
          installation?: string | null
          logo_url?: string | null
          name?: string | null
          website?: string | null
        }
        Update: {
          categories?: string | null
          id?: string | null
          installation?: string | null
          logo_url?: string | null
          name?: string | null
          website?: string | null
        }
        Relationships: []
      }
      flooring_brands: {
        Row: {
          categories: string | null
          created_at: string | null
          description: string | null
          featured: boolean | null
          id: string
          installation: string | null
          logo_url: string | null
          name: string | null
          slug: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          categories?: string | null
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          id?: string
          installation?: string | null
          logo_url?: string | null
          name?: string | null
          slug: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          categories?: string | null
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          id?: string
          installation?: string | null
          logo_url?: string | null
          name?: string | null
          slug?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      lead_distributions: {
        Row: {
          brand_matched: string | null
          charge_amount: number | null
          delivery_time: string | null
          distance_km: number | null
          distribution_method: string | null
          id: string
          lead_id: string | null
          lead_price: number
          payment_method: string | null
          responded_at: string | null
          retailer_id: string | null
          sent_at: string
          status: string | null
          stripe_payment_intent_id: string | null
          viewed_at: string | null
          was_paid: boolean | null
        }
        Insert: {
          brand_matched?: string | null
          charge_amount?: number | null
          delivery_time?: string | null
          distance_km?: number | null
          distribution_method?: string | null
          id?: string
          lead_id?: string | null
          lead_price: number
          payment_method?: string | null
          responded_at?: string | null
          retailer_id?: string | null
          sent_at?: string
          status?: string | null
          stripe_payment_intent_id?: string | null
          viewed_at?: string | null
          was_paid?: boolean | null
        }
        Update: {
          brand_matched?: string | null
          charge_amount?: number | null
          delivery_time?: string | null
          distance_km?: number | null
          distribution_method?: string | null
          id?: string
          lead_id?: string | null
          lead_price?: number
          payment_method?: string | null
          responded_at?: string | null
          retailer_id?: string | null
          sent_at?: string
          status?: string | null
          stripe_payment_intent_id?: string | null
          viewed_at?: string | null
          was_paid?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_distributions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_distributions_retailer_id_fkey"
            columns: ["retailer_id"]
            isOneToOne: false
            referencedRelation: "retailers"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_purchases: {
        Row: {
          created_at: string
          currency: string | null
          id: string
          lead_id: string | null
          purchase_method: string | null
          purchase_price: number
          purchased_at: string
          retailer_id: string | null
          stripe_payment_intent_id: string | null
        }
        Insert: {
          created_at?: string
          currency?: string | null
          id?: string
          lead_id?: string | null
          purchase_method?: string | null
          purchase_price: number
          purchased_at?: string
          retailer_id?: string | null
          stripe_payment_intent_id?: string | null
        }
        Update: {
          created_at?: string
          currency?: string | null
          id?: string
          lead_id?: string | null
          purchase_method?: string | null
          purchase_price?: number
          purchased_at?: string
          retailer_id?: string | null
          stripe_payment_intent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_purchases_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_purchases_retailer_id_fkey"
            columns: ["retailer_id"]
            isOneToOne: false
            referencedRelation: "retailers"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          address_city: string | null
          address_formatted: string | null
          address_province: string | null
          assigned_retailer_id: string | null
          attachment_urls: string[] | null
          brand_requested: string | null
          budget_range: string | null
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          flooring_type: string | null
          id: string
          installation_required: boolean | null
          is_locked: boolean | null
          is_verified: boolean | null
          lock_price: number | null
          notes: string | null
          postal_code: string
          project_type: string | null
          referrer: string | null
          session_id: string | null
          square_footage: number | null
          status: string | null
          street_address: string | null
          timeline: string | null
          updated_at: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          verification_expires_at: string | null
          verification_method: string | null
          verification_sent_at: string | null
          verification_token: string | null
        }
        Insert: {
          address_city?: string | null
          address_formatted?: string | null
          address_province?: string | null
          assigned_retailer_id?: string | null
          attachment_urls?: string[] | null
          brand_requested?: string | null
          budget_range?: string | null
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          flooring_type?: string | null
          id?: string
          installation_required?: boolean | null
          is_locked?: boolean | null
          is_verified?: boolean | null
          lock_price?: number | null
          notes?: string | null
          postal_code: string
          project_type?: string | null
          referrer?: string | null
          session_id?: string | null
          square_footage?: number | null
          status?: string | null
          street_address?: string | null
          timeline?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          verification_expires_at?: string | null
          verification_method?: string | null
          verification_sent_at?: string | null
          verification_token?: string | null
        }
        Update: {
          address_city?: string | null
          address_formatted?: string | null
          address_province?: string | null
          assigned_retailer_id?: string | null
          attachment_urls?: string[] | null
          brand_requested?: string | null
          budget_range?: string | null
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          flooring_type?: string | null
          id?: string
          installation_required?: boolean | null
          is_locked?: boolean | null
          is_verified?: boolean | null
          lock_price?: number | null
          notes?: string | null
          postal_code?: string
          project_type?: string | null
          referrer?: string | null
          session_id?: string | null
          square_footage?: number | null
          status?: string | null
          street_address?: string | null
          timeline?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          verification_expires_at?: string | null
          verification_method?: string | null
          verification_sent_at?: string | null
          verification_token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_retailer_id_fkey"
            columns: ["assigned_retailer_id"]
            isOneToOne: false
            referencedRelation: "retailers"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          card_brand: string | null
          card_exp_month: number | null
          card_exp_year: number | null
          card_last4: string | null
          created_at: string | null
          id: string
          is_default: boolean | null
          retailer_id: string
          stripe_payment_method_id: string
          updated_at: string | null
        }
        Insert: {
          card_brand?: string | null
          card_exp_month?: number | null
          card_exp_year?: number | null
          card_last4?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          retailer_id: string
          stripe_payment_method_id: string
          updated_at?: string | null
        }
        Update: {
          card_brand?: string | null
          card_exp_month?: number | null
          card_exp_year?: number | null
          card_last4?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          retailer_id?: string
          stripe_payment_method_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_retailer_id_fkey"
            columns: ["retailer_id"]
            isOneToOne: false
            referencedRelation: "retailers"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          amount_cents: number
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          lead_id: string | null
          net_amount_cents: number | null
          payment_type: string
          retailer_id: string
          status: string
          stripe_charge_id: string | null
          stripe_fee_cents: number | null
          stripe_payment_intent_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          lead_id?: string | null
          net_amount_cents?: number | null
          payment_type: string
          retailer_id: string
          status?: string
          stripe_charge_id?: string | null
          stripe_fee_cents?: number | null
          stripe_payment_intent_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          lead_id?: string | null
          net_amount_cents?: number | null
          payment_type?: string
          retailer_id?: string
          status?: string
          stripe_charge_id?: string | null
          stripe_fee_cents?: number | null
          stripe_payment_intent_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_retailer_id_fkey"
            columns: ["retailer_id"]
            isOneToOne: false
            referencedRelation: "retailers"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_plans: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          lead_limit: number | null
          monthly_price: number | null
          plan_name: string
          plan_type: string
          price_per_lead: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          lead_limit?: number | null
          monthly_price?: number | null
          plan_name: string
          plan_type: string
          price_per_lead?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          lead_limit?: number | null
          monthly_price?: number | null
          plan_name?: string
          plan_type?: string
          price_per_lead?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          first_name: string | null
          id: string
          impersonated_by: string | null
          impersonation_expires_at: string | null
          impersonation_started_at: string | null
          last_name: string | null
          password_reset_required: boolean | null
          retailer_id: string | null
          role: string | null
          temp_password_generated_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id: string
          impersonated_by?: string | null
          impersonation_expires_at?: string | null
          impersonation_started_at?: string | null
          last_name?: string | null
          password_reset_required?: boolean | null
          retailer_id?: string | null
          role?: string | null
          temp_password_generated_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          impersonated_by?: string | null
          impersonation_expires_at?: string | null
          impersonation_started_at?: string | null
          last_name?: string | null
          password_reset_required?: boolean | null
          retailer_id?: string | null
          role?: string | null
          temp_password_generated_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_retailer_id_fkey"
            columns: ["retailer_id"]
            isOneToOne: false
            referencedRelation: "retailers"
            referencedColumns: ["id"]
          },
        ]
      }
      retailer_applications: {
        Row: {
          brands_carried: string[] | null
          business_address: string | null
          business_description: string | null
          business_license: string | null
          business_name: string
          business_references: string | null
          city: string
          contact_name: string
          created_at: string | null
          email: string
          id: string
          insurance_provider: string | null
          notes: string | null
          phone: string
          postal_code: string
          reviewed_at: string | null
          reviewed_by: string | null
          service_areas: string[] | null
          services_offered: string[] | null
          status: string | null
          updated_at: string | null
          website: string | null
          years_in_business: number | null
        }
        Insert: {
          brands_carried?: string[] | null
          business_address?: string | null
          business_description?: string | null
          business_license?: string | null
          business_name: string
          business_references?: string | null
          city: string
          contact_name: string
          created_at?: string | null
          email: string
          id?: string
          insurance_provider?: string | null
          notes?: string | null
          phone: string
          postal_code: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          service_areas?: string[] | null
          services_offered?: string[] | null
          status?: string | null
          updated_at?: string | null
          website?: string | null
          years_in_business?: number | null
        }
        Update: {
          brands_carried?: string[] | null
          business_address?: string | null
          business_description?: string | null
          business_license?: string | null
          business_name?: string
          business_references?: string | null
          city?: string
          contact_name?: string
          created_at?: string | null
          email?: string
          id?: string
          insurance_provider?: string | null
          notes?: string | null
          phone?: string
          postal_code?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          service_areas?: string[] | null
          services_offered?: string[] | null
          status?: string | null
          updated_at?: string | null
          website?: string | null
          years_in_business?: number | null
        }
        Relationships: []
      }
      retailer_lead_credits: {
        Row: {
          created_at: string
          credits_remaining: number
          credits_used: number
          id: string
          last_purchase_date: string | null
          retailer_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          credits_remaining?: number
          credits_used?: number
          id?: string
          last_purchase_date?: string | null
          retailer_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          credits_remaining?: number
          credits_used?: number
          id?: string
          last_purchase_date?: string | null
          retailer_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "retailer_lead_credits_retailer_id_fkey"
            columns: ["retailer_id"]
            isOneToOne: false
            referencedRelation: "retailers"
            referencedColumns: ["id"]
          },
        ]
      }
      retailer_leads: {
        Row: {
          created_at: string
          id: string
          lead_id: string | null
          notes: string | null
          quote_amount: number | null
          retailer_id: string | null
          status: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          lead_id?: string | null
          notes?: string | null
          quote_amount?: number | null
          retailer_id?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          lead_id?: string | null
          notes?: string | null
          quote_amount?: number | null
          retailer_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "retailer_leads_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retailer_leads_retailer_id_fkey"
            columns: ["retailer_id"]
            isOneToOne: false
            referencedRelation: "retailers"
            referencedColumns: ["id"]
          },
        ]
      }
      retailer_requests: {
        Row: {
          city_province: string | null
          contact_person: string
          created_at: string
          email: string
          id: string
          message: string | null
          phone_number: string | null
          store_name: string
          updated_at: string
        }
        Insert: {
          city_province?: string | null
          contact_person: string
          created_at?: string
          email: string
          id?: string
          message?: string | null
          phone_number?: string | null
          store_name: string
          updated_at?: string
        }
        Update: {
          city_province?: string | null
          contact_person?: string
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          phone_number?: string | null
          store_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      retailer_subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          included_leads: number | null
          leads_used_current_period: number | null
          monthly_price: number | null
          overage_rate: number | null
          plan_name: string | null
          plan_type: string
          retailer_id: string | null
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          included_leads?: number | null
          leads_used_current_period?: number | null
          monthly_price?: number | null
          overage_rate?: number | null
          plan_name?: string | null
          plan_type: string
          retailer_id?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          included_leads?: number | null
          leads_used_current_period?: number | null
          monthly_price?: number | null
          overage_rate?: number | null
          plan_name?: string | null
          plan_type?: string
          retailer_id?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "retailer_subscriptions_retailer_id_fkey"
            columns: ["retailer_id"]
            isOneToOne: false
            referencedRelation: "retailers"
            referencedColumns: ["id"]
          },
        ]
      }
      retailers: {
        Row: {
          address: string | null
          auto_pay_enabled: boolean | null
          billing_cycle: string | null
          billing_cycle_start: string | null
          brands_carried: string[] | null
          business_description: string | null
          business_license: string | null
          business_name: string
          business_references: string | null
          city: string | null
          contact_name: string
          coverage_postal_codes: string[] | null
          created_at: string
          current_balance: number | null
          email: string
          id: string
          installation_preference: string | null
          insurance_provider: string | null
          last_billing_date: string | null
          lead_types: string[] | null
          leads_used_this_month: number | null
          monthly_budget_cap: number | null
          next_billing_date: string | null
          partner_id: string | null
          phone: string | null
          postal_code: string | null
          postal_code_prefixes: string[] | null
          pricing_plan_id: string | null
          province: string | null
          service_areas: string[] | null
          services_offered: string[] | null
          status: string | null
          store_type: string | null
          stripe_customer_id: string | null
          subscription_tier: string | null
          updated_at: string
          urgency_filter: string | null
          urgency_preference: string | null
          user_id: string | null
          website: string | null
          years_in_business: number | null
        }
        Insert: {
          address?: string | null
          auto_pay_enabled?: boolean | null
          billing_cycle?: string | null
          billing_cycle_start?: string | null
          brands_carried?: string[] | null
          business_description?: string | null
          business_license?: string | null
          business_name: string
          business_references?: string | null
          city?: string | null
          contact_name: string
          coverage_postal_codes?: string[] | null
          created_at?: string
          current_balance?: number | null
          email: string
          id?: string
          installation_preference?: string | null
          insurance_provider?: string | null
          last_billing_date?: string | null
          lead_types?: string[] | null
          leads_used_this_month?: number | null
          monthly_budget_cap?: number | null
          next_billing_date?: string | null
          partner_id?: string | null
          phone?: string | null
          postal_code?: string | null
          postal_code_prefixes?: string[] | null
          pricing_plan_id?: string | null
          province?: string | null
          service_areas?: string[] | null
          services_offered?: string[] | null
          status?: string | null
          store_type?: string | null
          stripe_customer_id?: string | null
          subscription_tier?: string | null
          updated_at?: string
          urgency_filter?: string | null
          urgency_preference?: string | null
          user_id?: string | null
          website?: string | null
          years_in_business?: number | null
        }
        Update: {
          address?: string | null
          auto_pay_enabled?: boolean | null
          billing_cycle?: string | null
          billing_cycle_start?: string | null
          brands_carried?: string[] | null
          business_description?: string | null
          business_license?: string | null
          business_name?: string
          business_references?: string | null
          city?: string | null
          contact_name?: string
          coverage_postal_codes?: string[] | null
          created_at?: string
          current_balance?: number | null
          email?: string
          id?: string
          installation_preference?: string | null
          insurance_provider?: string | null
          last_billing_date?: string | null
          lead_types?: string[] | null
          leads_used_this_month?: number | null
          monthly_budget_cap?: number | null
          next_billing_date?: string | null
          partner_id?: string | null
          phone?: string | null
          postal_code?: string | null
          postal_code_prefixes?: string[] | null
          pricing_plan_id?: string | null
          province?: string | null
          service_areas?: string[] | null
          services_offered?: string[] | null
          status?: string | null
          store_type?: string | null
          stripe_customer_id?: string | null
          subscription_tier?: string | null
          updated_at?: string
          urgency_filter?: string | null
          urgency_preference?: string | null
          user_id?: string | null
          website?: string | null
          years_in_business?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "retailers_pricing_plan_id_fkey"
            columns: ["pricing_plan_id"]
            isOneToOne: false
            referencedRelation: "pricing_plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_postal_distance: {
        Args: { postal1: string; postal2: string }
        Returns: number
      }
      generate_slug: {
        Args: { input_text: string }
        Returns: string
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_current_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      verification_status:
        | "pending_verification"
        | "verified"
        | "expired"
        | "failed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      verification_status: [
        "pending_verification",
        "verified",
        "expired",
        "failed",
      ],
    },
  },
} as const
