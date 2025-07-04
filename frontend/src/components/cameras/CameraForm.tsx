import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Camera,
  Save,
  TestTube,
  AlertCircle,
  CheckCircle,
  X,
  Eye,
  EyeOff,
  Loader2,
  Settings,
  Wifi,
} from 'lucide-react';
import { toast } from 'sonner';
import { Camera as CameraType, CameraCreate, CameraUpdate } from '@/types/camera.types';

// ✅ FIX: Update interface to accept both Camera and CameraCreate types
interface CameraFormProps {
  camera?: CameraType | CameraCreate | null; // ✅ Accept Camera type from service
  onSave: (camera: CameraCreate | CameraUpdate) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

interface TestResult {
  success: boolean;
  message: string;
  status?: 'success' | 'error' | 'warning';
  details?: {
    resolution?: string;
    fps?: number;
    codec?: string;
    bitrate?: string;
  };
}

const CameraForm: React.FC<CameraFormProps> = ({
  camera,
  onSave,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState<CameraCreate>({
    name: '',
    description: '',
    camera_type: 'ip_camera',
    camera_url: '',
    detection_enabled: true,
    stream_settings: {
      resolution: '1920x1080',
      fps: 30,
      quality: 'high'
    }
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [advancedSettings, setAdvancedSettings] = useState(false);

  // ✅ FIX: Handle both Camera and CameraCreate types properly
  useEffect(() => {
    if (camera) {
      setFormData({
        name: camera.name || '',
        description: camera.description || '',
        location: camera.location || '',
        camera_type: camera.camera_type || 'ip_camera',
        camera_url: camera.camera_url || '',
        detection_enabled: camera.detection_enabled ?? true,
        is_streaming: camera.is_streaming ?? false,
        tags: camera.tags || [],
        stream_settings: {
          resolution: camera.stream_settings?.resolution || '1920x1080',
          fps: camera.stream_settings?.fps || 30,
          quality: camera.stream_settings?.quality || 'high'
        },
        alert_settings: {
          email_alerts: camera.alert_settings?.email_alerts ?? false,
          webhook_url: camera.alert_settings?.webhook_url || ''
        }
      });
    }
  }, [camera]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleStreamSettingChange = (setting: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      stream_settings: {
        ...prev.stream_settings,
        [setting]: value
      }
    }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Camera name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Camera name must be at least 3 characters';
    }

    if (!formData.camera_url?.trim()) {
      newErrors.camera_url = 'Camera URL is required';
    } else if (!isValidCameraUrl(formData.camera_url)) {
      newErrors.camera_url = 'Please enter a valid camera URL';
    }

    if (formData.stream_settings?.fps && (formData.stream_settings.fps < 1 || formData.stream_settings.fps > 60)) {
      newErrors.fps = 'FPS must be between 1 and 60';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidCameraUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return ['rtsp:', 'http:', 'https:', 'rtmp:'].includes(urlObj.protocol);
    } catch {
      // Check for device paths like /dev/video0
      return /^\/dev\/video\d+$/.test(url) || /^\d+$/.test(url);
    }
  };

  const handleTestConnection = async () => {
    if (!formData.camera_url) {
      toast.error('Please enter a camera URL first');
      return;
    }

    if (!isValidCameraUrl(formData.camera_url)) {
      toast.error('Please enter a valid camera URL');
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      console.log('🔍 Testing camera connection with data:', formData);
      
      // Import camera service here to avoid circular dependency
      const { cameraService } = await import('@/services/camera.service');
      const result = await cameraService.testCameraConnection(formData);
      
      // Transform CameraTestResult to TestResult
      const testResult: TestResult = {
        success: result.is_connected || result.status === 'success',
        message: result.message,
        status: result.status,
        details: result.stream_info ? {
          resolution: result.stream_info.resolution,
          fps: result.stream_info.fps,
          codec: result.stream_info.codec,
          bitrate: result.stream_info.bitrate
        } : undefined
      };
      
      setTestResult(testResult);
      
      if (testResult.success) {
        toast.success('Camera connection test successful!', {
          description: testResult.message
        });
      } else {
        toast.error('Camera connection test failed', {
          description: testResult.message
        });
      }
    } catch (error: any) {
      console.error('❌ Camera test error:', error);
      const result: TestResult = {
        success: false,
        message: error.message || 'Connection test failed',
        status: 'error'
      };
      setTestResult(result);
      toast.error('Camera test failed', {
        description: error.message
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    try {
      await onSave(formData);
      // ✅ FIX: Check if camera has id to determine if editing
      const isEditing = !!(camera && 'id' in camera && camera.id);
      toast.success(isEditing ? 'Camera updated successfully' : 'Camera added successfully');
    } catch (error) {
      toast.error('Failed to save camera');
    }
  };

  // ✅ FIX: Determine if editing by checking if camera has id
  const isEditing = !!(camera && 'id' in camera && camera.id);

  const getUrlPlaceholder = () => {
    switch (formData.camera_type) {
      case 'ip_camera':
        return 'rtsp://username:password@192.168.1.100:554/stream';
      case 'rtsp':
        return 'rtsp://192.168.1.100:554/stream1';
      case 'webcam':
        return '/dev/video0 or 0';
      case 'usb':
      case 'usb_camera':
        return '/dev/video1 or 1';
      default:
        return 'Enter camera URL or device path';
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Camera className="h-5 w-5" />
          <span>{isEditing ? 'Edit Camera' : 'Add New Camera'}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 pb-2 border-b">
              <Settings className="h-4 w-4 text-gray-600" />
              <h3 className="text-lg font-medium">Basic Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Camera Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Front Door Camera"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="camera_type">Camera Type *</Label>
                <Select 
                  value={formData.camera_type} 
                  onValueChange={(value) => handleSelectChange('camera_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select camera type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ip_camera">IP Camera (RTSP/HTTP)</SelectItem>
                    <SelectItem value="rtsp">RTSP Camera</SelectItem>
                    <SelectItem value="webcam">Webcam</SelectItem>
                    <SelectItem value="usb">USB Camera</SelectItem>
                    <SelectItem value="usb_camera">USB Camera (Alternative)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Optional description of the camera location and purpose"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., Main Entrance, Office Door"
              />
            </div>
          </div>

          {/* Camera Configuration */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 pb-2 border-b">
              <Wifi className="h-4 w-4 text-gray-600" />
              <h3 className="text-lg font-medium">Connection Settings</h3>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="camera_url">Camera URL / Device Path *</Label>
                <div className="relative">
                  <Input
                    id="camera_url"
                    name="camera_url"
                    type={showPassword ? "text" : "password"}
                    value={formData.camera_url}
                    onChange={handleInputChange}
                    placeholder={getUrlPlaceholder()}
                    className={`pr-20 ${errors.camera_url ? 'border-red-500' : ''}`}
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      className="h-8 w-8 p-0"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleTestConnection}
                      disabled={testing || !formData.camera_url}
                      className="h-8 w-8 p-0"
                    >
                      {testing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <TestTube className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                {errors.camera_url && (
                  <p className="text-sm text-red-500 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.camera_url}
                  </p>
                )}
                <div className="text-xs text-gray-500 space-y-1">
                  <p>• RTSP: rtsp://username:password@ip:port/path</p>
                  <p>• HTTP: http://ip:port/stream</p>
                  <p>• Webcam: /dev/video0 or device number (0, 1, 2...)</p>
                </div>
              </div>

              {/* Test Result */}
              {testResult && (
                <Alert variant={testResult.success ? "default" : "destructive"} className="border-l-4">
                  <div className="flex items-start space-x-2">
                    {testResult.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <AlertDescription className="font-medium">
                        {testResult.message}
                      </AlertDescription>
                      {testResult.success && testResult.details && (
                        <div className="mt-2 text-sm text-gray-600">
                          <div className="grid grid-cols-2 gap-2">
                            <div>Resolution: {testResult.details.resolution}</div>
                            <div>FPS: {testResult.details.fps}</div>
                            <div>Codec: {testResult.details.codec}</div>
                            <div>Bitrate: {testResult.details.bitrate}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Alert>
              )}
            </div>
          </div>

          {/* Stream Settings */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 pb-2 border-b">
              <Settings className="h-4 w-4 text-gray-600" />
              <h3 className="text-lg font-medium">Stream Settings</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="resolution">Resolution</Label>
                <Select 
                  value={formData.stream_settings?.resolution} 
                  onValueChange={(value) => handleStreamSettingChange('resolution', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select resolution" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="640x480">640x480 (VGA)</SelectItem>
                    <SelectItem value="1280x720">1280x720 (HD)</SelectItem>
                    <SelectItem value="1920x1080">1920x1080 (Full HD)</SelectItem>
                    <SelectItem value="2560x1440">2560x1440 (2K)</SelectItem>
                    <SelectItem value="3840x2160">3840x2160 (4K)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fps">Frame Rate (FPS)</Label>
                <Input
                  id="fps"
                  type="number"
                  value={formData.stream_settings?.fps || ''}
                  onChange={(e) => handleStreamSettingChange('fps', parseInt(e.target.value) || 30)}
                  placeholder="30"
                  className={errors.fps ? 'border-red-500' : ''}
                />
                {errors.fps && (
                  <p className="text-sm text-red-500">{errors.fps}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="quality">Quality</Label>
                <Select 
                  value={formData.stream_settings?.quality} 
                  onValueChange={(value) => handleStreamSettingChange('quality', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select quality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (Faster)</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High (Better Quality)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Detection Settings */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 pb-2 border-b">
              <AlertCircle className="h-4 w-4 text-gray-600" />
              <h3 className="text-lg font-medium">Detection Settings</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="detection_enabled">Enable Face Detection</Label>
                  <p className="text-sm text-gray-600">Automatically detect faces in the camera feed</p>
                </div>
                <Switch
                  id="detection_enabled"
                  checked={formData.detection_enabled}
                  onCheckedChange={(checked) => handleSwitchChange('detection_enabled', checked)}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex space-x-4 pt-6 border-t">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isEditing ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? 'Update Camera' : 'Add Camera'}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CameraForm;