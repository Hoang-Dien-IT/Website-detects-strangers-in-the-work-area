import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  Eye,
  Clock,
  Users,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '@/services/api';

interface PresenceInfo {
  person_name: string;
  detection_type: string;
  first_detected: string;
  last_detected: string;
  duration: string;
  detection_count: number;
}

interface CameraTracking {
  camera_name: string;
  active_presences: number;
  presences: Record<string, PresenceInfo>;
}

interface TrackingOverview {
  total_presences: number;
  cameras_with_activity: number;
  tracking_details: Record<string, CameraTracking>;
  system_status: string;
}

const DetectionTrackingDashboard: React.FC = () => {
  const [trackingData, setTrackingData] = useState<TrackingOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTrackingData = async () => {
    try {
      const response = await apiService.get<TrackingOverview>('/admin/detection-tracking');
      setTrackingData(response.data);
    } catch (error) {
      console.error('Error loading tracking data:', error);
      toast.error('Failed to load detection tracking data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTrackingData();
    setRefreshing(false);
    toast.success('Tracking data refreshed');
  };

  const handleReset = async () => {
    try {
      await apiService.post('/admin/detection-tracking/reset');
      toast.success('Detection tracking reset successfully');
      await loadTrackingData();
    } catch (error) {
      console.error('Error resetting tracking:', error);
      toast.error('Failed to reset detection tracking');
    }
  };

  const formatDuration = (duration: string) => {
    try {
      const seconds = parseInt(duration);
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      
      if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s`;
      } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
      } else {
        return `${secs}s`;
      }
    } catch {
      return duration;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'idle':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getDetectionTypeColor = (type: string) => {
    switch (type) {
      case 'known_person':
        return 'bg-green-100 text-green-800';
      case 'stranger':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    loadTrackingData();
    
    // Auto refresh every 5 seconds
    const interval = setInterval(loadTrackingData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Detection Tracking</h1>
          <p className="text-gray-600 mt-2">
            Real-time monitoring of face detection tracking system
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className={getStatusColor(trackingData?.system_status || 'idle')}>
            <Activity className="h-3 w-3 mr-1" />
            {trackingData?.system_status || 'Unknown'}
          </Badge>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="destructive"
            onClick={handleReset}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Reset Tracking
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Active Presences</p>
                <p className="text-2xl font-bold">{trackingData?.total_presences || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cameras with Activity</p>
                <p className="text-2xl font-bold">{trackingData?.cameras_with_activity || 0}</p>
              </div>
              <Eye className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">System Status</p>
                <p className="text-2xl font-bold capitalize">
                  {trackingData?.system_status || 'Unknown'}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Camera Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            Camera Activity Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trackingData?.tracking_details && Object.keys(trackingData.tracking_details).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(trackingData.tracking_details).map(([cameraId, camera]) => (
                <Card key={cameraId} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>{camera.camera_name}</span>
                      <Badge variant="secondary">
                        {camera.active_presences} present
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(camera.presences).map(([presenceId, presence]) => (
                        <div key={presenceId} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{presence.person_name}</span>
                            <Badge className={getDetectionTypeColor(presence.detection_type)}>
                              {presence.detection_type}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              Duration: {formatDuration(presence.duration)}
                            </div>
                            <div>
                              Detections: {presence.detection_count}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No active detection tracking found</p>
              <p className="text-sm">Start camera streaming to see detection tracking</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DetectionTrackingDashboard;
