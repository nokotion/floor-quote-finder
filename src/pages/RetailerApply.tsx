import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  CheckCircle, 
  ArrowRight, 
  Users, 
  TrendingUp, 
  Star, 
  DollarSign,
  Target,
  Shield,
  MapPin,
  Zap,
  Building2,
  Phone,
  Mail,
  Globe,
  FileText,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedGradientBackground } from "@/components/ui/animated-gradient-background";
import { FloatingShapes } from "@/components/ui/floating-shapes";
import { GlassCard } from "@/components/ui/glass-card";
import { AnimatedCounter } from "@/components/ui/animated-counter";

const RetailerApply = () => {
  const [formData, setFormData] = useState({
    business_name: "",
    contact_name: "",
    email: "",
    phone: "",
    city: "",
    postal_code: "",
    website: "",
    business_description: "",
    business_references: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { error: submitError } = await supabase
        .from("retailer_applications")
        .insert([formData]);

      if (submitError) throw submitError;

      setIsSuccess(true);
      toast.success("Application submitted successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to submit application");
      toast.error("Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = [
    { icon: Users, value: 500, suffix: "+", label: "Partner Retailers" },
    { icon: TrendingUp, value: 10000, suffix: "+", label: "Leads Delivered" },
    { icon: Star, value: 95, suffix: "%", label: "Satisfaction Rate" },
    { icon: DollarSign, value: 2, prefix: "$", suffix: "M+", label: "Revenue Generated" },
  ];

  const benefits = [
    {
      icon: Target,
      title: "Perfect Leads",
      description: "Receive pre-qualified leads from homeowners actively searching for flooring solutions",
      color: "from-orange-500 to-rose-500",
    },
    {
      icon: Shield,
      title: "Verified & Ready",
      description: "Every lead is phone and email verified before delivery - no wasted time",
      color: "from-emerald-500 to-teal-500",
    },
    {
      icon: DollarSign,
      title: "Pay Per Lead",
      description: "Only pay for leads you receive - no monthly fees or hidden costs",
      color: "from-blue-500 to-indigo-500",
    },
    {
      icon: MapPin,
      title: "Coverage Control",
      description: "Choose exactly which postal codes you want to serve in your area",
      color: "from-purple-500 to-pink-500",
    },
  ];

  if (isSuccess) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <AnimatedGradientBackground />
        <FloatingShapes />
        
        {/* Navigation */}
        <nav className="relative z-10 px-6 py-4">
          <Link to="/" className="text-2xl font-bold text-gradient">
            Price My Floor
          </Link>
        </nav>

        <div className="relative z-10 flex items-center justify-center min-h-[80vh] px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <GlassCard variant="prominent" className="max-w-lg p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center"
              >
                <CheckCircle className="w-10 h-10 text-white" />
              </motion.div>
              
              <h2 className="text-3xl font-bold text-gradient mb-4">
                Application Submitted!
              </h2>
              <p className="text-muted-foreground mb-6">
                Thank you for your interest in joining Price My Floor. Our team will review your application and contact you within 2-3 business days.
              </p>
              
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <h4 className="font-semibold text-foreground mb-2">What's Next?</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 text-left">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Application review (1-2 days)
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Phone verification call
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Account setup & onboarding
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button asChild variant="outline" className="flex-1">
                  <Link to="/">Back to Home</Link>
                </Button>
                <Button asChild className="flex-1 button-glow">
                  <Link to="/how-it-works">Learn More</Link>
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedGradientBackground />
      <FloatingShapes />
      
      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4">
        <Link to="/" className="text-2xl font-bold text-gradient">
          Price My Floor
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-8 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Banner Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Join 500+ Growing Retailers</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-foreground">Grow Your Business with</span>
              <br />
              <span className="text-gradient">Perfect Leads</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Connect with homeowners actively searching for flooring. Get verified, qualified leads delivered directly to your inbox.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="relative z-10 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <GlassCard className="p-4 text-center hover:scale-105 transition-transform duration-300">
                  <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-foreground">
                    <AnimatedCounter 
                      value={stat.value} 
                      prefix={stat.prefix} 
                      suffix={stat.suffix}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative z-10 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl md:text-3xl font-bold text-center mb-8"
          >
            Why Retailers <span className="text-gradient">Choose Us</span>
          </motion.h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
              >
                <GlassCard className="p-5 h-full group hover:scale-[1.02] transition-all duration-300">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${benefit.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <benefit.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="relative z-10 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-orange-500 to-rose-500 p-8 text-center"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2" />
            
            <div className="relative z-10">
              <Zap className="w-10 h-10 text-white/90 mx-auto mb-4" />
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Start Receiving Leads This Week
              </h3>
              <p className="text-white/80 max-w-xl mx-auto">
                Quick approval process. Most retailers are approved within 48 hours and start receiving qualified leads immediately.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Application Form */}
      <section className="relative z-10 py-12 px-4 pb-20">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <GlassCard variant="prominent" className="p-6 md:p-8 relative overflow-hidden">
              {/* Gradient border effect */}
              <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-br from-primary/50 via-transparent to-rose-500/50 -z-10" />
              
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gradient mb-2">
                  Apply Now
                </h2>
                <p className="text-muted-foreground">
                  Fill out the form below to join our network of flooring professionals
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Business Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Building2 className="w-4 h-4 text-primary" />
                    Business Information
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="business_name">Business Name *</Label>
                      <Input
                        id="business_name"
                        name="business_name"
                        value={formData.business_name}
                        onChange={handleInputChange}
                        required
                        className="bg-white/50 border-white/30 focus:border-primary/50 focus:ring-primary/20"
                        placeholder="Your Flooring Company"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact_name">Contact Name *</Label>
                      <Input
                        id="contact_name"
                        name="contact_name"
                        value={formData.contact_name}
                        onChange={handleInputChange}
                        required
                        className="bg-white/50 border-white/30 focus:border-primary/50 focus:ring-primary/20"
                        placeholder="John Smith"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Phone className="w-4 h-4 text-primary" />
                    Contact Information
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="pl-10 bg-white/50 border-white/30 focus:border-primary/50 focus:ring-primary/20"
                          placeholder="email@company.com"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          className="pl-10 bg-white/50 border-white/30 focus:border-primary/50 focus:ring-primary/20"
                          placeholder="(555) 123-4567"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <MapPin className="w-4 h-4 text-primary" />
                    Location
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="bg-white/50 border-white/30 focus:border-primary/50 focus:ring-primary/20"
                        placeholder="Toronto"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postal_code">Postal Code *</Label>
                      <Input
                        id="postal_code"
                        name="postal_code"
                        value={formData.postal_code}
                        onChange={handleInputChange}
                        required
                        className="bg-white/50 border-white/30 focus:border-primary/50 focus:ring-primary/20"
                        placeholder="M5V 3A8"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <FileText className="w-4 h-4 text-primary" />
                    Additional Information
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="website">Website (Optional)</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="website"
                        name="website"
                        type="url"
                        value={formData.website}
                        onChange={handleInputChange}
                        className="pl-10 bg-white/50 border-white/30 focus:border-primary/50 focus:ring-primary/20"
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="business_description">Tell Us About Your Business</Label>
                    <Textarea
                      id="business_description"
                      name="business_description"
                      value={formData.business_description}
                      onChange={handleInputChange}
                      rows={3}
                      className="bg-white/50 border-white/30 focus:border-primary/50 focus:ring-primary/20 resize-none"
                      placeholder="What types of flooring do you specialize in? How long have you been in business?"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="business_references">References (Optional)</Label>
                    <Textarea
                      id="business_references"
                      name="business_references"
                      value={formData.business_references}
                      onChange={handleInputChange}
                      rows={2}
                      className="bg-white/50 border-white/30 focus:border-primary/50 focus:ring-primary/20 resize-none"
                      placeholder="Any professional references or certifications"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 text-lg font-semibold button-glow bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Submit Application
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By submitting, you agree to our{" "}
                  <Link to="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </p>
              </form>
            </GlassCard>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default RetailerApply;
