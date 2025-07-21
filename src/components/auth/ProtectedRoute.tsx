
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireRole = 'retailer' }) => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [roleChecking, setRoleChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      console.log('ProtectedRoute checking access for user:', user?.id, 'requireRole:', requireRole);
      console.log('Profile:', profile);

      if (loading) {
        console.log('Still loading auth...');
        return;
      }

      if (!user) {
        console.log('No user, redirecting to login');
        if (requireRole === 'admin') {
          navigate('/admin/login');
        } else {
          navigate('/retailer/login');
        }
        return;
      }

      if (!profile) {
        console.log('No profile found for user');
        setError('User profile not found');
        setRoleChecking(false);
        return;
      }

      if (requireRole === 'admin') {
        if (profile.role === 'admin') {
          console.log('Admin access granted');
          setHasAccess(true);
        } else {
          console.log('Admin access denied, redirecting to admin login');
          navigate('/admin/login');
        }
      } else if (requireRole === 'retailer') {
        if (profile.retailer_id) {
          // Check if retailer is approved
          try {
            const { data: retailer, error: retailerError } = await supabase
              .from('retailers')
              .select('status')
              .eq('id', profile.retailer_id)
              .single();

            if (retailerError) {
              console.error('Error checking retailer status:', retailerError);
              setError('Error verifying retailer account');
              setRoleChecking(false);
              return;
            }

            if (retailer?.status === 'approved') {
              console.log('Retailer access granted');
              setHasAccess(true);
            } else {
              console.log('Retailer not approved, redirecting to login');
              setError('Your retailer account is pending approval');
              setTimeout(() => navigate('/retailer/login'), 2000);
            }
          } catch (error) {
            console.error('Error checking retailer:', error);
            setError('Error verifying retailer account');
          }
        } else {
          console.log('No retailer_id found, redirecting to login');
          setError('No retailer account found');
          setTimeout(() => navigate('/retailer/login'), 2000);
        }
      }

      setRoleChecking(false);
    };

    checkAccess();
  }, [user, profile, loading, navigate, requireRole]);

  if (loading || roleChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Access Denied</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
