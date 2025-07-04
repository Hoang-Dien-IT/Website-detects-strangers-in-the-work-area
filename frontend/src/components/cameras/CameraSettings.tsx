import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Camera,
  Settings,
  Save,
  ArrowLeft,
  RefreshCw,
  Eye,
  Bell,
  Monitor,
  AlertTriangle,
  Info,
  Grid3X3,
  TestTube,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  VideoIcon,
  AudioWaveform,
  Target,

} from 'lucide-react';
import { cameraService } from '@/services/camera.service';
// Remove the CameraSettings import since it doesn't exist
import { Camera as CameraType } from '@/types/camera.types';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface CameraSettingsProps {
  className?: string;
}

interface StreamSettings {
  resolution: string;
  fps: number;
  bitrate: number;
  quality: 'auto' | 'high' | 'medium' | 'low';
  codec: 'h264' | 'h265' | 'mjpeg';
  audio_enabled: boolean;
  audio_bitrate: number;
}

interface DetectionSettings {
  enabled: boolean;
  confidence_threshold: number;
  detection_frequency: number;
  save_unknown_faces: boolean;
  blur_unknown_faces: boolean;
  detection_zones: Array<{
    id: string;
    name: string;
    points: Array<[number, number]>;
    enabled: boolean;
  }>;
  excluded_zones: Array<{
    id: string;
    name: string;
    points: Array<[number, number]>;
    enabled: boolean;
  }>;
}

interface NotificationSettings {
  email_notifications: boolean;
  webhook_url: string;
  notification_cooldown: number;
  notify_unknown_faces: boolean;
  notify_known_faces: boolean;
  notify_system_events: boolean;
}

interface RecordingSettings {
  enabled: boolean;
  record_on_detection: boolean;
  record_duration: number;
  max_storage_days: number;
  compression_level: number;
  record_audio: boolean;
}

interface SystemInfo {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  temperature: number;
  uptime: number;
  network_speed: {
    upload: number;
    download: number;
  };
  firmware_version: string;
  last_maintenance: string;
}

// interface BasicSettings {
//   name: string;
//   description: string;
//   location: string;
//   tags: string[];
//   is_active: boolean;
//   timezone: string;
// }

