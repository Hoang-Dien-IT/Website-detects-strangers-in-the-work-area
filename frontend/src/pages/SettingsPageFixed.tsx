import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  User, Bell, Shield, Camera, 
  ChevronRight, Monitor, Globe, Lock, Target
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useWebSocketContext } from '@/contexts/WebSocketContext';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

interface SettingsSection {
  title: string;
  description: string;
  icon: any;
  path: string;
  badge?: string;
  color: string;
}

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { isConnected } = useWebSocketContext();
  const navigate = useNavigate();

  const settingsSections: SettingsSection[] = [
    {
      title: 'General',
      description: 'Manage your profile information and system preferences',
      icon: User,
      path: '/app/settings/general',
      color: 'bg-blue-500'
    },
    {
      title: 'Face Recognition',
      description: 'Configure AI detection settings and face recognition parameters',
      icon: Camera,
      path: '/app/settings/face-recognition',
      badge: 'AI',
      color: 'bg-purple-500'
    },
    {
      title: 'Notifications',
      description: 'Configure how and when you receive alerts and notifications',
      icon: Bell,
      path: '/app/settings/notifications',
      color: 'bg-orange-500'
    },
    {
      title: 'Security',
      description: 'Manage your account security, authentication, and access controls',
      icon: Shield,
      path: '/app/settings/security',
      color: 'bg-green-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div {...fadeInUp} className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
              <p className="text-gray-600">Manage your SafeFace account and preferences</p>
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
            </div>
          </div>

          {/* User Profile Summary */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                  {user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900">{user?.full_name || 'User'}</h2>
                  <p className="text-gray-600">@{user?.username}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
                <div className="text-right">
                  <Badge className="bg-blue-100 text-blue-800">
                    {user?.is_admin ? 'Administrator' : 'User'}
                  </Badge>
                  <p className="text-sm text-gray-500 mt-1">
                    Member since {new Date(user?.created_at || '').toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Settings Sections */}
        <motion.div variants={staggerChildren} initial="initial" animate="animate" className="space-y-6">
          <motion.div {...fadeInUp}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {settingsSections.map((section) => (
                <motion.div
                  key={section.path}
                  variants={fadeInUp}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                    onClick={() => navigate(section.path)}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-3 rounded-lg ${section.color} text-white`}>
                            <section.icon className="h-6 w-6" />
                          </div>
                          <div>
                            <CardTitle className="text-lg font-semibold group-hover:text-blue-600 transition-colors">
                              {section.title}
                            </CardTitle>
                            {section.badge && (
                              <Badge className="mt-1 bg-purple-100 text-purple-800">
                                {section.badge}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {section.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div {...fadeInUp}>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/app/settings/general')}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/app/settings/security')}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/app/settings/face-recognition')}
                  >
                    <Target className="h-4 w-4 mr-2" />
                    AI Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* System Status */}
          <motion.div {...fadeInUp}>
            <h3 className="text-xl font-bold text-gray-900 mb-4">System Status</h3>
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Monitor className="h-8 w-8 text-blue-600" />
                    </div>
                    <p className="text-sm text-gray-600">System</p>
                    <p className="font-semibold text-green-600">Online</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Globe className="h-8 w-8 text-purple-600" />
                    </div>
                    <p className="text-sm text-gray-600">Connection</p>
                    <p className={`font-semibold ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                      {isConnected ? 'Connected' : 'Disconnected'}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Camera className="h-8 w-8 text-orange-600" />
                    </div>
                    <p className="text-sm text-gray-600">AI Detection</p>
                    <p className="font-semibold text-green-600">Active</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Shield className="h-8 w-8 text-green-600" />
                    </div>
                    <p className="text-sm text-gray-600">Security</p>
                    <p className="font-semibold text-green-600">Protected</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsPage;
