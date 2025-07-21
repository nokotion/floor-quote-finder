import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from './integrations/supabase/client';
import { MainLayout } from './components/layout/MainLayout';
import { LayoutWrapper } from './components/layout/LayoutWrapper';
import RetailerLogin from './pages/retailer/RetailerLogin';
import RetailerApply from './pages/retailer/RetailerApply';
import RetailerDashboard from './pages/retailer/RetailerDashboard';
import RetailerLeads from './pages/retailer/RetailerLeads';
import RetailerBilling from './pages/retailer/RetailerBilling';
import RetailerSettings from './pages/retailer/RetailerSettings';
import RetailerSubscriptions from './pages/retailer/RetailerSubscriptions';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRetailers from './pages/admin/AdminRetailers';
import AdminBrands from './pages/admin/AdminBrands';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSettings from './pages/admin/AdminSettings';
import RetailerCoverageMap from './pages/retailer/RetailerCoverageMap';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [session, setSession] = React.useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  if (!session) {
    // Redirect to login page if not authenticated
    return (
      <div className="flex justify-center items-center h-screen">
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
          redirectTo={`${location.pathname}`}
        />
      </div>
    );
  }

  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <LayoutWrapper>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<MainLayout.Home />} />
          <Route path="/about" element={<MainLayout.About />} />
          <Route path="/contact" element={<MainLayout.Contact />} />
          <Route path="/auth" element={
            <div className="flex justify-center items-center h-screen">
              <Auth
                supabaseClient={supabase}
                appearance={{ theme: ThemeSupa }}
                providers={[]}
              />
            </div>
          } />
          
          {/* Retailer routes */}
          <Route path="/retailer/login" element={<RetailerLogin />} />
          <Route path="/retailer/apply" element={<RetailerApply />} />
          <Route path="/retailer" element={<ProtectedRoute><RetailerDashboard /></ProtectedRoute>} />
          <Route path="/retailer/leads" element={<ProtectedRoute><RetailerLeads /></ProtectedRoute>} />
          <Route path="/retailer/subscriptions" element={<ProtectedRoute><RetailerSubscriptions /></ProtectedRoute>} />
          <Route path="/retailer/coverage-map" element={<ProtectedRoute><RetailerCoverageMap /></ProtectedRoute>} />
          <Route path="/retailer/billing" element={<ProtectedRoute><RetailerBilling /></ProtectedRoute>} />
          <Route path="/retailer/settings" element={<ProtectedRoute><RetailerSettings /></ProtectedRoute>} />
          
          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/retailers" element={<ProtectedRoute><AdminRetailers /></ProtectedRoute>} />
          <Route path="/admin/brands" element={<ProtectedRoute><AdminBrands /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
        </Routes>
      </LayoutWrapper>
    </Router>
  );
}

export default App;
