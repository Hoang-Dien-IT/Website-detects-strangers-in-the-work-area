import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Eye,
  Brain,
  Zap,
  Camera,
  Globe,
  Target,
  Clock,
  Lock,
  Activity,
  CheckCircle,
  ArrowRight,
  Play,
  BarChart3,
  Settings,
  Smartphone,
  Cloud,
  Wifi,
  Database,
  Rocket
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// const scaleOnHover = {
//   whileHover: { scale: 1.05 },
//   whileTap: { scale: 0.95 }
// };

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  benefits: string[];
  gradient: string;
  category: string;
}

interface FeatureCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const FeaturesPage: React.FC = () => {
  const categories: FeatureCategory[] = [
    {
      id: 'ai-detection',
      title: 'AI Detection',
      description: 'Advanced machine learning algorithms',
      icon: <Brain className="h-6 w-6" />
    },
    {
      id: 'monitoring',
      title: 'Real-time Monitoring',
      description: 'Live surveillance and alerts',
      icon: <Eye className="h-6 w-6" />
    },
    {
      id: 'security',
      title: 'Enterprise Security',
      description: 'Bank-grade protection',
      icon: <Shield className="h-6 w-6" />
    },
    {
      id: 'integration',
      title: 'Integration',
      description: 'Seamless platform connectivity',
      icon: <Globe className="h-6 w-6" />
    }
  ];

  const features: Feature[] = [
    // AI Detection Features
    {
      icon: <Brain className="h-8 w-8" />,
      title: "AI-Powered Face Recognition",
      description: "State-of-the-art deep learning models with 99.7% accuracy for instant face detection and recognition",
      benefits: [
        "99.7% recognition accuracy",
        "Sub-second processing speed",
        "Works in various lighting conditions",
        "Anti-spoofing protection",
        "Continuous learning and improvement"
      ],
      gradient: "from-teal-500 to-cyan-500",
      category: "ai-detection"
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Advanced Analytics",
      description: "Comprehensive analytics and insights to understand patterns and optimize security protocols",
      benefits: [
        "Real-time detection analytics",
        "Historical trend analysis",
        "Custom reporting dashboard",
        "Behavioral pattern recognition",
        "Performance metrics tracking"
      ],
      gradient: "from-emerald-500 to-teal-500",
      category: "ai-detection"
    },
    {
      icon: <Activity className="h-8 w-8" />,
      title: "Smart Detection Zones",
      description: "Configure custom detection areas and set specific rules for different zones and access levels",
      benefits: [
        "Multiple detection zones",
        "Zone-specific permissions",
        "Custom alert configurations",
        "Time-based access control",
        "Automated zone management"
      ],
      gradient: "from-green-500 to-emerald-500",
      category: "ai-detection"
    },

    // Real-time Monitoring Features
    {
      icon: <Eye className="h-8 w-8" />,
      title: "Live Video Monitoring",
      description: "Real-time video surveillance with instant face detection overlays and live person identification",
      benefits: [
        "Multi-camera live streaming",
        "Real-time detection overlays",
        "Instant person identification",
        "HD video quality support",
        "Mobile app monitoring"
      ],
      gradient: "from-cyan-500 to-emerald-500",
      category: "monitoring"
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Instant Alerts",
      description: "Get immediate notifications for unknown persons, security breaches, or system events",
      benefits: [
        "Real-time push notifications",
        "Email and SMS alerts",
        "Custom alert rules",
        "Escalation procedures",
        "Alert history tracking"
      ],
      gradient: "from-slate-500 to-gray-500",
      category: "monitoring"
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "24/7 Monitoring",
      description: "Continuous surveillance with automated monitoring and intelligent threat detection",
      benefits: [
        "Round-the-clock monitoring",
        "Automated threat detection",
        "Night vision support",
        "Motion-triggered recording",
        "Cloud backup storage"
      ],
      gradient: "from-teal-500 to-emerald-500",
      category: "monitoring"
    },

    // Security Features
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Enterprise Security",
      description: "Bank-level encryption and security protocols to protect your sensitive data and privacy",
      benefits: [
        "End-to-end encryption",
        "SOC 2 Type II compliance",
        "GDPR compliant data handling",
        "Role-based access control",
        "Audit trail logging"
      ],
      gradient: "from-emerald-500 to-cyan-500",
      category: "security"
    },
    {
      icon: <Lock className="h-8 w-8" />,
      title: "Access Control",
      description: "Advanced user management with role-based permissions and multi-factor authentication",
      benefits: [
        "Multi-factor authentication",
        "Role-based permissions",
        "Single sign-on (SSO)",
        "Session management",
        "Password policy enforcement"
      ],
      gradient: "from-gray-600 to-gray-800",
      category: "security"
    },
    {
      icon: <Database className="h-8 w-8" />,
      title: "Secure Data Storage",
      description: "Encrypted cloud storage with automatic backups and disaster recovery capabilities",
      benefits: [
        "Encrypted data storage",
        "Automatic daily backups",
        "Disaster recovery plans",
        "Data retention policies",
        "Geographic data replication"
      ],
      gradient: "from-teal-500 to-cyan-500",
      category: "security"
    },

