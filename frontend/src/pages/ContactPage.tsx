import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageCircle,
  Send,
  CheckCircle,
  ArrowRight,
  Headphones,
  Video,
  HelpCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

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

interface ContactForm {
  name: string;
  email: string;
  company: string;
  role: string;
  phone: string;
  subject: string;
  message: string;
  inquiryType: string;
  preferredContact: string;
}

interface ContactMethod {
  icon: React.ReactNode;
  title: string;
  description: string;
  value: string;
  action: string;
  available: string;
  gradient: string;
}

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    company: '',
    role: '',
    phone: '',
    subject: '',
    message: '',
    inquiryType: 'general',
    preferredContact: 'email'
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<ContactForm>>({});

  const contactMethods: ContactMethod[] = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: 'Email Support',
      description: 'Send us a message and we\'ll respond within 4 hours',
      value: 'support@safeface.ai',
      action: 'Send Email',
      available: '< 4 hours response',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      value: 'Available 24/7',
      action: 'Start Chat',
      available: 'Instant response',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: 'Phone Support',
      description: 'Speak directly with our security experts',
      value: '+1 (555) 123-4567',
      action: 'Call Now',
      available: 'Mon-Fri 9AM-6PM PST',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: <Video className="h-6 w-6" />,
      title: 'Schedule Demo',
      description: 'Book a personalized product demonstration',
      value: 'Free 30-min session',
      action: 'Book Demo',
      available: 'Flexible scheduling',
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  const officeLocations = [
    {
      city: 'San Francisco',
      country: 'United States',
      address: '123 Tech Street, Suite 456, San Francisco, CA 94105',
      phone: '+1 (555) 123-4567',
      email: 'sf@safeface.ai',
      timezone: 'PST (UTC-8)',
      type: 'Headquarters'
    },
    {
      city: 'London',
      country: 'United Kingdom',
      address: '456 Innovation Ave, London EC2A 1HQ, UK',
      phone: '+44 20 7123 4567',
      email: 'london@safeface.ai',
      timezone: 'GMT (UTC+0)',
      type: 'European Office'
    },
    {
      city: 'Singapore',
      country: 'Singapore',
      address: '789 Business Blvd, Singapore 018956',
      phone: '+65 6123 4567',
      email: 'singapore@safeface.ai',
      timezone: 'SGT (UTC+8)',
      type: 'Asia Pacific Office'
    }
  ];

  const faqs = [
    {
      question: 'How quickly can I get started?',
      answer: 'You can start using SafeFace immediately with our free plan. For paid plans, setup typically takes 1-2 business days after subscription.',
      category: 'Getting Started'
    },
    {
      question: 'Do you offer custom enterprise solutions?',
      answer: 'Yes, we provide fully customized solutions for enterprise clients including on-premise deployment, custom integrations, and dedicated support.',
      category: 'Enterprise'
    },
    {
      question: 'What kind of support do you provide?',
      answer: 'We offer 24/7 chat support, email support with <4 hour response time, phone support for enterprise customers, and comprehensive documentation.',
      category: 'Support'
    },
    {
      question: 'Is my data secure?',
      answer: 'Absolutely. We use bank-level encryption, are SOC 2 Type II compliant, and offer on-premise deployment options for maximum security.',
      category: 'Security'
    },
    {
      question: 'Can I integrate with my existing systems?',
      answer: 'Yes, SafeFace offers comprehensive APIs, webhooks, and pre-built integrations with popular security and business systems.',
      category: 'Integration'
    },
    {
      question: 'What pricing options do you have?',
      answer: 'We offer a free starter plan, professional plans starting at $29/month, and custom enterprise pricing. All plans include core features.',
      category: 'Pricing'
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof ContactForm]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ContactForm> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.company.trim()) newErrors.company = 'Company is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would typically send the form data to your backend
      console.log('Contact form submitted:', formData);
      
      setSubmitted(true);
      toast.success('Message sent successfully! We\'ll get back to you soon.');
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleContactMethod = (method: string) => {
    switch (method.toLowerCase()) {
      case 'email':
        window.location.href = 'mailto:support@safeface.ai?subject=Support Inquiry';
        break;
      case 'chat':
        // Implement chat widget
        toast.info('Chat feature will be available soon!');
        break;
      case 'phone':
        window.location.href = 'tel:+15551234567';
        break;
      case 'demo':
        // Implement demo booking
        toast.info('Demo booking will be available soon!');
        break;
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto text-center"
        >
          <Card className="border-0 shadow-2xl">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Message Sent Successfully!
              </h2>
              <p className="text-gray-600 mb-6">
                Thank you for contacting us. Our team will review your message and get back to you within 4 hours.
              </p>
              <div className="space-y-3">
                <Button onClick={() => setSubmitted(false)} className="w-full">
                  Send Another Message
                </Button>
                <Link to="/" className="block">
                  <Button variant="outline" className="w-full">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

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
              💬 Get in Touch
            </Badge>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Let's{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Talk Security
              </span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-8">
              Ready to enhance your security with AI-powered face recognition? 
              Our experts are here to help you find the perfect solution.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => handleContactMethod('demo')} className="px-8 py-3 text-lg">
                <Video className="mr-2 h-5 w-5" />
                Schedule Demo
              </Button>
              <Button variant="outline" size="lg" onClick={() => handleContactMethod('chat')} className="px-8 py-3 text-lg">
                <MessageCircle className="mr-2 h-5 w-5" />
                Start Live Chat
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Methods */}
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
              Choose Your Preferred Contact Method
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're here to help you succeed. Reach out through your preferred channel.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {contactMethods.map((method, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                className="group cursor-pointer"
                onClick={() => handleContactMethod(method.title.split(' ')[0].toLowerCase())}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 bg-gradient-to-r ${method.gradient} rounded-2xl flex items-center justify-center text-white mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      {method.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {method.title}
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm">
                      {method.description}
                    </p>
                    <div className="space-y-2">
                      <p className="font-semibold text-gray-900">{method.value}</p>
                      <Badge variant="outline" className="text-xs">
                        {method.available}
                      </Badge>
                    </div>
                    <Button className="w-full mt-4 group-hover:scale-105 transition-transform">
                      {method.action}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Send us a Message
                  </CardTitle>
                  <p className="text-gray-600">
                    Fill out the form below and we'll get back to you within 4 hours.
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Your full name"
                          className={errors.name ? 'border-red-500' : ''}
                        />
                        {errors.name && (
                          <p className="text-sm text-red-500">{errors.name}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="your@email.com"
                          className={errors.email ? 'border-red-500' : ''}
                        />
                        {errors.email && (
                          <p className="text-sm text-red-500">{errors.email}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="company">Company *</Label>
                        <Input
                          id="company"
                          name="company"
                          value={formData.company}
                          onChange={handleInputChange}
                          placeholder="Your company name"
                          className={errors.company ? 'border-red-500' : ''}
                        />
                        {errors.company && (
                          <p className="text-sm text-red-500">{errors.company}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="role">Your Role</Label>
                        <Input
                          id="role"
                          name="role"
                          value={formData.role}
                          onChange={handleInputChange}
                          placeholder="e.g., Security Manager"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Inquiry Type</Label>
                        <Select
                          value={formData.inquiryType}
                          onValueChange={(value) => handleSelectChange('inquiryType', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General Inquiry</SelectItem>
                            <SelectItem value="sales">Sales Question</SelectItem>
                            <SelectItem value="support">Technical Support</SelectItem>
                            <SelectItem value="partnership">Partnership</SelectItem>
                            <SelectItem value="enterprise">Enterprise Solution</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder="Brief subject line"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Tell us about your security needs and how we can help..."
                        rows={6}
                        className={errors.message ? 'border-red-500' : ''}
                      />
                      {errors.message && (
                        <p className="text-sm text-red-500">{errors.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Preferred Contact Method</Label>
                      <Select
                        value={formData.preferredContact}
                        onValueChange={(value) => handleSelectChange('preferredContact', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="phone">Phone</SelectItem>
                          <SelectItem value="either">Either</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Sending Message...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Send className="mr-2 h-4 w-4" />
                          Send Message
                        </div>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Office Locations */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Our Global Offices
                </h3>
                <p className="text-gray-600 mb-8">
                  With offices around the world, we're always close to you.
                </p>

                <div className="space-y-6">
                  {officeLocations.map((office, index) => (
                    <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg font-bold text-gray-900">
                              {office.city}, {office.country}
                            </CardTitle>
                            <Badge variant="outline" className="mt-1">
                              {office.type}
                            </Badge>
                          </div>
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <MapPin className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-start space-x-3">
                            <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                            <p className="text-sm text-gray-600">{office.address}</p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <p className="text-sm text-gray-600">{office.phone}</p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <p className="text-sm text-gray-600">{office.email}</p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <p className="text-sm text-gray-600">{office.timezone}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Support Hours */}
              <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Headphones className="h-5 w-5 text-blue-600" />
                    <span>Support Hours</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Live Chat</span>
                      <Badge className="bg-green-100 text-green-700">24/7</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Email Support</span>
                      <Badge className="bg-blue-100 text-blue-700">24/7</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Phone Support</span>
                      <Badge className="bg-purple-100 text-purple-700">Business Hours</Badge>
                    </div>
                    <Separator />
                    <p className="text-sm text-gray-600">
                      Emergency support available 24/7 for Enterprise customers
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
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
              Quick answers to common questions about SafeFace.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-semibold text-gray-900 pr-4">
                        {faq.question}
                      </CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {faq.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
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
              Can't find what you're looking for?
            </p>
            <Link to="/help">
              <Button variant="outline">
                <HelpCircle className="mr-2 h-4 w-4" />
                Visit Help Center
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
              <Button size="lg" variant="outline" onClick={() => handleContactMethod('demo')} className="px-8 py-3 text-lg border-white text-white hover:bg-white hover:text-blue-600">
                <Video className="mr-2 h-5 w-5" />
                Schedule Demo
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

export default ContactPage;