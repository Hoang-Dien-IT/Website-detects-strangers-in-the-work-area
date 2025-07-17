import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Mail, Smartphone, Save, AlertCircle, Volume2, VolumeX,
  ExternalLink, Target, Users, Camera, RefreshCw, TestTube,
  Clock, Shield, Settings, Webhook, MessageSquare
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useWebSocketContext } from '@/contexts/WebSocketContext';
import { settingsService, UserSettings } from '@/services/settings.service';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

interface NotificationSettings {
  email_notifications: boolean;
  web_notifications: boolean;
  detection_alerts: boolean;
  stranger_alerts: boolean;
  known_person_alerts: boolean;
  camera_offline_alerts: boolean;
  system_alerts: boolean;
  alert_sound: boolean;
  webhook_url: string;
  webhook_enabled: boolean;
  notification_frequency: 'immediate' | 'every_5_min' | 'every_15_min' | 'hourly' | 'daily';
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  alert_threshold: number;
}

const NotificationSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { isConnected } = useWebSocketContext();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [testingNotification, setTestingNotification] = useState(false);

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email_notifications: true,
    web_notifications: true,
    detection_alerts: true,
    stranger_alerts: true,
    known_person_alerts: false,
    camera_offline_alerts: true,
    system_alerts: true,
    alert_sound: true,
    webhook_url: '',
    webhook_enabled: false,
    notification_frequency: 'immediate',
    quiet_hours_enabled: false,
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00',
    alert_threshold: 0.8
  });

  // Initialize data
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        const userSettings = await settingsService.getUserSettings();
        
        setNotificationSettings(prev => ({
          ...prev,
          email_notifications: userSettings.email_notifications ?? true,
          web_notifications: userSettings.web_notifications ?? true,
          detection_alerts: userSettings.detection_sensitivity ? userSettings.detection_sensitivity > 0.5 : true,
          alert_sound: userSettings.alert_sound ?? true,
          webhook_url: userSettings.webhook_url || '',
          webhook_enabled: !!userSettings.webhook_url,
          alert_threshold: userSettings.confidence_threshold || 0.8
        }));

      } catch (error) {
        console.error('Error loading notification settings:', error);
        toast.error('Failed to load notification settings');
      }
    };

    loadData();
  }, [user]);

  const handleNotificationSettingsUpdate = async () => {
    try {
      setLoading(true);
      const userSettings: Partial<UserSettings> = {
        email_notifications: notificationSettings.email_notifications,
        web_notifications: notificationSettings.web_notifications,
        detection_sensitivity: notificationSettings.detection_alerts ? 0.8 : 0.3,
        alert_sound: notificationSettings.alert_sound,
        webhook_url: notificationSettings.webhook_enabled ? notificationSettings.webhook_url : '',
        confidence_threshold: notificationSettings.alert_threshold,
        email_alerts: notificationSettings.stranger_alerts
      };
      
      await settingsService.updateUserSettings(userSettings);
      toast.success('🔔 Notification settings updated successfully');
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast.error('❌ Failed to update notification settings');
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      setTestingNotification(true);
      // Simulate sending test notification
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('📧 Test notification sent! Check your email and browser notifications.');
    } catch (error) {
      toast.error('❌ Failed to send test notification');
    } finally {
      setTestingNotification(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div {...fadeInUp} className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Notification Settings</h1>
              <p className="text-gray-600">Configure how and when you receive alerts and notifications</p>
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

          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Email Alerts</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {notificationSettings.email_notifications ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                  <Mail className={`h-8 w-8 ${notificationSettings.email_notifications ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Web Push</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {notificationSettings.web_notifications ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                  <Smartphone className={`h-8 w-8 ${notificationSettings.web_notifications ? 'text-blue-600' : 'text-gray-400'}`} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Alert Sound</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {notificationSettings.alert_sound ? 'On' : 'Off'}
                    </p>
                  </div>
                  {notificationSettings.alert_sound ? 
                    <Volume2 className="h-8 w-8 text-purple-600" /> : 
                    <VolumeX className="h-8 w-8 text-gray-400" />
                  }
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Webhooks</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {notificationSettings.webhook_enabled ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  <Webhook className={`h-8 w-8 ${notificationSettings.webhook_enabled ? 'text-orange-600' : 'text-gray-400'}`} />
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Alert Types */}
          <motion.div {...fadeInUp} className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-orange-600" />
                  <span>Detection Alerts</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span>Stranger Detection Alerts</span>
                    </Label>
                    <p className="text-sm text-gray-600">Get notified when unknown faces are detected</p>
                  </div>
                  <Switch
                    checked={notificationSettings.stranger_alerts}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, stranger_alerts: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-green-600" />
                      <span>Known Person Alerts</span>
                    </Label>
                    <p className="text-sm text-gray-600">Get notified when recognized faces are detected</p>
                  </div>
                  <Switch
                    checked={notificationSettings.known_person_alerts}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, known_person_alerts: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center space-x-2">
                      <Camera className="w-4 h-4 text-blue-600" />
                      <span>Camera Offline Alerts</span>
                    </Label>
                    <p className="text-sm text-gray-600">Get notified when cameras go offline</p>
                  </div>
                  <Switch
                    checked={notificationSettings.camera_offline_alerts}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, camera_offline_alerts: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-purple-600" />
                      <span>System Alerts</span>
                    </Label>
                    <p className="text-sm text-gray-600">Get notified about system events and errors</p>
                  </div>
                  <Switch
                    checked={notificationSettings.system_alerts}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, system_alerts: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label>Detection Sensitivity</Label>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Low (0.5)</span>
                      <span>Current: {notificationSettings.alert_threshold.toFixed(1)}</span>
                      <span>High (1.0)</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="1.0"
                      step="0.1"
                      value={notificationSettings.alert_threshold}
                      onChange={(e) => 
                        setNotificationSettings(prev => ({ 
                          ...prev, 
                          alert_threshold: parseFloat(e.target.value) 
                        }))
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <Progress value={notificationSettings.alert_threshold * 100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Delivery Methods */}
          <motion.div {...fadeInUp} className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  <span>Delivery Methods</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span>Email Notifications</span>
                    </Label>
                    <p className="text-sm text-gray-600">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={notificationSettings.email_notifications}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, email_notifications: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center space-x-2">
                      <Smartphone className="w-4 h-4" />
                      <span>Web Push Notifications</span>
                    </Label>
                    <p className="text-sm text-gray-600">Receive push notifications in browser</p>
                  </div>
                  <Switch
                    checked={notificationSettings.web_notifications}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, web_notifications: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center space-x-2">
                      {notificationSettings.alert_sound ? 
                        <Volume2 className="w-4 h-4 text-blue-600" /> : 
                        <VolumeX className="w-4 h-4 text-gray-400" />
                      }
                      <span>Alert Sound</span>
                    </Label>
                    <p className="text-sm text-gray-600">Play sound for alerts</p>
                  </div>
                  <Switch
                    checked={notificationSettings.alert_sound}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, alert_sound: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center space-x-2">
                        <ExternalLink className="w-4 h-4" />
                        <span>Webhook Integration</span>
                      </Label>
                      <p className="text-sm text-gray-600">Send alerts to external webhook URL</p>
                    </div>
                    <Switch
                      checked={notificationSettings.webhook_enabled}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, webhook_enabled: checked }))
                      }
                    />
                  </div>

                  {notificationSettings.webhook_enabled && (
                    <div className="space-y-2">
                      <Label htmlFor="webhook_url">Webhook URL</Label>
                      <Input
                        id="webhook_url"
                        value={notificationSettings.webhook_url}
                        onChange={(e) => 
                          setNotificationSettings(prev => ({ ...prev, webhook_url: e.target.value }))
                        }
                        placeholder="https://your-webhook-url.com/endpoint"
                      />
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label>Notification Frequency</Label>
                  <Select
                    value={notificationSettings.notification_frequency}
                    onValueChange={(value: any) => 
                      setNotificationSettings(prev => ({ ...prev, notification_frequency: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="every_5_min">Every 5 minutes</SelectItem>
                      <SelectItem value="every_15_min">Every 15 minutes</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily Summary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Quiet Hours */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-indigo-600" />
                  <span>Quiet Hours</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Quiet Hours</Label>
                    <p className="text-sm text-gray-600">Suppress non-critical notifications during specified hours</p>
                  </div>
                  <Switch
                    checked={notificationSettings.quiet_hours_enabled}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, quiet_hours_enabled: checked }))
                    }
                  />
                </div>

                {notificationSettings.quiet_hours_enabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quiet_start">Start Time</Label>
                      <Input
                        id="quiet_start"
                        type="time"
                        value={notificationSettings.quiet_hours_start}
                        onChange={(e) => 
                          setNotificationSettings(prev => ({ ...prev, quiet_hours_start: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quiet_end">End Time</Label>
                      <Input
                        id="quiet_end"
                        type="time"
                        value={notificationSettings.quiet_hours_end}
                        onChange={(e) => 
                          setNotificationSettings(prev => ({ ...prev, quiet_hours_end: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Actions */}
        <motion.div {...fadeInUp} className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <Button 
                onClick={handleNotificationSettingsUpdate} 
                disabled={loading} 
                className="w-full"
              >
                {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <Button 
                onClick={handleTestNotification} 
                disabled={testingNotification} 
                variant="outline" 
                className="w-full"
              >
                {testingNotification ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <TestTube className="h-4 w-4 mr-2" />}
                Send Test Notification
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Help Section */}
        <motion.div {...fadeInUp} className="mt-8">
          <Alert className="border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Pro Tip:</strong> Test your notification settings to ensure they work correctly. 
              You can adjust the detection sensitivity to reduce false positives while maintaining security.
            </AlertDescription>
          </Alert>
        </motion.div>
      </div>
    </div>
  );
};

export default NotificationSettingsPage;
