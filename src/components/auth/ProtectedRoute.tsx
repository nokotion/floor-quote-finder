
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
    const timestamp = Date.now();
    const debugMessage = `[${timestamp}] ProtectedRoute: user=${user?.id}, profile=${!!profile}, loading=${loading}, role=${requireRole}`;
    console.log(debugMessage);
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
      console.log(`[${timestamp}] Still loading auth, waiting...`);
      setRoleChecking(true);
      
      // Set a reasonable timeout for auth loading
      timeoutRef.current = setTimeout(() => {
        console.warn(`[${timestamp}] Auth loading timeout, proceeding with current state`);
        setRoleChecking(false);
      }, 3000); // 3 second timeout
      
      return;
    }

    // Auth is not loading, proceed with access check
    const performAccessCheck = async () => {
      if (checkExecutedRef.current) return;
      checkExecutedRef.current = true;

      try {
        console.log(`[${timestamp}] Starting access check...`);

        if (!user) {
          console.log(`[${timestamp}] No user found, redirecting to login`);
          setRoleChecking(false);
          if (requireRole === 'admin') {
            navigate('/admin/login');
          } else {
            navigate('/retailer/login');
          }
          return;
        }

        if (!profile) {
          console.log(`[${timestamp}] No profile found for user, this may indicate a profile fetch is still pending`);
          
          // Give it a moment for profile to load, but don't wait too long
          timeoutRef.current = setTimeout(() => {
            if (!profile) {
              console.error(`[${timestamp}] Profile still not available after timeout`);
              setError('Unable to load user profile. Please try refreshing the page.');
              setRoleChecking(false);
            }
          }, 2000);
          
          return;
        }

        console.log(`[${timestamp}] Profile found:`, profile);

        if (requireRole === 'admin') {
          if (profile.role === 'admin') {
            console.log(`[${timestamp}] Admin access granted`);
            setHasAccess(true);
          } else {
            console.log(`[${timestamp}] Admin access denied, redirecting`);
            navigate('/admin/login');
          }
        } else if (requireRole === 'retailer') {
          if (profile.retailer_id) {
            try {
              console.log(`[${timestamp}] Checking retailer status...`);
              const { data: retailer, error: retailerError } = await supabase
                .from('retailers')
                .select('status')
                .eq('id', profile.retailer_id)
                .maybeSingle();

              if (retailerError) {
                console.error(`[${timestamp}] Error checking retailer status:`, retailerError);
                setError('Error verifying retailer account');
                setRoleChecking(false);
                return;
              }

              if (retailer?.status === 'approved') {
                console.log(`[${timestamp}] Retailer access granted`);
                setHasAccess(true);
              } else {
                console.log(`[${timestamp}] Retailer not approved, status:`, retailer?.status);
                setError(`Your retailer account is ${retailer?.status || 'pending approval'}`);
                setTimeout(() => navigate('/retailer/login'), 3000);
              }
            } catch (error) {
              console.error(`[${timestamp}] Network error checking retailer:`, error);
              setError('Network error verifying retailer account');
            }
          } else {
            console.log(`[${timestamp}] No retailer_id found in profile`);
            setError('No retailer account associated with this user');
            setTimeout(() => navigate('/retailer/login'), 3000);
          }
        }

        setRoleChecking(false);
      } catch (error) {
        console.error(`[${timestamp}] Unexpected error in access check:`, error);
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
