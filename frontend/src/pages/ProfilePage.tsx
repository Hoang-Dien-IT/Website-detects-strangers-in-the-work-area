import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  User,
  Settings,
  Shield,
  Bell,
  Lock,
  Eye,
  Calendar,
  Mail,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import ProfileSettings from '@/components/settings/ProfileSettings';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  // Đường dẫn base cho avatar (có thể điều chỉnh theo backend)
  const AVATAR_BASE_URL = "http://localhost:8000";
  // Xây dựng src cho avatar
  let avatarSrc: string | undefined = undefined;
  if (user?.avatar_url) {
    if (user.avatar_url.startsWith('http')) {
      avatarSrc = user.avatar_url;
    } else if (user.avatar_url.startsWith('/uploads/avatars/')) {
      avatarSrc = AVATAR_BASE_URL + user.avatar_url;
    } else {
      avatarSrc = AVATAR_BASE_URL + '/uploads/avatars/' + user.avatar_url;
    }
  }
  // eslint-disable-next-line no-console
  console.log('Avatar URL:', user?.avatar_url, '-> src:', avatarSrc);

  const handleProfileSave = (data: any) => {
    console.log('Profile saved:', data);
  };

  const getAccountBadge = () => {
    if (user?.is_admin) {
      return <Badge variant="default" className="bg-red-600"><Shield className="w-3 h-3 mr-1" />Administrator</Badge>;
    }
    return <Badge variant="outline"><User className="w-3 h-3 mr-1" />User</Badge>;
  };

  const getAccountStats = () => {
    const createdDate = user?.created_at ? new Date(user.created_at) : new Date();
    const daysSinceJoined = Math.floor((new Date().getTime() - createdDate.getTime()) / (1000 * 3600 * 24));
    
    return {
      daysSinceJoined,
      lastLogin: user?.last_login ? new Date(user.last_login) : new Date(),
      accountStatus: user?.is_active ? 'Active' : 'Inactive'
    };
  };

  const stats = getAccountStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            
            <div className="flex items-center space-x-3">
              <User className="h-6 w-6 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">My Profile</h1>
                <p className="text-sm text-gray-600">Manage your account settings and preferences</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {getAccountBadge()}
            <Button variant="outline" onClick={() => navigate('/settings')}>
              <Settings className="w-4 h-4 mr-2" />
              All Settings
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Profile Overview Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Profile Summary Card */}
              <Card>
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      {/* Avatar hiển thị ảnh nếu có, fallback nếu không */}
                      <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500">
                        <img
                          src={avatarSrc || '/default-avatar.png'}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                          onError={e => (e.currentTarget.src = '/default-avatar.png')}
                        />
                        {/* Nếu không có avatar, hiển thị chữ cái đầu */}
                        {!avatarSrc && (
                          <span className="absolute text-white text-2xl font-bold">
                            {user?.full_name?.charAt(0) || 'U'}
                          </span>
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{user?.full_name || 'User'}</CardTitle>
                  <p className="text-sm text-gray-600">@{user?.username}</p>
                  <div className="flex justify-center mt-2">
                    {getAccountBadge()}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Separator />
                  
                  {/* Quick Stats */}
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Account Status</span>
                      <Badge variant={user?.is_active ? "default" : "secondary"}>
                        {stats.accountStatus}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Member Since</span>
                      <span className="font-medium">{stats.daysSinceJoined} days</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Last Login</span>
                      <span className="font-medium">{stats.lastLogin.toLocaleDateString()}</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Quick Actions */}
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Lock className="w-4 h-4 mr-2" />
                      Change Password
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Bell className="w-4 h-4 mr-2" />
                      Notifications
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Shield className="w-4 h-4 mr-2" />
                      Privacy Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Account Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Account Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {user?.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{user.email}</span>
                    </div>
                  )}
                  
                  {user?.created_at && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Joined {new Date(user.created_at).toLocaleDateString()}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">ID: {user?.id?.slice(0, 8)}...</span>
                  </div>
                </CardContent>
              </Card>

              {/* Security Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Security Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Two-Factor Auth</span>
                    <Badge variant="outline">Disabled</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Password Strength</span>
                    <Badge variant="default">Strong</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Login Sessions</span>
                    <span className="font-medium">1 active</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Profile Settings */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <p className="text-sm text-gray-600">
                  Update your personal information and profile settings
                </p>
              </CardHeader>
              <CardContent>
                <ProfileSettings onSave={handleProfileSave} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="mt-8 p-4 bg-white rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Need Help?</h3>
              <p className="text-sm text-gray-600">Contact our support team for assistance</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => navigate('/help')}>
                Get Help
              </Button>
              <Button variant="outline">
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;