import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react';

const RetailerApply = () => {
  const [formData, setFormData] = useState({
    business_name: '',
    contact_name: '',
    email: '',
    phone: '',
    city: '',
    postal_code: '',
    business_address: '',
    website: '',
    years_in_business: '',
    business_description: '',
    business_references: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = {
        ...formData,
        years_in_business: formData.years_in_business ? parseInt(formData.years_in_business) : null
      };

      const { error } = await supabase
        .from('retailer_applications')
        .insert([submitData]);

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <Helmet>
          <title>Application Submitted - Price My Floor</title>
          <meta name="description" content="Your retailer application has been submitted successfully." />
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
            <div className="max-w-md mx-auto">
              <Card className="shadow-xl border-green-200">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <CardTitle className="text-2xl text-green-800">Application Submitted!</CardTitle>
                  <CardDescription>
                    Thank you for your interest in joining our retailer network.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <p className="text-gray-600">
                    We'll review your application and contact you within 2-3 business days.
                  </p>
                  <div className="space-y-2">
                    <Button asChild className="w-full">
                      <Link to="/">Return to Home</Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full">
                      <Link to="/retailer/login">Already have an account? Sign In</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Apply to Join Network - Price My Floor</title>
        <meta name="description" content="Apply to become a verified retailer partner with Price My Floor." />
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
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Join Our Retailer Network</CardTitle>
              <CardDescription>
                Apply to become a verified flooring retailer and start receiving qualified leads
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert className="border-red-200 bg-red-50 mb-6">
                  <AlertDescription className="text-red-600">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Business Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Business Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="business_name">Business Name *</Label>
                      <Input
                        id="business_name"
                        name="business_name"
                        value={formData.business_name}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact_name">Contact Name *</Label>
                      <Input
                        id="contact_name"
                        name="contact_name"
                        value={formData.contact_name}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="business_address">Business Address</Label>
                    <Input
                      id="business_address"
                      name="business_address"
                      value={formData.business_address}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="postal_code">Postal Code *</Label>
                      <Input
                        id="postal_code"
                        name="postal_code"
                        value={formData.postal_code}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                        placeholder="A1A 1A1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        name="website"
                        type="url"
                        value={formData.website}
                        onChange={handleInputChange}
                        className="mt-1"
                        placeholder="https://your-website.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="years_in_business">Years in Business</Label>
                      <Input
                        id="years_in_business"
                        name="years_in_business"
                        type="number"
                        value={formData.years_in_business}
                        onChange={handleInputChange}
                        className="mt-1"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
                  
                  <div>
                    <Label htmlFor="business_description">Business Description</Label>
                    <Textarea
                      id="business_description"
                      name="business_description"
                      value={formData.business_description}
                      onChange={handleInputChange}
                      className="mt-1"
                      rows={3}
                      placeholder="Tell us about your business, services offered, and specializations..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="business_references">References</Label>
                    <Textarea
                      id="business_references"
                      name="business_references"
                      value={formData.business_references}
                      onChange={handleInputChange}
                      className="mt-1"
                      rows={2}
                      placeholder="Please provide any business references or certifications..."
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Submit Application
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-center text-sm text-gray-600 space-y-2">
            <p>
              Already have an account? <Link to="/retailer/login" className="text-blue-600 hover:underline">Sign in here</Link>
            </p>
            <p>
              Questions? <Link to="/" className="text-blue-600 hover:underline">Contact our support team</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default RetailerApply;