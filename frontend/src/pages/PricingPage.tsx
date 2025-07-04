import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Shield,
  Check,
  X,
  ArrowRight,
  Play,
  Users,
  Lock,
  Headphones,
  Building2,
  HelpCircle,
  CreditCard,
  Rocket,
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

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  limitations?: string[];
  popular?: boolean;
  gradient: string;
  icon: React.ReactNode;
  buttonText: string;
  category: 'starter' | 'business' | 'enterprise';
}

interface Feature {
  category: string;
  features: {
    name: string;
    starter: boolean | string;
    professional: boolean | string;
    enterprise: boolean | string;
  }[];
}

const PricingPage: React.FC = () => {
  const [isYearly, setIsYearly] = useState(false);
  // const [selectedPlan, setSelectedPlan] = useState<string>('professional');

  const plans: PricingPlan[] = [
    {
      id: 'starter',
      name: 'Starter',
      description: 'Perfect for individuals and small projects',
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: [
        'Up to 2 cameras',
        '50 known persons database',
        'Basic face recognition',
        'Email notifications',
        'Community support',
        '7-day data retention',
        'Mobile app access',
        'Basic analytics dashboard'
      ],
      limitations: [
        'No API access',
        'No custom integrations',
        'No priority support'
      ],
      gradient: 'from-gray-500 to-gray-700',
      icon: <Users className="h-6 w-6" />,
      buttonText: 'Get Started Free',
      category: 'starter'
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'Ideal for growing businesses and teams',
      monthlyPrice: 29,
      yearlyPrice: 290, // 2 months free
      features: [
        'Up to 10 cameras',
        'Unlimited known persons',
        'Advanced AI recognition',
        'Real-time alerts (SMS/Email/Push)',
        'Priority support',
        'RESTful API access',
        '30-day data retention',
        'Advanced analytics & reports',
        'Custom detection zones',
        'Mobile & web dashboard',
        'Team collaboration tools',
        'Integration webhooks'
      ],
      popular: true,
      gradient: 'from-blue-600 to-purple-600',
      icon: <Building2 className="h-6 w-6" />,
      buttonText: 'Start Pro Trial',
      category: 'business'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Advanced features for large organizations',
      monthlyPrice: 99,
      yearlyPrice: 990, // 2 months free
      features: [
        'Unlimited cameras',
        'Unlimited known persons',
        'Enterprise AI engine',
        'Multi-location management',
        'Dedicated account manager',
        'Full API & SDK access',
        'Unlimited data retention',
        'Custom reporting & analytics',
        'White-label options',
        'SSO & LDAP integration',
        'On-premise deployment',
        'SLA guarantee (99.9% uptime)',
        'Custom integrations',
        '24/7 phone support',
        'Training & onboarding'
      ],
      gradient: 'from-purple-600 to-pink-600',
      icon: <Rocket className="h-6 w-6" />,
      buttonText: 'Contact Sales',
      category: 'enterprise'
    }
  ];

  const comparisonFeatures: Feature[] = [
    {
      category: 'Camera Management',
      features: [
        { name: 'Number of Cameras', starter: '2', professional: '10', enterprise: 'Unlimited' },
        { name: 'Live Streaming', starter: true, professional: true, enterprise: true },
        { name: 'Recording Storage', starter: '7 days', professional: '30 days', enterprise: 'Unlimited' },
        { name: 'Multiple Locations', starter: false, professional: true, enterprise: true },
        { name: 'Camera Health Monitoring', starter: false, professional: true, enterprise: true }
      ]
    },
    {
      category: 'Face Recognition',
      features: [
        { name: 'Known Persons Database', starter: '50', professional: 'Unlimited', enterprise: 'Unlimited' },
        { name: 'Recognition Accuracy', starter: '98%', professional: '99.5%', enterprise: '99.8%' },
        { name: 'Real-time Detection', starter: true, professional: true, enterprise: true },
        { name: 'Anti-spoofing Protection', starter: false, professional: true, enterprise: true },
        { name: 'Custom AI Models', starter: false, professional: false, enterprise: true }
      ]
    },
    {
      category: 'Analytics & Reporting',
      features: [
        { name: 'Basic Dashboard', starter: true, professional: true, enterprise: true },
        { name: 'Advanced Analytics', starter: false, professional: true, enterprise: true },
        { name: 'Custom Reports', starter: false, professional: true, enterprise: true },
        { name: 'Real-time Insights', starter: false, professional: true, enterprise: true },
        { name: 'Export Capabilities', starter: false, professional: true, enterprise: true }
      ]
    },
    {
      category: 'Integrations & API',
      features: [
        { name: 'Mobile App', starter: true, professional: true, enterprise: true },
        { name: 'RESTful API', starter: false, professional: true, enterprise: true },
        { name: 'Webhooks', starter: false, professional: true, enterprise: true },
        { name: 'Third-party Integrations', starter: false, professional: '5+', enterprise: 'Unlimited' },
        { name: 'SDK Access', starter: false, professional: false, enterprise: true }
      ]
    },
    {
      category: 'Support & Security',
      features: [
        { name: 'Community Support', starter: true, professional: true, enterprise: true },
        { name: 'Priority Email Support', starter: false, professional: true, enterprise: true },
        { name: 'Phone Support', starter: false, professional: false, enterprise: true },
        { name: 'SLA Guarantee', starter: false, professional: '99.5%', enterprise: '99.9%' },
        { name: 'Security Compliance', starter: 'Basic', professional: 'SOC 2', enterprise: 'SOC 2 + Custom' }
      ]
    }
  ];

  const faqs = [
    {
      question: 'Can I change my plan anytime?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and billing is prorated.'
    },
    {
      question: 'Is there a free trial for paid plans?',
      answer: 'Yes, we offer a 14-day free trial for Professional and Enterprise plans. No credit card required.'
    },
    {
      question: 'What happens if I exceed my camera limit?',
      answer: 'You\'ll receive notifications when approaching limits. You can upgrade your plan or temporarily disable cameras.'
    },
    {
      question: 'Do you offer volume discounts?',
      answer: 'Yes, we offer custom pricing for organizations with 100+ cameras. Contact our sales team for details.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Absolutely. We use bank-level encryption, SOC 2 compliance, and offer on-premise deployment for Enterprise customers.'
    },
    {
      question: 'Can I use my own servers?',
      answer: 'Enterprise customers can deploy SafeFace on their own infrastructure or private cloud environments.'
    }
  ];

  const getPrice = (plan: PricingPlan) => {
    if (plan.monthlyPrice === 0) return 'Free';
    const price = isYearly ? plan.yearlyPrice / 12 : plan.monthlyPrice;
    return `$${Math.round(price)}`;
  };

  const getSavings = (plan: PricingPlan) => {
    if (plan.monthlyPrice === 0) return null;
    const monthlyCost = plan.monthlyPrice * 12;
    const savings = monthlyCost - plan.yearlyPrice;
    return savings > 0 ? `Save $${savings}/year` : null;
  };

  const renderFeatureValue = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <X className="h-4 w-4 text-gray-400" />
      );
    }
    return <span className="text-sm text-gray-700">{value}</span>;
  };

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
            <Badge className="bg-green-50 text-green-600 border-green-200 mb-6 px-4 py-2">
              💰 Simple, Transparent Pricing
            </Badge>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Choose the{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Perfect Plan
              </span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-8">
              Start free and scale as you grow. All plans include our core AI-powered 
              face recognition features with 24/7 support.
            </p>

            {/* Pricing Toggle */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <span className={`font-medium ${!isYearly ? 'text-blue-600' : 'text-gray-500'}`}>
                Monthly
              </span>
              <Switch
                checked={isYearly}
                onCheckedChange={setIsYearly}
                className="data-[state=checked]:bg-blue-600"
              />
              <span className={`font-medium ${isYearly ? 'text-blue-600' : 'text-gray-500'}`}>
                Yearly
              </span>
              <Badge className="bg-green-100 text-green-700">Save 20%</Badge>
            </div>
          </motion.div>

          {/* Pricing Cards */}
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                className={`relative ${plan.popular ? 'scale-105' : ''}`}
              >
                <Card className={`h-full border-0 shadow-xl overflow-hidden ${
                  plan.popular ? 'ring-2 ring-blue-500' : ''
                }`}>
                  {plan.popular && (
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-2 text-sm font-bold">
                      ⭐ Most Popular
                    </div>
                  )}
                  
                  <CardHeader className={`text-center ${plan.popular ? 'pt-12' : 'pt-8'}`}>
                    <div className={`w-16 h-16 bg-gradient-to-r ${plan.gradient} rounded-2xl flex items-center justify-center text-white mx-auto mb-4`}>
                      {plan.icon}
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                      {plan.name}
                    </CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-gray-900">
                        {getPrice(plan)}
                      </span>
                      {plan.monthlyPrice > 0 && (
                        <span className="text-gray-500">/month</span>
                      )}
                      {plan.monthlyPrice === 0 && (
                        <span className="text-gray-500"> forever</span>
                      )}
                    </div>
                    {isYearly && getSavings(plan) && (
                      <Badge className="bg-green-100 text-green-700 mt-2">
                        {getSavings(plan)}
                      </Badge>
                    )}
                    <p className="text-gray-600 mt-4">{plan.description}</p>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start space-x-3">
                          <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {plan.limitations && plan.limitations.length > 0 && (
                      <>
                        <Separator className="my-6" />
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-500">Not included:</h4>
                          <ul className="space-y-2">
                            {plan.limitations.map((limitation, limitIndex) => (
                              <li key={limitIndex} className="flex items-start space-x-3">
                                <X className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-gray-500">{limitation}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                    
                    <div className="mt-8">
                      <Link to={plan.id === 'enterprise' ? '/contact' : '/register'}>
                        <Button 
                          className={`w-full ${
                            plan.popular 
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
                              : 'bg-gray-900 hover:bg-gray-800'
                          }`}
                        >
                          {plan.buttonText}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Trust Indicators */}
          <motion.div 
            className="text-center"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span>30-day money back guarantee</span>
              </div>
              <div className="flex items-center space-x-2">
                <Lock className="h-4 w-4 text-green-500" />
                <span>Bank-level security</span>
              </div>
              <div className="flex items-center space-x-2">
                <Headphones className="h-4 w-4 text-green-500" />
                <span>24/7 support included</span>
              </div>
              <div className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4 text-green-500" />
                <span>No setup fees</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Detailed Comparison Table */}
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
              Detailed Feature Comparison
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Compare all features across our plans to find the perfect fit for your needs
            </p>
          </motion.div>

          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Features</th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-900">Starter</th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-900 bg-blue-50">
                    Professional ⭐
                  </th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-900">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((category, categoryIndex) => (
                  <React.Fragment key={category.category}>
                    <tr className="bg-gray-50">
                      <td colSpan={4} className="px-6 py-3 font-semibold text-gray-700 text-sm uppercase tracking-wide">
                        {category.category}
                      </td>
                    </tr>
                    {category.features.map((feature, featureIndex) => (
                      <tr key={featureIndex} className="border-t border-gray-100">
                        <td className="px-6 py-4 font-medium text-gray-900">{feature.name}</td>
                        <td className="px-6 py-4 text-center">
                          {renderFeatureValue(feature.starter)}
                        </td>
                        <td className="px-6 py-4 text-center bg-blue-50">
                          {renderFeatureValue(feature.professional)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {renderFeatureValue(feature.enterprise)}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Enterprise Features */}
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
              Enterprise-Grade Security
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Advanced features designed for large organizations with complex security needs
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Lock className="h-8 w-8" />,
                title: "Advanced Security",
                features: [
                  "SOC 2 Type II Compliance",
                  "GDPR & CCPA Compliant",
                  "End-to-end encryption",
                  "Single Sign-On (SSO)",
                  "Role-based access control"
                ]
              },
              {
                icon: <Rocket className="h-8 w-8" />,
                title: "Scalability",
                features: [
                  "Unlimited cameras",
                  "Multi-location management",
                  "Auto-scaling infrastructure",
                  "Load balancing",
                  "Custom deployment options"
                ]
              },
              {
                icon: <Headphones className="h-8 w-8" />,
                title: "Premium Support",
                features: [
                  "Dedicated account manager",
                  "24/7 phone support",
                  "Custom training sessions",
                  "Priority bug fixes",
                  "SLA guarantee"
                ]
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white h-full">
                  <CardHeader>
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl font-bold">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {feature.features.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-center space-x-2">
                          <Check className="h-4 w-4 text-green-400" />
                          <span className="text-gray-100">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div 
            className="text-center mt-12"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <Link to="/contact">
              <Button size="lg" variant="secondary" className="px-8 py-3 text-lg">
                Contact Enterprise Sales
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Got questions? We've got answers.
            </p>
          </motion.div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3">
                      <HelpCircle className="h-5 w-5 text-blue-600" />
                      <span>{faq.question}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div 
            className="text-center mt-12"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <p className="text-gray-600 mb-4">
              Still have questions? We're here to help.
            </p>
            <Link to="/contact">
              <Button variant="outline">
                Contact Support
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
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
              Ready to Secure Your Space?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of organizations already using SafeFace to enhance their security 
              with AI-powered face recognition technology.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" variant="secondary" className="px-8 py-3 text-lg">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="px-8 py-3 text-lg border-white text-white hover:bg-white hover:text-blue-600">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>

            <div className="mt-8 text-white/80 text-sm">
              <span>✓ No credit card required</span>
              <span className="mx-4">•</span>
              <span>✓ 14-day free trial</span>
              <span className="mx-4">•</span>
              <span>✓ Cancel anytime</span>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;