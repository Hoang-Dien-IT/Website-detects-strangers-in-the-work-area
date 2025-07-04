import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Camera,
  MoreVertical,
  Play,
  Square,
  Eye,
  Settings,
  Trash2,
  AlertCircle,
  MapPin,
  Clock,
  Signal,
  SignalHigh,
  SignalLow,
  Wifi,
  WifiOff,
  Video,
  VideoOff,
  Activity,
  Users,
  CheckCircle,
  XCircle,
  Monitor,
  Zap
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { Camera as CameraType } from '@/types/camera.types';
import { toast } from 'sonner';

// ✅ FIX: Enhanced interface matching backend capabilities from #backend
interface CameraCardProps {
  camera: CameraType;
  onEdit: (camera: CameraType) => void;
  onDelete: (camera: CameraType) => void;
  onStartStream: (camera: CameraType) => void;
  onStopStream: (camera: CameraType) => void;
  onTestConnection: (camera: CameraType) => void;
  onToggleDetection?: (camera: CameraType) => void;
  onTakeSnapshot?: (camera: CameraType) => void; // ✅ ADD: Snapshot functionality from #backend
  streamStats?: {
    viewers: number;
    uptime: string;
    bandwidth: string;
    frame_rate?: number;
    resolution?: string;
  };
  loading?: boolean;
}

