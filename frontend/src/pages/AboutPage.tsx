import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Users,
  Target,
  Brain,
  Heart,
  Award,
  Globe,
  ArrowRight,
  Play,
  Building2,
  Linkedin,
  Twitter,
  Mail,
  Camera,
  Eye,
  Rocket,
  TrendingUp,
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

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
  linkedin?: string;
  twitter?: string;
  specialties: string[];
}

interface Value {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}

interface Milestone {
  year: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const AboutPage: React.FC = () => {
  const values: Value[] = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Security First",
      description: "We prioritize data protection and privacy in everything we build, ensuring enterprise-grade security standards.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Brain className="h-8 w-8" />,
      title: "Innovation",
      description: "Pushing the boundaries of AI technology to deliver cutting-edge face recognition solutions.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Customer Success",
      description: "Our customers' success is our success. We're committed to delivering exceptional value and support.",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Integrity",
      description: "Building trust through transparency, honesty, and ethical AI practices in all our operations.",
      gradient: "from-red-500 to-orange-500"
    }
  ];

  const team: TeamMember[] = [
    {
      name: "Sarah Chen",
      role: "Co-Founder & CEO",
      bio: "Former VP of Engineering at TechCorp with 15+ years in AI and computer vision. Stanford CS graduate.",
      image: "/team/sarah-chen.jpg",
      linkedin: "sarahchen",
      twitter: "sarahchen_ai",
      specialties: ["AI Strategy", "Computer Vision", "Leadership"]
    },
    {
      name: "Dr. Michael Rodriguez",
      role: "Co-Founder & CTO",
      bio: "PhD in Machine Learning from MIT. Previously Lead AI Researcher at Google DeepMind with 20+ patents.",
      image: "/team/michael-rodriguez.jpg",
      linkedin: "michaelrodriguez",
      specialties: ["Deep Learning", "Face Recognition", "Research"]
    },
    {
      name: "Emily Johnson",
      role: "VP of Engineering",
      bio: "Former Senior Engineer at Microsoft Azure. Expert in scalable cloud infrastructure and distributed systems.",
      image: "/team/emily-johnson.jpg",
      linkedin: "emilyjohnson",
      specialties: ["Cloud Architecture", "DevOps", "Scalability"]
    },
    {
      name: "David Kim",
      role: "Head of Security",
      bio: "Cybersecurity expert with government clearance. Former security lead at major financial institutions.",
      image: "/team/david-kim.jpg",
      linkedin: "davidkim",
      specialties: ["Cybersecurity", "Compliance", "Privacy"]
    },
    {
      name: "Lisa Wang",
      role: "VP of Product",
      bio: "Product management veteran with experience at Uber and Airbnb. Focused on user-centric design.",
      image: "/team/lisa-wang.jpg",
      linkedin: "lisawang",
      specialties: ["Product Strategy", "UX Design", "Analytics"]
    },
    {
      name: "James Thompson",
      role: "Head of Sales",
      bio: "Enterprise sales leader with track record of scaling B2B SaaS companies from startup to IPO.",
      image: "/team/james-thompson.jpg",
      linkedin: "jamesthompson",
      specialties: ["Enterprise Sales", "Business Development", "Partnerships"]
    }
  ];

  const milestones: Milestone[] = [
    {
      year: "2020",
      title: "Company Founded",
      description: "SafeFace AI Technologies was founded by AI researchers with a vision to democratize advanced face recognition technology.",
      icon: <Rocket className="h-6 w-6" />
    },
    {
      year: "2021",
      title: "First Product Launch",
      description: "Launched our MVP with basic face recognition capabilities, serving early adopters in the security industry.",
      icon: <Target className="h-6 w-6" />
    },
    {
      year: "2022",
      title: "Series A Funding",
      description: "Raised $15M Series A led by TechVentures to accelerate product development and team expansion.",
      icon: <TrendingUp className="h-6 w-6" />
    },
    {
      year: "2023",
      title: "Enterprise Platform",
      description: "Released comprehensive enterprise platform with advanced analytics, multi-location support, and enterprise integrations.",
      icon: <Building2 className="h-6 w-6" />
    },
    {
      year: "2024",
      title: "Global Expansion",
      description: "Expanded internationally with offices in London and Singapore, serving 10,000+ organizations worldwide.",
      icon: <Globe className="h-6 w-6" />
    }
  ];

  const stats = [
    { number: "10K+", label: "Organizations Trust Us", description: "Across 50+ countries" },
    { number: "99.7%", label: "Recognition Accuracy", description: "Industry-leading precision" },
    { number: "50M+", label: "Faces Processed", description: "Every month securely" },
    { number: "24/7", label: "Global Support", description: "Always here for you" }
  ];

  const awards = [
    {
      title: "Best AI Security Solution 2024",
      organization: "TechCrunch Awards",
      year: "2024"
    },
    {
      title: "Innovation in Computer Vision",
      organization: "MIT Technology Review",
      year: "2023"
    },
    {
      title: "Enterprise Security Excellence",
      organization: "Cybersecurity Awards",
      year: "2023"
    },
    {
      title: "Startup of the Year",
      organization: "AI Business Awards",
      year: "2022"
    }
  ];

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
              🚀 About SafeFace
            </Badge>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Securing the Future with{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Intelligent AI
              </span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-8">
              We're on a mission to make advanced face recognition technology accessible, 
              secure, and reliable for organizations worldwide. Founded by AI researchers 
              and security experts, we're building the future of intelligent security.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button size="lg" className="px-8 py-3 text-lg">
                  Join Our Mission
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
                <Play className="mr-2 h-5 w-5" />
                Our Story
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                variants={fadeInUp}
                className="text-center"
              >
                <div className="text-3xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-lg font-medium text-gray-900 mb-1">{stat.label}</div>
                <div className="text-sm text-gray-600">{stat.description}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-4xl font-bold text-gray-900">
                Our Story
              </h2>
              <div className="space-y-4 text-lg text-gray-600 leading-relaxed">
                <p>
                  SafeFace was born from a simple but powerful vision: to democratize 
                  advanced AI-powered security technology and make it accessible to 
                  organizations of all sizes.
                </p>
                <p>
                  Founded in 2020 by a team of AI researchers and security experts 
                  from Stanford, MIT, and leading tech companies, we recognized that 
                  while face recognition technology was rapidly advancing, it remained 
                  complex, expensive, and difficult to implement.
                </p>
                <p>
                  Today, we're proud to serve over 10,000 organizations worldwide, 
                  from small businesses to Fortune 500 companies, helping them enhance 
                  their security with intelligent, ethical, and reliable AI technology.
                </p>
              </div>
              <Link to="/contact">
                <Button size="lg">
                  Learn More About Us
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-8 text-white">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <Camera className="h-12 w-12 mx-auto mb-4 opacity-80" />
                    <div className="text-2xl font-bold mb-1">Enterprise</div>
                    <div className="text-sm opacity-80">Grade Security</div>
                  </div>
                  <div className="text-center">
                    <Brain className="h-12 w-12 mx-auto mb-4 opacity-80" />
                    <div className="text-2xl font-bold mb-1">AI-Powered</div>
                    <div className="text-sm opacity-80">Recognition</div>
                  </div>
                  <div className="text-center">
                    <Eye className="h-12 w-12 mx-auto mb-4 opacity-80" />
                    <div className="text-2xl font-bold mb-1">Real-time</div>
                    <div className="text-sm opacity-80">Monitoring</div>
                  </div>
                  <div className="text-center">
                    <Globe className="h-12 w-12 mx-auto mb-4 opacity-80" />
                    <div className="text-2xl font-bold mb-1">Global</div>
                    <div className="text-sm opacity-80">Presence</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values */}
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
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These principles guide everything we do and shape how we build 
              products, serve customers, and grow as a company.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {values.map((value, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-8">
                    <div className={`w-16 h-16 bg-gradient-to-r ${value.gradient} rounded-2xl flex items-center justify-center text-white mb-6`}>
                      {value.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      {value.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Timeline */}
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
              Our Journey
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From a small team with a big vision to a global leader in AI-powered security
            </p>
          </motion.div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-gradient-to-b from-blue-500 to-purple-500"></div>

            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center ${
                    index % 2 === 0 ? 'justify-start' : 'justify-end'
                  }`}
                >
                  <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8'}`}>
                    <Card className="border-0 shadow-lg">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                            {milestone.icon}
                          </div>
                          <div>
                            <Badge className="bg-blue-50 text-blue-600">
                              {milestone.year}
                            </Badge>
                          </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {milestone.title}
                        </h3>
                        <p className="text-gray-600">
                          {milestone.description}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Timeline dot */}
                  <div className="w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-lg z-10"></div>

                  <div className="w-5/12"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Team */}
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
              Leadership Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Meet the experienced leaders driving SafeFace's mission to secure 
              the future with intelligent AI technology.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {team.map((member, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {member.name}
                    </h3>
                    <p className="text-blue-600 font-medium mb-4">
                      {member.role}
                    </p>
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                      {member.bio}
                    </p>
                    
                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                      {member.specialties.map((specialty, specialtyIndex) => (
                        <Badge key={specialtyIndex} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex justify-center space-x-3">
                      {member.linkedin && (
                        <Button variant="ghost" size="sm" className="p-2">
                          <Linkedin className="h-4 w-4 text-blue-600" />
                        </Button>
                      )}
                      {member.twitter && (
                        <Button variant="ghost" size="sm" className="p-2">
                          <Twitter className="h-4 w-4 text-blue-400" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="p-2">
                        <Mail className="h-4 w-4 text-gray-600" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Awards & Recognition */}
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
              Awards & Recognition
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Industry recognition for our innovation and excellence in AI security
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {awards.map((award, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ scale: 1.02 }}
              >
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Award className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {award.title}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {award.organization} • {award.year}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
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
              Join Us in Securing the Future
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Whether you're looking to enhance your organization's security or 
              join our team of innovators, we'd love to hear from you.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button size="lg" variant="secondary" className="px-8 py-3 text-lg">
                  Get in Touch
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="px-8 py-3 text-lg border-white text-white hover:bg-white hover:text-blue-600">
                <Users className="mr-2 h-5 w-5" />
                View Careers
              </Button>
            </div>

            <div className="mt-8 text-white/80 text-sm">
              <span>✓ Join 10,000+ organizations worldwide</span>
              <span className="mx-4">•</span>
              <span>✓ Trusted by Fortune 500 companies</span>
              <span className="mx-4">•</span>
              <span>✓ Award-winning technology</span>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;