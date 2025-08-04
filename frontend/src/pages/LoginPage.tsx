import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  User, 
  LogIn, 
  Shield, 
  ArrowLeft,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Brain,
  Zap,
  Globe
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user, isLoading: authLoading } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [rememberMe, setRememberMe] = useState(false);

  // Demo credentials
  const demoCredentials = [
    { username: 'user1', password: 'user12345678', role: 'User' },
    { username: 'admin', password: 'admin123', role: 'Admin' }
  ];

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      console.log('🔄 LoginPage: User already authenticated, redirecting...');
      const from = location.state?.from?.pathname;
      
      if (from) {
        navigate(from, { replace: true });
      } else {
        if (user.is_admin) {
          navigate('/admin', { replace: true });
        } else {
          navigate('/app/dashboard', { replace: true });
        }
      }
    }
  }, [isAuthenticated, user, authLoading, navigate, location]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      console.log('🔐 LoginPage: Submitting login form:', formData.username);
      
      const response = await login(formData);
      
      if (rememberMe) {
        localStorage.setItem('remember_me', 'true');
      } else {
        localStorage.removeItem('remember_me');
      }

      toast.success('🎉 Login successful! Welcome to SafeFace', {
        description: 'Redirecting to your dashboard...',
        duration: 3000
      });

      // Role-based redirect after login
      setTimeout(() => {
        const from = location.state?.from?.pathname;
        
        if (from) {
          navigate(from, { replace: true });
        } else {
          if (response?.user?.is_admin) {
            navigate('/admin', { replace: true });
          } else {
            navigate('/app/dashboard', { replace: true });
          }
        }
      }, 1000);

    } catch (error: any) {
      console.error('❌ LoginPage: Login error:', error);
      
      let errorMessage = 'Login failed. Please try again.';
      
      // ✅ FIX: Properly handle error response
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.detail) {
          // Handle FastAPI error format
          if (Array.isArray(error.response.data.detail)) {
            // Handle validation errors
            const validationErrors = error.response.data.detail.map((err: any) => {
              return `${err.loc?.[err.loc.length - 1] || 'Field'}: ${err.msg}`;
            }).join(', ');
            errorMessage = validationErrors;
          } else {
            errorMessage = error.response.data.detail;
          }
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid username or password';
      } else if (error.response?.status === 422) {
        errorMessage = 'Please check your username and password format';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors({ submit: errorMessage });
      
      toast.error('❌ Login failed', {
        description: errorMessage,
        duration: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (demo: typeof demoCredentials[0]) => {
    setFormData({
      username: demo.username,
      password: demo.password
    });
    setErrors({});
    toast.info(`🎭 Demo credentials filled for ${demo.role}`, {
      description: 'Click Sign In to continue'
    });
  };

  // Show loading while checking auth status
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center space-y-6 max-w-md mx-auto px-6">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SafeFace
            </h1>
          </div>

          <div className="relative">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 animate-ping">
              <div className="w-12 h-12 border-2 border-blue-400 rounded-full opacity-20 mx-auto"></div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Checking Authentication
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Please wait while we verify your session...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex">
      {/* Left Side - Branding */}
      <motion.div 
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">SafeFace</h1>
              <p className="text-blue-100 text-sm">AI Security Platform</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-4xl font-bold leading-tight mb-4">
              Welcome Back to the Future of Security
            </h2>
            <p className="text-xl text-blue-100 leading-relaxed">
              Sign in to access your AI-powered face recognition dashboard.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-6">
            {[
              {
                icon: <Brain className="h-6 w-6" />,
                title: "AI-Powered Recognition",
                description: "99.7% accuracy with advanced machine learning"
              },
              {
                icon: <Zap className="h-6 w-6" />,
                title: "Real-time Monitoring",
                description: "Instant alerts and live surveillance feeds"
              },
              {
                icon: <Globe className="h-6 w-6" />,
                title: "Cloud Integration",
                description: "Access your security system from anywhere"
              }
            ].map((feature, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <p className="text-blue-100">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center lg:hidden">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 lg:hidden">SafeFace</span>
          </div>
        </div>

        {/* Login Form */}
        <div className="flex-1 flex items-center justify-center p-6">
          <motion.div 
            className="w-full max-w-md"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <Lock className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Sign In
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  Access your SafeFace security dashboard
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Demo Credentials */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center space-x-2 mb-3">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-900">Demo Credentials</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {demoCredentials.map((demo, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => fillDemoCredentials(demo)}
                        className="text-xs bg-white/50 hover:bg-white border-blue-200 hover:border-blue-300"
                      >
                        <Badge variant="outline" className="mr-1 text-xs">
                          {demo.role}
                        </Badge>
                        Try {demo.role}
                      </Button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* ✅ FIX: Proper error rendering */}
                  {errors.submit && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Alert variant="destructive" className="border-red-200 bg-red-50">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-red-800">
                          {/* ✅ Ensure we render string, not object */}
                          {typeof errors.submit === 'string' ? errors.submit : 'Login failed. Please try again.'}
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}

                  {/* Username Field */}
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                      Username
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="username"
                        name="username"
                        type="text"
                        placeholder="Enter your username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className={`pl-10 h-11 ${
                          errors.username 
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                            : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                        }`}
                        disabled={loading}
                      />
                    </div>
                    {errors.username && (
                      <motion.p 
                        className="text-sm text-red-600 flex items-center space-x-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <AlertTriangle className="h-3 w-3" />
                        <span>{errors.username}</span>
                      </motion.p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`pl-10 pr-10 h-11 ${
                          errors.password 
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                            : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                        }`}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff /> : <Eye />}
                      </button>
                    </div>
                    {errors.password && (
                      <motion.p 
                        className="text-sm text-red-600 flex items-center space-x-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <AlertTriangle className="h-3 w-3" />
                        <span>{errors.password}</span>
                      </motion.p>
                    )}
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                      />
                      <span className="text-sm text-gray-600">Remember me</span>
                    </label>
                    <Link 
                      to="/forgot-password" 
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <LogIn className="w-4 h-4" />
                        <span>Sign In</span>
                      </div>
                    )}
                  </Button>

                  {/* Divider */}
                  <div className="relative">
                    <Separator />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="bg-white px-2 text-xs text-gray-500">or</span>
                    </div>
                  </div>

                  {/* Sign Up Link */}
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Don't have an account?{' '}
                      <Link 
                        to="/register" 
                        className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors"
                      >
                        Create account
                      </Link>
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Security Badge */}
            <motion.div 
              className="text-center mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>256-bit SSL encrypted</span>
                <Separator orientation="vertical" className="h-3" />
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>GDPR compliant</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                © 2024 SafeFace AI Technologies. All rights reserved.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;