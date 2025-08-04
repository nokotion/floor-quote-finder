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

  const authPaths = ['/retailer/login', '/admin/login', '/retailer/apply', '/auth'];
  if (authPaths.includes(path)) {
    return <>{children}</>;
  }

  if (path.startsWith('/retailer') && path !== '/retailer/login' && path !== '/retailer/apply') {
    return <RetailerLayout>{children}</RetailerLayout>;
  }

  if (path.startsWith('/admin') && path !== '/admin/login') {
    return <AdminLayout>{children}</AdminLayout>;
  }

  return <MainLayout>{children}</MainLayout>;
};