const CameraSettings: React.FC<CameraSettingsProps> = ({ className }) => {
  const { cameraId } = useParams<{ cameraId: string }>();
  const navigate = useNavigate();

  // Core state
  const [camera, setCamera] = useState<CameraType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Settings state
  const [basicSettings, setBasicSettings] = useState({
    name: '',
    description: '',
    location: '',
    tags: [] as string[],
    is_active: true,
    timezone: 'UTC'
  });

  const RecordIcon = ({ className }: { className?: string }) => (
    <div className={`rounded-full bg-red-500 ${className}`} />
  );
  

  const [streamSettings, setStreamSettings] = useState<StreamSettings>({
    resolution: '1920x1080',
    fps: 30,
    bitrate: 2500,
    quality: 'auto',
    codec: 'h264',
    audio_enabled: false,
    audio_bitrate: 128
  });

  const [detectionSettings, setDetectionSettings] = useState<DetectionSettings>({
    enabled: true,
    confidence_threshold: 0.7,
    detection_frequency: 1,
    save_unknown_faces: true,
    blur_unknown_faces: false,
    detection_zones: [],
    excluded_zones: []
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email_notifications: true,
    webhook_url: '',
    notification_cooldown: 300,
    notify_unknown_faces: true,
    notify_known_faces: false,
    notify_system_events: true
  });

  const [recordingSettings, setRecordingSettings] = useState<RecordingSettings>({
    enabled: false,
    record_on_detection: true,
    record_duration: 30,
    max_storage_days: 30,
    compression_level: 3,
    record_audio: false
  });

  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);

  // Load camera data
  useEffect(() => {
    if (!cameraId) {
      setError('Camera ID not provided');
      setLoading(false);
      return;
    }

    const loadCameraSettings = async () => {
      try {
        setLoading(true);
        const [cameraData, settingsData, systemData] = await Promise.all([
          cameraService.getCamera(cameraId),
          cameraService.getCameraSettings(cameraId),
          cameraService.getSystemInfo(cameraId).catch(() => null)
        ]);

        setCamera(cameraData);
        
        // Load basic settings
        setBasicSettings({
          name: cameraData.name || '',
          description: cameraData.description || '',
          location: cameraData.location || '',
          tags: cameraData.tags || [],
          is_active: cameraData.is_active,
          timezone: cameraData.timezone || 'UTC'
        });

        // Load other settings
        // In the loadCameraSettings function, add type assertion for the quality field
        if (settingsData.stream_settings) {
          setStreamSettings({ 
            ...streamSettings, 
            ...settingsData.stream_settings,
            // Ensure quality is properly typed
            quality: (settingsData.stream_settings.quality as 'auto' | 'high' | 'medium' | 'low') || 'auto'
          });
        }
        if (settingsData.detection_settings) {
          setDetectionSettings({ ...detectionSettings, ...settingsData.detection_settings });
        }
        if (settingsData.notification_settings) {
          setNotificationSettings({ ...notificationSettings, ...settingsData.notification_settings });
        }
        if (settingsData.recording_settings) {
          setRecordingSettings({ ...recordingSettings, ...settingsData.recording_settings });
        }

        setSystemInfo(systemData);
      } catch (err) {
        setError('Failed to load camera settings');
        console.error('Error loading camera settings:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCameraSettings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraId]);

  // Handle save settings
  const handleSaveSettings = async () => {
    if (!camera) return;

    try {
      setSaving(true);
      
      // Update camera basic info
      await cameraService.updateCamera(camera.id, basicSettings);
      
      // Update detailed settings
      const settingsData = {
        stream_settings: streamSettings,
        detection_settings: detectionSettings,
        notification_settings: notificationSettings,
        recording_settings: recordingSettings
      };
      
      await cameraService.updateCameraSettings(camera.id, settingsData);
      
      setHasChanges(false);
      toast.success('Settings saved successfully');
    } catch (err) {
      toast.error('Failed to save settings');
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  // Test camera connection
  const handleTestConnection = async () => {
    if (!camera) return;

    try {
      setTesting(true);
      const result = await cameraService.testConnection(camera.id);
      
      if (result.success) {
        toast.success('Connection test successful');
      } else {
        toast.error(`Connection failed: ${result.error}`);
      }
    } catch (err) {
      toast.error('Connection test failed');
    } finally {
      setTesting(false);
    }
  };

  // Reset to defaults
  const handleResetDefaults = () => {
    if (!window.confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
      return;
    }

    setStreamSettings({
      resolution: '1920x1080',
      fps: 30,
      bitrate: 2500,
      quality: 'auto',
      codec: 'h264',
      audio_enabled: false,
      audio_bitrate: 128
    });

    setDetectionSettings({
      enabled: true,
      confidence_threshold: 0.7,
      detection_frequency: 1,
      save_unknown_faces: true,
      blur_unknown_faces: false,
      detection_zones: [],
      excluded_zones: []
    });

    setHasChanges(true);
    toast.success('Settings reset to defaults');
  };

  // Export settings
  const handleExportSettings = () => {
    const exportData = {
      basic_settings: basicSettings,
      stream_settings: streamSettings,
      detection_settings: detectionSettings,
      notification_settings: { ...notificationSettings, webhook_url: '' }, // Remove sensitive data
      recording_settings: recordingSettings,
      exported_at: new Date().toISOString(),
      camera_name: camera?.name
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${camera?.name || 'camera'}_settings.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Settings exported successfully');
  };

  // Helper functions
  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const getStatusColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'text-red-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProgressColor = (value: number) => {
    if (value >= 80) return 'bg-red-500';
    if (value >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !camera) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Camera Not Found</h3>
            <p className="text-gray-600 mb-4">{error || 'The requested camera could not be found.'}</p>
            <Button onClick={() => navigate('/cameras')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Cameras
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/cameras')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <div className="flex items-center space-x-3">
              <Settings className="h-6 w-6 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Camera Settings</h1>
                <p className="text-sm text-gray-600">{camera.name}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestConnection}
              disabled={testing}
            >
              {testing ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <TestTube className="w-4 h-4 mr-2" />
              )}
              Test Connection
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportSettings}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>

            <Button
              onClick={handleSaveSettings}
              disabled={saving || !hasChanges}
              size="sm"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>

        {hasChanges && (
          <Alert className="mt-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              You have unsaved changes. Don't forget to save your settings.
            </AlertDescription>
          </Alert>
        )}
      </header>

      {/* Main Content */}
      <div className="p-6">
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="basic" className="flex items-center space-x-2">
              <Camera className="w-4 h-4" />
              <span>Basic</span>
            </TabsTrigger>
            <TabsTrigger value="stream" className="flex items-center space-x-2">
              <VideoIcon className="w-4 h-4" />
              <span>Stream</span>
            </TabsTrigger>
            <TabsTrigger value="detection" className="flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>Detection</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="w-4 h-4" />
              <span>Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="recording" className="flex items-center space-x-2">
              <RecordIcon className="h-5 w-5" />
              <span>Recording</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center space-x-2">
              <Monitor className="w-4 h-4" />
              <span>System</span>
            </TabsTrigger>
          </TabsList>

          {/* Basic Settings */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Camera className="h-5 w-5" />
                  <span>Basic Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Camera Name</Label>
                    <Input
                      id="name"
                      value={basicSettings.name}
                      onChange={(e) => {
                        setBasicSettings(prev => ({ ...prev, name: e.target.value }));
                        setHasChanges(true);
                      }}
                      placeholder="Enter camera name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={basicSettings.location}
                      onChange={(e) => {
                        setBasicSettings(prev => ({ ...prev, location: e.target.value }));
                        setHasChanges(true);
                      }}
                      placeholder="e.g., Front Entrance, Office Lobby"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={basicSettings.description}
                    onChange={(e) => {
                      setBasicSettings(prev => ({ ...prev, description: e.target.value }));
                      setHasChanges(true);
                    }}
                    placeholder="Enter camera description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={basicSettings.timezone}
                      onValueChange={(value) => {
                        setBasicSettings(prev => ({ ...prev, timezone: value }));
                        setHasChanges(true);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        <SelectItem value="Europe/London">London</SelectItem>
                        <SelectItem value="Europe/Paris">Paris</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                        <SelectItem value="Asia/Shanghai">Shanghai</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Camera Status</Label>
                      <p className="text-sm text-gray-600">Enable or disable this camera</p>
                    </div>
                    <Switch
                      checked={basicSettings.is_active}
                      onCheckedChange={(checked) => {
                        setBasicSettings(prev => ({ ...prev, is_active: checked }));
                        setHasChanges(true);
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stream Settings */}
          <TabsContent value="stream" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Video Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <VideoIcon className="h-5 w-5" />
                    <span>Video Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Resolution</Label>
                    <Select
                      value={streamSettings.resolution}
                      onValueChange={(value) => {
                        setStreamSettings(prev => ({ ...prev, resolution: value }));
                        setHasChanges(true);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3840x2160">4K (3840x2160)</SelectItem>
                        <SelectItem value="1920x1080">Full HD (1920x1080)</SelectItem>
                        <SelectItem value="1280x720">HD (1280x720)</SelectItem>
                        <SelectItem value="854x480">SD (854x480)</SelectItem>
                        <SelectItem value="640x360">Low (640x360)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Frame Rate: {streamSettings.fps} FPS</Label>
                    <Slider
                      value={[streamSettings.fps]}
                      onValueChange={([value]: [number]) => {
                        setStreamSettings(prev => ({ ...prev, fps: value }));
                        setHasChanges(true);
                      }}
                      max={60}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>1 FPS</span>
                      <span>60 FPS</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Bitrate: {streamSettings.bitrate} Kbps</Label>
                    <Slider
                      value={[streamSettings.bitrate]}
                      onValueChange={([value]: [number]) => {
                        setStreamSettings(prev => ({ ...prev, bitrate: value }));
                        setHasChanges(true);
                      }}
                      max={10000}
                      min={500}
                      step={100}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>500 Kbps</span>
                      <span>10 Mbps</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Video Codec</Label>
                    <Select
                      value={streamSettings.codec}
                      onValueChange={(value: any) => {
                        setStreamSettings(prev => ({ ...prev, codec: value }));
                        setHasChanges(true);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="h264">H.264 (Recommended)</SelectItem>
                        <SelectItem value="h265">H.265/HEVC</SelectItem>
                        <SelectItem value="mjpeg">MJPEG</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Quality Preset</Label>
                    <Select
                      value={streamSettings.quality}
                      onValueChange={(value: any) => {
                        setStreamSettings(prev => ({ ...prev, quality: value }));
                        setHasChanges(true);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto</SelectItem>
                        <SelectItem value="high">High Quality</SelectItem>
                        <SelectItem value="medium">Medium Quality</SelectItem>
                        <SelectItem value="low">Low Quality</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Audio Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AudioWaveform className="h-5 w-5" />
                    <span>Audio Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Audio</Label>
                      <p className="text-sm text-gray-600">Record audio with video stream</p>
                    </div>
                    <Switch
                      checked={streamSettings.audio_enabled}
                      onCheckedChange={(checked) => {
                        setStreamSettings(prev => ({ ...prev, audio_enabled: checked }));
                        setHasChanges(true);
                      }}
                    />
                  </div>

                  {streamSettings.audio_enabled && (
                    <div className="space-y-2">
                      <Label>Audio Bitrate: {streamSettings.audio_bitrate} Kbps</Label>
                      <Slider
                        value={[streamSettings.audio_bitrate]}
                        onValueChange={([value]: [number]) => {
                          setStreamSettings(prev => ({ ...prev, audio_bitrate: value }));
                          setHasChanges(true);
                        }}
                        max={320}
                        min={64}
                        step={32}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>64 Kbps</span>
                        <span>320 Kbps</span>
                      </div>
                    </div>
                  )}

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Audio recording may not be legal in all jurisdictions. Please check local laws before enabling.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Detection Settings */}
          <TabsContent value="detection" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Face Detection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Eye className="h-5 w-5" />
                    <span>Face Detection</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Detection</Label>
                      <p className="text-sm text-gray-600">Detect faces in video stream</p>
                    </div>
                    <Switch
                      checked={detectionSettings.enabled}
                      onCheckedChange={(checked) => {
                        setDetectionSettings(prev => ({ ...prev, enabled: checked }));
                        setHasChanges(true);
                      }}
                    />
                  </div>

                  {detectionSettings.enabled && (
                    <>
                      <div className="space-y-2">
                        <Label>Confidence Threshold: {(detectionSettings.confidence_threshold * 100).toFixed(0)}%</Label>
                        <Slider
                          value={[detectionSettings.confidence_threshold]}
                          onValueChange={([value]: [number]) => {
                            setDetectionSettings(prev => ({ ...prev, confidence_threshold: value }));
                            setHasChanges(true);
                          }}
                          max={1}
                          min={0.1}
                          step={0.05}
                          className="w-full"
                        />
                        <p className="text-xs text-gray-500">Higher values reduce false positives</p>
                      </div>

                      <div className="space-y-2">
                        <Label>Detection Frequency</Label>
                        <Select
                          value={detectionSettings.detection_frequency.toString()}
                          onValueChange={(value) => {
                            setDetectionSettings(prev => ({ ...prev, detection_frequency: parseInt(value) }));
                            setHasChanges(true);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Every frame</SelectItem>
                            <SelectItem value="2">Every 2nd frame</SelectItem>
                            <SelectItem value="5">Every 5th frame</SelectItem>
                            <SelectItem value="10">Every 10th frame</SelectItem>
                            <SelectItem value="30">Every 30th frame</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Save Unknown Faces</Label>
                            <p className="text-sm text-gray-600">Store images of unrecognized faces</p>
                          </div>
                          <Switch
                            checked={detectionSettings.save_unknown_faces}
                            onCheckedChange={(checked) => {
                              setDetectionSettings(prev => ({ ...prev, save_unknown_faces: checked }));
                              setHasChanges(true);
                            }}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Blur Unknown Faces</Label>
                            <p className="text-sm text-gray-600">Blur unrecognized faces in recordings</p>
                          </div>
                          <Switch
                            checked={detectionSettings.blur_unknown_faces}
                            onCheckedChange={(checked) => {
                              setDetectionSettings(prev => ({ ...prev, blur_unknown_faces: checked }));
                              setHasChanges(true);
                            }}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Detection Zones */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Detection Zones</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Configure specific areas for face detection. This feature requires the camera stream to be active.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label>Active Detection Zones</Label>
                    {detectionSettings.detection_zones.length > 0 ? (
                      <div className="space-y-2">
                        {detectionSettings.detection_zones.map((zone) => (
                          <div key={zone.id} className="flex items-center justify-between p-2 border rounded">
                            <span className="text-sm">{zone.name}</span>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={zone.enabled}
                                onCheckedChange={(checked) => {
                                  setDetectionSettings(prev => ({
                                    ...prev,
                                    detection_zones: prev.detection_zones.map(z =>
                                      z.id === zone.id ? { ...z, enabled: checked } : z
                                    )
                                  }));
                                  setHasChanges(true);
                                }}
                              />
                              <Button variant="outline" size="sm">
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No detection zones configured</p>
                    )}
                  </div>

                  <Button variant="outline" className="w-full" disabled>
                    <Grid3X3 className="w-4 h-4 mr-2" />
                    Configure Zones (Coming Soon)
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notification Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-gray-600">Send notifications via email</p>
                    </div>
                    <Switch
                      checked={notificationSettings.email_notifications}
                      onCheckedChange={(checked) => {
                        setNotificationSettings(prev => ({ ...prev, email_notifications: checked }));
                        setHasChanges(true);
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="webhook_url">Webhook URL (Optional)</Label>
                    <Input
                      id="webhook_url"
                      type="url"
                      value={notificationSettings.webhook_url}
                      onChange={(e) => {
                        setNotificationSettings(prev => ({ ...prev, webhook_url: e.target.value }));
                        setHasChanges(true);
                      }}
                      placeholder="https://your-webhook-url.com/notifications"
                    />
                    <p className="text-xs text-gray-500">HTTP POST requests will be sent to this URL</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Notification Cooldown: {notificationSettings.notification_cooldown}s</Label>
                    <Slider
                      value={[notificationSettings.notification_cooldown]}
                      onValueChange={([value]: [number]) => {
                        setNotificationSettings(prev => ({ ...prev, notification_cooldown: value }));
                        setHasChanges(true);
                      }}
                      max={3600}
                      min={30}
                      step={30}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>30s</span>
                      <span>1 hour</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-medium">Notification Types</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Unknown Face Detected</Label>
                        <p className="text-sm text-gray-600">Alert when unknown faces are detected</p>
                      </div>
                      <Switch
                        checked={notificationSettings.notify_unknown_faces}
                        onCheckedChange={(checked) => {
                          setNotificationSettings(prev => ({ ...prev, notify_unknown_faces: checked }));
                          setHasChanges(true);
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Known Face Detected</Label>
                        <p className="text-sm text-gray-600">Alert when known faces are detected</p>
                      </div>
                      <Switch
                        checked={notificationSettings.notify_known_faces}
                        onCheckedChange={(checked) => {
                          setNotificationSettings(prev => ({ ...prev, notify_known_faces: checked }));
                          setHasChanges(true);
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>System Events</Label>
                        <p className="text-sm text-gray-600">Alert for system issues and status changes</p>
                      </div>
                      <Switch
                        checked={notificationSettings.notify_system_events}
                        onCheckedChange={(checked) => {
                          setNotificationSettings(prev => ({ ...prev, notify_system_events: checked }));
                          setHasChanges(true);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recording Settings */}
          <TabsContent value="recording" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <RecordIcon className="h-5 w-5" />
                  <span>Recording Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Recording</Label>
                    <p className="text-sm text-gray-600">Automatically record video footage</p>
                  </div>
                  <Switch
                    checked={recordingSettings.enabled}
                    onCheckedChange={(checked) => {
                      setRecordingSettings(prev => ({ ...prev, enabled: checked }));
                      setHasChanges(true);
                    }}
                  />
                </div>

                {recordingSettings.enabled && (
                  <>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Record on Detection</Label>
                          <p className="text-sm text-gray-600">Only record when faces are detected</p>
                        </div>
                        <Switch
                          checked={recordingSettings.record_on_detection}
                          onCheckedChange={(checked) => {
                            setRecordingSettings(prev => ({ ...prev, record_on_detection: checked }));
                            setHasChanges(true);
                          }}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Recording Duration: {recordingSettings.record_duration}s</Label>
                        <Slider
                          value={[recordingSettings.record_duration]}
                          onValueChange={([value]: [number]) => {
                            setRecordingSettings(prev => ({ ...prev, record_duration: value }));
                            setHasChanges(true);
                          }}
                          max={300}
                          min={10}
                          step={5}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>10s</span>
                          <span>5 min</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Storage Retention: {recordingSettings.max_storage_days} days</Label>
                        <Slider
                          value={[recordingSettings.max_storage_days]}
                          onValueChange={([value]: [number]) => {
                            setRecordingSettings(prev => ({ ...prev, max_storage_days: value }));
                            setHasChanges(true);
                          }}
                          max={365}
                          min={1}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>1 day</span>
                          <span>1 year</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Compression Level: {recordingSettings.compression_level}</Label>
                        <Slider
                          value={[recordingSettings.compression_level]}
                          onValueChange={([value]: [number]) => {
                            setRecordingSettings(prev => ({ ...prev, compression_level: value }));
                            setHasChanges(true);
                          }}
                          max={5}
                          min={1}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Low (Large files)</span>
                          <span>High (Small files)</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Record Audio</Label>
                          <p className="text-sm text-gray-600">Include audio in recordings</p>
                        </div>
                        <Switch
                          checked={recordingSettings.record_audio}
                          onCheckedChange={(checked) => {
                            setRecordingSettings(prev => ({ ...prev, record_audio: checked }));
                            setHasChanges(true);
                          }}
                        />
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Information */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Monitor className="h-5 w-5" />
                    <span>System Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {systemInfo ? (
                    <>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <Label className="text-sm">CPU Usage</Label>
                            <span className={`text-sm font-medium ${getStatusColor(systemInfo.cpu_usage, { warning: 70, critical: 90 })}`}>
                              {systemInfo.cpu_usage}%
                            </span>
                          </div>
                          <Progress value={systemInfo.cpu_usage} className={`h-2 ${getProgressColor(systemInfo.cpu_usage)}`} />
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <Label className="text-sm">Memory Usage</Label>
                            <span className={`text-sm font-medium ${getStatusColor(systemInfo.memory_usage, { warning: 80, critical: 95 })}`}>
                              {systemInfo.memory_usage}%
                            </span>
                          </div>
                          <Progress value={systemInfo.memory_usage} className={`h-2 ${getProgressColor(systemInfo.memory_usage)}`} />
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <Label className="text-sm">Disk Usage</Label>
                            <span className={`text-sm font-medium ${getStatusColor(systemInfo.disk_usage, { warning: 80, critical: 95 })}`}>
                              {systemInfo.disk_usage}%
                            </span>
                          </div>
                          <Progress value={systemInfo.disk_usage} className={`h-2 ${getProgressColor(systemInfo.disk_usage)}`} />
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <Label className="text-sm">Temperature</Label>
                            <span className={`text-sm font-medium ${getStatusColor(systemInfo.temperature, { warning: 70, critical: 85 })}`}>
                              {systemInfo.temperature}°C
                            </span>
                          </div>
                          <Progress value={(systemInfo.temperature / 100) * 100} className="h-2" />
                        </div>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <Label className="text-gray-600">Uptime</Label>
                          <p className="font-medium">{formatUptime(systemInfo.uptime)}</p>
                        </div>
                        <div>
                          <Label className="text-gray-600">Firmware</Label>
                          <p className="font-medium">{systemInfo.firmware_version}</p>
                        </div>
                        <div>
                          <Label className="text-gray-600">Upload Speed</Label>
                          <p className="font-medium">{formatBytes(systemInfo.network_speed.upload)}/s</p>
                        </div>
                        <div>
                          <Label className="text-gray-600">Download Speed</Label>
                          <p className="font-medium">{formatBytes(systemInfo.network_speed.download)}/s</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Monitor className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">System information not available</p>
                      <Button variant="outline" size="sm" className="mt-2" onClick={handleTestConnection}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>System Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start" onClick={handleResetDefaults}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset to Defaults
                    </Button>

                    <Button variant="outline" className="w-full justify-start" onClick={handleExportSettings}>
                      <Download className="w-4 h-4 mr-2" />
                      Export Settings
                    </Button>

                    <Button variant="outline" className="w-full justify-start" disabled>
                      <Upload className="w-4 h-4 mr-2" />
                      Import Settings
                    </Button>

                    <Separator />

                    <Button variant="outline" className="w-full justify-start" disabled>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Restart Camera
                    </Button>

                    <Button variant="destructive" className="w-full justify-start" disabled>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Factory Reset
                    </Button>
                  </div>

                  <Alert className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Some actions require physical access to the camera or may cause temporary service interruption.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CameraSettings;