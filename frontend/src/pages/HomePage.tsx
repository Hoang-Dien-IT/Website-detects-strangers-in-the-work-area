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
      gradient: "from-teal-600 via-cyan-500 to-emerald-400"
    },
    {
      icon: <ShieldCheck className="h-10 w-10" />,
      title: "Enterprise Security",
      description: "Military-grade encryption, GDPR compliance, zero-trust architecture, and SOC 2 Type II certification",
      gradient: "from-emerald-600 via-teal-500 to-cyan-400"
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
      gradient: "from-slate-600 via-gray-500 to-stone-400"
    },
    {
      icon: <BarChart3 className="h-10 w-10" />,
      title: "Advanced Analytics",
      description: "Machine learning insights, predictive analytics, custom dashboards, and comprehensive reporting",
      gradient: "from-cyan-600 via-teal-500 to-emerald-400"
    },
    {
      icon: <Users className="h-10 w-10" />,
      title: "Team Collaboration",
      description: "Role-based access control, workflow automation, team notifications, and audit trails",
      gradient: "from-slate-600 via-gray-500 to-zinc-400"
    }
  ];

  const stats: Stat[] = [
    {
      number: "100K+",
      label: "Active Users",
      description: "Global enterprises trust SafeFace",
      icon: <Users className="h-8 w-8" />,
      gradient: "from-teal-600 to-cyan-400"
    },
    {
      number: "99.97%",
      label: "Accuracy Rate",
      description: "Industry-leading AI precision",
      icon: <Target className="h-8 w-8" />,
      gradient: "from-emerald-600 to-teal-400"
    },
    {
      number: "24/7",
      label: "Support",
      description: "Expert assistance worldwide",
      icon: <Clock className="h-8 w-8" />,
      gradient: "from-cyan-600 to-emerald-400"
    },
    {
      number: "1B+",
      label: "Detections",
      description: "Successful face recognitions",
      icon: <Eye className="h-8 w-8" />,
      gradient: "from-slate-600 to-gray-400"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-emerald-50">

      {/* Enhanced Hero Section */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-teal-50 to-emerald-100">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-teal-400/20 to-emerald-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-64 h-64 bg-gradient-to-r from-cyan-400/20 to-teal-400/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
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
                  <Badge className="bg-gradient-to-r from-teal-600/10 to-emerald-600/10 text-teal-700 border border-teal-200/50 backdrop-blur-sm px-6 py-3 text-sm font-medium">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Nền tảng bảo mật AI thế hệ mới
                  </Badge>
                </motion.div>

                {/* Hero Title */}
                <div className="space-y-6">
                  <h1 className="text-6xl lg:text-7xl xl:text-8xl font-black leading-[0.9] tracking-tight">
                    <span className="block text-gray-900">Nền tảng</span>
                    <span className="block bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                      Bảo mật
                    </span>
                    <span className="block text-gray-900">Thông minh</span>
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
                    whileHover={{ scale: 1.02, boxShadow: "0 25px 50px -12px rgba(14, 165, 233, 0.25)" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      size="lg" 
                      onClick={handleGetStarted}
                      className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-12 py-6 text-xl font-semibold rounded-2xl shadow-2xl border-0"
                    >
                      <Rocket className="h-6 w-6 mr-3" />
                      {isAuthenticated ? 'Đi tới Dashboard' : 'Bắt đầu miễn phí'}
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
                      Xem Demo
                    </Button>
                  </motion.div>
                </div>

                {/* Trust Indicators */}
                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 pt-4">
                  {[
                    { icon: <CheckCircle className="h-5 w-5 text-green-500" />, text: "Hoàn toàn miễn phí" },
                    { icon: <Lock className="h-5 w-5 text-teal-500" />, text: "Không cần thẻ tín dụng" },
                    { icon: <Shield className="h-5 w-5 text-emerald-500" />, text: "Bảo mật doanh nghiệp" }
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
                  className="absolute -bottom-6 -left-6 bg-teal-500 text-white p-4 rounded-2xl shadow-xl"
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
            <Badge className="bg-teal-100/80 text-teal-700 border border-teal-200/50 backdrop-blur-sm mb-6 px-6 py-3 text-sm font-medium">
              <Sparkles className="h-4 w-4 mr-2" />
              Các tính năng tiên tiến
            </Badge>
            <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight">
              Mọi thứ bạn cần cho{" "}
              <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                Bảo mật hoàn hảo
              </span>
            </h2>
            <p className="text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light">
              Nền tảng AI toàn diện của chúng tôi cung cấp nhận diện khuôn mặt cấp doanh nghiệp, 
              phát hiện mối đe dọa theo thời gian thực và phân tích thông minh cho các hoạt động bảo mật hiện đại.
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
                      <CardTitle className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-teal-600 group-hover:to-emerald-600 group-hover:bg-clip-text transition-all duration-300">
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

      {/* Testimonials Section */}
      <section className="py-32 bg-gradient-to-br from-gray-50 to-teal-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-20"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight">
              Được tin tưởng bởi{" "}
              <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                Các chuyên gia bảo mật
              </span>
            </h2>
            <p className="text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light">
              Tham gia cùng hàng nghìn tổ chức trên toàn thế giới tin tưởng SafeFace 
              cho các hoạt động bảo mật quan trọng của họ
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
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600"></div>
              
              <CardContent className="p-16">
                <div className="flex items-center justify-center mb-12">
                  <div className="w-24 h-24 bg-gradient-to-r from-teal-100 to-emerald-100 rounded-3xl flex items-center justify-center">
                    <Quote className="h-12 w-12 text-teal-600" />
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
                      ? 'bg-teal-600 scale-125' 
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
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-gray-800">
          <div className="absolute top-20 left-20 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl"></div>
          
          {/* Geometric patterns */}
          <div className="absolute top-10 right-10 w-32 h-32 border border-teal-400/20 rounded-2xl rotate-45"></div>
          <div className="absolute bottom-10 left-10 w-24 h-24 border border-emerald-400/20 rounded-full"></div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-5">
            <div className="w-full h-full" style={{
              backgroundImage: `linear-gradient(rgba(20, 184, 166, 0.3) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(20, 184, 166, 0.3) 1px, transparent 1px)`,
              backgroundSize: '50px 50px'
            }}></div>
          </div>
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
                Sẵn sàng biến đổi 
                <span className="block bg-gradient-to-r from-teal-300 via-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                  Hệ thống bảo mật?
                </span>
              </h2>
              <p className="text-xl lg:text-2xl text-slate-200 max-w-4xl mx-auto leading-relaxed font-light">
                Tham gia cùng hơn 100,000+ tổ chức đang sử dụng SafeFace để bảo vệ những gì quan trọng nhất. 
                Bắt đầu ngay hôm nay và trải nghiệm tương lai của bảo mật thông minh.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
              <motion.div 
                whileHover={{ scale: 1.05, boxShadow: "0 25px 50px -12px rgba(20, 184, 166, 0.4)" }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg" 
                  onClick={handleGetStarted}
                  className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white px-12 py-6 text-xl font-semibold rounded-2xl shadow-2xl border-0 backdrop-blur-sm"
                >
                  <Rocket className="h-6 w-6 mr-3" />
                  Bắt đầu miễn phí
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
                  Liên hệ tư vấn
                </Button>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-slate-200 max-w-3xl mx-auto">
              {[
                { icon: <CheckCircle className="h-6 w-6" />, text: "Hoàn toàn miễn phí" },
                { icon: <Lock className="h-6 w-6" />, text: "Không phí cài đặt" },
                { icon: <Shield className="h-6 w-6" />, text: "Hủy bất cứ lúc nào" }
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  className="flex items-center justify-center space-x-3 text-lg font-medium"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <div className="text-teal-400">
                    {item.icon}
                  </div>
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
              <p className="text-slate-300 mb-6 text-lg">Được tin tưởng bởi các doanh nghiệp hàng đầu</p>
              <div className="flex justify-center items-center space-x-12 opacity-60">
                <div className="text-white/40 text-lg font-semibold">Doanh nghiệp+</div>
                <div className="text-white/40 text-lg font-semibold">Fortune 500</div>
                <div className="text-white/40 text-lg font-semibold">Bảo mật toàn cầu</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;