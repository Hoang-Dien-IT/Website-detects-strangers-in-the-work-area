import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  ArrowRight,
  BookOpen,
  TrendingUp,
  Star,
  Eye,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Brain,
  Lock,
  Rocket,
  Settings,
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
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

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  publishedAt: string;
  readTime: number;
  category: string;
  tags: string[];
  featured: boolean;
  views: number;
  likes: number;
  comments: number;
  image: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  count: number;
  icon: React.ReactNode;
  color: string;
}

const BlogPage: React.FC = () => {
  const [, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  const categories: Category[] = [
    {
      id: 'all',
      name: 'All Posts',
      description: 'Browse all our articles',
      count: 24,
      icon: <BookOpen className="h-5 w-5" />,
      color: 'bg-gray-100 text-gray-700'
    },
    {
      id: 'ai-technology',
      name: 'AI Technology',
      description: 'Latest in artificial intelligence',
      count: 8,
      icon: <Brain className="h-5 w-5" />,
      color: 'bg-blue-100 text-blue-700'
    },
    {
      id: 'security',
      name: 'Security',
      description: 'Security best practices and insights',
      count: 6,
      icon: <Lock className="h-5 w-5" />,
      color: 'bg-red-100 text-red-700'
    },
    {
      id: 'product-updates',
      name: 'Product Updates',
      description: 'New features and improvements',
      count: 5,
      icon: <Rocket className="h-5 w-5" />,
      color: 'bg-green-100 text-green-700'
    },
    {
      id: 'tutorials',
      name: 'Tutorials',
      description: 'Step-by-step guides',
      count: 4,
      icon: <Settings className="h-5 w-5" />,
      color: 'bg-purple-100 text-purple-700'
    },
    {
      id: 'industry-insights',
      name: 'Industry Insights',
      description: 'Market trends and analysis',
      count: 3,
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'bg-yellow-100 text-yellow-700'
    }
  ];

  // Mock blog posts data
  const mockPosts: BlogPost[] = [
    {
      id: '1',
      title: 'The Future of AI-Powered Security: Trends to Watch in 2024',
      excerpt: 'Explore the latest developments in artificial intelligence and how they\'re revolutionizing security systems across industries.',
      content: 'Full article content here...',
      author: {
        name: 'Dr. Sarah Chen',
        avatar: '/avatars/sarah-chen.jpg',
        role: 'AI Research Director'
      },
      publishedAt: '2024-01-15',
      readTime: 8,
      category: 'ai-technology',
      tags: ['AI', 'Security', 'Technology', 'Future'],
      featured: true,
      views: 2847,
      likes: 156,
      comments: 23,
      image: '/blog/ai-security-future.jpg'
    },
    {
      id: '2',
      title: 'Building Privacy-First Face Recognition Systems',
      excerpt: 'Learn how to implement face recognition technology while maintaining the highest standards of user privacy and data protection.',
      content: 'Full article content here...',
      author: {
        name: 'Michael Rodriguez',
        avatar: '/avatars/michael-rodriguez.jpg',
        role: 'Security Engineer'
      },
      publishedAt: '2024-01-12',
      readTime: 12,
      category: 'security',
      tags: ['Privacy', 'Face Recognition', 'Data Protection', 'GDPR'],
      featured: true,
      views: 1923,
      likes: 89,
      comments: 17,
      image: '/blog/privacy-face-recognition.jpg'
    },
    {
      id: '3',
      title: 'SafeFace 2.0: Enhanced Analytics and Real-time Insights',
      excerpt: 'Discover the powerful new features in our latest release, including advanced analytics dashboard and improved detection algorithms.',
      content: 'Full article content here...',
      author: {
        name: 'Emily Johnson',
        avatar: '/avatars/emily-johnson.jpg',
        role: 'Product Manager'
      },
      publishedAt: '2024-01-10',
      readTime: 6,
      category: 'product-updates',
      tags: ['Product Update', 'Analytics', 'Features', 'Dashboard'],
      featured: false,
      views: 1456,
      likes: 72,
      comments: 12,
      image: '/blog/safeface-2-0.jpg'
    },
    {
      id: '4',
      title: 'Complete Guide: Setting Up Your First Security Camera',
      excerpt: 'A comprehensive tutorial on installing and configuring SafeFace cameras for optimal performance and security coverage.',
      content: 'Full article content here...',
      author: {
        name: 'David Kim',
        avatar: '/avatars/david-kim.jpg',
        role: 'Technical Writer'
      },
      publishedAt: '2024-01-08',
      readTime: 15,
      category: 'tutorials',
      tags: ['Tutorial', 'Setup', 'Camera', 'Installation'],
      featured: false,
      views: 3241,
      likes: 198,
      comments: 34,
      image: '/blog/camera-setup-guide.jpg'
    },
    {
      id: '5',
      title: 'Enterprise Security in 2024: What Decision Makers Need to Know',
      excerpt: 'Industry analysis on emerging security threats and how AI-powered solutions are helping enterprises stay ahead.',
      content: 'Full article content here...',
      author: {
        name: 'Lisa Wang',
        avatar: '/avatars/lisa-wang.jpg',
        role: 'Industry Analyst'
      },
      publishedAt: '2024-01-05',
      readTime: 10,
      category: 'industry-insights',
      tags: ['Enterprise', 'Security Trends', 'Analysis', '2024'],
      featured: false,
      views: 1789,
      likes: 94,
      comments: 18,
      image: '/blog/enterprise-security-2024.jpg'
    },
    {
      id: '6',
      title: 'Best Practices for Face Recognition in Retail Environments',
      excerpt: 'How retailers can leverage face recognition technology to enhance customer experience while maintaining privacy compliance.',
      content: 'Full article content here...',
      author: {
        name: 'James Thompson',
        avatar: '/avatars/james-thompson.jpg',
        role: 'Solutions Architect'
      },
      publishedAt: '2024-01-03',
      readTime: 9,
      category: 'industry-insights',
      tags: ['Retail', 'Customer Experience', 'Best Practices', 'Compliance'],
      featured: false,
      views: 1234,
      likes: 67,
      comments: 15,
      image: '/blog/retail-face-recognition.jpg'
    }
  ];

  useEffect(() => {
    // Simulate API call
    const loadPosts = async () => {
      setLoading(true);
      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setPosts(mockPosts);
        setFilteredPosts(mockPosts);
      } catch (error) {
        console.error('Error loading posts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let filtered = posts;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Sort posts
    switch (sortBy) {
      case 'latest':
        filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        break;
      case 'popular':
        filtered.sort((a, b) => b.views - a.views);
        break;
      case 'liked':
        filtered.sort((a, b) => b.likes - a.likes);
        break;
    }

    setFilteredPosts(filtered);
    setCurrentPage(1);
  }, [posts, selectedCategory, searchTerm, sortBy]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const featuredPosts = posts.filter(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  // Pagination
  const totalPages = Math.ceil(regularPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const paginatedPosts = regularPosts.slice(startIndex, startIndex + postsPerPage);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSearchParams({ category: categoryId });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading blog posts...</p>
        </div>
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
            <Badge className="bg-blue-50 text-blue-600 border-blue-200 mb-6 px-4 py-2">
              📚 SafeFace Blog
            </Badge>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Insights, Updates &{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Expert Knowledge
              </span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-8">
              Stay up-to-date with the latest in AI-powered security, product updates, 
              industry insights, and expert tutorials from the SafeFace team.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search articles, topics, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3 text-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="mb-8"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <motion.div
                  key={category.id}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedCategory === category.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => handleCategoryChange(category.id)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${category.color}`}>
                        {category.icon}
                      </div>
                      <h3 className="font-semibold text-sm text-gray-900 mb-1">
                        {category.name}
                      </h3>
                      <p className="text-xs text-gray-600 mb-2">
                        {category.description}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {category.count} posts
                      </Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="flex items-center space-x-4">
              <Badge className="bg-gray-100 text-gray-700">
                {filteredPosts.length} articles found
              </Badge>
              {selectedCategory !== 'all' && (
                <Badge className="bg-blue-100 text-blue-700">
                  Category: {categories.find(c => c.id === selectedCategory)?.name}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="liked">Most Liked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Articles</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {featuredPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    variants={fadeInUp}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <Card className="h-full border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                      <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-500">
                        <div className="absolute inset-0 bg-black/20"></div>
                        <Badge className="absolute top-4 left-4 bg-yellow-500 text-yellow-900">
                          Featured
                        </Badge>
                        <div className="absolute bottom-4 left-4 right-4 text-white">
                          <Badge className="bg-white/20 text-white border-white/30 mb-2">
                            {categories.find(c => c.id === post.category)?.name}
                          </Badge>
                        </div>
                      </div>
                      <CardHeader>
                        <CardTitle className="text-xl font-bold text-gray-900 line-clamp-2">
                          {post.title}
                        </CardTitle>
                        <p className="text-gray-600 line-clamp-3">
                          {post.excerpt}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-sm font-semibold text-white">
                                {post.author.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{post.author.name}</p>
                              <p className="text-sm text-gray-600">{post.author.role}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">{formatDate(post.publishedAt)}</p>
                            <p className="text-sm text-gray-500">{post.readTime} min read</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center space-x-1">
                              <Eye className="h-4 w-4" />
                              <span>{post.views}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Star className="h-4 w-4" />
                              <span>{post.likes}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <MessageCircle className="h-4 w-4" />
                              <span>{post.comments}</span>
                            </span>
                          </div>
                          <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
                            Read More
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Regular Posts */}
      <section className="py-12 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Latest Articles</h2>
            
            {paginatedPosts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {paginatedPosts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      variants={fadeInUp}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                    >
                      <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="relative h-40 bg-gradient-to-r from-gray-400 to-gray-600 rounded-t-lg">
                          <div className="absolute inset-0 bg-black/10 rounded-t-lg"></div>
                          <Badge className="absolute top-3 left-3 bg-white/90 text-gray-700">
                            {categories.find(c => c.id === post.category)?.name}
                          </Badge>
                        </div>
                        
                        <CardHeader>
                          <CardTitle className="text-lg font-bold text-gray-900 line-clamp-2">
                            {post.title}
                          </CardTitle>
                          <p className="text-gray-600 line-clamp-3 text-sm">
                            {post.excerpt}
                          </p>
                        </CardHeader>
                        
                        <CardContent>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-xs font-semibold text-white">
                                  {post.author.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 text-sm">{post.author.name}</p>
                                <p className="text-xs text-gray-600">{formatDate(post.publishedAt)}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">{post.readTime} min</p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1 mb-4">
                            {post.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 text-xs text-gray-500">
                              <span className="flex items-center space-x-1">
                                <Eye className="h-3 w-3" />
                                <span>{post.views}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Star className="h-3 w-3" />
                                <span>{post.likes}</span>
                              </span>
                            </div>
                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 p-0">
                              Read More
                              <ArrowRight className="ml-1 h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-4 mt-12">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    
                    <div className="flex items-center space-x-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          onClick={() => setCurrentPage(page)}
                          className="w-10 h-10 p-0"
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                    
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm ? 'Try adjusting your search terms.' : 'No articles available in this category.'}
                </p>
                <Button onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}>
                  Clear Filters
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Newsletter Subscription */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Stay Updated with SafeFace
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Get the latest insights, product updates, and industry trends 
              delivered straight to your inbox.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Input
                placeholder="Enter your email"
                className="bg-white/90 border-white/20 text-gray-900 placeholder:text-gray-600"
              />
              <Button variant="secondary" className="px-8">
                Subscribe
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="mt-6 text-white/80 text-sm">
              <span>✓ Weekly insights</span>
              <span className="mx-4">•</span>
              <span>✓ Product updates</span>
              <span className="mx-4">•</span>
              <span>✓ Unsubscribe anytime</span>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default BlogPage;