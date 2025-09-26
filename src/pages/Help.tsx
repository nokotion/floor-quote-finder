import React from 'react';
import { Helmet } from 'react-helmet-async';
import { MessageCircle, Phone, Mail, FileText, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const helpTopics = [
  {
    title: "Getting Started",
    description: "Learn how to get quotes and find flooring retailers",
    icon: <FileText className="w-6 h-6" />,
    links: [
      { name: "How to get a quote", href: "/quote" },
      { name: "Browse retailers", href: "/browse" },
      { name: "How it works", href: "/how-it-works" },
    ]
  },
  {
    title: "Flooring Types",
    description: "Explore different flooring options and materials",
    icon: <FileText className="w-6 h-6" />,
    links: [
      { name: "Flooring types guide", href: "/flooring-types" },
      { name: "Installation services", href: "/installation" },
      { name: "Browse brands", href: "/browse" },
    ]
  },
  {
    title: "Support",
    description: "Get help with your account and orders",
    icon: <MessageCircle className="w-6 h-6" />,
    links: [
      { name: "Frequently asked questions", href: "/faq" },
      { name: "Contact support", href: "/contact" },
      { name: "Customer reviews", href: "/reviews" },
    ]
  }
];

const contactMethods = [
  {
    icon: <Phone className="w-6 h-6" />,
    title: "Phone Support",
    description: "Call us for immediate assistance",
    contact: "1-800-FLOORING",
    hours: "Monday - Friday: 9 AM - 6 PM EST"
  },
  {
    icon: <Mail className="w-6 h-6" />,
    title: "Email Support",
    description: "Send us an email and we'll get back to you",
    contact: "support@pricemyfloor.ca",
    hours: "We typically respond within 24 hours"
  },
  {
    icon: <MessageCircle className="w-6 h-6" />,
    title: "Live Chat",
    description: "Chat with our support team",
    contact: "Available on website",
    hours: "Monday - Friday: 9 AM - 6 PM EST"
  }
];

export default function Help() {
  return (
    <>
      <Helmet>
        <title>Help Center | Price My Floor - Get Support for Your Flooring Needs</title>
        <meta name="description" content="Get help with quotes, flooring types, and finding retailers. Comprehensive support center for all your flooring questions." />
        <meta name="keywords" content="flooring help, customer support, FAQ, quotes, installation, retailers" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <main className="max-w-7xl mx-auto px-4 py-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Help Center
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find answers to your questions about flooring quotes, retailers, and our services
            </p>
          </div>

          {/* Help Topics */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Browse Help Topics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {helpTopics.map((topic, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        {topic.icon}
                      </div>
                      <CardTitle className="text-xl">{topic.title}</CardTitle>
                    </div>
                    <CardDescription>{topic.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {topic.links.map((link, linkIndex) => (
                        <li key={linkIndex}>
                          <Link 
                            to={link.href}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700 hover:text-primary"
                          >
                            <span>{link.name}</span>
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Contact Methods */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Contact Support</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {contactMethods.map((method, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-primary/10 rounded-full text-primary">
                        {method.icon}
                      </div>
                    </div>
                    <CardTitle className="text-xl">{method.title}</CardTitle>
                    <CardDescription>{method.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="font-semibold text-primary mb-2">{method.contact}</p>
                    <p className="text-sm text-gray-600">{method.hours}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Quick Actions */}
          <section className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Quick Actions</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/quote">Get Your Quote</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/faq">View FAQ</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}