import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  User, Save, Upload, RefreshCw, AlertCircle, ArrowLeft,
  Moon, Sun, Laptop, Globe, Clock, Monitor, Database
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useWebSocketContext } from '@/contexts/WebSocketContext';
import { settingsService } from '@/services/settings.service';
import { userService } from '@/services/user.service';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

// Interfaces
interface ProfileFormData {
  full_name: string;
  email: string;
  username: string;
  phone: string;
  location: string;
  bio: string;
  website: string;
  job_title: string;
  company: string;
}

interface SystemPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  enable_animations: boolean;
  auto_save: boolean;
  show_tooltips: boolean;
  compact_mode: boolean;
}

const GeneralSettingsPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { isConnected } = useWebSocketContext();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [systemSaved, setSystemSaved] = useState(false);

  // Form States
  const [profileData, setProfileData] = useState<ProfileFormData>({
    full_name: '',
    email: '',
    username: '',
    phone: '',
    location: '',
    bio: '',
    website: '',
    job_title: '',
    company: ''
  });

  const [systemPreferences, setSystemPreferences] = useState<SystemPreferences>({
    theme: 'light',
    language: 'vi',
    timezone: 'Asia/Ho_Chi_Minh',
    enable_animations: true,
    auto_save: true,
    show_tooltips: true,
    compact_mode: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load user data
  useEffect(() => {
    if (user) {
      setProfileData({
        full_name: user.full_name || '',
        email: user.email || '',
        username: user.username || '',
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || '',
        website: user.website || '',
        job_title: user.job_title || '',
        company: user.company || ''
      });
    }
  }, [user]);

  // Load system preferences
  useEffect(() => {
    const loadSystemPreferences = async () => {
      try {
        const settings = await settingsService.getUserSettings();
        setSystemPreferences(prev => ({
          ...prev,
          theme: (settings as any).theme || 'light',
          language: settings.language || 'vi',
          timezone: settings.timezone || 'Asia/Ho_Chi_Minh',
          enable_animations: (settings as any).enable_animations ?? true,
          auto_save: (settings as any).auto_save ?? true
        }));
      } catch (error) {
        console.error('Error loading system preferences:', error);
      }
    };

    loadSystemPreferences();
  }, []);

  // Validation
  const validateProfile = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!profileData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (!profileData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!profileData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle profile save
  const handleSaveProfile = async () => {
    if (!validateProfile()) return;

    setLoading(true);
    try {
      await userService.updateProfile(profileData);
      const updatedUser = await userService.getCurrentUser();
      updateUser(updatedUser);
      setProfileSaved(true);
      toast.success('Profile updated successfully');
      
      setTimeout(() => setProfileSaved(false), 2000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Handle system preferences save
  const handleSaveSystemPreferences = async () => {
    setLoading(true);
    try {
      await settingsService.updateUserSettings(systemPreferences);
      setSystemSaved(true);
      toast.success('System preferences updated successfully');
      
      setTimeout(() => setSystemSaved(false), 2000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update system preferences');
    } finally {
      setLoading(false);
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setUploadingAvatar(true);
    try {
      await userService.uploadAvatar(file);
      const updatedUser = await userService.getCurrentUser();
      updateUser(updatedUser);
      toast.success('Avatar updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/app/settings')}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Settings
            </Button>
            <div className="h-6 border-l border-gray-300" />
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">General Settings</h1>
                <p className="text-sm text-gray-500">Manage your profile information and system preferences</p>
              </div>
            </div>
          </div>
          
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${
            isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Information */}
          <motion.div {...fadeInUp}>
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg font-semibold">Profile Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={user?.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-bold">
                        {user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'NHD'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{user?.full_name || 'Nguyễn Hoàng Diến'}</p>
                    <p className="text-sm text-gray-500">@{user?.username || 'user1'}</p>
                    <Label htmlFor="avatar-upload" className="cursor-pointer">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        disabled={uploadingAvatar}
                        asChild
                      >
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          {uploadingAvatar ? 'Uploading...' : 'Upload New Avatar'}
                        </span>
                      </Button>
                    </Label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG or WebP. Max 5MB.</p>
                  </div>
                </div>

                {/* Profile Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name" className="text-sm font-medium">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="full_name"
                      value={profileData.full_name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                      className={errors.full_name ? 'border-red-500' : ''}
                      placeholder="Nguyễn Hoàng Diến"
                    />
                    {errors.full_name && (
                      <p className="text-xs text-red-500 mt-1">{errors.full_name}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="username" className="text-sm font-medium">
                      Username <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="username"
                      value={profileData.username}
                      onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                      className={errors.username ? 'border-red-500' : ''}
                      placeholder="user1"
                    />
                    {errors.username && (
                      <p className="text-xs text-red-500 mt-1">{errors.username}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      className={errors.email ? 'border-red-500' : ''}
                      placeholder="nguyenhoangdienk@gmail.com"
                    />
                    {errors.email && (
                      <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="0944779744"
                    />
                  </div>

                  <div>
                    <Label htmlFor="job_title" className="text-sm font-medium">Job Title</Label>
                    <Input
                      id="job_title"
                      value={profileData.job_title}
                      onChange={(e) => setProfileData(prev => ({ ...prev, job_title: e.target.value }))}
                      placeholder="AI Engineer"
                    />
                  </div>

                  <div>
                    <Label htmlFor="company" className="text-sm font-medium">Company</Label>
                    <Input
                      id="company"
                      value={profileData.company}
                      onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                      placeholder="Company name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="website" className="text-sm font-medium">Website</Label>
                    <Input
                      id="website"
                      value={profileData.website}
                      onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                    <Input
                      id="location"
                      value={profileData.location}
                      onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Cần Thơ"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about yourself..."
                    className="min-h-[80px]"
                  />
                </div>

                <Button 
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className={`w-full ${profileSaved ? 'bg-green-600 hover:bg-green-700' : ''}`}
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : profileSaved ? (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Profile Saved!
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Profile
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* System Preferences */}
          <motion.div {...fadeInUp} className="transition-all duration-300 delay-100">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <Monitor className="h-5 w-5 text-purple-600" />
                  <CardTitle className="text-lg font-semibold">System Preferences</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Theme */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Sun className="h-4 w-4 text-orange-500" />
                    <Label className="text-sm font-medium">Theme</Label>
                  </div>
                  <Select 
                    value={systemPreferences.theme} 
                    onValueChange={(value: 'light' | 'dark' | 'auto') => 
                      setSystemPreferences(prev => ({ ...prev, theme: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center space-x-2">
                          <Sun className="h-4 w-4" />
                          <span>Light</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center space-x-2">
                          <Moon className="h-4 w-4" />
                          <span>Dark</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="auto">
                        <div className="flex items-center space-x-2">
                          <Laptop className="h-4 w-4" />
                          <span>System</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Language */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Globe className="h-4 w-4 text-blue-500" />
                    <Label className="text-sm font-medium">Language</Label>
                  </div>
                  <Select 
                    value={systemPreferences.language} 
                    onValueChange={(value) => 
                      setSystemPreferences(prev => ({ ...prev, language: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vi">Tiếng Việt</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Timezone */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Clock className="h-4 w-4 text-green-500" />
                    <Label className="text-sm font-medium">Timezone</Label>
                  </div>
                  <Select 
                    value={systemPreferences.timezone} 
                    onValueChange={(value) => 
                      setSystemPreferences(prev => ({ ...prev, timezone: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Ho_Chi_Minh">GMT+7 (Ho Chi Minh)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="Asia/Tokyo">GMT+9 (Tokyo)</SelectItem>
                      <SelectItem value="America/New_York">GMT-5 (New York)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Switches */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Monitor className="h-4 w-4 text-gray-500" />
                      <div>
                        <Label className="font-medium">Enable Animations</Label>
                        <p className="text-xs text-gray-500">Show smooth transitions and animations</p>
                      </div>
                    </div>
                    <Switch
                      checked={systemPreferences.enable_animations}
                      onCheckedChange={(checked) => 
                        setSystemPreferences(prev => ({ ...prev, enable_animations: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Database className="h-4 w-4 text-gray-500" />
                      <div>
                        <Label className="font-medium">Auto Save</Label>
                        <p className="text-xs text-gray-500">Automatically save changes</p>
                      </div>
                    </div>
                    <Switch
                      checked={systemPreferences.auto_save}
                      onCheckedChange={(checked) => 
                        setSystemPreferences(prev => ({ ...prev, auto_save: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="h-4 w-4 text-gray-500" />
                      <div>
                        <Label className="font-medium">Show Tooltips</Label>
                        <p className="text-xs text-gray-500">Display helpful tooltips</p>
                      </div>
                    </div>
                    <Switch
                      checked={systemPreferences.show_tooltips}
                      onCheckedChange={(checked) => 
                        setSystemPreferences(prev => ({ ...prev, show_tooltips: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Database className="h-4 w-4 text-gray-500" />
                      <div>
                        <Label className="font-medium">Compact Mode</Label>
                        <p className="text-xs text-gray-500">Use compact interface layout</p>
                      </div>
                    </div>
                    <Switch
                      checked={systemPreferences.compact_mode}
                      onCheckedChange={(checked) => 
                        setSystemPreferences(prev => ({ ...prev, compact_mode: checked }))
                      }
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleSaveSystemPreferences}
                  disabled={loading}
                  className={`w-full ${systemSaved ? 'bg-green-600 hover:bg-green-700' : ''}`}
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : systemSaved ? (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Preferences Saved!
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save System Preferences
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Status Messages */}
        {(profileSaved || systemSaved) && (
          <motion.div 
            {...fadeInUp}
            className="mt-6"
          >
            <Alert className="border-green-200 bg-green-50">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Settings have been saved successfully!
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default GeneralSettingsPage;
