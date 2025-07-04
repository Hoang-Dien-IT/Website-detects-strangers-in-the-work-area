import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  User, 
  Mail, 
  UserPlus, 
  CheckCircle,
  AlertTriangle,
  Phone,
  Building
} from 'lucide-react';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

// ✅ FIX: Interface để match với backend UserCreate từ #backend
interface RegisterFormData {
  username: string;
  email: string;
  full_name: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  department?: string;
  role: 'user' | 'admin'; // ✅ Thêm role field từ backend
}

interface FormErrors {
  [key: string]: string;
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // ✅ FIX: Enhanced form data với proper typing và default values
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    full_name: '',
    password: '',
    confirmPassword: '',
    phone: '',
    department: '',
    role: 'user' // ✅ Default role
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: '',
    color: 'gray'
  });

  // ✅ Enhanced input change handler với password strength
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // ✅ Check password strength real-time
    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };

  // ✅ Enhanced password strength checker
  const checkPasswordStrength = (password: string) => {
    let score = 0;
    let feedback = '';
    let color = 'red';

    if (password.length >= 8) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    switch (score) {
      case 0:
      case 1:
        feedback = 'Very weak password';
        color = 'red';
        break;
      case 2:
        feedback = 'Weak password';
        color = 'orange';
        break;
      case 3:
        feedback = 'Fair password';
        color = 'yellow';
        break;
      case 4:
        feedback = 'Good password';
        color = 'blue';
        break;
      case 5:
        feedback = 'Strong password';
        color = 'green';
        break;
      default:
        feedback = '';
        color = 'gray';
    }

    setPasswordStrength({ score, feedback, color });
  };

  // ✅ Enhanced form validation với chi tiết hơn
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (formData.username.length > 50) {
      newErrors.username = 'Username must be less than 50 characters';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, hyphens, and underscores';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    } else if (formData.email.length > 255) {
      newErrors.email = 'Email must be less than 255 characters';
    }

    // Full name validation
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    } else if (formData.full_name.length < 2) {
      newErrors.full_name = 'Full name must be at least 2 characters';
    } else if (formData.full_name.length > 100) {
      newErrors.full_name = 'Full name must be less than 100 characters';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (passwordStrength.score < 3) {
      newErrors.password = 'Password is too weak. Please use a stronger password';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Phone validation (optional)
    if (formData.phone && formData.phone.trim()) {
      if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Enhanced submit handler với better error handling
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);
    
    try {
      console.log('🔵 RegisterPage: Attempting to register user...');
      
      // ✅ FIX: Prepare data theo backend UserCreate schema từ #backend
      const registerData = {
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        full_name: formData.full_name.trim(),
        password: formData.password,
        phone: formData.phone?.trim() || undefined,
        department: formData.department?.trim() || undefined,
        role: formData.role
      };

      console.log('📤 RegisterPage: Sending registration data:', { 
        ...registerData, 
        password: '[HIDDEN]' 
      });
      
      // ✅ Call auth service với correct data structure
      const result = await authService.register(registerData);
      console.log('✅ RegisterPage: Registration successful:', result);
      
      // ✅ Enhanced success handling
      toast.success(
        'Account created successfully! Welcome to SafeFace!', 
        {
          duration: 5000,
          description: 'You can now sign in with your credentials'
        }
      );
      
      // ✅ Navigate với success state
      navigate('/login', { 
        state: { 
          email: formData.email,
          message: 'Registration successful! Please sign in.'
        }
      });
      
    } catch (error: any) {
      console.error('❌ RegisterPage: Registration failed:', error);
      
      // ✅ Enhanced error handling dựa trên backend response
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.response?.data?.detail) {
        // Backend trả về detail message
        errorMessage = error.response.data.detail;
        
        // Handle specific backend errors từ #backend/app/services/auth_service.py
        if (errorMessage.includes('already registered')) {
          if (errorMessage.includes('username')) {
            setErrors({ username: 'This username is already taken' });
          } else if (errorMessage.includes('email')) {
            setErrors({ email: 'This email is already registered' });
          } else {
            setErrors({ submit: 'Username or email already exists' });
          }
        } else {
          setErrors({ submit: errorMessage });
        }
      } else if (error.message) {
        errorMessage = error.message;
        setErrors({ submit: errorMessage });
      } else {
        setErrors({ submit: 'Network error. Please check your connection.' });
      }
      
      toast.error(errorMessage, {
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Password strength bar component
  const PasswordStrengthBar = () => {
    if (!formData.password) return null;
    
    const getBarColor = () => {
      switch (passwordStrength.color) {
        case 'red': return 'bg-red-500';
        case 'orange': return 'bg-orange-500';
        case 'yellow': return 'bg-yellow-500';
        case 'blue': return 'bg-blue-500';
        case 'green': return 'bg-green-500';
        default: return 'bg-gray-300';
      }
    };

    return (
      <div className="mt-2">
        <div className="flex space-x-1 mb-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded ${
                i <= passwordStrength.score ? getBarColor() : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <p className={`text-xs text-${passwordStrength.color}-600`}>
          {passwordStrength.feedback}
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div 
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* ✅ Enhanced Header */}
        <div className="text-center mb-8">
          <motion.div 
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4 shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <UserPlus className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Create Account
          </h1>
          <p className="text-gray-600 mt-2">Join SafeFace platform today</p>
        </div>

        {/* ✅ Enhanced Card với better styling */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-gray-900">Sign Up</CardTitle>
              <p className="text-gray-600 text-sm">Create your SafeFace account</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* ✅ Enhanced Error Alert */}
                {errors.submit && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert variant="destructive" className="border-red-200 bg-red-50">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-red-800">
                        {errors.submit}
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                {/* Username Field */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                    Username <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="Choose a unique username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className={`pl-10 transition-colors ${
                        errors.username 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:border-blue-500'
                      }`}
                      disabled={loading}
                      autoComplete="username"
                    />
                  </div>
                  {errors.username && (
                    <motion.p 
                      className="text-sm text-red-600 flex items-center"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {errors.username}
                    </motion.p>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`pl-10 transition-colors ${
                        errors.email 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:border-blue-500'
                      }`}
                      disabled={loading}
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && (
                    <motion.p 
                      className="text-sm text-red-600 flex items-center"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {errors.email}
                    </motion.p>
                  )}
                </div>

                {/* Full Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-sm font-medium text-gray-700">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="full_name"
                      name="full_name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      className={`pl-10 transition-colors ${
                        errors.full_name 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:border-blue-500'
                      }`}
                      disabled={loading}
                      autoComplete="name"
                    />
                  </div>
                  {errors.full_name && (
                    <motion.p 
                      className="text-sm text-red-600 flex items-center"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {errors.full_name}
                    </motion.p>
                  )}
                </div>

                {/* ✅ Additional Fields (Optional) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Phone Field */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                      Phone Number
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+1234567890"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`pl-10 transition-colors ${
                          errors.phone 
                            ? 'border-red-500 focus:border-red-500' 
                            : 'border-gray-300 focus:border-blue-500'
                        }`}
                        disabled={loading}
                        autoComplete="tel"
                      />
                    </div>
                    {errors.phone && (
                      <motion.p 
                        className="text-sm text-red-600 flex items-center"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {errors.phone}
                      </motion.p>
                    )}
                  </div>

                  {/* Department Field */}
                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-sm font-medium text-gray-700">
                      Department
                    </Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="department"
                        name="department"
                        type="text"
                        placeholder="IT, Security, etc."
                        value={formData.department}
                        onChange={handleInputChange}
                        className="pl-10 transition-colors border-gray-300 focus:border-blue-500"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`pl-10 pr-10 transition-colors ${
                        errors.password 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:border-blue-500'
                      }`}
                      disabled={loading}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  
                  {/* ✅ Password Strength Indicator */}
                  <PasswordStrengthBar />
                  
                  {errors.password && (
                    <motion.p 
                      className="text-sm text-red-600 flex items-center"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {errors.password}
                    </motion.p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirm Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`pl-10 pr-10 transition-colors ${
                        errors.confirmPassword 
                          ? 'border-red-500 focus:border-red-500' 
                          : formData.confirmPassword && formData.password === formData.confirmPassword
                          ? 'border-green-500 focus:border-green-500'
                          : 'border-gray-300 focus:border-blue-500'
                      }`}
                      disabled={loading}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  
                  {/* ✅ Password Match Indicator */}
                  {formData.confirmPassword && (
                    <div className="flex items-center text-xs">
                      {formData.password === formData.confirmPassword ? (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Passwords match
                        </div>
                      ) : (
                        <div className="flex items-center text-red-600">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Passwords don't match
                        </div>
                      )}
                    </div>
                  )}
                  
                  {errors.confirmPassword && (
                    <motion.p 
                      className="text-sm text-red-600 flex items-center"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {errors.confirmPassword}
                    </motion.p>
                  )}
                </div>

                {/* ✅ Terms and Conditions */}
                <div className="flex items-start space-x-2">
                  <input 
                    type="checkbox" 
                    id="terms"
                    className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                    required 
                    disabled={loading}
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                    I agree to the{' '}
                    <Link to="/terms" className="text-blue-600 hover:text-blue-800 underline font-medium">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-blue-600 hover:text-blue-800 underline font-medium">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                {/* ✅ Enhanced Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
                  disabled={loading}
                  size="lg"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Creating account...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Create Account
                    </div>
                  )}
                </Button>

                {/* ✅ Login Link */}
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link 
                      to="/login" 
                      className="text-blue-600 hover:text-blue-800 underline font-medium transition-colors"
                    >
                      Sign in here
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* ✅ Footer */}
        <motion.div 
          className="text-center mt-8 text-xs text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p>© 2024 SafeFace Platform. All rights reserved.</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;