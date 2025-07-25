
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from './integrations/supabase/client';
import { AuthProvider } from './components/auth/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';
import { LayoutWrapper } from './components/layout/LayoutWrapper';
import Index from './pages/Index';
import Quote from './pages/Quote';
import Browse from './pages/Browse';
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
import AdminBrands from './pages/admin/AdminBrands';
import AdminUsers from './pages/admin/AdminUsers';

// Create missing page components that are still needed
const AboutPage = () => (
  <MainLayout>
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
  </MainLayout>
);

const ContactPage = () => (
  <MainLayout>
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
  </MainLayout>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <LayoutWrapper>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/quote" element={<Quote />} />
            <Route path="/browse" element={<Browse />} />
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
            <Route path="/retailer" element={
              <ProtectedRoute requireRole="retailer">
                <RetailerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/retailer/leads" element={
              <ProtectedRoute requireRole="retailer">
                <RetailerLeads />
              </ProtectedRoute>
            } />
            <Route path="/retailer/subscriptions" element={
              <ProtectedRoute requireRole="retailer">
                <RetailerSubscriptions />
              </ProtectedRoute>
            } />
            <Route path="/retailer/coverage-map" element={
              <ProtectedRoute requireRole="retailer">
                <RetailerCoverageMap />
              </ProtectedRoute>
            } />
            <Route path="/retailer/billing" element={
              <ProtectedRoute requireRole="retailer">
                <RetailerBilling />
              </ProtectedRoute>
            } />
            <Route path="/retailer/settings" element={
              <ProtectedRoute requireRole="retailer">
                <RetailerSettings />
              </ProtectedRoute>
            } />
            
            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={
              <ProtectedRoute requireRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/retailers" element={
              <ProtectedRoute requireRole="admin">
                <AdminRetailers />
              </ProtectedRoute>
            } />
            <Route path="/admin/brands" element={
              <ProtectedRoute requireRole="admin">
                <AdminBrands />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute requireRole="admin">
                <AdminUsers />
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute requireRole="admin">
                <AdminSettings />
              </ProtectedRoute>
            } />
          </Routes>
        </LayoutWrapper>
      </Router>
    </AuthProvider>
  );
}

export default App;
