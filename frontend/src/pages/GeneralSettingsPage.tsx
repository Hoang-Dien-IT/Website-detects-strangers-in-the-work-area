import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  User, Save, Upload, RefreshCw, AlertCircle, Settings,
  Moon, Sun, Laptop, Globe, Clock, Monitor, HardDrive,
  Database, Wifi, Languages, MapPin, Building
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useWebSocketContext } from '@/contexts/WebSocketContext';
import { settingsService, UserSettings } from '@/services/settings.service';
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
  timezone: string;
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

  // Form States
  const [profileData, setProfileData] = useState<ProfileFormData>({
    full_name: '', email: '', username: '', phone: '', location: '',
    bio: '', website: '', job_title: '', company: '', timezone: 'UTC+7'
  });

  const [systemPreferences, setSystemPreferences] = useState<SystemPreferences>({
    theme: 'auto', language: 'en', timezone: 'UTC+7', enable_animations: true,
    auto_save: true, show_tooltips: true, compact_mode: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize data
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        // Load profile data
        setProfileData({
          full_name: user.full_name || '', email: user.email || '',
          username: user.username || '', phone: user.phone || '',
          location: user.location || '', bio: user.bio || '',
          website: user.website || '', job_title: user.job_title || '',
          company: user.company || '', timezone: user.timezone || 'UTC+7'
        });

        // Load user settings
        const userSettings = await settingsService.getUserSettings();
        
        setSystemPreferences(prev => ({
          ...prev,
          theme: userSettings.dark_mode ? 'dark' : 'light',
          language: userSettings.language || 'en',
          timezone: userSettings.timezone || 'UTC+7'
        }));

      } catch (error) {
        console.error('Error loading user settings:', error);
        toast.error('Failed to load user settings');
      }
    };

    loadData();
  }, [user]);

  // Validation
  const validateProfileData = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!profileData.full_name.trim()) newErrors.full_name = 'Full name is required';
    if (!profileData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) newErrors.email = 'Invalid email';
    if (!profileData.username.trim()) newErrors.username = 'Username is required';
    else if (profileData.username.length < 3) newErrors.username = 'Username must be at least 3 characters';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileUpdate = async () => {
    if (!validateProfileData()) return;

    try {
      setLoading(true);
      const updatedUser = await userService.updateProfile(profileData);
      updateUser(updatedUser);
      toast.success('👤 Profile updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || '❌ Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSystemPreferencesUpdate = async () => {
    try {
      setLoading(true);
      const userSettings: Partial<UserSettings> = {
        dark_mode: systemPreferences.theme === 'dark',
        language: systemPreferences.language,
        timezone: systemPreferences.timezone
      };
      await settingsService.updateUserSettings(userSettings);
      toast.success('⚙️ System preferences updated successfully');
    } catch (error) {
      console.error('Error updating system preferences:', error);
      toast.error('❌ Failed to update system preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    try {
      setUploadingAvatar(true);
      const updatedUser = await userService.uploadAvatar(file);
      updateUser(updatedUser);
      toast.success('📸 Avatar updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || '❌ Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const getThemeIcon = (theme: string) => {
    switch (theme) {
      case 'light': return <Sun className="h-4 w-4" />;
      case 'dark': return <Moon className="h-4 w-4" />;
      default: return <Laptop className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div {...fadeInUp} className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">General Settings</h1>
              <p className="text-gray-600">Manage your profile information and system preferences</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${
                isConnected 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
              <Button 
                variant="outline" 
                onClick={() => navigate('/app/settings')}
                className="flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>Back to Settings</span>
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Information */}
          <motion.div {...fadeInUp} className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <span>Profile Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user?.avatar_url} alt={user?.full_name} />
                    <AvatarFallback className="text-lg">
                      {user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{user?.full_name || 'User'}</h3>
                    <p className="text-sm text-gray-600">@{user?.username}</p>
                    <Label htmlFor="avatar_upload" className="mt-2 inline-block">
                      <Button size="sm" disabled={uploadingAvatar} asChild>
                        <span>
                          {uploadingAvatar ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                          Upload New Avatar
                        </span>
                      </Button>
                      <Input
                        id="avatar_upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG or WebP. Max 5MB.</p>
                  </div>
                </div>

                <Separator />

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      value={profileData.full_name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                      className={errors.full_name ? "border-red-500" : ""}
                    />
                    {errors.full_name && <p className="text-sm text-red-600">{errors.full_name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username *</Label>
                    <Input
                      id="username"
                      value={profileData.username}
                      onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                      className={errors.username ? "border-red-500" : ""}
                    />
                    {errors.username && <p className="text-sm text-red-600">{errors.username}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+84 123 456 789"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="job_title">Job Title</Label>
                    <Input
                      id="job_title"
                      value={profileData.job_title}
                      onChange={(e) => setProfileData(prev => ({ ...prev, job_title: e.target.value }))}
                      placeholder="AI Engineer"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={profileData.company}
                      onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                      placeholder="Company name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={profileData.website}
                      onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profileData.location}
                      onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Ho Chi Minh City, Vietnam"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about yourself..."
                    rows={3}
                    maxLength={500}
                  />
                  <div className="flex justify-end">
                    <span className="text-xs text-gray-500">
                      {profileData.bio.length}/500 characters
                    </span>
                  </div>
                </div>

                <Button onClick={handleProfileUpdate} disabled={loading} className="w-full">
                  {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Profile Changes
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* System Preferences */}
          <motion.div {...fadeInUp} className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Monitor className="h-5 w-5 text-purple-600" />
                  <span>System Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label className="flex items-center space-x-2">
                    {getThemeIcon(systemPreferences.theme)}
                    <span>Theme</span>
                  </Label>
                  <Select
                    value={systemPreferences.theme}
                    onValueChange={(value: any) => 
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

                <Separator />

                <div className="space-y-4">
                  <Label className="flex items-center space-x-2">
                    <Languages className="h-4 w-4" />
                    <span>Language</span>
                  </Label>
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
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="vi">Tiếng Việt</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                      <SelectItem value="ko">한국어</SelectItem>
                      <SelectItem value="zh">中文</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label className="flex items-center space-x-2">
                    <Globe className="h-4 w-4" />
                    <span>Timezone</span>
                  </Label>
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
                      <SelectItem value="UTC+7">UTC+7 (Ho Chi Minh)</SelectItem>
                      <SelectItem value="UTC+9">UTC+9 (Tokyo)</SelectItem>
                      <SelectItem value="UTC+8">UTC+8 (Beijing)</SelectItem>
                      <SelectItem value="UTC+0">UTC+0 (London)</SelectItem>
                      <SelectItem value="UTC-5">UTC-5 (New York)</SelectItem>
                      <SelectItem value="UTC-8">UTC-8 (Los Angeles)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center space-x-2">
                        <Monitor className="w-4 h-4" />
                        <span>Enable Animations</span>
                      </Label>
                      <p className="text-sm text-gray-600">Show smooth transitions and animations</p>
                    </div>
                    <Switch
                      checked={systemPreferences.enable_animations}
                      onCheckedChange={(checked) => 
                        setSystemPreferences(prev => ({ ...prev, enable_animations: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center space-x-2">
                        <Database className="w-4 h-4" />
                        <span>Auto Save</span>
                      </Label>
                      <p className="text-sm text-gray-600">Automatically save changes</p>
                    </div>
                    <Switch
                      checked={systemPreferences.auto_save}
                      onCheckedChange={(checked) => 
                        setSystemPreferences(prev => ({ ...prev, auto_save: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4" />
                        <span>Show Tooltips</span>
                      </Label>
                      <p className="text-sm text-gray-600">Display helpful tooltips</p>
                    </div>
                    <Switch
                      checked={systemPreferences.show_tooltips}
                      onCheckedChange={(checked) => 
                        setSystemPreferences(prev => ({ ...prev, show_tooltips: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center space-x-2">
                        <HardDrive className="w-4 h-4" />
                        <span>Compact Mode</span>
                      </Label>
                      <p className="text-sm text-gray-600">Use compact interface layout</p>
                    </div>
                    <Switch
                      checked={systemPreferences.compact_mode}
                      onCheckedChange={(checked) => 
                        setSystemPreferences(prev => ({ ...prev, compact_mode: checked }))
                      }
                    />
                  </div>
                </div>

                <Button onClick={handleSystemPreferencesUpdate} disabled={loading} className="w-full">
                  {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save System Preferences
                </Button>
              </CardContent>
            </Card>

            {/* System Information */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Monitor className="h-5 w-5 text-green-600" />
                  <span>System Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Wifi className="h-4 w-4 text-green-600" />
                    <span className="text-gray-600">Connection:</span>
                    <span className="font-medium">{isConnected ? 'Online' : 'Offline'}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-gray-600">Local Time:</span>
                    <span className="font-medium">{new Date().toLocaleTimeString()}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-purple-600" />
                    <span className="text-gray-600">Timezone:</span>
                    <span className="font-medium">{systemPreferences.timezone}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-orange-600" />
                    <span className="text-gray-600">Version:</span>
                    <span className="font-medium">v2.1.0</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Help Section */}
        <motion.div {...fadeInUp} className="mt-8">
          <Alert className="border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Profile Tips:</strong> Keep your profile information up to date for better 
              system experience. Your timezone setting affects how detection timestamps are displayed.
            </AlertDescription>
          </Alert>
        </motion.div>
      </div>
    </div>
  );
};

export default GeneralSettingsPage;
