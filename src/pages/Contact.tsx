import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const contactMethods = [
  {
    icon: <Phone className="w-6 h-6" />,
    title: "Phone Support",
    description: "Speak directly with our support team",
    contact: "1-800-FLOORING (1-800-356-6746)",
    hours: "Monday - Friday: 9:00 AM - 6:00 PM EST",
    availability: "Available Now"
  },
  {
    icon: <Mail className="w-6 h-6" />,
    title: "Email Support",
    description: "Send us a detailed message",
    contact: "support@pricemyfloor.ca",
    hours: "We respond within 24 hours",
    availability: "Always Available"
  },
  {
    icon: <MessageCircle className="w-6 h-6" />,
    title: "Live Chat",
    description: "Chat with us in real-time",
    contact: "Available on all pages",
    hours: "Monday - Friday: 9:00 AM - 6:00 PM EST",
    availability: "Available Now"
  }
];

const offices = [
  {
    city: "Toronto",
    address: "123 King Street West, Suite 1000",
    postal: "Toronto, ON M5H 3T9",
    phone: "(416) 555-0123"
  },
  {
    city: "Vancouver",
    address: "456 Granville Street, Suite 800",
    postal: "Vancouver, BC V6C 1V5",
    phone: "(604) 555-0456"
  },
  {
    city: "Montreal",
    address: "789 Rue Saint-Jacques, Suite 600",
    postal: "Montreal, QC H3C 1G1",
    phone: "(514) 555-0789"
  }
];

export default function Contact() {
  return (
    <>
      <Helmet>
        <title>Contact Us | Price My Floor - Customer Support & Inquiries</title>
        <meta name="description" content="Get in touch with Price My Floor for support, questions, or feedback. Phone, email, and live chat options available." />
        <meta name="keywords" content="contact, customer support, phone, email, help, Price My Floor" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <main className="max-w-7xl mx-auto px-4 py-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Contact Us
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're here to help with your flooring needs. Reach out using any of the methods below.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Send us a Message</CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you within 24 hours.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="John" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Doe" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="john.doe@example.com" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" placeholder="(555) 123-4567" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="inquiry">Inquiry Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select inquiry type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="quote">Getting a Quote</SelectItem>
                        <SelectItem value="support">Technical Support</SelectItem>
                        <SelectItem value="retailer">Retailer Questions</SelectItem>
                        <SelectItem value="billing">Billing Issue</SelectItem>
                        <SelectItem value="partnership">Partnership Inquiry</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Tell us how we can help you..."
                      rows={5}
                    />
                  </div>
                  
                  <Button size="lg" className="w-full">
                    Send Message
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Contact Methods & Office Info */}
            <div className="space-y-8">
              {/* Contact Methods */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
                <div className="space-y-4">
                  {contactMethods.map((method, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-primary/10 rounded-lg text-primary flex-shrink-0">
                            {method.icon}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">{method.title}</h3>
                            <p className="text-sm text-gray-600 mb-2">{method.description}</p>
                            <p className="font-medium text-primary mb-1">{method.contact}</p>
                            <p className="text-xs text-gray-500">{method.hours}</p>
                          </div>
                          <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            {method.availability}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Office Locations */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Offices</h2>
                <div className="space-y-4">
                  {offices.map((office, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-primary/10 rounded-lg text-primary flex-shrink-0">
                            <MapPin className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">{office.city}</h3>
                            <p className="text-sm text-gray-600">{office.address}</p>
                            <p className="text-sm text-gray-600 mb-2">{office.postal}</p>
                            <p className="text-sm font-medium text-primary">{office.phone}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Business Hours */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">Business Hours</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monday - Friday</span>
                    <span className="font-medium">9:00 AM - 6:00 PM EST</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Saturday</span>
                    <span className="font-medium">10:00 AM - 4:00 PM EST</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sunday</span>
                    <span className="font-medium">Closed</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}