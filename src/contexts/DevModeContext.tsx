import React, { createContext, useContext, useState, useEffect } from 'react';

export type DevRole = 'public' | 'admin' | 'retailer';

interface DevModeContextType {
  isDevMode: boolean;
  currentRole: DevRole;
  setCurrentRole: (role: DevRole) => void;
  mockUser: any;
  mockProfile: any;
  mockRetailerData: any;
  mockLeads: any[];
  mockBillingData: any;
  mockSubscriptions: any[];
}

const DevModeContext = createContext<DevModeContextType | undefined>(undefined);

export const useDevMode = () => {
  const context = useContext(DevModeContext);
  if (!context) {
    throw new Error('useDevMode must be used within a DevModeProvider');
  }
  return context;
};

export const DevModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<DevRole>('public');
  const isDevMode = import.meta.env.VITE_DEV_MODE === 'true';

  // Mock user object for dev mode - use real admin ID for RLS to work
  const mockUser = isDevMode ? {
    id: currentRole === 'admin' ? '03c68991-ed22-482a-9d66-b8bcdbe6c524' : 'dev-user-id',
    email: currentRole === 'admin' ? 'admin@dev.com' : 'retailer@dev.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } : null;

  // Mock profile based on current role - use real admin ID for RLS to work
  const mockProfile = isDevMode ? {
    id: currentRole === 'admin' ? '03c68991-ed22-482a-9d66-b8bcdbe6c524' : 'dev-user-id',
    retailer_id: currentRole === 'retailer' ? 'dev-retailer-id' : null,
    role: currentRole === 'admin' ? 'admin' : 'retailer',
    first_name: 'Dev',
    last_name: currentRole === 'admin' ? 'Admin' : 'Retailer',
    password_reset_required: false,
  } : null;

  // Mock retailer data for dev mode
  const mockRetailerData = isDevMode && currentRole === 'retailer' ? {
    id: 'dev-retailer-id',
    business_name: 'Dev Flooring Co.',
    contact_name: 'Dev Retailer',
    email: 'retailer@dev.com',
    phone: '(555) 123-4567',
    website: 'https://devflooring.com',
    address: '123 Main St',
    city: 'Toronto',
    province: 'ON',
    postal_code: 'M5V 3A8',
    current_balance: 500.00,
    monthly_budget_cap: 1000.00,
    auto_pay_enabled: true,
    coverage_postal_codes: ['M5V', 'M6G', 'M4E'],
    postal_code_prefixes: ['M5V', 'M6G', 'M4E'],
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  } : null;

  // Mock leads data for dev mode
  const mockLeads = isDevMode && currentRole === 'retailer' ? [
    {
      id: 'lead-1',
      customer_name: 'John Smith',
      customer_email: 'john@example.com',
      customer_phone: '(416) 555-0123',
      postal_code: 'M5V 2L7',
      flooring_type: 'hardwood',
      square_footage: 1500,
      installation_required: true,
      budget_range: '$5000-$7500',
      timeline: 'next_month',
      notes: 'Looking for premium hardwood flooring for living room and bedrooms',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'verified',
      attachment_urls: [],
      lead_price: 25.00,
      brand_matched: 'Shaw Floor',
      distribution_status: 'sent'
    },
    {
      id: 'lead-2',
      customer_name: 'Sarah Johnson',
      customer_email: 'sarah@example.com',
      customer_phone: '(416) 555-0456',
      postal_code: 'M6G 1B4',
      flooring_type: 'laminate',
      square_footage: 800,
      installation_required: false,
      budget_range: '$2000-$3000',
      timeline: 'within_week',
      notes: 'Need laminate flooring for basement renovation',
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'verified',
      attachment_urls: [],
      lead_price: 15.00,
      brand_matched: 'Kentwood',
      distribution_status: 'viewed'
    }
  ] : [];

  // Mock billing data for dev mode
  const mockBillingData = isDevMode && currentRole === 'retailer' ? {
    currentBalance: 500.00,
    monthlySpend: 180.00,
    leadsThisMonth: 12,
    nextBillingDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    billingHistory: [
      {
        id: 'bill-1',
        amount: 125.00,
        billing_type: 'lead_purchase',
        status: 'paid',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        billing_period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        billing_period_end: new Date().toISOString()
      },
      {
        id: 'bill-2',
        amount: 55.00,
        billing_type: 'lead_purchase',
        status: 'paid',
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        billing_period_start: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
        billing_period_end: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  } : null;

  // Mock subscriptions data for dev mode
  const mockSubscriptions = isDevMode && currentRole === 'retailer' ? [
    {
      id: 'sub-1',
      retailer_id: 'dev-retailer-id',
      brand_name: 'Shaw Floor',
      sqft_tier: 'medium',
      sqft_tier_min: 500,
      sqft_tier_max: 1500,
      is_active: true,
      accepts_installation: true,
      lead_price: 25.00,
      installation_surcharge: 5.00
    },
    {
      id: 'sub-2',
      retailer_id: 'dev-retailer-id',
      brand_name: 'Kentwood',
      sqft_tier: 'small',
      sqft_tier_min: 0,
      sqft_tier_max: 500,
      is_active: true,
      accepts_installation: false,
      lead_price: 15.00,
      installation_surcharge: 0.00
    }
  ] : [];

  return (
    <DevModeContext.Provider value={{
      isDevMode,
      currentRole,
      setCurrentRole,
      mockUser,
      mockProfile,
      mockRetailerData,
      mockLeads,
      mockBillingData,
      mockSubscriptions
    }}>
      {children}
    </DevModeContext.Provider>
  );
};