import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { CheckCircle, Star } from 'lucide-react';

import carpetImg from '@/assets/categories/carpet.png';
import hardwoodImg from '@/assets/categories/hardwood.png';
import laminateImg from '@/assets/categories/laminate.png';
import vinylImg from '@/assets/categories/vinyl.png';
import tileImg from '@/assets/categories/tile.png';
import sportsImg from '@/assets/categories/sports.png';

const flooringTypes = [
  {
    name: "Hardwood",
    image: hardwoodImg,
    description: "Premium natural wood flooring that adds warmth and value to any home.",
    priceRange: "$8 - $15 per sq ft",
    durability: "25+ years",
    bestFor: ["Living rooms", "Bedrooms", "Dining rooms"],
    pros: [
      "Timeless and elegant appearance",
      "Increases home value",
      "Can be refinished multiple times",
      "Natural and eco-friendly"
    ],
    cons: [
      "Higher upfront cost",
      "Susceptible to water damage",
      "Requires regular maintenance",
      "Can be scratched by pets"
    ],
    maintenance: "Regular sweeping, occasional refinishing",
    popular: true
  },
  {
    name: "Laminate",
    image: laminateImg,
    description: "Affordable alternative to hardwood with realistic wood-look designs.",
    priceRange: "$2 - $8 per sq ft",
    durability: "15-25 years",
    bestFor: ["Living rooms", "Bedrooms", "Hallways"],
    pros: [
      "Budget-friendly option",
      "Easy DIY installation",
      "Scratch and stain resistant",
      "Wide variety of designs"
    ],
    cons: [
      "Cannot be refinished",
      "Can sound hollow underfoot",
      "Not suitable for wet areas",
      "May fade with direct sunlight"
    ],
    maintenance: "Regular cleaning, avoid excessive moisture",
    popular: true
  },
  {
    name: "Vinyl",
    image: vinylImg,
    description: "Waterproof and versatile flooring perfect for any room in the house.",
    priceRange: "$3 - $12 per sq ft",
    durability: "10-20 years",
    bestFor: ["Bathrooms", "Kitchens", "Basements"],
    pros: [
      "100% waterproof",
      "Comfortable underfoot",
      "Easy to clean and maintain",
      "Realistic textures available"
    ],
    cons: [
      "Can be punctured by sharp objects",
      "May discolor over time",
      "Not biodegradable",
      "Can emit VOCs initially"
    ],
    maintenance: "Simple cleaning with mild detergent",
    popular: true
  },
  {
    name: "Tile",
    image: tileImg,
    description: "Durable ceramic, porcelain, or natural stone tiles for high-traffic areas.",
    priceRange: "$3 - $20 per sq ft",
    durability: "50+ years",
    bestFor: ["Bathrooms", "Kitchens", "Entryways"],
    pros: [
      "Extremely durable",
      "Water and stain resistant",
      "Easy to clean",
      "Maintains value over time"
    ],
    cons: [
      "Cold and hard underfoot",
      "Grout requires maintenance",
      "Can crack if heavy objects drop",
      "Professional installation recommended"
    ],
    maintenance: "Regular cleaning, periodic grout sealing"
  },
  {
    name: "Carpet",
    image: carpetImg,
    description: "Soft and comfortable flooring that provides warmth and sound insulation.",
    priceRange: "$2 - $12 per sq ft",
    durability: "5-15 years",
    bestFor: ["Bedrooms", "Living rooms", "Family rooms"],
    pros: [
      "Soft and comfortable",
      "Excellent insulation",
      "Sound dampening",
      "Wide range of styles and colors"
    ],
    cons: [
      "Prone to stains and odors",
      "Harbors allergens and dust",
      "Shorter lifespan",
      "Professional cleaning required"
    ],
    maintenance: "Regular vacuuming, professional cleaning"
  },
  {
    name: "Sports Flooring",
    image: sportsImg,
    description: "Specialized flooring designed for athletic facilities and home gyms.",
    priceRange: "$5 - $25 per sq ft",
    durability: "15-30 years",
    bestFor: ["Gyms", "Sports facilities", "Home fitness rooms"],
    pros: [
      "High impact resistance",
      "Non-slip surface",
      "Easy to clean",
      "Professional appearance"
    ],
    cons: [
      "Limited design options",
      "Higher cost",
      "Specialized installation",
      "May require specific maintenance"
    ],
    maintenance: "Regular cleaning with appropriate products"
  }
];

export default function FlooringTypes() {
  return (
    <>
      <Helmet>
        <title>Flooring Types Guide | Price My Floor - Compare Hardwood, Laminate, Vinyl & More</title>
        <meta name="description" content="Complete guide to flooring types including hardwood, laminate, vinyl, tile, carpet, and sports flooring. Compare prices, durability, and benefits." />
        <meta name="keywords" content="flooring types, hardwood, laminate, vinyl, tile, carpet, sports flooring, comparison, prices" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <main className="max-w-7xl mx-auto px-4 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Complete Flooring Types Guide
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Explore different flooring options to find the perfect fit for your home. Compare materials, prices, and benefits.
            </p>
            <Button size="lg" asChild>
              <Link to="/quote">Get Quotes for Your Project</Link>
            </Button>
          </div>

          {/* Flooring Types Grid */}
          <section className="space-y-8">
            {flooringTypes.map((flooring, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Image Section */}
                  <div className="relative">
                    <img 
                      src={flooring.image} 
                      alt={`${flooring.name} flooring`}
                      className="w-full h-64 lg:h-full object-cover"
                    />
                    {flooring.popular && (
                      <Badge className="absolute top-4 left-4 bg-yellow-100 text-yellow-800">
                        <Star className="w-3 h-3 mr-1" />
                        Popular Choice
                      </Badge>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="lg:col-span-2 p-6">
                    <CardHeader className="p-0 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <CardTitle className="text-2xl">{flooring.name}</CardTitle>
                        <Badge variant="outline" className="text-lg px-3 py-1">
                          {flooring.priceRange}
                        </Badge>
                      </div>
                      <CardDescription className="text-base">{flooring.description}</CardDescription>
                    </CardHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Quick Facts */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Quick Facts</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Durability:</span>
                            <span className="font-medium">{flooring.durability}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Maintenance:</span>
                            <span className="font-medium text-right">{flooring.maintenance}</span>
                          </div>
                        </div>
                        
                        <h5 className="font-semibold text-gray-900 mt-4 mb-2">Best For:</h5>
                        <div className="flex flex-wrap gap-1">
                          {flooring.bestFor.map((room, roomIndex) => (
                            <Badge key={roomIndex} variant="secondary" className="text-xs">
                              {room}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Pros and Cons */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Pros & Cons</h4>
                        
                        <div className="mb-4">
                          <h5 className="text-sm font-medium text-green-700 mb-2">Advantages:</h5>
                          <ul className="space-y-1">
                            {flooring.pros.slice(0, 2).map((pro, proIndex) => (
                              <li key={proIndex} className="flex items-start gap-2 text-xs text-gray-600">
                                <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                                {pro}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h5 className="text-sm font-medium text-red-700 mb-2">Considerations:</h5>
                          <ul className="space-y-1">
                            {flooring.cons.slice(0, 2).map((con, conIndex) => (
                              <li key={conIndex} className="flex items-start gap-2 text-xs text-gray-600">
                                <div className="w-3 h-3 bg-red-200 rounded-full flex-shrink-0 mt-0.5"></div>
                                {con}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </section>

          {/* CTA Section */}
          <section className="text-center mt-16 bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Choose Your Flooring?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Get personalized quotes from verified retailers who specialize in your preferred flooring type.
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
          </section>
        </main>
      </div>
    </>
  );
}