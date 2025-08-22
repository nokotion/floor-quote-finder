
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


const RetailerLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  
  const { signIn, user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserAccess = async () => {
      console.log('RetailerLogin checking user access:', user?.id, profile);
      
      if (user && profile) {
        if (profile.retailer_id) {
          // Check if password reset is required
          if (profile.password_reset_required) {
            setShowPasswordReset(true);
            setError('');
            return;
          }
          
          // User is authenticated and has retailer profile, redirect to dashboard
          navigate('/retailer');
        } else {
          setError('No retailer account found. Please apply to join our network first.');
        }
      }
    };

    checkUserAccess();
  }, [user, profile, navigate]);

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
    await refreshProfile();
    navigate('/retailer');
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
              <Link to="/" className="font-bold text-2xl text-blue-600">
                Price My Floor
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
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default RetailerLogin;
