import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function Terms() {
  return (
    <>
      <Helmet>
        <title>Terms and Conditions | Price My Floor - Service Terms</title>
        <meta name="description" content="Terms and conditions for using Price My Floor services. Read our service terms, user responsibilities, and legal information." />
        <meta name="keywords" content="terms and conditions, service terms, legal, user agreement, Price My Floor" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <main className="max-w-4xl mx-auto px-4 py-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Terms and Conditions
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Last updated: January 1, 2024
            </p>
          </div>

          <div className="space-y-8">
            {/* Introduction */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">1. Introduction</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>
                  Welcome to Price My Floor ("we," "our," or "us"). These Terms and Conditions ("Terms") govern your use of our website and services. By accessing or using our services, you agree to be bound by these Terms.
                </p>
                <p>
                  Price My Floor is a platform that connects homeowners with verified flooring retailers and contractors across Canada. We facilitate connections but are not directly involved in the execution of flooring projects.
                </p>
              </CardContent>
            </Card>

            {/* Services */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">2. Our Services</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <h3 className="text-lg font-semibold mb-3">2.1 Service Description</h3>
                <p>Price My Floor provides:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Connection between homeowners and verified flooring retailers</li>
                  <li>Quote request processing and matching services</li>
                  <li>Retailer verification and quality monitoring</li>
                  <li>Customer support and dispute resolution assistance</li>
                </ul>

                <h3 className="text-lg font-semibold mb-3">2.2 Service Limitations</h3>
                <p>
                  We are an intermediary platform and do not directly provide flooring installation services. All work is performed by independent contractors and retailers in our network.
                </p>
              </CardContent>
            </Card>

            {/* User Responsibilities */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">3. User Responsibilities</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <h3 className="text-lg font-semibold mb-3">3.1 Accurate Information</h3>
                <p>You agree to provide accurate, current, and complete information when using our services.</p>

                <h3 className="text-lg font-semibold mb-3">3.2 Prohibited Uses</h3>
                <p>You may not use our services to:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Provide false or misleading information</li>
                  <li>Harass, abuse, or harm other users or service providers</li>
                  <li>Violate any applicable laws or regulations</li>
                  <li>Attempt to circumvent our verification processes</li>
                </ul>

                <h3 className="text-lg font-semibold mb-3">3.3 Communication</h3>
                <p>
                  You agree to communicate respectfully with retailers and contractors. Any disputes should be resolved professionally or escalated to our support team.
                </p>
              </CardContent>
            </Card>

            {/* Retailer Terms */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">4. Retailer and Contractor Terms</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <h3 className="text-lg font-semibold mb-3">4.1 Verification Requirements</h3>
                <p>All retailers and contractors must:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Maintain valid business licenses and insurance</li>
                  <li>Provide accurate business information</li>
                  <li>Maintain professional standards of service</li>
                  <li>Comply with all applicable laws and regulations</li>
                </ul>

                <h3 className="text-lg font-semibold mb-3">4.2 Lead Fees</h3>
                <p>
                  Retailers pay fees for qualified leads received through our platform. Fee structures are outlined in separate retailer agreements.
                </p>
              </CardContent>
            </Card>

            {/* Disclaimers */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">5. Disclaimers and Limitations</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <h3 className="text-lg font-semibold mb-3">5.1 Service Availability</h3>
                <p>
                  We strive to maintain continuous service availability but cannot guarantee uninterrupted access. Services may be temporarily unavailable due to maintenance, updates, or technical issues.
                </p>

                <h3 className="text-lg font-semibold mb-3">5.2 Third-Party Services</h3>
                <p>
                  We are not responsible for the quality, timeliness, or outcomes of work performed by retailers and contractors in our network. All agreements are between users and service providers.
                </p>

                <h3 className="text-lg font-semibold mb-3">5.3 Limitation of Liability</h3>
                <p>
                  Price My Floor's liability is limited to the extent permitted by law. We are not liable for indirect, incidental, or consequential damages arising from use of our services.
                </p>
              </CardContent>
            </Card>

            {/* Privacy and Data */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">6. Privacy and Data Protection</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>
                  Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your personal information.
                </p>
                <p>
                  By using our services, you consent to the collection and use of information as outlined in our Privacy Policy.
                </p>
              </CardContent>
            </Card>

            {/* Modifications */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">7. Modifications to Terms</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>
                  We reserve the right to modify these Terms at any time. Changes will be posted on this page with an updated "Last updated" date. Continued use of our services after changes constitutes acceptance of the new Terms.
                </p>
              </CardContent>
            </Card>

            {/* Governing Law */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">8. Governing Law</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>
                  These Terms are governed by the laws of Canada and the province of Ontario. Any disputes will be resolved in the courts of Ontario.
                </p>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">9. Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>
                  If you have questions about these Terms and Conditions, please contact us:
                </p>
                <ul className="list-none space-y-2">
                  <li><strong>Email:</strong> legal@pricemyfloor.ca</li>
                  <li><strong>Phone:</strong> 1-800-FLOORING (1-800-356-6746)</li>
                  <li><strong>Mail:</strong> Price My Floor Legal Department, 123 King Street West, Toronto, ON M5H 3T9</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Footer Navigation */}
          <div className="text-center mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" asChild>
                <Link to="/privacy">Privacy Policy</Link>
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