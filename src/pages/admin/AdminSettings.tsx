import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { 
  Loader2, 
  Settings, 
  Mail, 
  Globe, 
  Shield, 
  Database, 
  Bell,
  Save
} from 'lucide-react';

interface AdminSettings {
  id: string;
  site_name: string;
  admin_email: string;
  support_email: string;
  notifications_enabled: boolean;
  maintenance_mode: boolean;
  created_at: string;
  updated_at: string;
}

const AdminSettings = () => {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      // For now, we'll use mock data since there's no settings table
      // In a real app, you'd fetch from a settings table
      setSettings({
        id: '1',
        site_name: 'Price My Floor',
        admin_email: 'admin@pricemyfloor.com',
        support_email: 'support@pricemyfloor.com',
        notifications_enabled: true,
        maintenance_mode: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // TODO: Implement actual settings save to database
      // await supabase.from('admin_settings').upsert(settings);
      
      // For now, just simulate a save
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof AdminSettings, value: any) => {
    if (!settings) return;
    setSettings({
      ...settings,
      [key]: value,
      updated_at: new Date().toISOString(),
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-600">
            Failed to load settings
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Settings - Admin Dashboard</title>
        <meta name="description" content="Manage system settings and configuration." />
      </Helmet>
      
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
            <p className="text-gray-600 mt-2">Manage system configuration and preferences</p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-600">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-600">
              {success}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  General Settings
                </CardTitle>
                <CardDescription>
                  Basic system configuration and site information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="site_name">Site Name</Label>
                  <Input
                    id="site_name"
                    value={settings.site_name}
                    onChange={(e) => updateSetting('site_name', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-gray-500">
                      Put the site in maintenance mode to prevent public access
                    </p>
                  </div>
                  <Switch
                    checked={settings.maintenance_mode}
                    onCheckedChange={(checked) => updateSetting('maintenance_mode', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Email Configuration
                </CardTitle>
                <CardDescription>
                  Configure email addresses and SMTP settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="admin_email">Admin Email</Label>
                  <Input
                    id="admin_email"
                    type="email"
                    value={settings.admin_email}
                    onChange={(e) => updateSetting('admin_email', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="support_email">Support Email</Label>
                  <Input
                    id="support_email"
                    type="email"
                    value={settings.support_email}
                    onChange={(e) => updateSetting('support_email', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">SMTP Configuration</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="smtp_host">SMTP Host</Label>
                      <Input
                        id="smtp_host"
                        placeholder="smtp.gmail.com"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="smtp_port">SMTP Port</Label>
                      <Input
                        id="smtp_port"
                        placeholder="587"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="smtp_username">SMTP Username</Label>
                    <Input
                      id="smtp_username"
                      placeholder="username@gmail.com"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtp_password">SMTP Password</Label>
                    <Input
                      id="smtp_password"
                      type="password"
                      placeholder="••••••••"
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Settings
                </CardTitle>
                <CardDescription>
                  Configure system notifications and alerts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-gray-500">
                      Enable or disable email notifications
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications_enabled}
                    onCheckedChange={(checked) => updateSetting('notifications_enabled', checked)}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Notification Types</h4>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>New Applications</Label>
                      <p className="text-sm text-gray-500">
                        Notify when new retailer applications are submitted
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>New Leads</Label>
                      <p className="text-sm text-gray-500">
                        Notify when new leads are generated
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>System Errors</Label>
                      <p className="text-sm text-gray-500">
                        Notify when system errors occur
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Configure security policies and access controls
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-500">
                      Require 2FA for admin accounts
                    </p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Force Password Reset</Label>
                    <p className="text-sm text-gray-500">
                      Force password reset every 90 days
                    </p>
                  </div>
                  <Switch />
                </div>

                <Separator />

                <div>
                  <Label htmlFor="session_timeout">Session Timeout (minutes)</Label>
                  <Input
                    id="session_timeout"
                    type="number"
                    defaultValue="60"
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="database" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Database Management
                </CardTitle>
                <CardDescription>
                  Database maintenance and backup settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <h3 className="text-lg font-semibold">Database Status</h3>
                        <p className="text-green-600 font-medium">Connected</p>
                        <p className="text-sm text-gray-500 mt-2">Last backup: 2 hours ago</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <h3 className="text-lg font-semibold">Storage Used</h3>
                        <p className="text-blue-600 font-medium">2.4 GB</p>
                        <p className="text-sm text-gray-500 mt-2">of 10 GB limit</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Backup Settings</h4>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Automatic Backups</Label>
                      <p className="text-sm text-gray-500">
                        Create automatic daily backups
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div>
                    <Label htmlFor="backup_retention">Backup Retention (days)</Label>
                    <Input
                      id="backup_retention"
                      type="number"
                      defaultValue="30"
                      className="mt-1"
                    />
                  </div>
                </div>

                <Separator />

                <div className="flex gap-2">
                  <Button variant="outline">
                    Create Backup
                  </Button>
                  <Button variant="outline">
                    Download Backup
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default AdminSettings;