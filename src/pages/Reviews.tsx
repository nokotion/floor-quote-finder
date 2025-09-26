import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Star, MapPin, Calendar, CheckCircle, Quote } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';

const customerReviews = [
  {
    name: "Sarah Johnson",
    location: "Toronto, ON",
    rating: 5,
    date: "March 2024",
    project: "Hardwood Installation",
    retailer: "Premium Flooring Solutions",
    review: "Outstanding service from start to finish! The team was professional, punctual, and delivered exactly what was promised. Our new hardwood floors look absolutely beautiful and the installation was completed ahead of schedule.",
    verified: true
  },
  {
    name: "Michael Chen",
    location: "Vancouver, BC",
    rating: 5,
    date: "February 2024",
    project: "Luxury Vinyl Plank",
    retailer: "West Coast Flooring",
    review: "Price My Floor connected us with an amazing contractor. The LVP installation in our kitchen and living room exceeded our expectations. Great value for money and the customer service was exceptional.",
    verified: true
  },
  {
    name: "Jennifer Smith",
    location: "Calgary, AB",
    rating: 4,
    date: "January 2024",
    project: "Tile Installation",
    retailer: "Mountain View Tiles",
    review: "Very satisfied with the tile work in our bathrooms. The installer was knowledgeable and helped us choose the perfect tiles. Minor delay due to weather, but communication was excellent throughout.",
    verified: true
  },
  {
    name: "Robert Wilson",
    location: "Montreal, QC",
    rating: 5,
    date: "December 2023",
    project: "Laminate Flooring",
    retailer: "Quebec Flooring Experts",
    review: "Fantastic experience! Got multiple quotes through Price My Floor and found the perfect contractor. The laminate installation was flawless and completed within budget. Highly recommend this service.",
    verified: true
  },
  {
    name: "Lisa Thompson",
    location: "Ottawa, ON",
    rating: 5,
    date: "November 2023",
    project: "Carpet Installation",
    retailer: "Capital Carpet Co.",
    review: "Professional and courteous service. The carpet installation in our bedrooms was done perfectly. The team cleaned up thoroughly and provided excellent care instructions. Very happy with the results.",
    verified: true
  },
  {
    name: "David Brown",
    location: "Halifax, NS",
    rating: 4,
    date: "October 2023",
    project: "Hardwood Refinishing",
    retailer: "Atlantic Wood Floors",
    review: "Great job refinishing our old hardwood floors. They look like new! The process was explained clearly and the team was respectful of our home. Would definitely use Price My Floor again.",
    verified: true
  }
];

const stats = [
  {
    number: "4.8/5",
    label: "Average Rating",
    description: "Based on 1,200+ reviews"
  },
  {
    number: "96%",
    label: "Customer Satisfaction",
    description: "Would recommend to friends"
  },
  {
    number: "98%",
    label: "Project Completion",
    description: "On time and on budget"
  },
  {
    number: "500+",
    label: "Verified Retailers",
    description: "Across Canada"
  }
];

const testimonialHighlights = [
  {
    quote: "Price My Floor made finding a flooring contractor so easy. Multiple quotes, verified professionals, and excellent results.",
    author: "Emma Davis",
    location: "Winnipeg, MB"
  },
  {
    quote: "The quality of work exceeded our expectations. Professional, punctual, and reasonably priced. Couldn't be happier!",
    author: "James Wilson",
    location: "Edmonton, AB"
  },
  {
    quote: "From quote to completion, everything was handled professionally. Our new floors are beautiful and installed perfectly.",
    author: "Maria Rodriguez",
    location: "London, ON"
  }
];

export default function Reviews() {
  return (
    <>
      <Helmet>
        <title>Customer Reviews | Price My Floor - Real Reviews from Canadian Homeowners</title>
        <meta name="description" content="Read verified customer reviews from Canadian homeowners who used Price My Floor to find flooring contractors. Real experiences, honest feedback." />
        <meta name="keywords" content="customer reviews, flooring reviews, contractor reviews, testimonials, Canada, verified reviews" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <main className="max-w-7xl mx-auto px-4 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Customer Reviews & Testimonials
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              See what Canadian homeowners are saying about their experience with Price My Floor and our verified retailer network.
            </p>
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-lg font-semibold text-gray-900">4.8 out of 5</span>
              <span className="text-gray-600">(1,200+ reviews)</span>
            </div>
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

          {/* Featured Testimonials */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                What Our Customers Say
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {testimonialHighlights.map((testimonial, index) => (
                <Card key={index} className="bg-primary/5 border-primary/20">
                  <CardContent className="p-6 text-center">
                    <Quote className="w-8 h-8 text-primary mx-auto mb-4" />
                    <p className="text-gray-700 italic mb-4">"{testimonial.quote}"</p>
                    <div className="font-semibold text-gray-900">{testimonial.author}</div>
                    <div className="text-sm text-gray-600">{testimonial.location}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Detailed Reviews */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Recent Customer Reviews
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Verified reviews from homeowners who completed flooring projects through our network.
              </p>
            </div>

            <div className="space-y-6">
              {customerReviews.map((review, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <Avatar className="flex-shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {review.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>

                      {/* Review Content */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900">{review.name}</h3>
                              {review.verified && (
                                <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {review.location}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {review.date}
                              </div>
                            </div>
                          </div>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star} 
                                className={`w-4 h-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="flex gap-4 text-sm">
                            <Badge variant="outline">{review.project}</Badge>
                            <span className="text-gray-600">Retailer: {review.retailer}</span>
                          </div>
                        </div>

                        <p className="text-gray-700 leading-relaxed">{review.review}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Join Thousands of Satisfied Customers
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Experience the Price My Floor difference. Get connected with verified flooring professionals and join our community of satisfied homeowners.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link to="/quote">Get Your Free Quote</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/browse">Browse Retailers</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/how-it-works">How It Works</Link>
                </Button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}