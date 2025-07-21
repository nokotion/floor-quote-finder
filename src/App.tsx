
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from './integrations/supabase/client';
import { MainLayout } from './components/layout/MainLayout';
import { LayoutWrapper } from './components/layout/LayoutWrapper';
import RetailerLogin from './pages/RetailerLogin';
import RetailerApply from './pages/RetailerApply';
import RetailerDashboard from './pages/retailer/RetailerDashboard';
import RetailerLeads from './pages/retailer/RetailerLeads';
import RetailerBilling from './pages/retailer/RetailerBilling';
import RetailerSettings from './pages/retailer/RetailerSettings';
import RetailerSubscriptions from './pages/retailer/RetailerSubscriptions';
import RetailerCoverageMap from './pages/retailer/RetailerCoverageMap';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRetailers from './pages/admin/AdminRetailers';
import AdminSettings from './pages/admin/AdminSettings';

// Create missing page components
const HomePage = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Price My Floor
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Connect with verified flooring retailers across Canada
        </p>
        <div className="space-y-4">
          <div className="flex justify-center space-x-4">
            <a href="/retailer/login" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
              Retailer Login
            </a>
            <a href="/admin/login" className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700">
              Admin Login
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const AboutPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          About Price My Floor
        </h1>
        <p className="text-xl text-gray-600">
          We connect homeowners with verified flooring retailers across Canada.
        </p>
      </div>
    </div>
  </div>
);

const ContactPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Contact Us
        </h1>
        <p className="text-xl text-gray-600">
          Get in touch with our support team.
        </p>
      </div>
    </div>
  </div>
);

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
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
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
          <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
        </Routes>
      </LayoutWrapper>
    </Router>
  );
}

export default App;
