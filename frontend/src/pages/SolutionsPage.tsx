import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  GraduationCap,
  Hospital,
  ShoppingCart,
  Car,
  Home,
  Users,
  CheckCircle,
  ArrowRight,
  Play,
  Target,
  Settings,
  Activity,
  Star,
  Quote
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

// const staggerContainer = {
//   animate: {
//     transition: {
//       staggerChildren: 0.1
//     }
//   }
// };

interface Solution {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  benefits: string[];
  useCases: string[];
  gradient: string;
  image?: string;
  stats?: {
    accuracy: string;
    speed: string;
    coverage: string;
  };
}

interface Industry {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  challenges: string[];
  solutions: string[];
}

const SolutionsPage: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const [selectedSolution, setSelectedSolution] = useState<string>(type || 'enterprise');

  const solutions: Solution[] = [
    {
      id: 'enterprise',
      title: 'Enterprise Security',
      description: 'Comprehensive security solution for large organizations with advanced access control and monitoring capabilities.',
      icon: <Building2 className="h-8 w-8" />,
      features: [
        'Multi-location monitoring',
        'Advanced user management',
        'Role-based access control',
        'Enterprise integrations',
        'Custom reporting',
        'API access',
        'White-label options',
        '24/7 dedicated support'
      ],
      benefits: [
        'Reduce security incidents by 85%',
        'Streamline access management',
        'Improve compliance reporting',
        'Scale across multiple locations',
        'Integrate with existing systems'
      ],
      useCases: [
        'Corporate headquarters access',
        'Multi-building campus security',
        'Employee time tracking',
        'Visitor management',
        'Sensitive area protection'
      ],
      gradient: 'from-blue-600 to-cyan-600',
      stats: {
        accuracy: '99.9%',
        speed: '0.2s',
        coverage: '24/7'
      }
    },
    {
      id: 'retail',
      title: 'Retail & Commerce',
      description: 'Smart retail solutions for customer analytics, loss prevention, and enhanced shopping experiences.',
      icon: <ShoppingCart className="h-8 w-8" />,
      features: [
        'Customer analytics',
        'Loss prevention',
        'VIP customer recognition',
        'Queue management',
        'Heat mapping',
        'Age/gender demographics',
        'Loyalty program integration',
        'Real-time alerts'
      ],
      benefits: [
        'Increase sales by 25%',
        'Reduce theft by 70%',
        'Improve customer experience',
        'Optimize store layout',
        'Enhance marketing ROI'
      ],
      useCases: [
        'Customer behavior analysis',
        'Shoplifting prevention',
        'VIP customer service',
        'Store traffic optimization',
        'Marketing campaign effectiveness'
      ],
      gradient: 'from-green-600 to-emerald-600',
      stats: {
        accuracy: '99.5%',
        speed: '0.3s',
        coverage: 'Real-time'
      }
    },
    {
      id: 'education',
      title: 'Education & Campus',
      description: 'Secure campus environments with student safety monitoring and automated attendance systems.',
      icon: <GraduationCap className="h-8 w-8" />,
      features: [
        'Campus access control',
        'Automated attendance',
        'Student safety monitoring',
        'Visitor management',
        'Emergency alerts',
        'Parent notifications',
        'Library access',
        'Dormitory security'
      ],
      benefits: [
        'Enhance student safety',
        'Automate attendance tracking',
        'Improve emergency response',
        'Reduce administrative work',
        'Increase parent confidence'
      ],
      useCases: [
        'Classroom attendance',
        'Campus building access',
        'Emergency evacuations',
        'Visitor screening',
        'After-hours monitoring'
      ],
      gradient: 'from-purple-600 to-pink-600',
      stats: {
        accuracy: '99.7%',
        speed: '0.25s',
        coverage: 'Campus-wide'
      }
    },
    {
      id: 'healthcare',
      title: 'Healthcare & Medical',
      description: 'HIPAA-compliant solutions for patient safety, access control, and medical facility security.',
      icon: <Hospital className="h-8 w-8" />,
      features: [
        'HIPAA compliance',
        'Patient identification',
        'Restricted area access',
        'Staff authentication',
        'Visitor tracking',
        'Emergency protocols',
        'Medical record integration',
        'Audit trail logging'
      ],
      benefits: [
        'Ensure HIPAA compliance',
        'Improve patient safety',
        'Secure sensitive areas',
        'Streamline workflows',
        'Reduce security incidents'
      ],
      useCases: [
        'Operating room access',
        'Pharmacy security',
        'Patient room monitoring',
        'Staff area control',
        'Visitor management'
      ],
      gradient: 'from-red-600 to-orange-600',
      stats: {
        accuracy: '99.8%',
        speed: '0.2s',
        coverage: 'HIPAA-compliant'
      }
    },
    {
      id: 'residential',
      title: 'Residential & Housing',
      description: 'Smart home and residential complex security with family-friendly features and convenience.',
      icon: <Home className="h-8 w-8" />,
      features: [
        'Family member recognition',
        'Guest access management',
        'Package delivery alerts',
        'Child safety monitoring',
        'Elderly care assistance',
        'Smart home integration',
        'Mobile notifications',
        'Cloud storage'
      ],
      benefits: [
        'Enhance home security',
        'Convenient keyless entry',
        'Monitor family safety',
        'Reduce false alarms',
        'Smart home automation'
      ],
      useCases: [
        'Family access control',
        'Guest management',
        'Child monitoring',
        'Package security',
        'Elderly assistance'
      ],
      gradient: 'from-indigo-600 to-blue-600',
      stats: {
        accuracy: '99.6%',
        speed: '0.3s',
        coverage: '24/7'
      }
    },
    {
      id: 'transportation',
      title: 'Transportation & Logistics',
      description: 'Secure transportation hubs with passenger screening and logistics facility protection.',
      icon: <Car className="h-8 w-8" />,
      features: [
        'Passenger screening',
        'Driver authentication',
        'Cargo area security',
        'Vehicle access control',
        'Real-time monitoring',
        'Incident detection',
        'Route optimization',
        'Fleet management'
      ],
      benefits: [
        'Improve transportation security',
        'Enhance passenger safety',
        'Optimize logistics operations',
        'Reduce theft and fraud',
        'Streamline check-in processes'
      ],
      useCases: [
        'Airport security',
        'Train station monitoring',
        'Bus terminal access',
        'Warehouse security',
        'Fleet vehicle access'
      ],
      gradient: 'from-yellow-600 to-orange-600',
      stats: {
        accuracy: '99.4%',
        speed: '0.4s',
        coverage: 'Multi-modal'
      }
    }
  ];

  const industries: Industry[] = [
    {
      id: 'enterprise',
      title: 'Enterprise & Corporate',
      description: 'Large organizations requiring scalable security solutions',
      icon: <Building2 className="h-6 w-6" />,
      gradient: 'from-blue-500 to-cyan-500',
      challenges: [
        'Complex access control needs',
        'Multiple location management',
        'Compliance requirements',
        'Integration with existing systems'
      ],
      solutions: [
        'Centralized management dashboard',
        'Role-based access control',
        'Audit trail and reporting',
        'Enterprise API integration'
      ]
    },
    {
      id: 'retail',
      title: 'Retail & E-commerce',
      description: 'Stores and shopping centers focused on customer experience',
      icon: <ShoppingCart className="h-6 w-6" />,
      gradient: 'from-green-500 to-emerald-500',
      challenges: [
        'Theft and shoplifting',
        'Customer behavior analysis',
        'Staff management',
        'Loss prevention'
      ],
      solutions: [
        'Real-time theft detection',
        'Customer analytics dashboard',
        'VIP customer recognition',
        'Heat mapping and insights'
      ]
    },
    {
      id: 'education',
      title: 'Education & Schools',
      description: 'Educational institutions prioritizing student safety',
      icon: <GraduationCap className="h-6 w-6" />,
      gradient: 'from-purple-500 to-pink-500',
      challenges: [
        'Student safety concerns',
        'Attendance tracking',
        'Campus access control',
        'Emergency response'
      ],
      solutions: [
        'Automated attendance system',
        'Emergency alert protocols',
        'Visitor management system',
        'Parent notification system'
      ]
    },
    {
      id: 'healthcare',
      title: 'Healthcare & Medical',
      description: 'Medical facilities requiring HIPAA-compliant security',
      icon: <Hospital className="h-6 w-6" />,
      gradient: 'from-red-500 to-orange-500',
      challenges: [
        'HIPAA compliance requirements',
        'Patient privacy protection',
        'Restricted area access',
        'Staff authentication'
      ],
      solutions: [
        'HIPAA-compliant data handling',
        'Secure patient identification',
        'Multi-level access control',
        'Comprehensive audit logs'
      ]
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Security Director',
      company: 'TechCorp Industries',
      content: 'SafeFace has revolutionized our security operations. The accuracy is incredible and the integration was seamless.',
      rating: 5,
      image: '/avatars/sarah.jpg'
    },
    {
      name: 'Michael Chen',
      role: 'IT Manager',
      company: 'Metro Shopping Center',
      content: 'Customer analytics from SafeFace helped us increase sales by 30% while reducing theft incidents significantly.',
      rating: 5,
      image: '/avatars/michael.jpg'
    },
    {
      name: 'Dr. Emily Rodriguez',
      role: 'Administrator',
      company: 'University Hospital',
      content: 'HIPAA compliance was our biggest concern. SafeFace delivered a solution that exceeded our expectations.',
      rating: 5,
      image: '/avatars/emily.jpg'
    }
  ];

  const currentSolution = solutions.find(s => s.id === selectedSolution) || solutions[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            <Badge className="bg-blue-50 text-blue-600 border-blue-200 mb-6 px-4 py-2">
              ✨ Industry Solutions
            </Badge>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Tailored Solutions for{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Every Industry
              </span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-8">
              Discover how SafeFace adapts to your specific industry needs with customized 
              features, compliance standards, and integration capabilities.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="px-8 py-3 text-lg">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Industry Solutions */}
      <section className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Solutions by Industry
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose your industry to see how SafeFace addresses your specific challenges
            </p>
          </motion.div>

          {/* Solution Selector */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {solutions.map((solution) => (
              <Button
                key={solution.id}
                variant={selectedSolution === solution.id ? 'default' : 'outline'}
                onClick={() => setSelectedSolution(solution.id)}
                className="flex items-center space-x-2 px-6 py-3"
              >
                {solution.icon}
                <span>{solution.title}</span>
              </Button>
            ))}
          </div>

          {/* Current Solution Detail */}
          <motion.div 
            key={selectedSolution}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            {/* Solution Info */}
            <div className="space-y-8">
              <div>
                <div className={`w-16 h-16 bg-gradient-to-r ${currentSolution.gradient} rounded-2xl flex items-center justify-center text-white mb-6`}>
                  {currentSolution.icon}
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  {currentSolution.title}
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {currentSolution.description}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{currentSolution.stats?.accuracy}</div>
                  <div className="text-sm text-gray-600">Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{currentSolution.stats?.speed}</div>
                  <div className="text-sm text-gray-600">Response Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{currentSolution.stats?.coverage}</div>
                  <div className="text-sm text-gray-600">Coverage</div>
                </div>
              </div>

              {/* Key Benefits */}
              <div>
                <h4 className="text-xl font-semibold text-gray-900 mb-4">Key Benefits</h4>
                <div className="space-y-3">
                  {currentSolution.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Features & Use Cases */}
            <div className="space-y-8">
              {/* Features */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5 text-blue-600" />
                    <span>Key Features</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentSolution.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Use Cases */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-green-600" />
                    <span>Common Use Cases</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {currentSolution.useCases.map((useCase, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-semibold text-green-600">{index + 1}</span>
                        </div>
                        <span className="text-gray-700">{useCase}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Industry Challenges & Solutions */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Industry Challenges We Solve
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Every industry has unique security challenges. See how we address them.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {industries.map((industry, index) => (
              <motion.div
                key={industry.id}
                variants={fadeInUp}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <div className={`w-12 h-12 bg-gradient-to-r ${industry.gradient} rounded-xl flex items-center justify-center text-white mb-4`}>
                      {industry.icon}
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {industry.title}
                    </CardTitle>
                    <p className="text-gray-600">{industry.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Challenges</h4>
                        <div className="space-y-2">
                          {industry.challenges.map((challenge, challengeIndex) => (
                            <div key={challengeIndex} className="flex items-start space-x-2">
                              <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-sm text-gray-600">{challenge}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Our Solutions</h4>
                        <div className="space-y-2">
                          {industry.solutions.map((solution, solutionIndex) => (
                            <div key={solutionIndex} className="flex items-start space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{solution}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">
              Trusted by Industry Leaders
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              See what our customers say about their SafeFace experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <Quote className="h-8 w-8 text-blue-400 mb-4" />
                    <p className="text-gray-100 mb-6 italic">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold">
                          {testimonial.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-sm text-gray-300">{testimonial.role}</div>
                        <div className="text-sm text-gray-400">{testimonial.company}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Implementation Process */}
      <section className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple Implementation Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get started with SafeFace in just a few simple steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Consultation',
                description: 'We assess your specific needs and recommend the best solution',
                icon: <Users className="h-6 w-6" />
              },
              {
                step: '02',
                title: 'Setup',
                description: 'Our team handles installation and configuration',
                icon: <Settings className="h-6 w-6" />
              },
              {
                step: '03',
                title: 'Training',
                description: 'Comprehensive training for your team',
                icon: <GraduationCap className="h-6 w-6" />
              },
              {
                step: '04',
                title: 'Go Live',
                description: 'Launch with ongoing support and monitoring',
                icon: <Activity className="h-6 w-6" />
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white mx-auto mb-4">
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Security?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of organizations already using SafeFace to enhance their security 
              with industry-specific AI-powered solutions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" variant="secondary" className="px-8 py-3 text-lg">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="px-8 py-3 text-lg border-white text-white hover:bg-white hover:text-blue-600">
                  Schedule Consultation
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default SolutionsPage;