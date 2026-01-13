import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/components/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import { PasswordResetForm } from '@/components/auth/PasswordResetForm';
import { useDevMode } from '@/contexts/DevModeContext';


const RetailerLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  
  const { signIn, user, profile, refreshProfile, isRecoveringPassword, clearPasswordRecovery } = useAuth();
  const navigate = useNavigate();
  const { isDevMode, currentRole } = useDevMode();

  useEffect(() => {
    const checkUserAccess = async () => {
      console.log('RetailerLogin checking user access:', user?.id, profile, { isDevMode, currentRole });

      // Dev Mode: bypass login if role is retailer or admin
      if (isDevMode && (currentRole === 'retailer' || currentRole === 'admin')) {
        navigate('/retailer/dashboard');
        return;
      }
      
      if (user && profile) {
        if (profile.retailer_id) {
          // Check if password reset is required (temp password or recovery email)
          if (profile.password_reset_required || isRecoveringPassword) {
            setShowPasswordReset(true);
            setError('');
            return;
          }
          
          // User is authenticated and has retailer profile, redirect to dashboard
          navigate('/retailer/dashboard');
        } else {
          setError('No retailer account found. Please apply to join our network first.');
        }
      }
    };

    checkUserAccess();
  }, [user, profile, navigate, isDevMode, currentRole]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Attempting to sign in:', email);
      const { error } = await signIn(email, password);
      if (error) {
        console.error('Sign in error:', error);
        setError(error.message);
      } else {
        // Refresh profile after successful login
        await refreshProfile();
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordResetSuccess = async () => {
    setShowPasswordReset(false);
    clearPasswordRecovery();
    await refreshProfile();
    navigate('/retailer/dashboard');
  };

  return (
    <>
      <Helmet>
        <title>Retailer Login - Price My Floor</title>
        <meta name="description" content="Sign in to your retailer account to access leads and manage your business." />
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
            ) : (
              <>
                {/* Main Auth Card */}
                <Card className="shadow-xl">
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Retailer Login</CardTitle>
                    <CardDescription>Sign in to your retailer account</CardDescription>
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
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="mt-1"
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
                        className="w-full" 
                        disabled={loading}
                      >
                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Sign In
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <div className="text-center text-sm text-gray-600 space-y-2">
                  <p>
                    Not a retailer yet? <Link to="/retailer/apply" className="text-blue-600 hover:underline">Apply to join our network</Link>
                  </p>
                  <p>
                    Need help? <Link to="/" className="text-blue-600 hover:underline">Contact support</Link>
                  </p>
                </div>

                {/* Dev Mode Quick Access */}
                {isDevMode && (
                  <Card className="mt-6 border-dashed border-2 border-orange-300 bg-orange-50">
                    <CardContent className="pt-4">
                      <p className="text-xs text-orange-600 font-medium mb-2 text-center">🛠️ Dev Mode</p>
                      <Button 
                        variant="outline" 
                        className="w-full border-orange-400 text-orange-600 hover:bg-orange-100"
                        onClick={() => {
                          if (currentRole !== 'retailer') {
                            // This would need setCurrentRole from context, but we can just navigate
                          }
                          navigate('/retailer/dashboard');
                        }}
                      >
                        Skip Login → Dashboard
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default RetailerLogin;
