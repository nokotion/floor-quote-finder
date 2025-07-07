import { useLocation } from "react-router-dom";
import { MainLayout } from "./MainLayout";
import { AdminLayout } from "../admin/AdminLayout";
import RetailerLayout from "../retailer/RetailerLayout";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export const LayoutWrapper = ({ children }: LayoutWrapperProps) => {
  const location = useLocation();
  const path = location.pathname;

  // Auth pages and quote page - no layout (minimal design)
  const authPaths = ['/retailer/login', '/admin/login', '/retailer/apply', '/auth', '/quote'];
  if (authPaths.includes(path)) {
    return <>{children}</>;
  }

  // Retailer dashboard pages - use RetailerLayout
  if (path.startsWith('/retailer') && path !== '/retailer/login' && path !== '/retailer/apply') {
    return <RetailerLayout>{children}</RetailerLayout>;
  }

  // Admin pages - use AdminLayout
  if (path.startsWith('/admin') && path !== '/admin/login') {
    return <AdminLayout>{children}</AdminLayout>;
  }

  // Public pages - use MainLayout
  return <MainLayout>{children}</MainLayout>;
};