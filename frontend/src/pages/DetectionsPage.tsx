import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Eye,
  Search,
  RefreshCw,
  Filter,
  Download,
  Calendar,
  Clock,
  Camera,
  Activity,
  AlertTriangle,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Trash2,
  Shield,
  Target,
  MapPin,
  Wifi,
  WifiOff,
  Settings
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { detectionService, Detection, DetectionResponse } from '@/services/detection.service';
import { cameraService } from '@/services/camera.service';
import { useWebSocketContext } from '@/contexts/WebSocketContext';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

// ✅ FIX: Update interfaces to match service types
interface DetectionCamera {
  id: string;
  name: string;
  location?: string;
  is_active: boolean;
  camera_type?: string;
}

interface DetectionStats {
  total_detections: number;
  stranger_detections: number;
  known_person_detections: number;
  today_detections: number;
  this_week_detections: number;
  cameras_active: number;
  detection_rate_per_day?: number;
}

interface DetectionFilter {
  limit?: number;
  offset?: number;
  camera_id?: string;
  detection_type?: string;
  start_date?: string;
  end_date?: string;
}

interface PaginationState {
  total: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface CleanupDialogState {
  open: boolean;
  daysToKeep: number;
  loading: boolean;
}

const DetectionsPage: React.FC = () => {
  const { isConnected } = useWebSocketContext();

  // ✅ Enhanced state management
  const [detections, setDetections] = useState<Detection[]>([]);
  const [cameras, setCameras] = useState<DetectionCamera[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDetection, setSelectedDetection] = useState<Detection | null>(null);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [cleanupDialog, setCleanupDialog] = useState<CleanupDialogState>({
    open: false,
    daysToKeep: 30,
    loading: false
  });
  
  // ✅ FIX: Proper default values aligned with backend
  const [filters, setFilters] = useState<DetectionFilter>({
    limit: 20,
    offset: 0
  });
  
  const [stats, setStats] = useState<DetectionStats>({
    total_detections: 0,
    stranger_detections: 0,
    known_person_detections: 0,
    today_detections: 0,
    this_week_detections: 0,
    cameras_active: 0
  });
  
  const [pagination, setPagination] = useState<PaginationState>({
    total: 0,
    currentPage: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  });

  // ✅ Load initial data
  useEffect(() => {
    Promise.all([
      loadDetections(),
      loadCameras(),
      loadStats()
    ]);
  }, []);

  // ✅ Load detections when filters change
  useEffect(() => {
    if (!loading) {
      loadDetections();
    }
  }, [filters]);

  // ✅ FIX: Enhanced loadDetections with proper response handling
  const loadDetections = async () => {
    try {
      if (!loading) setRefreshing(true);
      
      console.log('🔵 DetectionsPage: Loading detections with filters:', filters);
      
      const response = await detectionService.getDetections(filters);
      console.log('✅ DetectionsPage: Detections loaded:', response);
      
      // ✅ FIX: Handle both response formats properly
      if (Array.isArray(response)) {
        // Direct array response
        setDetections(response);
        setPagination(prev => ({
          ...prev,
          total: response.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }));
      } else if (response && typeof response === 'object' && 'detections' in response) {
        // Paginated response
        const paginatedResponse = response as DetectionResponse;
        setDetections(paginatedResponse.detections);
        updatePagination(paginatedResponse);
      } else {
        console.warn('⚠️ DetectionsPage: Unexpected response format:', response);
        setDetections([]);
      }
      
      if (!loading) {
        toast.success('✅ Detections refreshed');
      }
      
    } catch (error: any) {
      console.error('❌ DetectionsPage: Error loading detections:', error);
      
      let errorMessage = 'Failed to load detections';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      toast.error(errorMessage);
      setDetections([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ✅ Helper function to update pagination from response
  const updatePagination = (response: DetectionResponse) => {
    setPagination({
      total: response.total,
      currentPage: response.page,
      totalPages: response.pages,
      hasNext: response.has_next,
      hasPrev: response.has_prev
    });
  };

  const loadCameras = async () => {
    try {
      console.log('🔵 DetectionsPage: Loading cameras...');
      const camerasData = await cameraService.getCameras();
      
      // Transform cameras to match DetectionCamera interface
      const transformedCameras: DetectionCamera[] = camerasData.map(camera => ({
        id: camera.id,
        name: camera.name,
        location: camera.location,
        is_active: camera.is_active,
        camera_type: camera.camera_type
      }));
      
      setCameras(transformedCameras);
      console.log('✅ DetectionsPage: Cameras loaded:', transformedCameras.length);
    } catch (error: any) {
      console.error('❌ DetectionsPage: Error loading cameras:', error);
      toast.error('Failed to load cameras');
    }
  };

  const loadStats = async () => {
    try {
      console.log('🔵 DetectionsPage: Loading detection stats...');
      const statsData = await detectionService.getDetectionStats();
      
      // Transform stats to match our interface
      const transformedStats: DetectionStats = {
        total_detections: statsData.overview?.total_detections || 0,
        stranger_detections: statsData.overview?.stranger_detections || 0,
        known_person_detections: statsData.overview?.known_person_detections || 0,
        today_detections: statsData.time_based?.today || 0,
        this_week_detections: statsData.time_based?.this_week || 0,
        cameras_active: statsData.camera_stats?.active_cameras || 0,
        detection_rate_per_day: statsData.overview?.total_detections ? 
          (statsData.overview.total_detections / 7) : 0
      };
      
      setStats(transformedStats);
      console.log('✅ DetectionsPage: Stats loaded:', transformedStats);
    } catch (error: any) {
      console.error('❌ DetectionsPage: Error loading stats:', error);
      // Keep default stats on error
    }
  };

  const handleDeleteDetection = async (detectionId: string) => {
    try {
      console.log('🗑️ DetectionsPage: Deleting detection:', detectionId);
      await detectionService.deleteDetection(detectionId);
      
      // Remove from local state
      setDetections(prev => prev.filter(d => d.id !== detectionId));
      toast.success('Detection deleted successfully');
      
      // Refresh stats
      loadStats();
    } catch (error: any) {
      console.error('❌ DetectionsPage: Error deleting detection:', error);
      toast.error('Failed to delete detection');
    }
  };

  const handlePageChange = (newPage: number) => {
    const newOffset = (newPage - 1) * (filters.limit || 20);
    setFilters(prev => ({ ...prev, offset: newOffset }));
  };

  const handleFilterChange = (key: keyof DetectionFilter, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, offset: 0 }));
  };

  const clearFilters = () => {
    setFilters({ limit: 20, offset: 0 });
    setSearchTerm('');
  };

  const handleExportDetections = async () => {
    try {
      toast.info('📤 Exporting detections...');
      console.log('🔵 DetectionsPage: Exporting detections with filters:', filters);
      
      // Get all detections (remove pagination for export)
      const exportFilters = { ...filters, limit: 10000, offset: 0 };
      const response = await detectionService.getDetections(exportFilters);
      const exportDetections = Array.isArray(response) ? response : 
        (response && 'detections' in response ? response.detections : []);
      
      if (exportDetections.length === 0) {
        toast.warning('⚠️ No detections to export');
        return;
      }
      
      // ✅ Create proper CSV with headers
      const csvHeaders = [
        'ID',
        'Date & Time',
        'Camera Name',
        'Camera Location',
        'Detection Type',
        'Person Name',
        'Confidence (%)',
        'Similarity Score (%)',
        'Alert Sent',
        'Bounding Box'
      ];
      
      const csvRows = exportDetections.map(detection => [
        detection.id,
        new Date(detection.timestamp).toLocaleString(),
        detection.camera_name || 'Unknown',
        detection.location || '',
        detection.detection_type === 'stranger' ? 'Unknown Person' : 'Known Person',
        detection.person_name || 'N/A',
        (detection.confidence * 100).toFixed(1),
        detection.similarity_score ? (detection.similarity_score * 100).toFixed(1) : 'N/A',
        detection.is_alert_sent ? 'Yes' : 'No',
        detection.bbox ? detection.bbox.join(',') : 'N/A'
      ]);
      
      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
      
      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `detections_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success(`✅ Exported ${exportDetections.length} detections`);
    } catch (error: any) {
      console.error('❌ DetectionsPage: Error exporting detections:', error);
      toast.error('Failed to export detections');
    }
  };

  const handleCleanupDetections = async () => {
    try {
      setCleanupDialog(prev => ({ ...prev, loading: true }));
      console.log('🧹 DetectionsPage: Cleaning up detections older than', cleanupDialog.daysToKeep, 'days');
      
      const result = await detectionService.cleanupOldDetections(cleanupDialog.daysToKeep);
      console.log('✅ DetectionsPage: Cleanup completed:', result);
      
      toast.success(`✅ Cleaned up old detections`);
      setCleanupDialog({ open: false, daysToKeep: 30, loading: false });
      
      // Reload data
      loadDetections();
      loadStats();
    } catch (error: any) {
      console.error('❌ DetectionsPage: Error cleaning up detections:', error);
      toast.error('Failed to cleanup detections');
      setCleanupDialog(prev => ({ ...prev, loading: false }));
    }
  };

  // ✅ Utility functions
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const detectionTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - detectionTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const formatConfidence = (confidence: number) => {
    return `${(confidence * 100).toFixed(1)}%`;
  };

  // ✅ Filter detections based on search term
  const filteredDetections = detections.filter(detection => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      detection.person_name?.toLowerCase().includes(searchLower) ||
      detection.camera_name?.toLowerCase().includes(searchLower) ||
      detection.location?.toLowerCase().includes(searchLower) ||
      detection.detection_type.toLowerCase().includes(searchLower) ||
      detection.id.toLowerCase().includes(searchLower)
    );
  });

  // ✅ Enhanced loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading detections...</p>
          <p className="text-gray-500 text-sm mt-2">This may take a few moments</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-6">
      {/* Header Section */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
          {/* Title and Status */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Detection Activity</h1>
                <div className="flex items-center space-x-4 mt-1">
                  <p className="text-gray-600">Real-time face detection monitoring</p>
                  {isConnected ? (
                    <div className="flex items-center space-x-1 text-emerald-600">
                      <Wifi className="h-4 w-4" />
                      <span className="text-sm font-medium">Live Updates</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-red-600">
                      <WifiOff className="h-4 w-4" />
                      <span className="text-sm font-medium">Disconnected</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                loadDetections();
                loadStats();
              }}
              disabled={refreshing}
              className="shadow-sm hover:shadow-md transition-shadow"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportDetections}
              className="shadow-sm hover:shadow-md transition-shadow"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCleanupDialog(prev => ({ ...prev, open: true }))}
              className="shadow-sm hover:shadow-md transition-shadow"
            >
              <Settings className="h-4 w-4 mr-2" />
              Cleanup
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Detections</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total_detections.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.today_detections} today
                    {stats.detection_rate_per_day && (
                      <span> • {stats.detection_rate_per_day.toFixed(1)}/day avg</span>
                    )}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Known Persons</p>
                <p className="text-3xl font-bold text-emerald-600">{stats.known_person_detections.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.total_detections > 0 
                    ? `${((stats.known_person_detections / stats.total_detections) * 100).toFixed(1)}% of total`
                    : '0% of total'
                  }
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unknown Persons</p>
                <p className="text-3xl font-bold text-red-600">{stats.stranger_detections.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.total_detections > 0 
                    ? `${((stats.stranger_detections / stats.total_detections) * 100).toFixed(1)}% of total`
                    : '0% of total'
                  }
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Cameras</p>
                <p className="text-3xl font-bold text-purple-600">{stats.cameras_active.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {cameras.length} total cameras
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Camera className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Section */}
      <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filter & Search</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search detections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              />
            </div>

            {/* Camera Filter */}
            <Select
              value={filters.camera_id || 'all_cameras'}
              onValueChange={(value) => handleFilterChange('camera_id', value === 'all_cameras' ? undefined : value)}
            >
              <SelectTrigger className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <SelectValue placeholder="All Cameras" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200 shadow-xl">
                <SelectItem value="all_cameras">All Cameras</SelectItem>
                {cameras.map((camera) => (
                  <SelectItem key={camera.id} value={camera.id}>
                    {camera.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Detection Type Filter */}
            <Select
              value={filters.detection_type || 'all_types'}
              onValueChange={(value) => handleFilterChange('detection_type', value === 'all_types' ? undefined : value)}
            >
              <SelectTrigger className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200 shadow-xl">
                <SelectItem value="all_types">All Types</SelectItem>
                <SelectItem value="known_person">
                  <div className="flex items-center space-x-2">
                    <UserCheck className="h-4 w-4 text-emerald-600" />
                    <span>Known Persons</span>
                  </div>
                </SelectItem>
                <SelectItem value="stranger">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span>Unknown Persons</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            
            {/* Start Date Filter */}
            <Input
              type="date"
              placeholder="Start Date"
              value={filters.start_date || ''}
              onChange={(e) => handleFilterChange('start_date', e.target.value || undefined)}
              className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            />
          </div>

          {/* Active Filters Display */}
          {(searchTerm || Object.values(filters).some(v => v !== undefined && v !== 20 && v !== 0)) && (
            <div className="flex items-center space-x-2 mt-4 pt-4 border-t">
              <span className="text-sm text-gray-600">Active filters:</span>
              {searchTerm && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Search: {searchTerm}
                </Badge>
              )}
              {filters.camera_id && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Camera: {cameras.find(c => c.id === filters.camera_id)?.name || 'Unknown'}
                </Badge>
              )}
              {filters.detection_type && (
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  Type: {filters.detection_type === 'known_person' ? 'Known Person' : 'Unknown Person'}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                Clear all
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detections List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Detection Activity</span>
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {filteredDetections.length} results
                </Badge>
                {pagination.total > filteredDetections.length && (
                  <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                    of {pagination.total} total
                  </Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredDetections.length > 0 ? (
              <div className="space-y-4">
                {filteredDetections.map((detection, index) => (
                  <motion.div
                    key={detection.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer group"
                    onClick={() => {
                      setSelectedDetection(detection);
                      setShowImageDialog(true);
                    }}
                  >
                    {/* Detection Image */}
                    <div className="flex-shrink-0">
                      <Avatar className="h-12 w-12 border-2 border-white shadow-lg">
                        <AvatarImage 
                          src={detection.image_url} 
                          alt="Detection"
                          onError={(e) => {
                            console.warn('Failed to load detection image:', detection.image_url);
                          }}
                        />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                          <Camera className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    {/* Detection Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {detection.detection_type === 'stranger' 
                            ? '🚫 Unknown Person' 
                            : `👤 ${detection.person_name}`
                          }
                        </h3>
                        <Badge 
                          variant={detection.detection_type === 'stranger' ? 'destructive' : 'default'}
                          className="text-xs"
                        >
                          <Target className="h-3 w-3 mr-1" />
                          {formatConfidence(detection.confidence)}
                        </Badge>
                        {detection.similarity_score && (
                          <Badge variant="secondary" className="text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            {formatConfidence(detection.similarity_score)}
                          </Badge>
                        )}
                        {detection.is_alert_sent && (
                          <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-300">
                            🔔 Alert Sent
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-600 flex-wrap">
                        <div className="flex items-center">
                          <Camera className="h-4 w-4 mr-1" />
                          <span className="truncate">{detection.camera_name || 'Unknown Camera'}</span>
                        </div>
                        
                        {detection.location && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span className="truncate">{detection.location}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span title={new Date(detection.timestamp).toLocaleString()}>
                            {formatTimeAgo(detection.timestamp)}
                          </span>
                        </div>

                        <div className="flex items-center text-xs text-gray-500">
                          <span>ID: {detection.id.slice(0, 8)}...</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white border-gray-200 shadow-xl">
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDetection(detection);
                              setShowImageDialog(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(detection.id);
                              toast.success('Detection ID copied to clipboard');
                            }}
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            Copy ID
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteDetection(detection.id);
                            }}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No detections found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || Object.values(filters).some(v => v !== undefined && v !== 20 && v !== 0)
                    ? 'No detections match your current filters. Try adjusting your search criteria.'
                    : 'No detections have been recorded yet. Make sure your cameras are active and detection is enabled.'}
                </p>
                <div className="flex justify-center space-x-3">
                  {(searchTerm || Object.values(filters).some(v => v !== undefined && v !== 20 && v !== 0)) && (
                    <Button onClick={clearFilters} variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Clear Filters
                    </Button>
                  )}
                  <Button 
                    onClick={() => {
                      loadDetections();
                      loadStats();
                    }}
                    variant="outline"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <div className="text-sm text-gray-600">
                  Showing {((pagination.currentPage - 1) * (filters.limit || 20)) + 1} to{' '}
                  {Math.min(pagination.currentPage * (filters.limit || 20), pagination.total)} of{' '}
                  {pagination.total.toLocaleString()} results
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrev}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600 px-3">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNext}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Enhanced Detection Detail Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="max-w-4xl bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Detection Details</span>
              {selectedDetection && (
                <Badge 
                  variant={selectedDetection.detection_type === 'stranger' ? 'destructive' : 'default'}
                  className="ml-2"
                >
                  {selectedDetection.detection_type === 'stranger' ? 'Unknown Person' : 'Known Person'}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedDetection && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Enhanced Image Display */}
              <div className="space-y-4">
                <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden border border-gray-200 relative">
                  <img
                    src={selectedDetection.image_url}
                    alt="Detection"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.warn('Failed to load detection image in dialog:', selectedDetection.image_url);
                    }}
                  />
                  {/* Overlay with detection info */}
                  <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                    {formatConfidence(selectedDetection.confidence)} confidence
                  </div>
                  {selectedDetection.similarity_score && (
                    <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                      {formatConfidence(selectedDetection.similarity_score)} similarity
                    </div>
                  )}
                </div>

                {/* Bounding Box Info */}
                {selectedDetection.bbox && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Bounding Box Coordinates</label>
                    <div className="mt-1 grid grid-cols-4 gap-2">
                      <div className="bg-gray-100 p-3 rounded text-center">
                        <p className="font-medium text-sm text-gray-600">X</p>
                        <p className="text-lg font-semibold">{Math.round(selectedDetection.bbox[0])}</p>
                      </div>
                      <div className="bg-gray-100 p-3 rounded text-center">
                        <p className="font-medium text-sm text-gray-600">Y</p>
                        <p className="text-lg font-semibold">{Math.round(selectedDetection.bbox[1])}</p>
                      </div>
                      <div className="bg-gray-100 p-3 rounded text-center">
                        <p className="font-medium text-sm text-gray-600">Width</p>
                        <p className="text-lg font-semibold">{Math.round(selectedDetection.bbox[2])}</p>
                      </div>
                      <div className="bg-gray-100 p-3 rounded text-center">
                        <p className="font-medium text-sm text-gray-600">Height</p>
                        <p className="text-lg font-semibold">{Math.round(selectedDetection.bbox[3])}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Enhanced Details Panel */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Detection ID</label>
                    <p className="mt-1 text-sm font-mono bg-gray-100 p-2 rounded">
                      {selectedDetection.id}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Detection Type</label>
                    <div className="mt-1">
                      <Badge 
                        variant={selectedDetection.detection_type === 'stranger' ? 'destructive' : 'default'}
                        className="text-sm"
                      >
                        {selectedDetection.detection_type === 'stranger' 
                          ? '🚫 Unknown Person' 
                          : '👤 Known Person'
                        }
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Confidence Score</label>
                      <p className="mt-1 text-2xl font-bold text-blue-600">
                        {formatConfidence(selectedDetection.confidence)}
                      </p>
                    </div>

                    {selectedDetection.similarity_score && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Similarity Score</label>
                        <p className="mt-1 text-2xl font-bold text-emerald-600">
                          {formatConfidence(selectedDetection.similarity_score)}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {selectedDetection.person_name && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Person Name</label>
                      <p className="mt-1 text-lg font-semibold">{selectedDetection.person_name}</p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-gray-600">Camera Information</label>
                    <div className="mt-1 space-y-1">
                      <p className="font-medium">{selectedDetection.camera_name || 'Unknown Camera'}</p>
                      {selectedDetection.location && (
                        <p className="text-sm text-gray-600 flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {selectedDetection.location}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Detection Time</label>
                    <div className="mt-1 space-y-1">
                      <p className="font-medium">{new Date(selectedDetection.timestamp).toLocaleString()}</p>
                      <p className="text-sm text-gray-600">{formatTimeAgo(selectedDetection.timestamp)}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Alert Status</label>
                    <div className="mt-1">
                      <Badge 
                        variant={selectedDetection.is_alert_sent ? 'default' : 'secondary'}
                        className="text-sm"
                      >
                        {selectedDetection.is_alert_sent ? '🔔 Alert Sent' : '🔕 No Alert'}
                      </Badge>
                    </div>
                  </div>

                  {/* Additional metadata if available */}
                  {selectedDetection.metadata && Object.keys(selectedDetection.metadata).length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Additional Information</label>
                      <div className="mt-1 bg-gray-100 p-3 rounded">
                        <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                          {JSON.stringify(selectedDetection.metadata, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cleanup Dialog */}
      <AlertDialog open={cleanupDialog.open} onOpenChange={(open) => setCleanupDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent className="bg-white border-gray-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Cleanup Old Detections</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete detections older than the specified number of days. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Days to keep</label>
              <Input
                type="number"
                min="1"
                max="365"
                value={cleanupDialog.daysToKeep}
                onChange={(e) => setCleanupDialog(prev => ({ ...prev, daysToKeep: parseInt(e.target.value) || 30 }))}
                className="mt-1"
                disabled={cleanupDialog.loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Detections older than {cleanupDialog.daysToKeep} days will be permanently deleted.
              </p>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="hover:bg-gray-50"
              disabled={cleanupDialog.loading}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCleanupDetections}
              disabled={cleanupDialog.loading}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              {cleanupDialog.loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Cleaning up...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Cleanup Detections
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DetectionsPage;