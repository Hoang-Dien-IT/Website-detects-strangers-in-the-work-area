import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Shield,
  AlertTriangle,
  Home,
  ArrowLeft,
  Lock,
  Users,
  Settings,
  HelpCircle,
  Eye,
  UserX,
  Key,
  Phone,
  Mail
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  // Get the page user was trying to access
  const from = location.state?.from?.pathname || '/dashboard';
  const requiredRole = location.state?.requiredRole || 'admin';

  const handleGoHome = () => {
    if (isAuthenticated) {
      navigate('/app/dashboard'); // ← Changed from '/dashboard'
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

  const handleContactAdmin = () => {
    // Navigate to help or contact page
    navigate('/help');
  };

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

  const accessRequirements = {
    admin: {
      title: 'Administrator Access Required',
      description: 'This page requires administrator privileges to access.',
      icon: <Shield className="h-16 w-16 text-red-500" />,
      suggestions: [
        'Contact your system administrator to request admin access',
        'Verify you are logged in with the correct account',
        'Check if your account has the necessary permissions'
      ]
    },
    manager: {
      title: 'Manager Access Required',
      description: 'This page requires manager-level permissions to access.',
      icon: <Users className="h-16 w-16 text-orange-500" />,
      suggestions: [
        'Contact your manager to request elevated permissions',
        'Verify your role in the system',
        'Check with HR about your access level'
      ]
    },
    premium: {
      title: 'Premium Feature',
      description: 'This feature requires a premium subscription to access.',
      icon: <Key className="h-16 w-16 text-purple-500" />,
      suggestions: [
        'Upgrade to a premium plan to access this feature',
        'Contact sales for subscription options',
        'Check your current plan limitations'
      ]
    }
  };

  const requirement = accessRequirements[requiredRole as keyof typeof accessRequirements] || accessRequirements.admin;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <motion.div 
        className="max-w-2xl w-full text-center space-y-8"
        variants={animationVariants.container}
        initial="initial"
        animate="animate"
      >
        {/* Error Icon & Code */}
        <motion.div variants={animationVariants.item} className="relative">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-r from-red-500 to-orange-500 rounded-full mb-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-full"></div>
            <UserX className="w-16 h-16 text-white z-10" />
            
            {/* Floating warning elements */}
            <motion.div 
              className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <AlertTriangle className="w-3 h-3 text-red-600" />
            </motion.div>
            <motion.div 
              className="absolute -bottom-2 -left-2 w-4 h-4 bg-red-400 rounded-full"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
          </div>
          
          {/* 403 Text */}
          <motion.div 
            className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent"
            variants={animationVariants.item}
          >
            403
          </motion.div>
        </motion.div>

        {/* Error Message */}
        <motion.div variants={animationVariants.item} className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Access Denied
          </h1>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            {requirement.description}
          </p>
          
          {/* Current user info */}
          {isAuthenticated && user && (
            <div className="flex items-center justify-center space-x-4 text-sm bg-white/60 backdrop-blur-sm rounded-lg p-4 border">
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Logged in as:</span>
                <Badge variant="outline">
                  {user.full_name || user.username}
                </Badge>
                {user.is_admin ? (
                  <Badge variant="default" className="bg-red-600">Admin</Badge>
                ) : (
                  <Badge variant="secondary">User</Badge>
                )}
              </div>
            </div>
          )}

          {/* Attempted access info */}
          <div className="text-sm text-gray-500">
            <p>Attempted to access: <code className="bg-gray-100 px-2 py-1 rounded text-gray-700">{from}</code></p>
          </div>
        </motion.div>

        {/* Main Alert */}
        <motion.div variants={animationVariants.item}>
          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-left">
              <div className="space-y-3">
                <div className="flex items-center justify-center mb-4">
                  {requirement.icon}
                </div>
                <h3 className="font-semibold text-lg text-center">{requirement.title}</h3>
                <p className="text-center mb-4">{requirement.description}</p>
                
                <div className="space-y-2">
                  <h4 className="font-medium">What you can do:</h4>
                  <ul className="space-y-1 text-sm">
                    {requirement.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-red-500 mt-1">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </AlertDescription>
          </Alert>
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
          
          <Button variant="outline" onClick={handleContactAdmin}>
            <HelpCircle className="h-4 w-4 mr-2" />
            Get Help
          </Button>
        </motion.div>

        {/* Contact Information */}
        <motion.div variants={animationVariants.item}>
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-center space-x-2">
                <Phone className="h-5 w-5 text-blue-600" />
                <span>Need Access?</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="ghost"
                  className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-blue-50"
                  onClick={() => window.location.href = 'mailto:admin@safeface.ai?subject=Access Request'}
                >
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-medium">Email Admin</span>
                    <p className="text-xs text-gray-600">Request access via email</p>
                  </div>
                </Button>

                <Button
                  variant="ghost"
                  className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-green-50"
                  onClick={handleContactAdmin}
                >
                  <div className="p-2 bg-green-100 rounded-lg text-green-600">
                    <HelpCircle className="h-4 w-4" />
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-medium">Contact Support</span>
                    <p className="text-xs text-gray-600">Get help from our team</p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Access (if user has some permissions) */}
        {isAuthenticated && (
          <motion.div variants={animationVariants.item}>
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-center space-x-2">
                  <Eye className="h-5 w-5 text-green-600" />
                  <span>Available to You</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Dashboard', icon: <Home className="h-4 w-4" />, path: '/dashboard' },
                    { label: 'Profile', icon: <Users className="h-4 w-4" />, path: '/profile' },
                    { label: 'Settings', icon: <Settings className="h-4 w-4" />, path: '/settings' },
                    { label: 'Help', icon: <HelpCircle className="h-4 w-4" />, path: '/help' }
                  ].map((action, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="h-auto p-3 flex flex-col items-center space-y-1 hover:bg-gray-50"
                      onClick={() => navigate(action.path)}
                    >
                      <div className="p-1 bg-gray-100 rounded text-gray-600">
                        {action.icon}
                      </div>
                      <span className="text-xs font-medium">{action.label}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Security Notice */}
        <motion.div variants={animationVariants.item} className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <Lock className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Security Notice</h3>
          </div>
          
          <p className="text-gray-600 text-sm">
            This access restriction is in place to protect sensitive system resources. 
            All access attempts are logged for security purposes. If you believe you should 
            have access to this resource, please contact your system administrator.
          </p>
        </motion.div>

        {/* Footer */}
        <motion.div variants={animationVariants.item} className="text-xs text-gray-400">
          <p>© 2024 SafeFace AI Technologies. All rights reserved.</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default UnauthorizedPage;