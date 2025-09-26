import React, { createContext, useContext, useState, useEffect } from 'react';

export type DevRole = 'public' | 'admin' | 'retailer';

interface DevModeContextType {
  isDevMode: boolean;
  currentRole: DevRole;
  setCurrentRole: (role: DevRole) => void;
  mockUser: any;
  mockProfile: any;
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

  return (
    <DevModeContext.Provider value={{
      isDevMode,
      currentRole,
      setCurrentRole,
      mockUser,
      mockProfile
    }}>
      {children}
    </DevModeContext.Provider>
  );
};