const CameraCard: React.FC<CameraCardProps> = ({
  camera,
  onEdit,
  onDelete,
  onStartStream,
  onStopStream,
  onTestConnection,
  onToggleDetection,
  onTakeSnapshot,
  streamStats,
  loading = false
}) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const [snapshotLoading, setSnapshotLoading] = useState(false);

  // ✅ FIX: Enhanced status badge logic
  const getStatusBadge = () => {
    if (camera.is_streaming) {
      return (
        <Badge className="bg-green-500 text-white shadow-sm">
          <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse" />
          Live
        </Badge>
      );
    } else if (camera.is_active) {
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Ready</Badge>;
    } else {
      return <Badge variant="destructive" className="bg-red-100 text-red-800">Offline</Badge>;
    }
  };

  // ✅ FIX: Enhanced signal icon with better logic
  const getSignalIcon = () => {
    if (camera.is_streaming) {
      return <SignalHigh className="h-4 w-4 text-green-500" />;
    } else if (camera.is_active) {
      return <Signal className="h-4 w-4 text-yellow-500" />;
    } else {
      return <SignalLow className="h-4 w-4 text-red-500" />;
    }
  };

  // ✅ FIX: Enhanced connection icon
  const getConnectionIcon = () => {
    if (camera.is_streaming || camera.is_active) {
      return <Wifi className="h-4 w-4 text-green-500" />;
    } else {
      return <WifiOff className="h-4 w-4 text-red-500" />;
    }
  };

  // ✅ FIX: Better date formatting
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  // ✅ FIX: Enhanced uptime formatting
  const formatUptime = (uptime: string | number) => {
    try {
      const seconds = typeof uptime === 'string' ? parseInt(uptime) : uptime;
      if (isNaN(seconds)) return '0m';
      
      const days = Math.floor(seconds / 86400);
      const hours = Math.floor((seconds % 86400) / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      
      if (days > 0) return `${days}d ${hours}h`;
      if (hours > 0) return `${hours}h ${minutes}m`;
      return `${minutes}m`;
    } catch {
      return '0m';
    }
  };

  // ✅ FIX: Enhanced preview URL logic matching #backend endpoints
  const getPreviewUrl = () => {
    if (camera.is_streaming) {
      return `/api/stream/${camera.id}/snapshot`;
    }
    return null;
  };

  // ✅ FIX: Enhanced snapshot function
  const handleTakeSnapshot = async () => {
    if (!onTakeSnapshot) return;
    
    setSnapshotLoading(true);
    try {
      await onTakeSnapshot(camera);
      toast.success('Snapshot taken successfully');
    } catch (error: any) {
      toast.error(`Failed to take snapshot: ${error.message || 'Unknown error'}`);
    } finally {
      setSnapshotLoading(false);
    }
  };

  // ✅ FIX: Enhanced camera type display
  const getCameraTypeDisplay = () => {
    switch (camera.camera_type) {
      case 'webcam':
        return { label: 'Webcam', icon: Monitor };
      case 'ip_camera':
        return { label: 'IP Camera', icon: Camera };
      case 'usb_camera':
        return { label: 'USB Camera', icon: Monitor };
      default:
        return { label: camera.camera_type, icon: Camera };
    }
  };

  const cameraTypeInfo = getCameraTypeDisplay();
  const CameraTypeIcon = cameraTypeInfo.icon;

  // ✅ FIX: Enhanced URL masking for security
  const getMaskedUrl = (url: string) => {
    try {
      // Replace credentials in URL for security
      return url.replace(/(:\/\/[^:]+:)[^@]+(@)/, '$1***$2');
    } catch {
      return 'Invalid URL';
    }
  };

  // ✅ FIX: Enhanced protocol detection
  const getProtocolInfo = (url: string) => {
    try {
      if (url.startsWith('rtsp://')) return { protocol: 'RTSP', color: 'blue' };
      if (url.startsWith('http://') || url.startsWith('https://')) return { protocol: 'HTTP', color: 'green' };
      if (url.startsWith('ws://') || url.startsWith('wss://')) return { protocol: 'WebSocket', color: 'purple' };
      return { protocol: 'Custom', color: 'gray' };
    } catch {
      return { protocol: 'Unknown', color: 'gray' };
    }
  };

  const protocolInfo = getProtocolInfo(camera.camera_url || '');

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500 group">
      <CardContent className="p-0">
        {/* Camera Preview/Placeholder */}
        <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
          {camera.is_streaming ? (
            <div className="relative w-full h-full">
              {!imageError ? (
                <img
                  src={getPreviewUrl() || ''}
                  alt={`${camera.name} preview`}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-12 h-12 bg-white/20 rounded-full mx-auto mb-3 animate-pulse flex items-center justify-center">
                      <div className="w-4 h-4 bg-white rounded-full animate-ping" />
                    </div>
                    <p className="text-sm font-medium">Live Stream</p>
                    <p className="text-xs opacity-75">
                      {camera.stream_settings?.resolution || '1920x1080'} @ {camera.stream_settings?.fps || 30}fps
                    </p>
                  </div>
                </div>
              )}
              
              {/* Live indicator */}
              <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center shadow-lg">
                <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse" />
                LIVE
              </div>

              {/* Viewer count */}
              {streamStats && (
                <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-md text-xs flex items-center backdrop-blur-sm">
                  <Users className="w-3 h-3 mr-1" />
                  {streamStats.viewers}
                </div>
              )}

              {/* Frame rate indicator */}
              {streamStats?.frame_rate && (
                <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded-md text-xs flex items-center backdrop-blur-sm">
                  <Zap className="w-3 h-3 mr-1" />
                  {streamStats.frame_rate} FPS
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <div className="text-center">
                <div className="relative">
                  <CameraTypeIcon className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                  {camera.is_active ? (
                    <CheckCircle className="w-6 h-6 text-green-500 absolute -bottom-1 -right-1 bg-white rounded-full" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500 absolute -bottom-1 -right-1 bg-white rounded-full" />
                  )}
                </div>
                <p className="text-sm text-gray-600 font-medium">
                  {camera.is_active ? 'Camera Ready' : 'Camera Offline'}
                </p>
                <p className="text-xs text-gray-500">
                  {camera.is_active ? 'Click to start streaming' : 'Check connection'}
                </p>
              </div>
            </div>
          )}

          {/* Status Overlay */}
          <div className="absolute top-3 left-3">
            {getStatusBadge()}
          </div>

          {/* Detection Status */}
          {camera.detection_enabled && (
            <div className="absolute bottom-3 left-3">
              <Badge variant="outline" className="bg-white/90 text-purple-600 border-purple-200 shadow-sm">
                <Activity className="w-3 h-3 mr-1" />
                Detection ON
              </Badge>
            </div>
          )}

          {/* Signal Strength */}
          <div className="absolute top-3 right-3 bg-black/50 rounded-full p-2 backdrop-blur-sm">
            {getSignalIcon()}
          </div>

          {/* Actions Overlay - Enhanced */}
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="secondary" className="h-8 w-8 p-0 backdrop-blur-sm bg-white/80 hover:bg-white/90">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate(`/cameras/${camera.id}`)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(`/cameras/${camera.id}/stream`)}>
                  <Video className="h-4 w-4 mr-2" />
                  Full Stream
                </DropdownMenuItem>
                {/* ✅ ADD: Snapshot functionality */}
                {onTakeSnapshot && (
                  <DropdownMenuItem 
                    onClick={handleTakeSnapshot}
                    disabled={snapshotLoading || !camera.is_active}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    {snapshotLoading ? 'Taking...' : 'Take Snapshot'}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onEdit(camera)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Camera
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onTestConnection(camera)}>
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Test Connection
                </DropdownMenuItem>
                {onToggleDetection && (
                  <DropdownMenuItem onClick={() => onToggleDetection(camera)}>
                    {camera.detection_enabled ? (
                      <>
                        <VideoOff className="h-4 w-4 mr-2" />
                        Disable Detection
                      </>
                    ) : (
                      <>
                        <Video className="h-4 w-4 mr-2" />
                        Enable Detection
                      </>
                    )}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDelete(camera)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Camera
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Camera Info */}
        <div className="p-4">
          <div className="space-y-3">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-900 truncate flex-1">
                  {camera.name}
                </h3>
                <div className="flex items-center space-x-1 ml-2">
                  {getConnectionIcon()}
                  <Badge variant="outline" className="text-xs">
                    <CameraTypeIcon className="w-3 h-3 mr-1" />
                    {cameraTypeInfo.label}
                  </Badge>
                </div>
              </div>
              {camera.description && (
                <p className="text-sm text-gray-600 truncate">
                  {camera.description}
                </p>
              )}
            </div>

            {/* Location and Date */}
            <div className="space-y-2">
              {camera.location && (
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{camera.location}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                  <span>Added {formatDate(camera.created_at)}</span>
                </div>
                {camera.last_online && (
                  <span className="text-xs text-gray-500">
                    Last seen: {formatDate(camera.last_online)}
                  </span>
                )}
              </div>
            </div>

            {/* Stream Stats - Enhanced */}
            {camera.is_streaming && streamStats && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs text-green-600 font-medium">Uptime</p>
                    <p className="text-sm font-bold text-green-800">
                      {formatUptime(streamStats.uptime)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-green-600 font-medium">Viewers</p>
                    <p className="text-sm font-bold text-green-800">{streamStats.viewers}</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-600 font-medium">Quality</p>
                    <p className="text-sm font-bold text-green-800">
                      {camera.stream_settings?.quality || 'HD'}
                    </p>
                  </div>
                </div>
                {/* ✅ ADD: Additional stats row */}
                {(streamStats.bandwidth || streamStats.frame_rate) && (
                  <div className="grid grid-cols-2 gap-2 text-center mt-2 pt-2 border-t border-green-200">
                    {streamStats.bandwidth && (
                      <div>
                        <p className="text-xs text-green-600 font-medium">Bandwidth</p>
                        <p className="text-sm font-bold text-green-800">{streamStats.bandwidth}</p>
                      </div>
                    )}
                    {streamStats.frame_rate && (
                      <div>
                        <p className="text-xs text-green-600 font-medium">FPS</p>
                        <p className="text-sm font-bold text-green-800">{streamStats.frame_rate}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Stream URL Info - Enhanced */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-500 font-medium">Stream Source</p>
                <Badge 
                  variant="outline" 
                  className={`text-xs border-${protocolInfo.color}-200 text-${protocolInfo.color}-700`}
                >
                  {protocolInfo.protocol}
                </Badge>
              </div>
              <div className="bg-white rounded border p-2">
                <p className="text-xs font-mono text-gray-700 truncate">
                  {getMaskedUrl(camera.camera_url || '')}
                </p>
                {/* ✅ ADD: URL status indicator */}
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">
                    {camera.camera_type === 'webcam' ? 'Local device' : 'Network source'}
                  </span>
                  {camera.is_active && (
                    <div className="flex items-center text-xs text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                      Connected
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons - Enhanced */}
            <div className="flex space-x-2 pt-2">
              {camera.is_streaming ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onStopStream(camera)}
                  className="flex-1"
                  disabled={loading}
                >
                  <Square className="w-4 h-4 mr-1" />
                  {loading ? 'Stopping...' : 'Stop Stream'}
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => onStartStream(camera)}
                  className="flex-1"
                  disabled={!camera.is_active || loading}
                >
                  <Play className="w-4 h-4 mr-1" />
                  {loading ? 'Starting...' : 'Start Stream'}
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/cameras/${camera.id}`)}
                className="px-3"
                title="View Details"
              >
                <Eye className="w-4 h-4" />
              </Button>
              {/* ✅ ADD: Quick snapshot button */}
              {onTakeSnapshot && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleTakeSnapshot}
                  className="px-3"
                  disabled={!camera.is_active || snapshotLoading}
                  title="Take Snapshot"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CameraCard;