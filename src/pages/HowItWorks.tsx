import React from 'react';
import { Helmet } from 'react-helmet-async';
import { FileText, Users, Quote, CheckCircle, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const steps = [
  {
    number: 1,
    icon: <FileText className="w-8 h-8" />,
    title: "Tell Us About Your Project",
    description: "Complete our simple form with details about your flooring needs, space size, preferred materials, and timeline.",
    details: [
      "Specify room dimensions and layout",
      "Select flooring type preferences",
      "Set your budget range",
      "Choose installation timeline"
    ]
  },
  {
    number: 2,
    icon: <Users className="w-8 h-8" />,
    title: "We Match You with Verified Retailers",
    description: "Our system connects you with 2-4 qualified retailers in your area who specialize in your flooring type.",
    details: [
      "All retailers are verified and insured",
      "Matched based on location and expertise",
      "Quality guaranteed through our standards",
      "Customer reviews and ratings available"
    ]
  },
  {
    number: 3,
    icon: <Quote className="w-8 h-8" />,
    title: "Receive Competitive Quotes",
    description: "Retailers will contact you within 24-48 hours with detailed quotes and can schedule in-home consultations.",
    details: [
      "Multiple quotes for price comparison",
      "Detailed breakdown of costs",
      "Material and labor estimates",
      "In-home consultation scheduling"
    ]
  },
  {
    number: 4,
    icon: <CheckCircle className="w-8 h-8" />,
    title: "Choose and Get Started",
    description: "Compare quotes, read reviews, and select the retailer that best fits your needs and budget.",
    details: [
      "Compare prices and services",
      "Review retailer profiles and ratings",
      "Ask questions and clarify details",
      "Schedule your installation"
    ]
  }
];

const benefits = [
  {
    title: "100% Free Service",
    description: "No cost to homeowners - we're paid by retailers"
  },
  {
    title: "Verified Retailers Only",
    description: "All retailers are licensed, insured, and background checked"
  },
  {
    title: "Competitive Pricing",
    description: "Multiple quotes ensure you get the best price"
  },
  {
    title: "Quality Guaranteed",
    description: "We maintain high standards across our network"
  },
  {
    title: "Canada-Wide Coverage",
    description: "Serving homeowners across all major Canadian cities"
  },
  {
    title: "Expert Support",
    description: "Our team is here to help throughout the process"
  }
];

export default function HowItWorks() {
  return (
    <>
      <Helmet>
        <title>How It Works | Price My Floor - Simple Steps to Get Flooring Quotes</title>
        <meta name="description" content="Learn how Price My Floor connects homeowners with verified flooring retailers. Simple 4-step process to get competitive quotes." />
        <meta name="keywords" content="how it works, flooring quotes, process, retailers, installation, Canada" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <main className="max-w-7xl mx-auto px-4 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Getting flooring quotes has never been easier. Follow our simple 4-step process to connect with verified retailers.
            </p>
            <Badge variant="secondary" className="bg-green-100 text-green-800 text-sm px-4 py-2">
              100% Free for Homeowners
            </Badge>
          </div>

          {/* Process Steps */}
          <section className="mb-20">
            <div className="space-y-12">
              {steps.map((step, index) => (
                <div key={step.number} className="relative">
                  <div className="flex flex-col lg:flex-row items-center gap-8">
                    {/* Step Card */}
                    <Card className="w-full lg:w-1/2 hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex items-center justify-center w-12 h-12 bg-primary text-white rounded-full font-bold text-lg">
                            {step.number}
                          </div>
                          <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            {step.icon}
                          </div>
                        </div>
                        <CardTitle className="text-2xl">{step.title}</CardTitle>
                        <CardDescription className="text-base">{step.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {step.details.map((detail, detailIndex) => (
                            <li key={detailIndex} className="flex items-center gap-2 text-sm text-gray-600">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></div>
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    {/* Arrow (hidden on mobile, shown between steps on desktop) */}
                    {index < steps.length - 1 && (
                      <div className="hidden lg:block text-primary">
                        <ArrowRight className="w-8 h-8" />
                      </div>
                    )}

                    {/* Visual Element */}
                    <div className="w-full lg:w-1/2 flex justify-center">
                      <div className="w-48 h-48 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center">
                        <div className="text-primary text-6xl font-bold opacity-20">
                          {step.number}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Benefits Section */}
          <section className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Why Choose Price My Floor?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                We make finding the right flooring retailer simple, safe, and cost-effective.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">{benefit.title}</h3>
                    <p className="text-gray-600 text-sm">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of Canadian homeowners who have found their perfect flooring through Price My Floor.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/quote">Get Your Free Quote</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/browse">Browse Retailers</Link>
              </Button>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}