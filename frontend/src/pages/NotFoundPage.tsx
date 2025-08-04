import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  Home,
  ArrowLeft,
  Search,
  Camera,
  Users,
  Settings,
  HelpCircle,
  RefreshCw,
  MapPin,
  Compass,
  Star,
  Phone,
  Shield,
  BarChart3,
  Layers,
  DollarSign,
  LogIn,
  Monitor,
  FileText,
  Crown
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  const handleGoHome = () => {
    if (isAuthenticated) {
      if (user?.is_admin) {
        navigate('/admin'); // ✅ Admin dashboard
      } else {
        navigate('/app/dashboard'); // ✅ User dashboard
      }
    } else {
      navigate('/');
    }
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      handleGoHome();
    }
  };


  const quickActions = isAuthenticated ? (
    user?.is_admin ? [
      { label: 'Admin Dashboard', icon: <Crown className="h-4 w-4" />, path: '/app/admin' },
      { label: 'User Management', icon: <Users className="h-4 w-4" />, path: '/app/admin/users' },
      { label: 'System Monitor', icon: <Monitor className="h-4 w-4" />, path: '/app/admin/monitoring' },
      { label: 'System Logs', icon: <FileText className="h-4 w-4" />, path: '/app/admin/logs' },
      { label: 'User Dashboard', icon: <Home className="h-4 w-4" />, path: '/app/dashboard' },
      { label: 'Settings', icon: <Settings className="h-4 w-4" />, path: '/app/settings' },
      { label: 'Help', icon: <HelpCircle className="h-4 w-4" />, path: '/app/help' }
    ] : [
      { label: 'Dashboard', icon: <Home className="h-4 w-4" />, path: '/app/dashboard' },
      { label: 'Cameras', icon: <Camera className="h-4 w-4" />, path: '/app/cameras' },
      { label: 'Known Persons', icon: <Users className="h-4 w-4" />, path: '/app/persons' },
      { label: 'Detections', icon: <Shield className="h-4 w-4" />, path: '/app/detections' },
      { label: 'Analytics', icon: <BarChart3 className="h-4 w-4" />, path: '/app/analytics' },
      { label: 'Settings', icon: <Settings className="h-4 w-4" />, path: '/app/settings' },
      { label: 'Help', icon: <HelpCircle className="h-4 w-4" />, path: '/app/help' }
    ]
  ) : [
    { label: 'Home', icon: <Home className="h-4 w-4" />, path: '/' },
    { label: 'Features', icon: <Star className="h-4 w-4" />, path: '/features' },
    { label: 'Solutions', icon: <Layers className="h-4 w-4" />, path: '/solutions' },
    { label: 'Contact', icon: <Phone className="h-4 w-4" />, path: '/contact' },
    { label: 'Sign In', icon: <LogIn className="h-4 w-4" />, path: '/login' },
    { label: 'Help', icon: <HelpCircle className="h-4 w-4" />, path: '/help' }
  ];
  
  // const quickActions = isAuthenticated ? [
  //   { label: 'Dashboard', icon: <Home className="h-4 w-4" />, path: '/app/dashboard' },
  //   { label: 'Cameras', icon: <Camera className="h-4 w-4" />, path: '/app/cameras' },
  //   { label: 'Known Persons', icon: <Users className="h-4 w-4" />, path: '/app/persons' },
  //   { label: 'Detections', icon: <Shield className="h-4 w-4" />, path: '/app/detections' },
  //   { label: 'Analytics', icon: <BarChart3 className="h-4 w-4" />, path: '/app/analytics' },
  //   { label: 'Settings', icon: <Settings className="h-4 w-4" />, path: '/app/settings' },
  //   { label: 'Help', icon: <HelpCircle className="h-4 w-4" />, path: '/app/help' }
  // ] : [
  //   { label: 'Home', icon: <Home className="h-4 w-4" />, path: '/' },
  //   { label: 'Features', icon: <Star className="h-4 w-4" />, path: '/features' },
  //   { label: 'Solutions', icon: <Layers className="h-4 w-4" />, path: '/solutions' },
  //   { label: 'Contact', icon: <Phone className="h-4 w-4" />, path: '/contact' },
  //   { label: 'Sign In', icon: <LogIn className="h-4 w-4" />, path: '/login' },
  //   { label: 'Help', icon: <HelpCircle className="h-4 w-4" />, path: '/help' }
  // ];

  const animationVariants = {
    container: {
      initial: { opacity: 0, y: 20 },
      animate: { 
        opacity: 1, 
        y: 0,
        transition: { 
          duration: 0.6,
          staggerChildren: 0.1
        }
      }
    },
    item: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <motion.div 
        className="max-w-2xl w-full text-center space-y-8"
        variants={animationVariants.container}
        initial="initial"
        animate="animate"
      >
        {/* 404 Illustration */}
        <motion.div variants={animationVariants.item} className="relative">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-full"></div>
            <AlertTriangle className="w-16 h-16 text-white z-10" />
            
            {/* Floating elements */}
            <motion.div 
              className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div 
              className="absolute -bottom-2 -left-2 w-4 h-4 bg-green-400 rounded-full"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
          </div>
          
          {/* 404 Text */}
          <motion.div 
            className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            variants={animationVariants.item}
          >
            404
          </motion.div>
        </motion.div>

        {/* Error Message */}
        <motion.div variants={animationVariants.item} className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Oops! Page Not Found
          </h1>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved to a different location.
          </p>
          
          {/* Current path info */}
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <MapPin className="h-4 w-4" />
            <code className="bg-gray-100 px-2 py-1 rounded text-gray-700">
              {location.pathname}
            </code>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div variants={animationVariants.item} className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={handleGoHome} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Home className="h-4 w-4 mr-2" />
            {isAuthenticated ? 'Go to Dashboard' : 'Go to Home'}
          </Button>
          
          <Button variant="outline" onClick={handleGoBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
          
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Page
          </Button>
        </motion.div>

        {/* Quick Navigation */}
        <motion.div variants={animationVariants.item}>
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-center space-x-2">
                <Compass className="h-5 w-5 text-blue-600" />
                <span>Quick Navigation</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-blue-50"
                    onClick={() => navigate(action.path)}
                  >
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                      {action.icon}
                    </div>
                    <span className="text-sm font-medium">{action.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Help Section */}
        <motion.div variants={animationVariants.item} className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <HelpCircle className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Need Help?</h3>
          </div>
          
          <p className="text-gray-600 mb-4">
            If you believe this is an error, please contact our support team or check our help documentation.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" size="sm" onClick={() => navigate('/help')}>
              <Search className="h-4 w-4 mr-2" />
              Browse Help Articles
            </Button>
            
            <Button variant="outline" size="sm" onClick={() => window.location.href = 'mailto:support@safeface.ai'}>
              Contact Support
            </Button>
          </div>
        </motion.div>

        {/* User Info (if authenticated) */}
        {isAuthenticated && user && (
          <motion.div variants={animationVariants.item}>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <span>Logged in as</span>
              <Badge variant="outline">
                {user.full_name || user.username}
              </Badge>
              {user.is_admin && (
                <Badge variant="default" className="bg-red-600">
                  Admin
                </Badge>
              )}
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div variants={animationVariants.item} className="text-xs text-gray-400">
          <p>© 2024 SafeFace AI Technologies. All rights reserved.</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;