import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Shield,
  Eye,
  Users,
  Zap,
  Star,
  CheckCircle,
  Play,
  ArrowRight,
  Target,
  Brain,
  Rocket,
  MessageCircle,
  Quote,
  Sparkles,
  Award,
  Lock,
  Cloud,
  BarChart3,
  ShieldCheck,
  Clock,
  Activity
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { motion, Variants } from 'framer-motion';
import '@/index.css';
// ✅ Fixed Animation variants with proper types
const fadeInUp: Variants = {
  initial: { 
    opacity: 0, 
    y: 60 
  },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.8, 
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

const fadeInLeft: Variants = {
  initial: { 
    opacity: 0, 
    x: -60 
  },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: { 
      duration: 0.8, 
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

const fadeInRight: Variants = {
  initial: { 
    opacity: 0, 
    x: 60 
  },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: { 
      duration: 0.8, 
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.15
    }
  }
};

const scaleIn: Variants = {
  initial: { 
    opacity: 0, 
    scale: 0.8 
  },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.6, 
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

// Interfaces
interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}

interface Stat {
  number: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
}

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  gradient: string;
  buttonText: string;
  savings?: string;
}

interface Testimonial {
  name: string;
  role: string;
  company: string;
  avatar: string;
  content: string;
  rating: number;
  verified: boolean;
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  
  const testimonials: Testimonial[] = [
    {
      name: "Sarah Johnson",
      role: "Chief Security Officer",
      company: "TechCorp International",
      avatar: "/api/placeholder/120/120",
      content: "SafeFace completely transformed our security infrastructure. The AI accuracy is phenomenal, and we've prevented numerous security incidents. The ROI was evident within weeks of deployment.",
      rating: 5,
      verified: true
    },
    {
      name: "Michael Chen",
      role: "IT Director",
      company: "Global Solutions Inc.",
      avatar: "/api/placeholder/120/120",
      content: "The implementation was seamless, and the support team exceeded our expectations. We've seen a 400% improvement in response times and significantly reduced false positives.",
      rating: 5,
      verified: true
    },
    {
      name: "Emma Rodriguez",
      role: "Operations Manager",
      company: "SecureBase Systems",
      avatar: "/api/placeholder/120/120",
      content: "The analytics dashboard provides insights we never had before. The predictive capabilities and real-time monitoring have revolutionized our security operations.",
      rating: 5,
      verified: true
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const features: Feature[] = [
    {
      icon: <Brain className="h-10 w-10" />,
      title: "AI-Powered Recognition",
      description: "Advanced deep learning algorithms with 99.97% accuracy, real-time processing, and adaptive learning capabilities",
      gradient: "from-blue-600 via-cyan-500 to-teal-400"
    },
    {
      icon: <ShieldCheck className="h-10 w-10" />,
      title: "Enterprise Security",
      description: "Military-grade encryption, GDPR compliance, zero-trust architecture, and SOC 2 Type II certification",
      gradient: "from-purple-600 via-pink-500 to-rose-400"
    },
    {
      icon: <Activity className="h-10 w-10" />,
      title: "Real-time Monitoring",
      description: "Sub-millisecond detection, instant alerts, live streaming, and comprehensive threat intelligence",
      gradient: "from-green-600 via-emerald-500 to-teal-400"
    },
    {
      icon: <Cloud className="h-10 w-10" />,
      title: "Cloud-Native Platform",
      description: "Global CDN, auto-scaling infrastructure, multi-region deployment, and 99.99% uptime SLA",
      gradient: "from-orange-600 via-amber-500 to-yellow-400"
    },
    {
      icon: <BarChart3 className="h-10 w-10" />,
      title: "Advanced Analytics",
      description: "Machine learning insights, predictive analytics, custom dashboards, and comprehensive reporting",
      gradient: "from-indigo-600 via-purple-500 to-pink-400"
    },
    {
      icon: <Users className="h-10 w-10" />,
      title: "Team Collaboration",
      description: "Role-based access control, workflow automation, team notifications, and audit trails",
      gradient: "from-pink-600 via-rose-500 to-red-400"
    }
  ];

  const stats: Stat[] = [
    {
      number: "100K+",
      label: "Active Users",
      description: "Global enterprises trust SafeFace",
      icon: <Users className="h-8 w-8" />,
      gradient: "from-blue-600 to-cyan-400"
    },
    {
      number: "99.97%",
      label: "Accuracy Rate",
      description: "Industry-leading AI precision",
      icon: <Target className="h-8 w-8" />,
      gradient: "from-green-600 to-emerald-400"
    },
    {
      number: "24/7",
      label: "Support",
      description: "Expert assistance worldwide",
      icon: <Clock className="h-8 w-8" />,
      gradient: "from-purple-600 to-pink-400"
    },
    {
      number: "1B+",
      label: "Detections",
      description: "Successful face recognitions",
      icon: <Eye className="h-8 w-8" />,
      gradient: "from-orange-600 to-yellow-400"
    }
  ];

  const pricingPlans: PricingPlan[] = [
    {
      name: "Starter",
      price: "Free",
      period: "forever",
      description: "Perfect for individuals and small teams getting started with face recognition",
      features: [
        "Up to 3 cameras",
        "100 known persons",
        "Basic analytics dashboard",
        "Email support",
        "Community access",
        "Mobile app access",
        "Basic API access"
      ],
      gradient: "from-gray-600 to-gray-800",
      buttonText: "Start Free Today"
    },
    {
      name: "Professional",
      price: "$49",
      period: "per month",
      description: "Ideal for growing businesses with advanced security needs",
      features: [
        "Up to 25 cameras",
        "Unlimited known persons",
        "Advanced analytics & reports",
        "Priority support (24/7)",
        "API & webhook access",
        "Custom integrations",
        "Real-time alerts",
        "Multi-user collaboration",
        "Advanced face analytics",
        "Custom branding"
      ],
      popular: true,
      gradient: "from-blue-600 to-purple-600",
      buttonText: "Start 14-Day Free Trial",
      savings: "Save 20% annually"
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "pricing",
      description: "For large organizations requiring maximum security and customization",
      features: [
        "Unlimited cameras",
        "Advanced AI models",
        "Dedicated account manager",
        "Custom deployment options",
        "White-label solutions",
        "SLA guarantee (99.99%)",
        "On-premise deployment",
        "Custom integrations",
        "Advanced security features",
        "Compliance support",
        "Training & onboarding"
      ],
      gradient: "from-purple-600 to-pink-600",
      buttonText: "Contact Sales Team"
    }
  ];

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  const handleWatchDemo = () => {
    console.log('Opening demo video...');
  };

  const handleContactSales = () => {
    navigate('/contact');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">

      {/* Enhanced Hero Section */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-64 h-64 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[85vh]">
            {/* Enhanced Hero Content */}
            <motion.div 
              className="space-y-10"
              initial="initial"
              animate="animate"
              variants={fadeInLeft}
            >
              <div className="space-y-8">
                {/* Premium Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Badge className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 text-blue-700 border border-blue-200/50 backdrop-blur-sm px-6 py-3 text-sm font-medium">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Next-Gen AI Security Platform
                  </Badge>
                </motion.div>

                {/* Hero Title */}
                <div className="space-y-6">
                  <h1 className="text-6xl lg:text-7xl xl:text-8xl font-black leading-[0.9] tracking-tight">
                    <span className="block text-gray-900">Intelligent</span>
                    <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                      Face Security
                    </span>
                    <span className="block text-gray-900">Platform</span>
                  </h1>
                  
                  <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-2xl font-light">
                    Protect your organization with military-grade AI face recognition. 
                    Real-time threat detection, predictive analytics, and enterprise compliance 
                    in one powerful platform.
                  </p>
                </div>

                {/* Hero Stats */}
                <div className="grid grid-cols-3 gap-8 py-6">
                  {[
                    { value: "99.97%", label: "AI Accuracy", icon: <Target className="h-5 w-5" /> },
                    { value: "100K+", label: "Users", icon: <Users className="h-5 w-5" /> },
                    { value: "<100ms", label: "Response", icon: <Zap className="h-5 w-5" /> }
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      className="text-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                    >
                      <div className="flex items-center justify-center mb-2 text-blue-600">
                        {stat.icon}
                      </div>
                      <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                      <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-6">
                  <motion.div 
                    whileHover={{ scale: 1.02, boxShadow: "0 25px 50px -12px rgba(59, 130, 246, 0.25)" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      size="lg" 
                      onClick={handleGetStarted}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-6 text-xl font-semibold rounded-2xl shadow-2xl border-0"
                    >
                      <Rocket className="h-6 w-6 mr-3" />
                      {isAuthenticated ? 'Go to Dashboard' : 'Start Free Trial'}
                      <ArrowRight className="h-5 w-5 ml-3" />
                    </Button>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      size="lg" 
                      variant="outline"
                      onClick={handleWatchDemo}
                      className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-12 py-6 text-xl font-semibold rounded-2xl"
                    >
                      <Play className="h-6 w-6 mr-3" />
                      Watch Demo
                    </Button>
                  </motion.div>
                </div>

                {/* Trust Indicators */}
                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 pt-4">
                  {[
                    { icon: <CheckCircle className="h-5 w-5 text-green-500" />, text: "14-day free trial" },
                    { icon: <Lock className="h-5 w-5 text-blue-500" />, text: "No credit card required" },
                    { icon: <Shield className="h-5 w-5 text-purple-500" />, text: "Enterprise security" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      {item.icon}
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Hero Visual */}
            <motion.div 
              className="relative"
              initial="initial"
              animate="animate"
              variants={fadeInRight}
            >
              <div className="relative">
                {/* Main Dashboard Card */}
                <motion.div 
                  className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20"
                  whileHover={{ y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Dashboard Header */}
                  <div className="bg-gray-100/80 backdrop-blur-sm rounded-t-2xl px-6 py-4 flex items-center space-x-3 -mx-8 -mt-8 mb-8">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  
                  {/* Dashboard Content */}
                  <div className="space-y-6">
                    {/* Live Detection Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">Live Detection Status</span>
                      <Badge className="bg-green-100 text-green-700 animate-pulse">Active</Badge>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: "Cameras Online", value: "12/12", color: "text-green-600" },
                        { label: "Known Persons", value: "2,847", color: "text-blue-600" },
                        { label: "Today's Detections", value: "1,234", color: "text-purple-600" },
                        { label: "Threats Blocked", value: "0", color: "text-red-600" }
                      ].map((item, index) => (
                        <motion.div
                          key={index}
                          className="bg-gray-50/80 rounded-xl p-4 backdrop-blur-sm"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.6 + index * 0.1 }}
                        >
                          <div className="text-xs text-gray-600 mb-1">{item.label}</div>
                          <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
                        </motion.div>
                      ))}
                    </div>
                    
                    {/* Live Activity */}
                    <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-gray-700">Live Recognition Accuracy</span>
                        <span className="text-xl font-bold text-indigo-600">99.97%</span>
                      </div>
                      <div className="w-full bg-indigo-200/50 rounded-full h-3 overflow-hidden">
                        <motion.div 
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: '99.97%' }}
                          transition={{ duration: 2, delay: 1 }}
                        ></motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Floating Elements */}
                <motion.div 
                  className="absolute -top-6 -right-6 bg-green-500 text-white p-4 rounded-2xl shadow-xl"
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 5, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <CheckCircle className="h-8 w-8" />
                </motion.div>
                
                <motion.div 
                  className="absolute -bottom-6 -left-6 bg-blue-500 text-white p-4 rounded-2xl shadow-xl"
                  animate={{ 
                    y: [0, 10, 0],
                    rotate: [0, -5, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                >
                  <Shield className="h-8 w-8" />
                </motion.div>

                {/* Floating notification */}
                <motion.div 
                  className="absolute top-20 -left-16 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20 max-w-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 2 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Person Recognized</p>
                      <p className="text-xs text-gray-600">John Smith • Main Entrance</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-indigo-600/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                variants={scaleIn}
                whileHover={{ y: -10, scale: 1.05 }}
                className="group"
              >
                <Card className="text-center p-8 bg-white/80 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl">
                  <div className={`w-16 h-16 bg-gradient-to-r ${stat.gradient} rounded-2xl flex items-center justify-center text-white mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    {stat.icon}
                  </div>
                  <div className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">{stat.number}</div>
                  <div className="text-lg font-semibold text-gray-700 mb-2">{stat.label}</div>
                  <div className="text-sm text-gray-500 leading-relaxed">{stat.description}</div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-20"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <Badge className="bg-blue-100/80 text-blue-700 border border-blue-200/50 backdrop-blur-sm mb-6 px-6 py-3 text-sm font-medium">
              <Sparkles className="h-4 w-4 mr-2" />
              Cutting-Edge Features
            </Badge>
            <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight">
              Everything You Need for{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Complete Security
              </span>
            </h2>
            <p className="text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light">
              Our comprehensive AI-powered platform provides enterprise-grade face recognition, 
              real-time threat detection, and intelligent analytics for modern security operations.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -15 }}
                className="group relative"
              >
                <Card className="h-full border-0 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden bg-white/90 backdrop-blur-xl rounded-3xl">
                  <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl`}>
                    <div className="absolute inset-[2px] bg-white rounded-3xl"></div>
                  </div>
                  
                  <div className="relative p-8">
                    <CardHeader className="p-0 mb-6">
                      <div className={`w-20 h-20 bg-gradient-to-r ${feature.gradient} rounded-3xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-all duration-300`}>
                        {feature.icon}
                      </div>
                      <CardTitle className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <p className="text-gray-600 leading-relaxed text-lg">
                        {feature.description}
                      </p>
                    </CardContent>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-20"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <Badge className="bg-purple-100/80 text-purple-700 border border-purple-200/50 backdrop-blur-sm mb-6 px-6 py-3 text-sm font-medium">
              <Award className="h-4 w-4 mr-2" />
              Transparent Pricing
            </Badge>
            <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight">
              Choose Your{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Perfect Plan
              </span>
            </h2>
            <p className="text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light">
              Start free and scale as you grow. All plans include our core AI features, 
              24/7 support, and enterprise-grade security.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-10"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                whileHover={{ y: -15, scale: plan.popular ? 1.02 : 1.05 }}
                className={`relative ${plan.popular ? 'md:scale-105 z-10' : ''}`}
              >
                <Card className={`h-full border-0 shadow-2xl overflow-hidden rounded-3xl bg-white relative ${
                  plan.popular ? 'ring-4 ring-blue-500/20 shadow-blue-500/10' : ''
                }`}>
                  {plan.popular && (
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-4 text-sm font-bold">
                      🔥 Most Popular
                    </div>
                  )}
                  
                  {plan.popular && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600"></div>
                  )}
                  
                  <CardHeader className={`text-center relative ${plan.popular ? 'pt-20 pb-8' : 'pt-12 pb-8'}`}>
                    <div className={`w-20 h-20 bg-gradient-to-r ${plan.gradient} rounded-3xl flex items-center justify-center mx-auto mb-6`}>
                      <Rocket className="h-10 w-10 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </CardTitle>
                    <div className="text-center mb-6">
                      <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                      {plan.price !== 'Free' && plan.price !== 'Custom' && (
                        <span className="text-gray-600 ml-2">/{plan.period}</span>
                      )}
                      {plan.price === 'Free' && (
                        <span className="text-gray-600 ml-2">{plan.period}</span>
                      )}
                      {plan.price === 'Custom' && (
                        <span className="text-gray-600 ml-2">{plan.period}</span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed max-w-sm mx-auto">
                      {plan.description}
                    </p>
                    {plan.savings && (
                      <Badge className="bg-green-100 text-green-700 mt-4">
                        {plan.savings}
                      </Badge>
                    )}
                  </CardHeader>
                  
                  <CardContent className="pt-0 px-8 pb-12 relative">
                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span className="text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className={`w-full py-6 text-lg font-semibold rounded-2xl transition-all duration-300 ${
                        plan.popular 
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
                          : 'bg-gray-900 hover:bg-gray-800'
                      }`}
                      onClick={plan.name === 'Enterprise' ? handleContactSales : handleGetStarted}
                    >
                      {plan.buttonText}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Pricing Footer */}
          <motion.div 
            className="text-center mt-16"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-2xl p-8 backdrop-blur-sm">
              <p className="text-gray-600 text-lg mb-4">
                All plans include free SSL, automatic backups, 99.99% uptime SLA, and enterprise-grade security.
              </p>
              <p className="text-gray-500">
                Need a custom solution? <button onClick={handleContactSales} className="text-blue-600 hover:text-blue-700 font-semibold underline">Contact our sales team</button> for personalized pricing.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-20"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight">
              Trusted by{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Security Leaders
              </span>
            </h2>
            <p className="text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light">
              Join thousands of organizations worldwide who trust SafeFace 
              for their mission-critical security operations
            </p>
          </motion.div>

          <motion.div 
            className="max-w-5xl mx-auto"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <Card className="border-0 shadow-3xl bg-white/90 backdrop-blur-xl relative overflow-hidden rounded-3xl">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600"></div>
              
              <CardContent className="p-16">
                <div className="flex items-center justify-center mb-12">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center">
                    <Quote className="h-12 w-12 text-blue-600" />
                  </div>
                </div>
                
                <div className="text-center">
                  <motion.p 
                    className="text-2xl lg:text-3xl text-gray-700 leading-relaxed mb-12 italic font-light"
                    key={currentTestimonial}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    "{testimonials[currentTestimonial].content}"
                  </motion.p>
                  
                  <motion.div 
                    className="flex items-center justify-center space-x-6"
                    key={currentTestimonial}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={testimonials[currentTestimonial].avatar} />
                      <AvatarFallback>{testimonials[currentTestimonial].name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <div className="font-bold text-xl text-gray-900">{testimonials[currentTestimonial].name}</div>
                      <div className="text-gray-600">{testimonials[currentTestimonial].role}</div>
                      <div className="text-blue-600 font-semibold">{testimonials[currentTestimonial].company}</div>
                      <div className="flex items-center mt-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                        ))}
                        {testimonials[currentTestimonial].verified && (
                          <Badge className="ml-2 bg-green-100 text-green-700 text-xs">Verified</Badge>
                        )}
                      </div>
                    </div>
                  </motion.div>
                  
                  <div className="flex justify-center space-x-1 mt-8">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial Navigation */}
            <div className="flex justify-center space-x-3 mt-12">
              {testimonials.map((_, index) => (
                <motion.button
                  key={index}
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    index === currentTestimonial 
                      ? 'bg-blue-600 scale-125' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  onClick={() => setCurrentTestimonial(index)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600">
          <div className="absolute top-20 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="space-y-12"
          >
            <div className="space-y-8">
              <h2 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
                Ready to Secure Your 
                <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  Digital Future?
                </span>
              </h2>
              <p className="text-xl lg:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed font-light">
                Join 100,000+ organizations using SafeFace to protect what matters most. 
                Start your free trial today and experience the future of intelligent security.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
              <motion.div 
                whileHover={{ scale: 1.05, boxShadow: "0 25px 50px -12px rgba(255, 255, 255, 0.25)" }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg" 
                  onClick={handleGetStarted}
                  className="bg-white text-blue-600 hover:bg-gray-100 px-12 py-6 text-xl font-semibold rounded-2xl shadow-2xl border-0"
                >
                  <Rocket className="h-6 w-6 mr-3" />
                  Start Free Trial
                  <ArrowRight className="h-5 w-5 ml-3" />
                </Button>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={handleContactSales}
                  className="border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-12 py-6 text-xl font-semibold rounded-2xl"
                >
                  <MessageCircle className="h-6 w-6 mr-3" />
                  Talk to Sales
                </Button>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-blue-100 max-w-3xl mx-auto">
              {[
                { icon: <CheckCircle className="h-6 w-6" />, text: "14-day free trial" },
                { icon: <Lock className="h-6 w-6" />, text: "No setup fees" },
                { icon: <Shield className="h-6 w-6" />, text: "Cancel anytime" }
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  className="flex items-center justify-center space-x-3 text-lg font-medium"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  {item.icon}
                  <span>{item.text}</span>
                </motion.div>
              ))}
            </div>

            <motion.div 
              className="pt-12 border-t border-white/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <p className="text-blue-200 mb-6 text-lg">Trusted by industry leaders</p>
              <div className="flex justify-center items-center space-x-12 opacity-60">
                <div className="text-white/40 text-lg font-semibold">Enterprise+</div>
                <div className="text-white/40 text-lg font-semibold">Fortune 500</div>
                <div className="text-white/40 text-lg font-semibold">Global Security</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;