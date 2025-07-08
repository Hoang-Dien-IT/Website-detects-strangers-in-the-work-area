import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Camera,
  Play,
  Square,
  CheckCircle,
  Clock,
  User,
  RefreshCw,
  Bell,
  Shield,
  Eye,
  Activity,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebSocketContext } from '@/contexts/WebSocketContext';
import { detectionService } from '@/services/detection.service';
import { cameraService } from '@/services/camera.service';
import { toast } from 'sonner';
import StreamPlayer from '@/components/stream/StreamPlayer';

interface LiveDetectionEvent {
  id: string;
  camera_id: string;
  camera_name: string;
  person_name?: string;
  confidence: number;
  timestamp: string;
  image_url?: string;
  status: 'new' | 'acknowledged' | 'resolved';
}

const LiveDetectionPage: React.FC = () => {
  const { isConnected, lastMessage } = useWebSocketContext();
  const [liveDetections, setLiveDetections] = useState<LiveDetectionEvent[]>([]);
  const [activeCameras, setActiveCameras] = useState<any[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState<string>('all');

  const loadActiveCameras = async () => {
    try {
      const cameras = await cameraService.getCameras();
      setActiveCameras(cameras.filter(c => c.is_active && c.detection_enabled));
    } catch (error) {
      console.error('Error loading cameras:', error);
      toast.error('Failed to load cameras');
    }
  };

  const loadRecentDetections = async () => {
    try {
      const detections = await detectionService.getDetections();
      const detectionsArray = Array.isArray(detections) ? detections : detections.detections || [];
      const liveEvents: LiveDetectionEvent[] = detectionsArray.map((d: any) => ({
        id: d.id,
        camera_id: d.camera_id,
        camera_name: d.camera_name || 'Unknown Camera',
        person_name: d.person_name,
        confidence: d.confidence || 0,
        timestamp: d.timestamp || d.created_at,
        image_url: d.image_url,
        status: 'new' as const,
      }));
      setLiveDetections(liveEvents);
    } catch (error) {
      console.error('Error loading recent detections:', error);
    }
  };

  const handleNewDetection = (detection: any) => {
    const newEvent: LiveDetectionEvent = {
      id: Date.now().toString(),
      camera_id: detection.camera_id,
      camera_name: detection.camera_name || 'Unknown Camera',
      person_name: detection.person_name,
      confidence: detection.confidence || 0,
      timestamp: new Date().toISOString(),
      status: 'new',
    };

    setLiveDetections(prev => [newEvent, ...prev.slice(0, 49)]); // Keep last 50

    // Show toast notification
    toast.success(
      `New detection: ${detection.person_name || 'Unknown Person'} on ${detection.camera_name}`,
      {
        duration: 5000,
        action: {
          label: 'View',
          onClick: () => setSelectedCamera(detection.camera_id),
        },
      }
    );
  };

  const acknowledgeDetection = (detectionId: string) => {
    setLiveDetections(prev =>
      prev.map(d =>
        d.id === detectionId
          ? { ...d, status: 'acknowledged' as const }
          : d
      )
    );
  };

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
    if (!isMonitoring) {
      toast.success('Live monitoring started');
    } else {
      toast.info('Live monitoring stopped');
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'acknowledged':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const filteredDetections = selectedCamera === 'all' 
    ? liveDetections 
    : liveDetections.filter(d => d.camera_id === selectedCamera);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        loadActiveCameras(),
        loadRecentDetections(),
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  useEffect(() => {
    if (lastMessage) {
      try {
        const message = JSON.parse(lastMessage.data);
        if (message.type === 'detection_alert') {
          handleNewDetection(message.data);
        }
      } catch (error) {
        console.warn('Failed to parse WebSocket message:', error);
      }
    }
  }, [lastMessage]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Live Detection</h1>
          <p className="text-gray-600 mt-2">
            Real-time face detection monitoring
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge
            variant={isConnected ? 'default' : 'destructive'}
            className="flex items-center space-x-1"
          >
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </Badge>
          <Button
            onClick={toggleMonitoring}
            variant={isMonitoring ? 'destructive' : 'default'}
          >
            {isMonitoring ? (
              <>
                <Square className="h-4 w-4 mr-2" />
                Stop Monitoring
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start Monitoring
              </>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Cameras</p>
                <p className="text-2xl font-bold">{activeCameras.length}</p>
              </div>
              <Camera className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Live Detections</p>
                <p className="text-2xl font-bold">{filteredDetections.length}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">New Alerts</p>
                <p className="text-2xl font-bold">
                  {filteredDetections.filter(d => d.status === 'new').length}
                </p>
              </div>
              <Bell className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monitoring</p>
                <p className="text-2xl font-bold">
                  {isMonitoring ? 'ON' : 'OFF'}
                </p>
              </div>
              <Shield className={`h-8 w-8 ${isMonitoring ? 'text-green-500' : 'text-gray-400'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Detection Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Camera Preview */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Camera Preview</span>
                <select
                  value={selectedCamera}
                  onChange={(e) => setSelectedCamera(e.target.value)}
                  className="text-sm border rounded px-2 py-1"
                >
                  <option value="all">All Cameras</option>
                  {activeCameras.map(camera => (
                    <option key={camera.id} value={camera.id}>
                      {camera.name}
                    </option>
                  ))}
                </select>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeCameras.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeCameras
                    .filter(camera => selectedCamera === 'all' || camera.id === selectedCamera)
                    .slice(0, 4)
                    .map(camera => (
                      <StreamPlayer
                        key={camera.id}
                        cameraId={camera.id}
                        cameraName={camera.name}
                        className="aspect-video"
                      />
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No active cameras with detection enabled</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detection Events */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Detections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              <AnimatePresence>
                {filteredDetections.map(detection => (
                  <motion.div
                    key={detection.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-3 border rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium text-sm">
                            {detection.person_name || 'Unknown Person'}
                          </span>
                          <Badge className={getStatusColor(detection.status)}>
                            {detection.status}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <Camera className="h-3 w-3" />
                          <span>{detection.camera_name}</span>
                          <Clock className="h-3 w-3" />
                          <span>{formatTime(detection.timestamp)}</span>
                        </div>
                        <div className="mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {(detection.confidence * 100).toFixed(1)}% confidence
                          </Badge>
                        </div>
                      </div>
                      {detection.status === 'new' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => acknowledgeDetection(detection.id)}
                          className="ml-2"
                        >
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {filteredDetections.length === 0 && (
                <div className="text-center py-8">
                  <Eye className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No recent detections</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LiveDetectionPage;