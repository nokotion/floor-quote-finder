import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/components/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ArrowLeft, Shield } from 'lucide-react';
import { PasswordResetForm } from '@/components/auth/PasswordResetForm';
import { useDevMode } from '@/contexts/DevModeContext';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  
  const { signIn, user, profile, refreshProfile, isRecoveringPassword, clearPasswordRecovery } = useAuth();
  const navigate = useNavigate();
  const { isDevMode, currentRole } = useDevMode();

  // Check URL for recovery tokens immediately on mount
  useEffect(() => {
    const checkRecoveryToken = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const type = hashParams.get('type');
      
      if (type === 'recovery') {
        console.log('🔐 Recovery token detected in URL - validating...');
        
        // Validate the recovery token with Supabase
        try {
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('❌ Recovery token validation failed:', error);
            setError('Invalid or expired password reset link. Please request a new one.');
            // Clear the hash to prevent retry loops
            window.history.replaceState(null, '', window.location.pathname);
            return;
          }
          
          if (data?.session) {
            console.log('✅ Valid recovery token - showing password reset form');
            setShowPasswordReset(true);
            setError('');
            return;
          }
        } catch (err) {
          console.error('❌ Error validating recovery token:', err);
          setError('An error occurred validating the reset link.');
        }
      }
    };

    checkRecoveryToken();
  }, []); // Run once on mount

  useEffect(() => {
    const checkUserAccess = async () => {
      console.log('🔍 AdminLogin useEffect - State check:', {
        user: !!user,
        profile: !!profile,
        profileRole: profile?.role,
        isRecoveringPassword,
        passwordResetRequired: profile?.password_reset_required,
        isDevMode,
        currentRole,
        showPasswordReset
      });

      // CRITICAL: If password reset form is already shown, don't redirect
      if (showPasswordReset) {
        console.log('🔐 Password reset form active - blocking redirects');
        return;
      }

      // CRITICAL: Check password recovery state FIRST before any redirects
      if (isRecoveringPassword) {
        console.log('🔐 Password recovery mode detected - showing reset form');
        setShowPasswordReset(true);
        setError('');
        return;
      }

      if (isDevMode && currentRole === 'admin') {
        console.log('🧪 Dev mode admin access - redirecting to dashboard');
        navigate('/admin/dashboard');
        return;
      }
      
      if (user && profile) {
        console.log('👤 User and profile loaded');
        
        // Check if user is admin
        if (profile.role === 'admin') {
          // Check if password reset is required (temp password)
          if (profile.password_reset_required) {
            console.log('🔒 Password reset required - showing reset form');
            setShowPasswordReset(true);
            setError('');
            return;
          }
          
          // User is authenticated and is admin, redirect to dashboard
          console.log('✅ Admin authenticated - redirecting to dashboard');
          navigate('/admin/dashboard');
        } else {
          console.log('❌ Not an admin user');
          setError('Access denied. Admin privileges required.');
        }
      }
    };

    checkUserAccess();
  }, [user, profile, navigate, isDevMode, currentRole, isRecoveringPassword, showPasswordReset]);

  const handlePasswordResetSuccess = async () => {
    setShowPasswordReset(false);
    clearPasswordRecovery();
    await refreshProfile();
    navigate('/admin/dashboard');
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message);
      } else {
        // Refresh profile after successful login
        await refreshProfile();
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResetMessage('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://floor-quote-match.vercel.app/admin/login',
      });

      if (error) {
        setError(error.message);
      } else {
        setResetMessage('Password reset link sent! Check your email.');
        setTimeout(() => {
          setShowForgotPassword(false);
          setResetMessage('');
        }, 3000);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Login - Price My Floor</title>
        <meta name="description" content="Administrative access for Price My Floor management." />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <img 
                src="https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/pricemyfloor-files//pricemyfloor%20_logo.png" 
                alt="Price My Floor Logo" 
                className="h-10 sm:h-12 w-auto"
              />
            </Link>
            <Button variant="ghost" asChild>
              <Link to="/" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      <div className="py-12 px-4">
        <div className="max-w-md mx-auto space-y-6">
          {/* Show password reset form if required */}
          {showPasswordReset ? (
            <PasswordResetForm onSuccess={handlePasswordResetSuccess} />
          ) : showForgotPassword ? (
            <Card className="shadow-xl border-amber-200">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-amber-600" />
                </div>
                <CardTitle className="text-2xl">Reset Password</CardTitle>
                <CardDescription>Enter your admin email to receive a password reset link</CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert className="border-red-200 bg-red-50 mb-4">
                    <AlertDescription className="text-red-600">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}
                {resetMessage && (
                  <Alert className="border-green-200 bg-green-50 mb-4">
                    <AlertDescription className="text-green-600">
                      {resetMessage}
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handlePasswordResetRequest} className="space-y-4">
                  <div>
                    <Label htmlFor="reset-email">Admin Email</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="mt-1"
                      placeholder="admin@pricefloor.dev"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-amber-600 hover:bg-amber-700" 
                    disabled={loading}
                  >
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Send Reset Link
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setError('');
                      setResetMessage('');
                    }}
                  >
                    Back to Login
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Main Auth Card */}
              <Card className="shadow-xl border-amber-200">
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-amber-600" />
                  </div>
                  <CardTitle className="text-2xl">Admin Access</CardTitle>
                  <CardDescription>Administrative login required</CardDescription>
                </CardHeader>
                <CardContent>
                  {error && (
                    <Alert className="border-red-200 bg-red-50 mb-4">
                      <AlertDescription className="text-red-600">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div>
                      <Label htmlFor="email">Admin Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="mt-1"
                        placeholder="admin@pricefloor.dev"
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-amber-600 hover:bg-amber-700" 
                      disabled={loading}
                    >
                      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Admin Sign In
                    </Button>
                    <Button
                      type="button"
                      variant="link"
                      className="w-full text-sm text-amber-600"
                      onClick={() => {
                        setShowForgotPassword(true);
                        setError('');
                      }}
                    >
                      Forgot Password?
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <div className="text-center text-sm text-gray-600">
                <p className="text-xs">
                  This area is restricted to authorized administrators only.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default AdminLogin;