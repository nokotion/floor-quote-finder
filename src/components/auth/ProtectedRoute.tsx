
import { useEffect, useState, useRef } from 'react';
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
  const [debugInfo, setDebugInfo] = useState<string>('');
  const checkExecutedRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const debugMessage = `ProtectedRoute: user=${user?.id}, profile=${!!profile}, loading=${loading}, role=${requireRole}`;
    setDebugInfo(debugMessage);

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Reset states when auth context changes
    setError(null);
    setHasAccess(false);
    checkExecutedRef.current = false;

    // If still loading, wait a bit more but don't wait indefinitely
    if (loading) {
      setRoleChecking(true);
      
      // Set a reasonable timeout for auth loading
      timeoutRef.current = setTimeout(() => {
        setRoleChecking(false);
      }, 2000); // 2 second timeout
      
      return;
    }

    // Auth is not loading, proceed with access check
    const performAccessCheck = async () => {
      if (checkExecutedRef.current) return;
      checkExecutedRef.current = true;

      try {
        if (!user) {
          setRoleChecking(false);
          if (requireRole === 'admin') {
            navigate('/admin/login');
          } else {
            navigate('/retailer/login');
          }
          return;
        }

        if (!profile) {
          // Give it a moment for profile to load, but don't wait too long
          timeoutRef.current = setTimeout(() => {
            if (!profile) {
              setError('Unable to load user profile. Please try refreshing the page.');
              setRoleChecking(false);
            }
          }, 1500);
          
          return;
        }

        if (requireRole === 'admin') {
          if (profile.role === 'admin') {
            setHasAccess(true);
          } else {
            navigate('/admin/login');
          }
        } else if (requireRole === 'retailer') {
          if (profile.retailer_id) {
            try {
              const { data: retailer, error: retailerError } = await supabase
                .from('retailers')
                .select('status')
                .eq('id', profile.retailer_id)
                .maybeSingle();

              if (retailerError) {
                console.error('Error checking retailer status:', retailerError);
                setError('Error verifying retailer account');
                setRoleChecking(false);
                return;
              }

              if (retailer?.status === 'approved') {
                setHasAccess(true);
              } else {
                setError(`Your retailer account is ${retailer?.status || 'pending approval'}`);
                setTimeout(() => navigate('/retailer/login'), 3000);
              }
            } catch (error) {
              console.error('Network error checking retailer:', error);
              setError('Network error verifying retailer account');
            }
          } else {
            setError('No retailer account associated with this user');
            setTimeout(() => navigate('/retailer/login'), 3000);
          }
        }

        setRoleChecking(false);
      } catch (error) {
        console.error('Unexpected error in access check:', error);
        setError('An unexpected error occurred during authentication');
        setRoleChecking(false);
      }
    };

    performAccessCheck();

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [user, profile, loading, navigate, requireRole]);

  if (loading || roleChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
          <p className="text-xs text-gray-400 mt-4">{debugInfo}</p>
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
