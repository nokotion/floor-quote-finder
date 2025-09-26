import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Eye, Lock, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | Price My Floor - Data Protection & Privacy</title>
        <meta name="description" content="Price My Floor privacy policy. Learn how we collect, use, and protect your personal information when using our flooring quote service." />
        <meta name="keywords" content="privacy policy, data protection, personal information, privacy, security" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <main className="max-w-4xl mx-auto px-4 py-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Shield className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-4">
              Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
            </p>
            <p className="text-sm text-gray-500">Last updated: January 1, 2024</p>
          </div>

          {/* Quick Overview */}
          <section className="mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-3">
                    <Eye className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Transparency</h3>
                  <p className="text-sm text-gray-600">We're clear about what data we collect and why</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-3">
                    <Lock className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Security</h3>
                  <p className="text-sm text-gray-600">Your data is encrypted and securely stored</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-3">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Control</h3>
                  <p className="text-sm text-gray-600">You have control over your personal information</p>
                </CardContent>
              </Card>
            </div>
          </section>

          <div className="space-y-8">
            {/* Introduction */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">1. Introduction</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>
                  Price My Floor ("we," "our," or "us") respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
                </p>
                <p>
                  By using our services, you consent to the data practices described in this policy.
                </p>
              </CardContent>
            </Card>

            {/* Information We Collect */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">2. Information We Collect</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <h3 className="text-lg font-semibold mb-3">2.1 Personal Information</h3>
                <p>We collect information you provide directly to us, including:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Name and contact information (email, phone number, address)</li>
                  <li>Project details and flooring preferences</li>
                  <li>Property information and measurements</li>
                  <li>Communication preferences</li>
                </ul>

                <h3 className="text-lg font-semibold mb-3">2.2 Automatically Collected Information</h3>
                <p>When you use our website, we automatically collect:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>IP address and location data</li>
                  <li>Browser type and device information</li>
                  <li>Pages visited and time spent on our site</li>
                  <li>Referral sources and search terms</li>
                </ul>

                <h3 className="text-lg font-semibold mb-3">2.3 Cookies and Tracking Technologies</h3>
                <p>
                  We use cookies and similar technologies to enhance user experience, analyze website traffic, and deliver personalized content. You can control cookie settings through your browser preferences.
                </p>
              </CardContent>
            </Card>

            {/* How We Use Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">3. How We Use Your Information</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>We use your information to:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Match you with appropriate flooring retailers and contractors</li>
                  <li>Process and respond to your quote requests</li>
                  <li>Communicate about your projects and our services</li>
                  <li>Improve our website and user experience</li>
                  <li>Analyze usage patterns and preferences</li>
                  <li>Prevent fraud and ensure security</li>
                  <li>Comply with legal obligations</li>
                </ul>
                
                <h3 className="text-lg font-semibold mb-3">Marketing Communications</h3>
                <p>
                  With your consent, we may send you promotional materials about our services. You can opt out of marketing communications at any time using the unsubscribe link in our emails or by contacting us directly.
                </p>
              </CardContent>
            </Card>

            {/* Information Sharing */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">4. Information Sharing and Disclosure</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <h3 className="text-lg font-semibold mb-3">4.1 With Service Providers</h3>
                <p>
                  We share your project information with verified retailers and contractors in our network to provide you with relevant quotes and services.
                </p>

                <h3 className="text-lg font-semibold mb-3">4.2 Service Partners</h3>
                <p>We may share information with trusted third-party service providers who assist us with:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Website hosting and maintenance</li>
                  <li>Email and communication services</li>
                  <li>Analytics and data analysis</li>
                  <li>Customer support services</li>
                </ul>

                <h3 className="text-lg font-semibold mb-3">4.3 Legal Requirements</h3>
                <p>
                  We may disclose your information if required by law, court order, or to protect our rights, property, or safety, or that of our users or the public.
                </p>

                <h3 className="text-lg font-semibold mb-3">4.4 Business Transfers</h3>
                <p>
                  In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the business transaction.
                </p>
              </CardContent>
            </Card>

            {/* Data Security */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">5. Data Security</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>We implement appropriate security measures to protect your personal information, including:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Secure servers and firewalls</li>
                  <li>Regular security audits and updates</li>
                  <li>Limited access to personal information</li>
                  <li>Employee training on data protection</li>
                </ul>
                <p>
                  While we strive to protect your information, no security system is completely secure. We cannot guarantee the absolute security of your data.
                </p>
              </CardContent>
            </Card>

            {/* Your Rights */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">6. Your Rights and Choices</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>You have the right to:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal requirements)</li>
                  <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                  <li><strong>Portability:</strong> Request transfer of your data to another service provider</li>
                </ul>
                <p>
                  To exercise these rights, please contact us using the information provided at the end of this policy.
                </p>
              </CardContent>
            </Card>

            {/* Data Retention */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">7. Data Retention</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>
                  We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this policy. Specific retention periods depend on:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>The nature of the information</li>
                  <li>Legal and regulatory requirements</li>
                  <li>Business needs and purposes</li>
                  <li>Your preferences and consent</li>
                </ul>
                <p>
                  When information is no longer needed, we securely delete or anonymize it.
                </p>
              </CardContent>
            </Card>

            {/* Children's Privacy */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">8. Children's Privacy</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>
                  Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If we become aware that we have collected information from a child, we will take steps to delete it promptly.
                </p>
              </CardContent>
            </Card>

            {/* International Users */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">9. International Users</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>
                  Our services are primarily intended for users in Canada. If you access our services from outside Canada, please be aware that your information may be transferred to, stored, and processed in Canada, where our servers and central database are located.
                </p>
              </CardContent>
            </Card>

            {/* Changes to Privacy Policy */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">10. Changes to This Privacy Policy</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on our website and updating the "Last updated" date. We encourage you to review this policy periodically.
                </p>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">11. Contact Us</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>
                  If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
                </p>
                <ul className="list-none space-y-2">
                  <li><strong>Email:</strong> privacy@pricemyfloor.ca</li>
                  <li><strong>Phone:</strong> 1-800-FLOORING (1-800-356-6746)</li>
                  <li><strong>Mail:</strong> Price My Floor Privacy Officer, 123 King Street West, Toronto, ON M5H 3T9</li>
                </ul>
                <p className="mt-4">
                  We will respond to your inquiry within 30 days of receiving your request.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Footer Navigation */}
          <div className="text-center mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" asChild>
                <Link to="/terms">Terms and Conditions</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/contact">Contact Us</Link>
              </Button>
              <Button asChild>
                <Link to="/">Back to Home</Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}