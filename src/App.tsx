
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Browse from "./pages/Browse";
import Quote from "./pages/Quote";
import BrandDetail from "./pages/BrandDetail";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./components/auth/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Auth from "./pages/Auth";
import RetailerLogin from "./pages/RetailerLogin";
import AdminLogin from "./pages/AdminLogin";
import RetailerApply from "./pages/RetailerApply";
import AdminDashboard from "./pages/admin/AdminDashboard";
import RetailerLayout from "./components/retailer/RetailerLayout";
import RetailerDashboard from "./pages/retailer/RetailerDashboard";
import RetailerLeads from "./pages/retailer/RetailerLeads";
import RetailerSubscriptions from "./pages/retailer/RetailerSubscriptions";
import RetailerBilling from "./pages/retailer/RetailerBilling";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/quote" element={<Quote />} />
            <Route path="/brand/:slug" element={<BrandDetail />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/retailer/login" element={<RetailerLogin />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/retailer/apply" element={<RetailerApply />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute requireRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            {/* Retailer Routes */}
            <Route path="/retailer" element={
              <ProtectedRoute>
                <RetailerLayout>
                  <RetailerDashboard />
                </RetailerLayout>
              </ProtectedRoute>
            } />
            <Route path="/retailer/leads" element={
              <ProtectedRoute>
                <RetailerLayout>
                  <RetailerLeads />
                </RetailerLayout>
              </ProtectedRoute>
            } />
            <Route path="/retailer/subscriptions" element={
              <ProtectedRoute>
                <RetailerLayout>
                  <RetailerSubscriptions />
                </RetailerLayout>
              </ProtectedRoute>
            } />
            <Route path="/retailer/billing" element={
              <ProtectedRoute>
                <RetailerLayout>
                  <RetailerBilling />
                </RetailerLayout>
              </ProtectedRoute>
            } />
            <Route path="/retailer/settings" element={
              <ProtectedRoute>
                <RetailerLayout>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold">Settings</h1>
                    <p className="text-gray-600 mt-2">Coming soon...</p>
                  </div>
                </RetailerLayout>
              </ProtectedRoute>
            } />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