    // Integration Features
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Cloud Integration",
      description: "Seamless cloud connectivity with popular platforms and enterprise systems",
      benefits: [
        "AWS, Azure, GCP support",
        "RESTful API access",
        "Webhook integrations",
        "Third-party app connections",
        "Custom integration support"
      ],
      gradient: "from-teal-600 to-emerald-600",
      category: "integration"
    },
    {
      icon: <Smartphone className="h-8 w-8" />,
      title: "Mobile Applications",
      description: "Native mobile apps for iOS and Android with full monitoring and management capabilities",
      benefits: [
        "Native iOS and Android apps",
        "Push notification support",
        "Offline capability",
        "Biometric authentication",
        "Real-time synchronization"
      ],
      gradient: "from-emerald-600 to-teal-600",
      category: "integration"
    },
    {
      icon: <Settings className="h-8 w-8" />,
      title: "API & Webhooks",
      description: "Comprehensive REST API and webhook system for custom integrations and automation",
      benefits: [
        "RESTful API with SDKs",
        "Real-time webhook events",
        "GraphQL support",
        "Rate limiting and throttling",
        "Comprehensive documentation"
      ],
      gradient: "from-cyan-600 to-emerald-600",
      category: "integration"
    }
  ];

  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');

  const filteredFeatures = selectedCategory === 'all' 
    ? features 
    : features.filter(feature => feature.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-emerald-50">
      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            <Badge className="bg-teal-50 text-teal-600 border-teal-200 mb-6 px-4 py-2">
              ✨ Bộ tính năng hoàn chỉnh
            </Badge>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Tính năng mạnh mẽ cho{" "}
              <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                Bảo mật hiện đại
              </span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-8">
              Khám phá các khả năng nhận diện khuôn mặt AI toàn diện được thiết kế cho 
              bảo mật doanh nghiệp, giám sát thời gian thực và tích hợp liền mạch.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="px-8 py-3 text-lg bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700">
                  Bắt đầu miễn phí
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="px-8 py-3 text-lg border-teal-200 text-teal-700 hover:bg-teal-50">
                <Play className="mr-2 h-5 w-5" />
                Xem Demo
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-20"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {[
              { number: "99.7%", label: "Recognition Accuracy" },
              { number: "0.3s", label: "Detection Speed" },
              { number: "24/7", label: "Monitoring" },
              { number: "50+", label: "Integrations" }
            ].map((stat, index) => (
              <motion.div 
                key={index}
                variants={fadeInUp}
                className="text-center"
              >
                <div className="text-3xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-12 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Explore by Category
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Browse our comprehensive feature set organized by functionality
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
              className="flex items-center space-x-2"
            >
              <BarChart3 className="h-4 w-4" />
              <span>All Features</span>
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center space-x-2"
              >
                {category.icon}
                <span>{category.title}</span>
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {filteredFeatures.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  <CardHeader>
                    <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 leading-relaxed mb-6">
                      {feature.description}
                    </p>
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900 mb-3">Lợi ích chính:</h4>
                      {feature.benefits.map((benefit, benefitIndex) => (
                        <div key={benefitIndex} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Technical Specifications */}
      <section className="py-20 bg-gradient-to-r from-slate-900 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">
              Thông số kỹ thuật
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Được xây dựng với công nghệ cấp doanh nghiệp và tiêu chuẩn hiệu suất hàng đầu trong ngành
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Rocket className="h-8 w-8" />,
                title: "Performance",
                specs: [
                  "99.7% accuracy rate",
                  "0.3s detection speed",
                  "1M+ faces database",
                  "Real-time processing"
                ]
              },
              {
                icon: <Camera className="h-8 w-8" />,
                title: "Camera Support",
                specs: [
                  "IP cameras (RTSP/HTTP)",
                  "USB/Webcam support",
                  "4K resolution support",
                  "Night vision compatible"
                ]
              },
              {
                icon: <Cloud className="h-8 w-8" />,
                title: "Infrastructure",
                specs: [
                  "Cloud & on-premise",
                  "Auto-scaling",
                  "99.9% uptime SLA",
                  "Global CDN"
                ]
              },
              {
                icon: <Wifi className="h-8 w-8" />,
                title: "Connectivity",
                specs: [
                  "RESTful API",
                  "WebSocket real-time",
                  "Webhook events",
                  "SDK libraries"
                ]
              }
            ].map((spec, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="text-center"
              >
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white mx-auto mb-4">
                  {spec.icon}
                </div>
                <h3 className="text-xl font-bold mb-4">{spec.title}</h3>
                <ul className="space-y-2">
                  {spec.specs.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-gray-300">
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-teal-600 to-emerald-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Sẵn sàng bắt đầu?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Tham gia cùng hàng nghìn tổ chức đang sử dụng SafeFace để nâng cao bảo mật 
              của họ với công nghệ nhận diện khuôn mặt AI.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" variant="secondary" className="px-8 py-3 text-lg">
                  Bắt đầu miễn phí
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="px-8 py-3 text-lg border-white text-white hover:bg-white hover:text-teal-600">
                  Liên hệ tư vấn
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default FeaturesPage;