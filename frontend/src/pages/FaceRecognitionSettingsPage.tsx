import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Brain,
  Eye,
  Settings,
  Zap,
  Shield,
  Target,
  Camera,
  Cpu,
  BarChart3,
  AlertTriangle,
  Save,
  RefreshCw,
  ArrowLeft,
  Monitor
} from 'lucide-react';
import { settingsService, UserSettings } from '@/services/settings.service';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface FaceRecognitionSettings {
  detection_enabled: boolean;
  confidence_threshold: number;
  save_unknown_faces: boolean;
  anti_spoofing_enabled: boolean;
  real_time_processing: boolean;
  stranger_alert_cooldown: number;
  detection_sensitivity: number;
  max_faces_per_frame: number;
  face_quality_threshold: number;
  enable_gender_detection: boolean;
  enable_age_estimation: boolean;
  enable_emotion_detection: boolean;
}

interface PerformanceMetrics {
  detection_speed: number;
  accuracy_rate: number;
  false_positive_rate: number;
  processing_load: number;
  memory_usage: number;
}

const FaceRecognitionSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState<FaceRecognitionSettings>({
    detection_enabled: true,
    confidence_threshold: 0.8,
    save_unknown_faces: true,
    anti_spoofing_enabled: true,
    real_time_processing: true,
    stranger_alert_cooldown: 300,
    detection_sensitivity: 0.7,
    max_faces_per_frame: 10,
    face_quality_threshold: 0.6,
    enable_gender_detection: false,
    enable_age_estimation: false,
    enable_emotion_detection: false
  });

  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    detection_speed: 45,
    accuracy_rate: 94.5,
    false_positive_rate: 2.1,
    processing_load: 68,
    memory_usage: 42
  });

  // Load settings from backend
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const userSettings = await settingsService.getUserSettings();
      
      setSettings({
        detection_enabled: userSettings.face_recognition_enabled ?? true,
        confidence_threshold: userSettings.confidence_threshold ?? 0.8,
        save_unknown_faces: true,
        anti_spoofing_enabled: true,
        real_time_processing: true,
        stranger_alert_cooldown: userSettings.stranger_alert_cooldown ?? 300,
        detection_sensitivity: userSettings.detection_sensitivity ?? 0.7,
        max_faces_per_frame: 10,
        face_quality_threshold: 0.6,
        enable_gender_detection: false,
        enable_age_estimation: false,
        enable_emotion_detection: false
      });

      // Simulate performance metrics (in real app, this would come from backend)
      setPerformanceMetrics({
        detection_speed: Math.random() * 20 + 40,
        accuracy_rate: Math.random() * 5 + 92,
        false_positive_rate: Math.random() * 3 + 1,
        processing_load: Math.random() * 30 + 50,
        memory_usage: Math.random() * 20 + 30
      });

    } catch (error) {
      console.error('Error loading face recognition settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      
      const userSettings: Partial<UserSettings> = {
        face_recognition_enabled: settings.detection_enabled,
        confidence_threshold: settings.confidence_threshold,
        stranger_alert_cooldown: settings.stranger_alert_cooldown,
        detection_sensitivity: settings.detection_sensitivity
      };

      await settingsService.updateUserSettings(userSettings);
      toast.success('🧠 Face recognition settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const getConfidenceLabel = (value: number) => {
    if (value >= 0.9) return 'Very High';
    if (value >= 0.8) return 'High';
    if (value >= 0.7) return 'Medium';
    if (value >= 0.6) return 'Low';
    return 'Very Low';
  };

  const getSensitivityLabel = (value: number) => {
    if (value >= 0.8) return 'Maximum';
    if (value >= 0.7) return 'High';
    if (value >= 0.5) return 'Medium';
    if (value >= 0.3) return 'Low';
    return 'Minimal';
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <motion.div 
        className="max-w-6xl mx-auto space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl opacity-90"></div>
          <div className="absolute inset-0 bg-black/20 rounded-3xl"></div>
          <div className="relative p-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/dashboard/settings')}
                  className="text-white hover:bg-white/10"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Settings
                </Button>
                <div>
                  <h1 className="text-4xl font-bold mb-2 flex items-center">
                    <Brain className="h-10 w-10 mr-3" />
                    Face Recognition Settings
                  </h1>
                  <p className="text-blue-100 text-lg">Configure AI-powered face detection and recognition</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                {settings.detection_enabled ? (
                  <>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <Eye className="h-4 w-4" />
                    <span className="text-sm font-medium">Active</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    <span className="text-sm font-medium">Disabled</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Zap className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-600">
                {performanceMetrics.detection_speed.toFixed(1)}ms
              </div>
              <div className="text-sm text-gray-600">Detection Speed</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">
                {performanceMetrics.accuracy_rate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Accuracy Rate</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600">
                {performanceMetrics.false_positive_rate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">False Positives</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Cpu className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">
                {performanceMetrics.processing_load.toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600">CPU Load</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Monitor className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">
                {performanceMetrics.memory_usage.toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600">Memory Usage</div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="detection" className="space-y-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-2">
            <TabsList className="grid w-full grid-cols-4 bg-transparent">
              <TabsTrigger value="detection" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <Eye className="w-4 h-4 mr-2" />
                Detection
              </TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                <Shield className="w-4 h-4 mr-2" />
                Security
              </TabsTrigger>
              <TabsTrigger value="performance" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                <Zap className="w-4 h-4 mr-2" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="advanced" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
                <Settings className="w-4 h-4 mr-2" />
                Advanced
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Detection Settings */}
          <TabsContent value="detection" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Eye className="h-5 w-5" />
                    <span>Detection Controls</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Face Detection</Label>
                      <p className="text-sm text-gray-600">Enable AI-powered face detection</p>
                    </div>
                    <Switch
                      checked={settings.detection_enabled}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, detection_enabled: checked }))
                      }
                    />
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label>
                      Confidence Threshold: {Math.round(settings.confidence_threshold * 100)}% 
                      <Badge variant="outline" className="ml-2">
                        {getConfidenceLabel(settings.confidence_threshold)}
                      </Badge>
                    </Label>
                    <input
                      type="range"
                      min="0.5"
                      max="0.99"
                      step="0.01"
                      value={settings.confidence_threshold}
                      onChange={(e) => 
                        setSettings(prev => ({ 
                          ...prev, 
                          confidence_threshold: parseFloat(e.target.value) 
                        }))
                      }
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>50% (More faces)</span>
                      <span>99% (Fewer faces)</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label>
                      Detection Sensitivity: {Math.round(settings.detection_sensitivity * 100)}%
                      <Badge variant="outline" className="ml-2">
                        {getSensitivityLabel(settings.detection_sensitivity)}
                      </Badge>
                    </Label>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.1"
                      value={settings.detection_sensitivity}
                      onChange={(e) => 
                        setSettings(prev => ({ 
                          ...prev, 
                          detection_sensitivity: parseFloat(e.target.value) 
                        }))
                      }
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Low (Fewer alerts)</span>
                      <span>High (More alerts)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Camera className="h-5 w-5" />
                    <span>Recognition Options</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Save Unknown Faces</Label>
                      <p className="text-sm text-gray-600">Store images of unrecognized faces</p>
                    </div>
                    <Switch
                      checked={settings.save_unknown_faces}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, save_unknown_faces: checked }))
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Real-time Processing</Label>
                      <p className="text-sm text-gray-600">Process video frames in real-time</p>
                    </div>
                    <Switch
                      checked={settings.real_time_processing}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, real_time_processing: checked }))
                      }
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="cooldown">Stranger Alert Cooldown (seconds)</Label>
                    <Input
                      id="cooldown"
                      type="number"
                      value={settings.stranger_alert_cooldown}
                      onChange={(e) => 
                        setSettings(prev => ({ 
                          ...prev, 
                          stranger_alert_cooldown: Math.max(0, parseInt(e.target.value) || 0)
                        }))
                      }
                      min="0"
                      max="3600"
                    />
                    <p className="text-sm text-gray-600">
                      Minimum time between alerts for the same stranger
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Security Features</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Anti-Spoofing Protection</Label>
                    <p className="text-sm text-gray-600">Detect fake faces and printed photos</p>
                  </div>
                  <Switch
                    checked={settings.anti_spoofing_enabled}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, anti_spoofing_enabled: checked }))
                    }
                  />
                </div>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Anti-spoofing protection helps prevent unauthorized access using photos, 
                    videos, or 3D models. This may slightly increase processing time.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Settings */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="h-5 w-5" />
                    <span>Performance Tuning</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="max_faces">Max Faces per Frame</Label>
                    <Input
                      id="max_faces"
                      type="number"
                      value={settings.max_faces_per_frame}
                      onChange={(e) => 
                        setSettings(prev => ({ 
                          ...prev, 
                          max_faces_per_frame: Math.max(1, parseInt(e.target.value) || 1)
                        }))
                      }
                      min="1"
                      max="50"
                    />
                    <p className="text-sm text-gray-600">
                      Maximum number of faces to detect in a single frame
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label>
                      Face Quality Threshold: {Math.round(settings.face_quality_threshold * 100)}%
                    </Label>
                    <input
                      type="range"
                      min="0.3"
                      max="0.9"
                      step="0.1"
                      value={settings.face_quality_threshold}
                      onChange={(e) => 
                        setSettings(prev => ({ 
                          ...prev, 
                          face_quality_threshold: parseFloat(e.target.value) 
                        }))
                      }
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Low quality</span>
                      <span>High quality</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Current Performance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>CPU Usage</span>
                      <span>{performanceMetrics.processing_load.toFixed(0)}%</span>
                    </div>
                    <Progress value={performanceMetrics.processing_load} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Memory Usage</span>
                      <span>{performanceMetrics.memory_usage.toFixed(0)}%</span>
                    </div>
                    <Progress value={performanceMetrics.memory_usage} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Accuracy Rate</span>
                      <span>{performanceMetrics.accuracy_rate.toFixed(1)}%</span>
                    </div>
                    <Progress value={performanceMetrics.accuracy_rate} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Advanced Settings */}
          <TabsContent value="advanced" className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Advanced AI Features</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Gender Detection</Label>
                    <p className="text-sm text-gray-600">Detect gender from facial features</p>
                  </div>
                  <Switch
                    checked={settings.enable_gender_detection}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, enable_gender_detection: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Age Estimation</Label>
                    <p className="text-sm text-gray-600">Estimate age from facial features</p>
                  </div>
                  <Switch
                    checked={settings.enable_age_estimation}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, enable_age_estimation: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Emotion Detection</Label>
                    <p className="text-sm text-gray-600">Detect emotions from facial expressions</p>
                  </div>
                  <Switch
                    checked={settings.enable_emotion_detection}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, enable_emotion_detection: checked }))
                    }
                  />
                </div>

                <Alert>
                  <Brain className="h-4 w-4" />
                  <AlertDescription>
                    Advanced AI features require additional processing power and may impact performance. 
                    Enable only the features you need for your use case.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Save Changes</h3>
                <p className="text-sm text-gray-600">
                  Apply your face recognition settings to all cameras
                </p>
              </div>
              <Button onClick={handleSaveSettings} disabled={saving} size="lg">
                {saving ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default FaceRecognitionSettingsPage;
