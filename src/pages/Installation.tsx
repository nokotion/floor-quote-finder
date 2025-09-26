import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Wrench, Clock, CheckCircle, Home, Users, Award } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const installationSteps = [
  {
    step: 1,
    title: "Initial Consultation",
    description: "Professional assessment of your space and flooring needs",
    duration: "1-2 hours",
    details: [
      "Space measurement and layout planning",
      "Subfloor inspection and preparation needs",
      "Material selection and customization options",
      "Timeline and cost estimation"
    ]
  },
  {
    step: 2,
    title: "Preparation & Planning",
    description: "Site preparation and material ordering",
    duration: "1-3 days",
    details: [
      "Furniture removal and room clearing",
      "Old flooring removal if necessary",
      "Subfloor repairs and leveling",
      "Material delivery and acclimation"
    ]
  },
  {
    step: 3,
    title: "Professional Installation",
    description: "Expert installation using proper techniques and tools",
    duration: "1-5 days",
    details: [
      "Precise cutting and fitting",
      "Professional adhesive or fastening methods",
      "Quality control at each stage",
      "Trim and transition installation"
    ]
  },
  {
    step: 4,
    title: "Finishing & Cleanup",
    description: "Final touches and thorough cleanup",
    duration: "Half day",
    details: [
      "Final inspection and touch-ups",
      "Thorough cleaning of work area",
      "Furniture replacement assistance",
      "Care and maintenance instructions"
    ]
  }
];

const serviceTypes = [
  {
    icon: <Home className="w-8 h-8" />,
    title: "Residential Installation",
    description: "Professional flooring installation for homes",
    features: [
      "Living rooms and bedrooms",
      "Kitchens and bathrooms",
      "Basements and upper floors",
      "Stairs and hallways"
    ]
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Commercial Installation",
    description: "Heavy-duty flooring solutions for businesses",
    features: [
      "Office buildings and retail spaces",
      "Restaurants and hospitality",
      "Healthcare facilities",
      "Educational institutions"
    ]
  },
  {
    icon: <Award className="w-8 h-8" />,
    title: "Specialty Installation",
    description: "Specialized flooring for unique requirements",
    features: [
      "Sports and fitness facilities",
      "Industrial and warehouse",
      "Historic restoration projects",
      "Custom design installations"
    ]
  }
];

const benefits = [
  {
    title: "Professional Results",
    description: "Expert installation ensures optimal performance and longevity"
  },
  {
    title: "Warranty Protection",
    description: "Professional installation often required for manufacturer warranties"
  },
  {
    title: "Time Savings",
    description: "Experienced installers complete projects faster than DIY"
  },
  {
    title: "Proper Tools & Equipment",
    description: "Access to professional-grade tools and installation equipment"
  },
  {
    title: "Problem Resolution",
    description: "Experts can handle unexpected issues during installation"
  },
  {
    title: "Safety Assurance",
    description: "Proper safety procedures and liability insurance coverage"
  }
];

const flooringTimelines = [
  { type: "Hardwood", timeline: "2-4 days", complexity: "Medium" },
  { type: "Laminate", timeline: "1-2 days", complexity: "Low" },
  { type: "Vinyl/LVP", timeline: "1-3 days", complexity: "Low-Medium" },
  { type: "Tile", timeline: "3-5 days", complexity: "High" },
  { type: "Carpet", timeline: "1-2 days", complexity: "Low" },
  { type: "Sports Flooring", timeline: "3-7 days", complexity: "High" }
];

export default function Installation() {
  return (
    <>
      <Helmet>
        <title>Professional Flooring Installation | Price My Floor - Expert Installation Services</title>
        <meta name="description" content="Professional flooring installation services across Canada. Expert installers for hardwood, laminate, vinyl, tile, and specialty flooring." />
        <meta name="keywords" content="flooring installation, professional installers, hardwood installation, tile installation, flooring contractors" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <main className="max-w-7xl mx-auto px-4 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 mb-4">
              Professional Installation
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Expert Flooring Installation Services
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Professional installation ensures your flooring looks perfect, lasts longer, and maintains its warranty. Our verified installers deliver quality results every time.
            </p>
            <Button size="lg" asChild>
              <Link to="/quote">Get Installation Quote</Link>
            </Button>
          </div>

          {/* Installation Process */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Professional Installation Process
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                From initial consultation to final cleanup, our process ensures quality results.
              </p>
            </div>

            <div className="space-y-8">
              {installationSteps.map((step, index) => (
                <Card key={step.step} className="overflow-hidden">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Step Number & Duration */}
                    <div className="bg-primary/5 p-6 flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                        {step.step}
                      </div>
                      <Badge variant="outline" className="mb-2">
                        <Clock className="w-3 h-3 mr-1" />
                        {step.duration}
                      </Badge>
                    </div>

                    {/* Content */}
                    <div className="lg:col-span-3 p-6">
                      <CardHeader className="p-0 mb-4">
                        <CardTitle className="text-xl">{step.title}</CardTitle>
                        <CardDescription>{step.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-0">
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {step.details.map((detail, detailIndex) => (
                            <li key={detailIndex} className="flex items-start gap-2 text-sm text-gray-600">
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* Service Types */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Installation Services We Offer
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Comprehensive installation services for residential, commercial, and specialty projects.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {serviceTypes.map((service, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-primary/10 rounded-full text-primary">
                        {service.icon}
                      </div>
                    </div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-gray-600">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center justify-center gap-2">
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

          {/* Installation Timelines */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Installation Timeframes
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Typical installation times for different flooring types (for average-sized rooms).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {flooringTimelines.map((flooring, index) => (
                <Card key={index}>
                  <CardContent className="p-6 text-center">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">{flooring.type}</h3>
                    <div className="text-2xl font-bold text-primary mb-2">{flooring.timeline}</div>
                    <Badge 
                      variant={flooring.complexity === 'Low' ? 'secondary' : flooring.complexity === 'Medium' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {flooring.complexity} Complexity
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Benefits */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Why Choose Professional Installation?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Professional installation provides significant advantages over DIY approaches.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Wrench className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-bold text-gray-900">{benefit.title}</h3>
                    </div>
                    <p className="text-gray-600 text-sm">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center">
            <div className="bg-gradient-to-r from-primary to-primary/80 text-white rounded-lg p-8">
              <h2 className="text-3xl font-bold mb-4">
                Ready for Professional Installation?
              </h2>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                Get quotes from verified professional installers in your area. Quality installation, competitive pricing, guaranteed results.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild>
                  <Link to="/quote">Get Installation Quote</Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary" asChild>
                  <Link to="/browse">Find Installers</Link>
                </Button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}