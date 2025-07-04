import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  Search,
  HelpCircle,
  MessageCircle,
  Mail,
  Phone,
  FileText,
  Book,
  Video,
  Download,
  ExternalLink,
  ChevronRight,
  Clock,
  Users,
  Camera,
  Eye,
  Settings,
  Shield,
  AlertTriangle,
  Star,
  Send,
  ArrowRight
} from 'lucide-react';
// import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

interface HelpArticle {
  id: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  popular: boolean;
  icon: React.ReactNode;
}

const HelpPage: React.FC = () => {
  // const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Topics', icon: <Book className="h-4 w-4" /> },
    { id: 'getting-started', label: 'Getting Started', icon: <Users className="h-4 w-4" /> },
    { id: 'cameras', label: 'Camera Setup', icon: <Camera className="h-4 w-4" /> },
    { id: 'detections', label: 'Face Detection', icon: <Eye className="h-4 w-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="h-4 w-4" /> },
    { id: 'troubleshooting', label: 'Troubleshooting', icon: <AlertTriangle className="h-4 w-4" /> }
  ];

  const faqs: FAQItem[] = [
    {
      question: "How do I add a new camera to my system?",
      answer: "To add a new camera, navigate to the Cameras page and click 'Add Camera'. You can connect IP cameras using RTSP URLs or use your device's webcam. Make sure your camera supports the required formats (MJPEG, H.264).",
      category: "cameras"
    },
    {
      question: "Why is my face detection accuracy low?",
      answer: "Face detection accuracy can be affected by lighting conditions, camera angle, and image quality. Ensure good lighting, position cameras at eye level, and use high-resolution cameras. Also, make sure you've added multiple clear photos of each person.",
      category: "detections"
    },
    {
      question: "How do I add known persons to the system?",
      answer: "Go to the Persons page and click 'Add Person'. Upload multiple clear photos of the person from different angles. The more quality photos you provide, the better the recognition accuracy will be.",
      category: "getting-started"
    },
    {
      question: "Can I receive notifications when strangers are detected?",
      answer: "Yes! You can configure email notifications and webhook alerts in the Settings page. You can customize when and how you receive notifications for stranger detections.",
      category: "settings"
    },
    {
      question: "What video formats are supported?",
      answer: "SafeFace supports RTSP streams, MJPEG, H.264, and direct webcam connections. Most modern IP cameras and USB webcams are compatible with our system.",
      category: "cameras"
    },
    {
      question: "How secure is my data?",
      answer: "Your data is encrypted both in transit and at rest. We use industry-standard security protocols, and your face data never leaves your secure environment. Each user's data is completely isolated.",
      category: "security"
    },
    {
      question: "Camera is showing as offline, what should I do?",
      answer: "Check your network connection, verify the camera URL is correct, and ensure the camera is powered on. For IP cameras, make sure they're accessible from your network and authentication credentials are correct.",
      category: "troubleshooting"
    },
    {
      question: "How many cameras can I connect?",
      answer: "The number of cameras depends on your subscription plan. Free tier supports 2 cameras, Pro supports 10 cameras, and Enterprise supports unlimited cameras.",
      category: "getting-started"
    }
  ];

  const helpArticles: HelpArticle[] = [
    {
      id: '1',
      title: 'Quick Start Guide',
      description: 'Get up and running with SafeFace in 5 minutes',
      category: 'getting-started',
      readTime: '5 min',
      popular: true,
      icon: <Users className="h-5 w-5" />
    },
    {
      id: '2',
      title: 'Camera Configuration Best Practices',
      description: 'Optimize your camera setup for maximum accuracy',
      category: 'cameras',
      readTime: '8 min',
      popular: true,
      icon: <Camera className="h-5 w-5" />
    },
    {
      id: '3',
      title: 'Understanding Detection Analytics',
      description: 'Learn how to interpret your detection data and reports',
      category: 'detections',
      readTime: '6 min',
      popular: true,
      icon: <Eye className="h-5 w-5" />
    },
    {
      id: '4',
      title: 'Security and Privacy Settings',
      description: 'Configure privacy settings and understand data security',
      category: 'security',
      readTime: '10 min',
      popular: false,
      icon: <Shield className="h-5 w-5" />
    },
    {
      id: '5',
      title: 'Notification Configuration',
      description: 'Set up email alerts and webhook notifications',
      category: 'settings',
      readTime: '7 min',
      popular: false,
      icon: <Settings className="h-5 w-5" />
    },
    {
      id: '6',
      title: 'Troubleshooting Common Issues',
      description: 'Solutions to frequently encountered problems',
      category: 'troubleshooting',
      readTime: '12 min',
      popular: true,
      icon: <AlertTriangle className="h-5 w-5" />
    }
  ];

  const contactMethods = [
    {
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      icon: <MessageCircle className="h-6 w-6" />,
      action: 'Start Chat',
      available: '24/7',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Email Support',
      description: 'Send us a detailed message',
      icon: <Mail className="h-6 w-6" />,
      action: 'Send Email',
      available: '< 4 hours response',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Phone Support',
      description: 'Speak directly with our experts',
      icon: <Phone className="h-6 w-6" />,
      action: 'Call Now',
      available: 'Mon-Fri 9AM-6PM',
      gradient: 'from-purple-500 to-pink-500'
    }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredArticles = helpArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleContactMethod = (method: string) => {
    switch (method) {
      case 'chat':
        toast.success('Opening live chat...');
        break;
      case 'email':
        window.location.href = 'mailto:support@safeface.ai';
        break;
      case 'phone':
        toast.success('Phone support: +1 (555) 123-4567');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <HelpCircle className="h-16 w-16 mx-auto mb-6 opacity-90" />
          <h1 className="text-4xl font-bold mb-4">How can we help you?</h1>
          <p className="text-xl opacity-90 mb-8">
            Find answers to your questions and get the most out of SafeFace
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for help articles, tutorials, or FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-4 text-lg bg-white text-gray-900 border-0 shadow-lg rounded-xl"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {contactMethods.map((method, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className={`w-12 h-12 bg-gradient-to-r ${method.gradient} rounded-xl flex items-center justify-center text-white mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  {method.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{method.title}</h3>
                <p className="text-gray-600 mb-3">{method.description}</p>
                <Badge variant="outline" className="mb-4">{method.available}</Badge>
                <Button 
                  className="w-full"
                  onClick={() => handleContactMethod(method.title.toLowerCase().split(' ')[0])}
                >
                  {method.action}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="articles" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="articles">Help Articles</TabsTrigger>
            <TabsTrigger value="faqs">FAQs</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          {/* Help Articles Tab */}
          <TabsContent value="articles" className="space-y-6">
            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center space-x-2"
                >
                  {category.icon}
                  <span>{category.label}</span>
                </Button>
              ))}
            </div>

            {/* Popular Articles */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Popular Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.filter(article => article.popular).map((article) => (
                  <Card key={article.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                          {article.icon}
                        </div>
                        <Badge variant="secondary">
                          <Clock className="h-3 w-3 mr-1" />
                          {article.readTime}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                        {article.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">{article.description}</p>
                      <Button variant="ghost" className="p-0 h-auto font-semibold text-blue-600">
                        Read Article
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* All Articles */}
            {filteredArticles.filter(article => !article.popular).length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">All Articles</h2>
                <div className="space-y-4">
                  {filteredArticles.filter(article => !article.popular).map((article) => (
                    <Card key={article.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="p-3 bg-gray-100 rounded-lg text-gray-600">
                              {article.icon}
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold mb-1">{article.title}</h3>
                              <p className="text-gray-600">{article.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <Badge variant="outline">
                              <Clock className="h-3 w-3 mr-1" />
                              {article.readTime}
                            </Badge>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* FAQs Tab */}
          <TabsContent value="faqs" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
              
              {filteredFAQs.length > 0 ? (
                <Accordion type="single" collapsible className="space-y-4">
                  {filteredFAQs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border border-gray-200 rounded-lg px-6">
                      <AccordionTrigger className="text-left font-medium hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600 pb-4">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <HelpCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No FAQs found</h3>
                    <p className="text-gray-600">Try adjusting your search or category filter.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Documentation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <FileText className="h-6 w-6 text-blue-600" />
                    <span>Documentation</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Button variant="ghost" className="w-full justify-start">
                      <Book className="h-4 w-4 mr-3" />
                      API Documentation
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      <Settings className="h-4 w-4 mr-3" />
                      Configuration Guide
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      <Shield className="h-4 w-4 mr-3" />
                      Security Best Practices
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Video Tutorials */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <Video className="h-6 w-6 text-green-600" />
                    <span>Video Tutorials</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Button variant="ghost" className="w-full justify-start">
                      <Users className="h-4 w-4 mr-3" />
                      Getting Started (5 min)
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      <Camera className="h-4 w-4 mr-3" />
                      Camera Setup (8 min)
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      <Eye className="h-4 w-4 mr-3" />
                      Understanding Analytics (12 min)
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Downloads */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <Download className="h-6 w-6 text-purple-600" />
                    <span>Downloads</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Button variant="ghost" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-3" />
                      User Manual (PDF)
                      <Download className="h-4 w-4 ml-auto" />
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      <Settings className="h-4 w-4 mr-3" />
                      Quick Reference Card
                      <Download className="h-4 w-4 ml-auto" />
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      <Camera className="h-4 w-4 mr-3" />
                      Camera Compatibility List
                      <Download className="h-4 w-4 ml-auto" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Community */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <Users className="h-6 w-6 text-orange-600" />
                    <span>Community</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Button variant="ghost" className="w-full justify-start">
                      <MessageCircle className="h-4 w-4 mr-3" />
                      Discussion Forum
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      <Star className="h-4 w-4 mr-3" />
                      Feature Requests
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      <AlertTriangle className="h-4 w-4 mr-3" />
                      Report Issues
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Still Need Help */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0 mt-12">
          <CardContent className="p-8 text-center">
            <MessageCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Still need help?</h3>
            <p className="text-gray-600 mb-6">
              Can't find what you're looking for? Our support team is here to help you 24/7.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => handleContactMethod('chat')}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Start Live Chat
              </Button>
              <Button variant="outline" onClick={() => handleContactMethod('email')}>
                <Send className="h-4 w-4 mr-2" />
                Send Email
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HelpPage;