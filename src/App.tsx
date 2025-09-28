
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from './integrations/supabase/client';
import { AuthProvider } from './components/auth/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { LayoutWrapper } from './components/layout/LayoutWrapper';
import RetailerLayout from './components/retailer/RetailerLayout';
import { AdminLayout } from './components/admin/AdminLayout';
import { BrandProvider } from './contexts/BrandContext';
import { DevModeProvider } from './contexts/DevModeContext';
import { DevModeBanner } from './components/dev/DevModeBanner';
import { DevModePanel } from './components/dev/DevModePanel';
import { Toaster } from './components/ui/sonner';
import { HelmetProvider } from 'react-helmet-async';

// Lazy load page components
const Index = lazy(() => import('./pages/Index'));
const Quote = lazy(() => import('./pages/Quote'));
const Browse = lazy(() => import('./pages/Browse'));
const Verify = lazy(() => import('./pages/Verify'));
const RetailerLogin = lazy(() => import('./pages/RetailerLogin'));
const RetailerApply = lazy(() => import('./pages/RetailerApply'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const Help = lazy(() => import('./pages/Help'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Contact = lazy(() => import('./pages/Contact'));
const HowItWorks = lazy(() => import('./pages/HowItWorks'));
const Partners = lazy(() => import('./pages/Partners'));
const FlooringTypes = lazy(() => import('./pages/FlooringTypes'));
const Installation = lazy(() => import('./pages/Installation'));
const Reviews = lazy(() => import('./pages/Reviews'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));

// Retailer pages
const RetailerDashboard = lazy(() => import('./pages/retailer/RetailerDashboard'));
const RetailerLeadsList = lazy(() => import('./pages/retailer/RetailerLeadsList'));
const RetailerBilling = lazy(() => import('./pages/retailer/RetailerBilling'));
const RetailerSettings = lazy(() => import('./pages/retailer/RetailerSettings'));
const RetailerSubscriptions = lazy(() => import('./pages/retailer/RetailerSubscriptions'));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminRetailers = lazy(() => import('./pages/admin/AdminRetailers'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminBrands = lazy(() => import('./pages/admin/AdminBrands'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminApplications = lazy(() => import('./pages/admin/AdminApplications'));
const AdminLeads = lazy(() => import('./pages/admin/AdminLeads'));

// Create missing page components that are still needed
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

function App() {
  return (
    <HelmetProvider>
      <DevModeProvider>
        <AuthProvider>
          <Router>
            <BrandProvider>
              <DevModeBanner />
              <LayoutWrapper>
                <Toaster />
                <DevModePanel />
                <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
                  <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Index />} />
                    <Route path="/quote" element={<Quote />} />
                    <Route path="/browse" element={<Browse />} />
                    <Route path="/verify" element={<Verify />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/help" element={<Help />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/how-it-works" element={<HowItWorks />} />
                    <Route path="/partners" element={<Partners />} />
                    <Route path="/flooring-types" element={<FlooringTypes />} />
                    <Route path="/installation" element={<Installation />} />
                    <Route path="/reviews" element={<Reviews />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/privacy" element={<Privacy />} />
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
                    <Route path="/retailer" element={<Navigate to="/retailer/dashboard" replace />} />
                    <Route path="/retailer/dashboard" element={
                      <ProtectedRoute requireRole="retailer">
                        <RetailerLayout>
                          <RetailerDashboard />
                        </RetailerLayout>
                      </ProtectedRoute>
                    } />
                    <Route path="/retailer/leads" element={
                      <ProtectedRoute requireRole="retailer">
                        <RetailerLayout>
                          <RetailerLeadsList />
                        </RetailerLayout>
                      </ProtectedRoute>
                    } />
                    <Route path="/retailer/subscriptions" element={
                      <ProtectedRoute requireRole="retailer">
                        <RetailerLayout>
                          <RetailerSubscriptions />
                        </RetailerLayout>
                      </ProtectedRoute>
                    } />
                    <Route path="/retailer/billing" element={
                      <ProtectedRoute requireRole="retailer">
                        <RetailerLayout>
                          <RetailerBilling />
                        </RetailerLayout>
                      </ProtectedRoute>
                    } />
                    <Route path="/retailer/settings" element={
                      <ProtectedRoute requireRole="retailer">
                        <RetailerLayout>
                          <RetailerSettings />
                        </RetailerLayout>
                      </ProtectedRoute>
                    } />
                    
                    {/* Admin routes */}
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="/admin/dashboard" element={
                      <ProtectedRoute requireRole="admin">
                        <AdminLayout>
                          <AdminDashboard />
                        </AdminLayout>
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/retailers" element={
                      <ProtectedRoute requireRole="admin">
                        <AdminLayout>
                          <AdminRetailers />
                        </AdminLayout>
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/brands" element={
                      <ProtectedRoute requireRole="admin">
                        <AdminLayout>
                          <AdminBrands />
                        </AdminLayout>
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/users" element={
                      <ProtectedRoute requireRole="admin">
                        <AdminLayout>
                          <AdminUsers />
                        </AdminLayout>
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/applications" element={
                      <ProtectedRoute requireRole="admin">
                        <AdminLayout>
                          <AdminApplications />
                        </AdminLayout>
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/leads" element={
                      <ProtectedRoute requireRole="admin">
                        <AdminLayout>
                          <AdminLeads />
                        </AdminLayout>
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/settings" element={
                      <ProtectedRoute requireRole="admin">
                        <AdminLayout>
                          <AdminSettings />
                        </AdminLayout>
                      </ProtectedRoute>
                    } />
                  </Routes>
                </Suspense>
              </LayoutWrapper>
            </BrandProvider>
          </Router>
        </AuthProvider>
      </DevModeProvider>
    </HelmetProvider>
  );
}

export default App;
