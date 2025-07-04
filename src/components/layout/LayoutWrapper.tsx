import { useLocation } from "react-router-dom";
import { MainLayout } from "./MainLayout";
import RetailerLayout from "../retailer/RetailerLayout";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export const LayoutWrapper = ({ children }: LayoutWrapperProps) => {
  const location = useLocation();
  const path = location.pathname;

  // Auth pages - no layout (minimal design)
  const authPaths = ['/retailer/login', '/admin/login', '/retailer/apply', '/auth'];
  if (authPaths.includes(path)) {
    return <>{children}</>;
  }

  // Retailer dashboard pages - use RetailerLayout
  if (path.startsWith('/retailer') && path !== '/retailer/login' && path !== '/retailer/apply') {
    return <RetailerLayout>{children}</RetailerLayout>;
  }

  // Admin pages - no layout wrapper (they handle their own layout)
  if (path.startsWith('/admin')) {
    return <>{children}</>;
  }

  // Public pages - use MainLayout
  return <MainLayout>{children}</MainLayout>;
};