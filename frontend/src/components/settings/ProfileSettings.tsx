import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { userService } from '@/services/user.service';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Save,
  Upload,
  Camera,
  Edit,
  CheckCircle,
  AlertTriangle,
  FileText,
  Globe,
  Building,
  Briefcase
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';

// ✅ Updated interface to match backend User model from #backend
interface ProfileData {
  full_name: string;
  email: string;
  username: string;
  phone?: string;
  department?: string;
  location?: string;
  bio?: string;
  website?: string;
  job_title?: string;
  company?: string;
  timezone?: string;
}

interface ProfileSettingsProps {
  onSave?: (data: ProfileData) => void;
  readonly?: boolean;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ 
  onSave, 
  readonly = false 
}) => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  // ✅ Updated profileData to match backend fields
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: user?.full_name || '',
    email: user?.email || '',
    username: user?.username || '',
    phone: user?.phone || '',
    department: user?.department || '',
    location: user?.location || '',
    bio: user?.bio || '',
    website: user?.website || '',
    job_title: user?.job_title || '',
    company: user?.company || '',
    timezone: user?.timezone || 'UTC+7'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // ✅ Load profile data from backend
  useEffect(() => {
    loadProfileData();
  }, [user]);

  const loadProfileData = async () => {
    try {
      if (user) {
        // ✅ Use backend endpoint to get current user profile
        const currentUser = await authService.getCurrentUser();
        
        setProfileData({
          full_name: currentUser.full_name || '',
          email: currentUser.email || '',
          username: currentUser.username || '',
          phone: currentUser.phone || '',
          department: currentUser.department || '',
          location: currentUser.location || '',
          bio: currentUser.bio || '',
          website: currentUser.website || '',
          job_title: currentUser.job_title || '',
          company: currentUser.company || '',
          timezone: currentUser.timezone || 'UTC+7'
        });
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
      // Use existing user data as fallback
      if (user) {
        setProfileData({
          full_name: user.full_name || '',
          email: user.email || '',
          username: user.username || '',
          phone: user.phone || '',
          department: user.department || '',
          location: user.location || '',
          bio: user.bio || '',
          website: user.website || '',
          job_title: user.job_title || '',
          company: user.company || '',
          timezone: user.timezone || 'UTC+7'
        });
      }
    }
  };

  // ✅ Enhanced validation following backend rules
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Full name validation (required)
    if (!profileData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    } else if (profileData.full_name.length > 100) {
      newErrors.full_name = 'Full name must be less than 100 characters';
    }

    // Email validation (required)
    if (!profileData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Username validation (required, backend rules)
    if (!profileData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (profileData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (profileData.username.length > 50) {
      newErrors.username = 'Username must be less than 50 characters';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(profileData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, hyphens and underscores';
    }

    // Phone validation (optional but if provided, must be valid)
    if (profileData.phone && !/^[+]?[\d\s\-()]{8,}$/.test(profileData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Website validation (optional but if provided, must be valid)
    if (profileData.website && !profileData.website.match(/^https?:\/\/.+/)) {
      newErrors.website = 'Website must start with http:// or https://';
    }

    // Bio length validation
    if (profileData.bio && profileData.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
    
    setHasChanges(true);
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // ✅ Enhanced avatar upload with proper error handling
  const handleAvatarUpload = async (file: File) => {
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file formats
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a JPEG, PNG, or WebP image');
      return;
    }

    try {
      setUploading(true);
      console.log('🔵 ProfileSettings: Uploading avatar...');
      
      // ✅ Check if backend endpoint exists
      if (typeof userService.uploadAvatar === 'function') {
        const response = await userService.uploadAvatar(file);
        
        // Update avatar preview
        setAvatarPreview(response.avatar_url);
        
        // Update user context
        if (user) {
          updateUser({ ...user, avatar_url: response.avatar_url });
        }
        
        toast.success('Avatar updated successfully');
        console.log('✅ ProfileSettings: Avatar uploaded successfully');
      } else {
        // ✅ Fallback: Use auth service upload endpoint
        console.warn('⚠️ ProfileSettings: userService.uploadAvatar not available, using auth service');
        
        const formData = new FormData();
        formData.append('file', file);
        
        // Call auth upload endpoint directly
        const response = await authService.uploadAvatar(formData);
        
        // Update avatar preview
        setAvatarPreview(response.avatar_url);
        
        // Update user context
        if (user) {
          updateUser({ ...user, avatar_url: response.avatar_url });
        }
        
        toast.success('Avatar updated successfully');
        console.log('✅ ProfileSettings: Avatar uploaded via auth service');
      }
      
    } catch (error: any) {
      console.error('❌ ProfileSettings: Error uploading avatar:', error);
      
      // Enhanced error handling
      let errorMessage = 'Failed to upload avatar';
      
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  // ✅ Enhanced save function using backend endpoint
  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors before saving');
      return;
    }

    try {
      setLoading(true);
      console.log('🔵 ProfileSettings: Saving profile...', profileData);
      
      // ✅ Use updateProfile method from auth service
      const response = await authService.updateProfile(profileData);
      
      // Update user context with new data
      if (user) {
        updateUser({ 
          ...user, 
          ...response,
          role: response.role as "user" | "admin"
        });
      }
      
      setHasChanges(false);
      onSave?.(profileData);
      
      toast.success('Profile updated successfully');
      console.log('✅ ProfileSettings: Profile saved successfully');
      
    } catch (error: any) {
      console.error('❌ ProfileSettings: Error updating profile:', error);
      
      // Enhanced error handling
      let errorMessage = 'Failed to update profile';
      
      if (error.response?.status === 400) {
        errorMessage = error.response.data?.detail || 'Invalid profile data';
      } else if (error.response?.status === 409) {
        errorMessage = 'Username or email already exists';
        
        // Set specific field errors
        if (error.response.data?.detail?.includes('username')) {
          setErrors(prev => ({ ...prev, username: 'Username already exists' }));
        }
        if (error.response.data?.detail?.includes('email')) {
          setErrors(prev => ({ ...prev, email: 'Email already exists' }));
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // ✅ Reset function
  const handleReset = () => {
    if (user) {
      setProfileData({
        full_name: user.full_name || '',
        email: user.email || '',
        username: user.username || '',
        phone: user.phone || '',
        department: user.department || '',
        location: user.location || '',
        bio: user.bio || '',
        website: user.website || '',
        job_title: user.job_title || '',
        company: user.company || '',
        timezone: user.timezone || 'UTC+7'
      });
      setHasChanges(false);
      setErrors({});
      setAvatarPreview(null);
      toast.info('Profile reset to saved values');
    }
  };

  return (
    <div className="space-y-6">
      {/* ✅ Enhanced Profile Picture */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5 text-blue-600" />
            <span>Profile Picture</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-24 w-24 ring-4 ring-gray-100">
                <AvatarImage 
                  src={avatarPreview || user?.avatar_url} 
                  alt={profileData.full_name}
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xl">
                  {getInitials(profileData.full_name || 'U')}
                </AvatarFallback>
              </Avatar>
              
              {uploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              )}
            </div>
            
            {!readonly && (
              <div className="space-y-2 text-center">
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleAvatarUpload(file);
                    }
                  }}
                  className="hidden"
                  disabled={uploading}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                  disabled={uploading}
                  className="bg-blue-50 hover:bg-blue-100 border-blue-200"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Change Picture'}
                </Button>
                <p className="text-xs text-gray-500">
                  JPEG, PNG, WebP up to 5MB
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ✅ Enhanced Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5 text-green-600" />
            <span>Basic Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="full_name">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="full_name"
                value={profileData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                placeholder="Enter your full name"
                className={errors.full_name ? 'border-red-500 focus:border-red-500' : ''}
                disabled={readonly || loading}
                maxLength={100}
              />
              {errors.full_name && (
                <p className="text-sm text-red-500 flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {errors.full_name}
                </p>
              )}
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">
                Username <span className="text-red-500">*</span>
              </Label>
              <Input
                id="username"
                value={profileData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="Enter your username"
                className={errors.username ? 'border-red-500 focus:border-red-500' : ''}
                disabled={readonly || loading}
                maxLength={50}
              />
              {errors.username && (
                <p className="text-sm text-red-500 flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {errors.username}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                <Mail className="h-4 w-4 inline mr-1" />
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email"
                className={errors.email ? 'border-red-500 focus:border-red-500' : ''}
                disabled={readonly || loading}
              />
              {errors.email && (
                <p className="text-sm text-red-500 flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">
                <Phone className="h-4 w-4 inline mr-1" />
                Phone Number
              </Label>
              <Input
                id="phone"
                value={profileData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+84 123 456 789"
                className={errors.phone ? 'border-red-500 focus:border-red-500' : ''}
                disabled={readonly || loading}
              />
              {errors.phone && (
                <p className="text-sm text-red-500 flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label htmlFor="department">
                <Building className="h-4 w-4 inline mr-1" />
                Department
              </Label>
              <Input
                id="department"
                value={profileData.department || ''}
                onChange={(e) => handleInputChange('department', e.target.value)}
                placeholder="IT, HR, Marketing..."
                disabled={readonly || loading}
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">
                <MapPin className="h-4 w-4 inline mr-1" />
                Location
              </Label>
              <Input
                id="location"
                value={profileData.location || ''}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Ho Chi Minh City, Vietnam"
                disabled={readonly || loading}
              />
            </div>

            {/* Timezone */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="timezone">
                <Globe className="h-4 w-4 inline mr-1" />
                Timezone
              </Label>
              <select
                id="timezone"
                value={profileData.timezone || 'UTC+7'}
                onChange={(e) => handleInputChange('timezone', e.target.value)}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={readonly || loading}
              >
                <option value="UTC+7">UTC+7 (Vietnam, Thailand)</option>
                <option value="UTC">UTC (London, Dublin)</option>
                <option value="UTC-5">UTC-5 (New York, Toronto)</option>
                <option value="UTC-8">UTC-8 (Los Angeles, Vancouver)</option>
                <option value="UTC+9">UTC+9 (Tokyo, Seoul)</option>
                <option value="UTC+8">UTC+8 (Singapore, Beijing)</option>
                <option value="UTC+1">UTC+1 (Paris, Berlin)</option>
                <option value="UTC+5:30">UTC+5:30 (India)</option>
              </select>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">
              <FileText className="h-4 w-4 inline mr-1" />
              Bio
            </Label>
            <Textarea
              id="bio"
              value={profileData.bio || ''}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell us about yourself..."
              rows={3}
              disabled={readonly || loading}
              maxLength={500}
              className={errors.bio ? 'border-red-500 focus:border-red-500' : ''}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{(profileData.bio || '').length}/500 characters</span>
              {errors.bio && (
                <span className="text-red-500 flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {errors.bio}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ✅ Enhanced Professional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Briefcase className="h-5 w-5 text-purple-600" />
            <span>Professional Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Job Title */}
            <div className="space-y-2">
              <Label htmlFor="job_title">
                <Briefcase className="h-4 w-4 inline mr-1" />
                Job Title
              </Label>
              <Input
                id="job_title"
                value={profileData.job_title || ''}
                onChange={(e) => handleInputChange('job_title', e.target.value)}
                placeholder="Software Engineer, Manager..."
                disabled={readonly || loading}
              />
            </div>

            {/* Company */}
            <div className="space-y-2">
              <Label htmlFor="company">
                <Building className="h-4 w-4 inline mr-1" />
                Company
              </Label>
              <Input
                id="company"
                value={profileData.company || ''}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="Your Company Name"
                disabled={readonly || loading}
              />
            </div>

            {/* Website */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="website">
                <Globe className="h-4 w-4 inline mr-1" />
                Website
              </Label>
              <Input
                id="website"
                type="url"
                value={profileData.website || ''}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://yourwebsite.com"
                className={errors.website ? 'border-red-500 focus:border-red-500' : ''}
                disabled={readonly || loading}
              />
              {errors.website && (
                <p className="text-sm text-red-500 flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {errors.website}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ✅ Enhanced Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5 text-gray-600" />
            <span>Account Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-gray-50 rounded-lg">
              <Label className="text-gray-600 font-medium">Account Created</Label>
              <div className="flex items-center mt-1">
                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                <span className="text-gray-900">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <Label className="text-gray-600 font-medium">Last Login</Label>
              <div className="flex items-center mt-1">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                <span className="text-gray-900">
                  {user?.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <Label className="text-gray-600 font-medium">Account Status</Label>
              <div className="flex items-center mt-1">
                {user?.is_active ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    <span className="text-green-600 font-medium">Active</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                    <span className="text-red-600 font-medium">Inactive</span>
                  </>
                )}
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <Label className="text-gray-600 font-medium">Role</Label>
              <div className="flex items-center mt-1">
                {user?.is_admin ? (
                  <>
                    <Edit className="h-4 w-4 mr-2 text-purple-500" />
                    <span className="text-purple-600 font-medium">Administrator</span>
                  </>
                ) : (
                  <>
                    <User className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="text-blue-600 font-medium">User</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ✅ Enhanced Save Section */}
      {!readonly && (
        <div className="space-y-4">
          {hasChanges && (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                You have unsaved changes. Don't forget to save your profile before leaving this page.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
            {hasChanges && (
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                Reset Changes
              </Button>
            )}
            
            <Button
              onClick={handleSave}
              disabled={loading || !hasChanges}
              className="min-w-32 w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSettings;