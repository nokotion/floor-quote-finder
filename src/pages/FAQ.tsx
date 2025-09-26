import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const faqData = [
  {
    category: "Getting Started",
    questions: [
      {
        question: "How does Price My Floor work?",
        answer: "Price My Floor connects homeowners with verified flooring retailers across Canada. Simply tell us about your project, and we'll match you with qualified professionals who can provide competitive quotes for your flooring needs."
      },
      {
        question: "Is the service really free for homeowners?",
        answer: "Yes! Our service is completely free for homeowners. We're paid by retailers when they receive qualified leads, so you can get quotes without any cost to you."
      },
      {
        question: "How quickly will I receive quotes?",
        answer: "Most homeowners receive their first quote within 24-48 hours. Response times may vary depending on your location and the complexity of your project."
      }
    ]
  },
  {
    category: "Flooring Types",
    questions: [
      {
        question: "What types of flooring do you cover?",
        answer: "We cover all major flooring types including hardwood, laminate, vinyl, tile, carpet, and specialty flooring. Our network includes retailers specializing in residential, commercial, and industrial installations."
      },
      {
        question: "Do you work with specific brands?",
        answer: "Yes! We work with retailers who carry all major flooring brands. You can browse our brand directory to see specific manufacturers and products available in your area."
      },
      {
        question: "Can I get quotes for both materials and installation?",
        answer: "Absolutely! Most quotes include both materials and professional installation. You can specify if you need materials only or installation only when submitting your request."
      }
    ]
  },
  {
    category: "Retailers & Quality",
    questions: [
      {
        question: "How are retailers verified?",
        answer: "All retailers in our network are verified through a comprehensive process including business licensing, insurance verification, background checks, and customer review analysis."
      },
      {
        question: "What if I'm not satisfied with a retailer?",
        answer: "We take quality seriously. If you have issues with a retailer, contact our support team immediately. We'll work to resolve the situation and may remove retailers who don't meet our standards."
      },
      {
        question: "Can I see reviews of retailers?",
        answer: "Yes! Each retailer profile includes customer reviews and ratings. We encourage honest feedback to help maintain quality standards across our network."
      }
    ]
  },
  {
    category: "Quotes & Pricing",
    questions: [
      {
        question: "Are the quotes binding?",
        answer: "Initial quotes are estimates based on the information provided. Final pricing will be determined after an in-home consultation where the retailer can assess your specific needs and conditions."
      },
      {
        question: "How many quotes will I receive?",
        answer: "You'll typically receive 2-4 quotes from different retailers, depending on availability in your area. This gives you options to compare pricing, services, and approaches."
      },
      {
        question: "What's included in a flooring quote?",
        answer: "Standard quotes include materials, labor, basic preparation work, and cleanup. Additional services like furniture moving, subfloor repairs, or disposal of old flooring may be quoted separately."
      }
    ]
  },
  {
    category: "Coverage & Availability",
    questions: [
      {
        question: "Do you serve my area?",
        answer: "We serve most major cities and towns across Canada. Enter your postal code in our quote form to see if we have retailers in your area."
      },
      {
        question: "What if there are no retailers in my area?",
        answer: "We're constantly expanding our network. If we don't currently serve your area, we'll add you to our waitlist and notify you when retailers become available."
      },
      {
        question: "Do you handle commercial projects?",
        answer: "Yes! We have retailers who specialize in commercial and industrial flooring projects. Just specify your project type when requesting quotes."
      }
    ]
  }
];

export default function FAQ() {
  return (
    <>
      <Helmet>
        <title>Frequently Asked Questions | Price My Floor - Flooring Quotes & Retailers</title>
        <meta name="description" content="Find answers to common questions about getting flooring quotes, our verified retailers, pricing, and coverage across Canada." />
        <meta name="keywords" content="flooring FAQ, quotes, retailers, pricing, installation, Canada" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <main className="max-w-4xl mx-auto px-4 py-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get answers to the most common questions about our flooring quote service
            </p>
          </div>

          {/* FAQ Content */}
          <div className="space-y-8">
            {faqData.map((category, categoryIndex) => (
              <section key={categoryIndex}>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{category.category}</h2>
                <Accordion type="single" collapsible className="bg-white rounded-lg shadow-sm">
                  {category.questions.map((faq, faqIndex) => (
                    <AccordionItem key={faqIndex} value={`${categoryIndex}-${faqIndex}`}>
                      <AccordionTrigger className="text-left px-6 py-4 hover:no-underline hover:bg-gray-50">
                        <span className="font-medium">{faq.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-4 text-gray-600 leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            ))}
          </div>

          {/* Still Have Questions */}
          <section className="text-center mt-16 p-8 bg-white rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Still Have Questions?</h2>
            <p className="text-gray-600 mb-6">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/contact">Contact Support</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/help">Visit Help Center</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/quote">Get Your Quote</Link>
              </Button>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}