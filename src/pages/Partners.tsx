import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Users, TrendingUp, Shield, Award, DollarSign, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const partnerBenefits = [
  {
    icon: <Users className="w-8 h-8" />,
    title: "Qualified Leads",
    description: "Receive pre-qualified homeowners actively seeking flooring services in your area.",
    features: [
      "Homeowners ready to buy",
      "Detailed project requirements",
      "Verified contact information",
      "Geographic targeting"
    ]
  },
  {
    icon: <TrendingUp className="w-8 h-8" />,
    title: "Grow Your Business",
    description: "Expand your customer base and increase revenue with our growing network.",
    features: [
      "Access to new customers",
      "Increased project volume",
      "Business growth tracking",
      "Market expansion opportunities"
    ]
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: "Quality Assurance",
    description: "Maintain high standards with our quality control and customer feedback system.",
    features: [
      "Customer review system",
      "Quality monitoring",
      "Best practice sharing",
      "Continuous improvement"
    ]
  },
  {
    icon: <DollarSign className="w-8 h-8" />,
    title: "Competitive Pricing",
    description: "Fair and transparent pricing model that works for your business.",
    features: [
      "Pay per qualified lead",
      "No setup fees",
      "Flexible payment terms",
      "Volume discounts available"
    ]
  }
];

const requirements = [
  {
    title: "Business Licensing",
    description: "Valid business license and registration"
  },
  {
    title: "Insurance Coverage",
    description: "Comprehensive liability and workers' compensation insurance"
  },
  {
    title: "Experience",
    description: "Minimum 2 years of flooring installation experience"
  },
  {
    title: "Quality Standards",
    description: "Commitment to high-quality workmanship and customer service"
  },
  {
    title: "References",
    description: "Verifiable customer references and work portfolio"
  },
  {
    title: "Coverage Area",
    description: "Ability to service specific geographic regions"
  }
];

const stats = [
  {
    number: "500+",
    label: "Partner Retailers",
    description: "Across Canada"
  },
  {
    number: "10,000+",
    label: "Projects Completed",
    description: "Through our network"
  },
  {
    number: "4.8/5",
    label: "Average Rating",
    description: "Customer satisfaction"
  },
  {
    number: "95%",
    label: "Lead Quality",
    description: "Qualified homeowners"
  }
];

export default function Partners() {
  return (
    <>
      <Helmet>
        <title>Partner With Us | Price My Floor - Join Our Flooring Retailer Network</title>
        <meta name="description" content="Join Price My Floor's network of verified flooring retailers. Get qualified leads, grow your business, and serve homeowners across Canada." />
        <meta name="keywords" content="flooring partners, retailer network, business growth, qualified leads, contractor partnership" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <main className="max-w-7xl mx-auto px-4 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <Badge variant="secondary" className="bg-green-100 text-green-800 mb-4">
              Partner Opportunity
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Join Canada's Premier Flooring Network
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Partner with Price My Floor to access qualified leads, grow your business, and serve homeowners across Canada with quality flooring solutions.
            </p>
            <Button size="lg" asChild>
              <Link to="/retailer/apply">Apply to Join Network</Link>
            </Button>
          </div>

          {/* Statistics */}
          <section className="mb-20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                      {stat.number}
                    </div>
                    <div className="font-semibold text-gray-900 mb-1">
                      {stat.label}
                    </div>
                    <div className="text-sm text-gray-600">
                      {stat.description}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Partner Benefits */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Why Partner With Price My Floor?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Join a network that's designed to help flooring professionals succeed and grow their business.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {partnerBenefits.map((benefit, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-primary/10 rounded-lg text-primary">
                        {benefit.icon}
                      </div>
                      <div>
                        <CardTitle className="text-xl">{benefit.title}</CardTitle>
                        <CardDescription>{benefit.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {benefit.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Requirements */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Partner Requirements
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                We maintain high standards to ensure quality service for homeowners and success for our partners.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {requirements.map((requirement, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full text-primary mb-4 mx-auto">
                      <Award className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2">{requirement.title}</h3>
                    <p className="text-gray-600 text-sm">{requirement.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* How It Works for Partners */}
          <section className="mb-20 bg-white rounded-lg shadow-sm p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                How Partnership Works
              </h2>
              <p className="text-gray-600">
                Simple steps to start receiving qualified leads and growing your business.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-primary text-white rounded-full font-bold text-xl mb-4 mx-auto">
                  1
                </div>
                <h3 className="font-bold text-lg mb-2">Apply & Get Verified</h3>
                <p className="text-gray-600 text-sm">Submit your application and complete our verification process</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-primary text-white rounded-full font-bold text-xl mb-4 mx-auto">
                  2
                </div>
                <h3 className="font-bold text-lg mb-2">Receive Qualified Leads</h3>
                <p className="text-gray-600 text-sm">Get matched with homeowners in your service area looking for flooring</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-primary text-white rounded-full font-bold text-xl mb-4 mx-auto">
                  3
                </div>
                <h3 className="font-bold text-lg mb-2">Grow Your Business</h3>
                <p className="text-gray-600 text-sm">Close more deals, build your reputation, and expand your customer base</p>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center">
            <div className="bg-gradient-to-r from-primary to-primary/80 text-white rounded-lg p-8">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Join Our Network?
              </h2>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                Start receiving qualified leads and growing your flooring business today. The application process takes just a few minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild>
                  <Link to="/retailer/apply">Apply Now</Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary" asChild>
                  <Link to="/contact">Contact Us</Link>
                </Button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}