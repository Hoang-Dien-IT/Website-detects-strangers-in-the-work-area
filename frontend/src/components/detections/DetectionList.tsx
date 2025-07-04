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
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  UserCheck,
  Clock,
  Camera,
  MoreHorizontal,
  ExternalLink,
  Trash2,
} from 'lucide-react';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { detectionService } from '@/services/detection.service';
import { Detection, DetectionFilter } from '@/types/detection.types';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface DetectionListProps {
  onDetectionSelect?: (detection: Detection) => void;
  onViewDetails?: (detection: Detection) => void;
  onDeleteDetection?: (detection: Detection) => void;
  showActions?: boolean;
  showPagination?: boolean;
  maxHeight?: string;
  filters?: Partial<DetectionFilter>;
  title?: string;
  className?: string;
}

const DetectionList: React.FC<DetectionListProps> = ({
  onDetectionSelect,
  onViewDetails,
  onDeleteDetection,
  showActions = true,
  showPagination = true,
  maxHeight = "600px",
  filters: externalFilters = {},
  title = "Detection Logs",
  className = ""
}) => {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<DetectionFilter>({
    limit: 20,
    offset: 0,
    ...externalFilters
  });

  const [pagination, setPagination] = useState({
    total: 0,
    currentPage: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  });

  useEffect(() => {
    loadDetections();
  }, [filters]);

  useEffect(() => {
    setFilters(prev => ({ ...prev, ...externalFilters, offset: 0 }));
  }, [externalFilters]);

  const loadDetections = async () => {
    try {
      setRefreshing(true);
      // If API returns paginated response
      const response = await detectionService.getDetections(filters) as Detection[];
      setDetections(response);
      
      // Mock pagination - replace with real pagination from API
      setPagination({
        total: response.length,
        currentPage: Math.floor((filters.offset || 0) / (filters.limit || 20)) + 1,
        totalPages: Math.ceil(response.length / (filters.limit || 20)),
        hasNext: response.length === (filters.limit || 20),
        hasPrev: (filters.offset || 0) > 0
      });
    } catch (error) {
      console.error('Error loading detections:', error);
      toast.error('Failed to load detections');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    // Implement client-side search if needed
  };

  const handleFilterChange = (key: keyof DetectionFilter, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, offset: 0 }));
  };

  const handlePageChange = (newPage: number) => {
    const newOffset = (newPage - 1) * (filters.limit || 20);
    setFilters(prev => ({ ...prev, offset: newOffset }));
  };

  const handleDeleteDetection = async (detection: Detection) => {
    try {
      await detectionService.deleteDetection(detection.id);
      toast.success('Detection deleted successfully');
      loadDetections();
      onDeleteDetection?.(detection);
    } catch (error) {
      toast.error('Failed to delete detection');
    }
  };

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

  const getDetectionTypeColor = (type: string) => {
    return type === 'stranger' ? 'destructive' : 'default';
  };

  const getDetectionTypeIcon = (type: string) => {
    return type === 'stranger' ? AlertTriangle : UserCheck;
  };

  const filteredDetections = detections.filter(detection =>
    detection.person_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    detection.camera_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>{title} ({pagination.total.toLocaleString()})</span>
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            {showActions && (
              <>
                <Button 
                  onClick={loadDetections} 
                  variant="outline" 
                  size="sm"
                  disabled={refreshing}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search detections..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Type Filter */}
          <Select 
            value={filters.detection_type || 'all_types'} 
            onValueChange={(value) => handleFilterChange('detection_type', value === 'all_types' ? undefined : value)}
          >
            <SelectTrigger className="lg:w-40">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_types">All Types</SelectItem>
              <SelectItem value="known_person">Known Persons</SelectItem>
              <SelectItem value="stranger">Strangers</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4" style={{ maxHeight, overflowY: 'auto' }}>
          {filteredDetections.length > 0 ? (
            filteredDetections.map((detection) => {
              const DetectionIcon = getDetectionTypeIcon(detection.detection_type);
              return (
                <div 
                  key={detection.id} 
                  className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => onDetectionSelect?.(detection)}
                >
                  {/* Avatar */}
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={detection.image_url} alt="Detection" />
                    <AvatarFallback className={`${
                      detection.detection_type === 'stranger' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                    }`}>
                      <DetectionIcon className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Detection Info */}
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <p className="font-medium truncate">
                        {detection.detection_type === 'stranger' ? 'Unknown Person' : detection.person_name}
                      </p>
                      <Badge variant={getDetectionTypeColor(detection.detection_type)} className="shrink-0">
                        {detection.detection_type === 'stranger' ? 'Stranger' : 'Known'}
                      </Badge>
                      <Badge variant="outline" className="shrink-0">
                        {formatConfidence(detection.confidence)}
                      </Badge>
                      {detection.similarity_score && (
                        <Badge variant="secondary" className="shrink-0">
                          Match: {formatConfidence(detection.similarity_score)}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 flex-wrap">
                      <div className="flex items-center shrink-0">
                        <Camera className="h-4 w-4 mr-1" />
                        <span className="truncate">{detection.camera_name || 'Unknown Camera'}</span>
                      </div>
                      
                      <div className="flex items-center shrink-0">
                        <Clock className="h-4 w-4 mr-1" />
                        <span title={new Date(detection.timestamp).toLocaleString()}>
                          {formatTimeAgo(detection.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  {showActions && (
                    <div className="flex items-center space-x-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDetails?.(detection);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onViewDetails?.(detection)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => window.open(detection.image_url, '_blank')}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open Image
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteDetection(detection)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No detections found</h3>
              <p className="text-gray-600">
                {searchTerm || filters.detection_type
                  ? 'No detections match your current filters.'
                  : 'No detections have been recorded yet.'}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {showPagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t mt-4">
            <div className="text-sm text-gray-600">
              Showing {((pagination.currentPage - 1) * (filters.limit ?? 20)) + 1} to{' '}
              {Math.min(pagination.currentPage * (filters.limit ?? 20), pagination.total)} of{' '}
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
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === pagination.currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
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
  );
};

export default DetectionList;