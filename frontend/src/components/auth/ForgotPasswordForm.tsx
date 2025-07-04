import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Mail, 
  Send, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Info
} from 'lucide-react';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';

interface ForgotPasswordFormData {
  email: string;
}

const ForgotPasswordForm: React.FC = () => {
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: '',
  });
  const [errors, setErrors] = useState<Partial<ForgotPasswordFormData>>({});
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof ForgotPasswordFormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<ForgotPasswordFormData> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      // ✅ FIX: Enhanced error handling
      await authService.forgotPassword(formData.email);
      setEmailSent(true);
      toast.success(
        'Password reset email sent successfully', 
        {
          description: 'Check your inbox and spam folder',
          duration: 5000
        }
      );
      
      // Start countdown for resend button
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (error: any) {
      console.error('❌ ForgotPasswordForm: Error sending reset email:', error);
      
      // ✅ FIX: Better error handling
      let errorMessage = 'Failed to send reset email. Please try again.';
      
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Set specific error for email field
      if (errorMessage.includes('email') || errorMessage.includes('account') || errorMessage.includes('found')) {
        setErrors({ email: errorMessage });
      }
      
      toast.error(errorMessage, {
        description: 'Please check your email address and try again'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    try {
      await authService.forgotPassword(formData.email);
      toast.success('Reset email sent again', {
        description: 'Please check your inbox'
      });
      
      // Restart countdown
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (error: any) {
      console.error('❌ ForgotPasswordForm: Error resending email:', error);
      toast.error('Failed to resend email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Check Your Email
              </CardTitle>
              <CardDescription className="text-gray-600">
                We've sent a password reset link to your email
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <Alert className="bg-green-50 border-green-200">
              <Mail className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Password reset instructions have been sent to{' '}
                <strong>{formData.email}</strong>
              </AlertDescription>
            </Alert>

            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                Didn't receive the email? Check your spam folder or{' '}
                {countdown > 0 ? (
                  <span className="text-gray-500 flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3" />
                    wait {countdown}s to resend
                  </span>
                ) : (
                  <button
                    onClick={handleResendEmail}
                    disabled={loading}
                    className="text-blue-600 hover:text-blue-500 font-medium transition-colors"
                  >
                    {loading ? 'Sending...' : 'resend the email'}
                  </button>
                )}
              </p>

              <div className="space-y-2">
                <Button
                  onClick={() => navigate('/login')}
                  className="w-full"
                  variant="default"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    setEmailSent(false);
                    setFormData({ email: '' });
                    setErrors({});
                    setCountdown(0);
                  }}
                  className="w-full"
                >
                  Try Different Email
                </Button>
              </div>
            </div>

            {/* ✅ FIX: Add development notice */}
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Development Notice:</strong> This is currently a demo. 
                The reset link functionality will be available when the backend password reset feature is implemented.
              </AlertDescription>
            </Alert>

            <Alert className="bg-amber-50 border-amber-200">
              <Clock className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                The reset link will expire in 24 hours for security reasons.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Forgot Password?
            </CardTitle>
            <CardDescription className="text-gray-600">
              Enter your email address and we'll send you a link to reset your password
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  className={`pl-10 ${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.email}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11"
              disabled={loading || !formData.email.trim()}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sending...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Send className="w-4 h-4" />
                  <span>Send Reset Link</span>
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Login
            </Link>
          </div>

          {/* ✅ FIX: Enhanced alerts */}
          <div className="mt-4 space-y-3">
            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                If you don't have an account,{' '}
                <Link to="/register" className="font-medium underline hover:text-blue-600 transition-colors">
                  sign up here
                </Link>
              </AlertDescription>
            </Alert>

            {/* ✅ FIX: Development notice */}
            <Alert className="bg-gray-50 border-gray-200">
              <Info className="h-4 w-4 text-gray-600" />
              <AlertDescription className="text-gray-700 text-xs">
                <strong>Note:</strong> This feature is currently in development. 
                For now, please contact an administrator to reset your password.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPasswordForm;