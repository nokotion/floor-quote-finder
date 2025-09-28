import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { useDevMode } from '@/contexts/DevModeContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { formatAndValidatePostalCode } from '@/utils/postalCodeUtils';
import EnhancedPostalCodeCoverage from '@/components/retailer/EnhancedPostalCodeCoverage';
import { Building2, MapPin, Phone, Mail, Globe, DollarSign } from 'lucide-react';

interface RetailerProfile {
  id: string;
  business_name: string;
  contact_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  website: string;
  business_description: string;
  auto_pay_enabled: boolean;
  monthly_budget_cap: number;
  status: string;
  lead_notification_email?: string;
  lead_forwarding_emails?: string[];
  email_notification_preference?: string;
}

const RetailerSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isDevMode, mockRetailerData } = useDevMode();
  const [profile, setProfile] = useState<RetailerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      if (isDevMode && mockRetailerData) {
        // Use mock data in dev mode
        setProfile(mockRetailerData as RetailerProfile);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from('profiles')
        .select('retailer_id')
        .eq('id', user.id)
        .single();

      if (!profileData?.retailer_id) return;

      const { data: retailer } = await supabase
        .from('retailers')
        .select('*')
        .eq('id', profileData.retailer_id)
        .single();

      setProfile(retailer);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      if (isDevMode) {
        // In dev mode, just show success toast
        toast({
          title: "Success",
          description: "Profile updated successfully (dev mode)",
        });
        return;
      }

      const { error } = await supabase
        .from('retailers')
        .update({
          business_name: profile.business_name,
          contact_name: profile.contact_name,
          phone: profile.phone,
          address: profile.address,
          city: profile.city,
          province: profile.province,
          postal_code: profile.postal_code,
          website: profile.website,
          business_description: profile.business_description,
          auto_pay_enabled: profile.auto_pay_enabled,
          monthly_budget_cap: profile.monthly_budget_cap,
          lead_notification_email: profile.lead_notification_email,
          lead_forwarding_emails: profile.lead_forwarding_emails,
          email_notification_preference: profile.email_notification_preference,
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateProfile = (field: keyof RetailerProfile, value: any) => {
    if (profile) {
      setProfile({ ...profile, [field]: value });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No profile data found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <Badge variant={profile.status === 'active' ? 'default' : 'secondary'}>
          {profile.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Notification Settings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              Lead Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="lead_notification_email">Primary Lead Notification Email</Label>
              <Input
                id="lead_notification_email"
                type="email"
                value={profile.lead_notification_email || profile.email}
                onChange={(e) => updateProfile('lead_notification_email', e.target.value)}
                placeholder={profile.email}
              />
              <p className="text-sm text-gray-500 mt-1">
                Email address where lead notifications will be sent (defaults to account email)
              </p>
            </div>
            <div>
              <Label htmlFor="lead_forwarding_emails">Additional Forwarding Emails</Label>
              <Textarea
                id="lead_forwarding_emails"
                value={profile.lead_forwarding_emails?.join(', ') || ''}
                onChange={(e) => {
                  const emails = e.target.value.split(',').map(email => email.trim()).filter(email => email);
                  updateProfile('lead_forwarding_emails', emails);
                }}
                placeholder="additional@email.com, team@company.com"
                rows={2}
              />
              <p className="text-sm text-gray-500 mt-1">
                Comma-separated list of additional emails to forward leads to
              </p>
            </div>
            <div>
              <Label htmlFor="email_notification_preference">Notification Frequency</Label>
              <select
                id="email_notification_preference"
                value={profile.email_notification_preference || 'immediate'}
                onChange={(e) => updateProfile('email_notification_preference', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="immediate">Immediate (as leads come in)</option>
                <option value="daily_digest">Daily Digest</option>
                <option value="disabled">Disabled</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">
                How often you want to receive lead notifications
              </p>
            </div>
          </CardContent>
        </Card>
        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="business_name">Business Name</Label>
              <Input
                id="business_name"
                value={profile.business_name}
                onChange={(e) => updateProfile('business_name', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="contact_name">Contact Name</Label>
              <Input
                id="contact_name"
                value={profile.contact_name}
                onChange={(e) => updateProfile('contact_name', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="business_description">Business Description</Label>
              <Textarea
                id="business_description"
                value={profile.business_description || ''}
                onChange={(e) => updateProfile('business_description', e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Phone className="w-5 h-5 mr-2" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">
                Email cannot be changed. Contact support if needed.
              </p>
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={profile.phone || ''}
                onChange={(e) => updateProfile('phone', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={profile.website || ''}
                onChange={(e) => updateProfile('website', e.target.value)}
                placeholder="https://www.yourwebsite.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Billing Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Billing Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto_pay">Auto Pay</Label>
                <p className="text-sm text-gray-500">
                  Automatically pay for leads using your default payment method
                </p>
              </div>
              <Switch
                id="auto_pay"
                checked={profile.auto_pay_enabled}
                onCheckedChange={(checked) => updateProfile('auto_pay_enabled', checked)}
              />
            </div>
            <Separator />
            <div>
              <Label htmlFor="monthly_budget_cap">Monthly Budget Cap ($CAD)</Label>
              <Input
                id="monthly_budget_cap"
                type="number"
                value={profile.monthly_budget_cap}
                onChange={(e) => updateProfile('monthly_budget_cap', parseFloat(e.target.value) || 0)}
                min="0"
                step="10"
              />
              <p className="text-sm text-gray-500 mt-1">
                Maximum amount to spend on leads per month
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coverage Selection - Full Width */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Service Coverage Areas</h2>
        <div className="grid gap-6">
          {/* Map-based coverage (primary) */}
          <div id="map-coverage">
            {/* Map component will be loaded here */}
          </div>
          
          {/* Text-based coverage (fallback) */}
          <EnhancedPostalCodeCoverage retailerId={profile.id} />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

export default RetailerSettings;