import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Camera,
  Search,
  Plus,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  Download,
  RefreshCw
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import CameraCard from './CameraCard';
import { useNavigate } from 'react-router-dom';
import { Camera as CameraType } from '@/types/camera.types';

interface CameraListProps {
  cameras: CameraType[];
  loading?: boolean;
  onEdit: (camera: CameraType) => void;
  onDelete: (camera: CameraType) => void;
  onStartStream: (camera: CameraType) => void;
  onStopStream: (camera: CameraType) => void;
  onTestConnection: (camera: CameraType) => void;
  onToggleDetection?: (camera: CameraType) => void;
  onRefresh?: () => void;
}

type ViewMode = 'grid' | 'list';
type SortField = 'name' | 'created_at' | 'last_online' | 'status';
type SortOrder = 'asc' | 'desc';

const CameraList: React.FC<CameraListProps> = ({
  cameras,
  loading = false,
  onEdit,
  onDelete,
  onStartStream,
  onStopStream,
  onTestConnection,
  onToggleDetection,
  onRefresh
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const filteredCameras = cameras
    .filter(camera => {
      const matchesSearch = 
        camera.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        camera.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && camera.is_active) ||
                           (statusFilter === 'inactive' && !camera.is_active) ||
                           (statusFilter === 'streaming' && camera.is_streaming) ||
                           (statusFilter === 'detection' && camera.detection_enabled);
      
      const matchesType = typeFilter === 'all' || camera.camera_type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'last_online':
          aValue = a.last_online ? new Date(a.last_online).getTime() : 0;
          bValue = b.last_online ? new Date(b.last_online).getTime() : 0;
          break;
        case 'status':
          aValue = a.is_streaming ? 3 : a.is_active ? 2 : 1;
          bValue = b.is_streaming ? 3 : b.is_active ? 2 : 1;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const getStats = () => {
    return {
      total: cameras.length,
      active: cameras.filter(c => c.is_active).length,
      streaming: cameras.filter(c => c.is_streaming).length,
      offline: cameras.filter(c => !c.is_active).length,
      detection: cameras.filter(c => c.detection_enabled).length
    };
  };

  const handleExport = () => {
    const csvContent = [
      ['Name', 'Type', 'Status', 'Detection', 'URL', 'Created', 'Last Online'].join(','),
      ...filteredCameras.map(camera => [
        `"${camera.name}"`,
        camera.camera_type,
        camera.is_streaming ? 'Streaming' : camera.is_active ? 'Active' : 'Offline',
        camera.detection_enabled ? 'Enabled' : 'Disabled',
        `"${camera.camera_url}"`,
        new Date(camera.created_at).toLocaleDateString(),
        camera.last_online ? new Date(camera.last_online).toLocaleDateString() : 'Never'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cameras-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading Header */}
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>

        {/* Loading Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Loading Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="aspect-video bg-gray-200 rounded-lg mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="flex space-x-2 mt-4">
                    <div className="h-8 bg-gray-200 rounded flex-1"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cameras</h1>
          <p className="text-gray-600">
            {stats.total} total • {stats.active} active • {stats.streaming} streaming • {stats.detection} with detection
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => navigate('/cameras/new')} className="flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Add Camera
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-sm text-gray-600">Total Cameras</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            <p className="text-sm text-gray-600">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.streaming}</p>
            <p className="text-sm text-gray-600">Streaming</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">{stats.detection}</p>
            <p className="text-sm text-gray-600">Detection ON</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{stats.offline}</p>
            <p className="text-sm text-gray-600">Offline</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search cameras..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="streaming">Streaming</SelectItem>
                  <SelectItem value="detection">Detection ON</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="ip_camera">IP Camera</SelectItem>
                  <SelectItem value="webcam">Webcam</SelectItem>
                  <SelectItem value="usb_camera">USB Camera</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortField} onValueChange={(value: SortField) => setSortField(value)}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="created_at">Created Date</SelectItem>
                  <SelectItem value="last_online">Last Online</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>

              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Clear Filters */}
            {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all') && (
              <Button variant="outline" onClick={clearFilters}>
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Camera Grid/List */}
      {filteredCameras.length > 0 ? (
        <div className={
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        }>
          {filteredCameras.map((camera) => (
            <CameraCard
              key={camera.id}
              camera={camera}
              onEdit={onEdit}
              onDelete={onDelete}
              onStartStream={onStartStream}
              onStopStream={onStopStream}
              onTestConnection={onTestConnection}
              onToggleDetection={onToggleDetection}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-16">
            <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                ? 'No cameras match your filters' 
                : 'No cameras found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your search criteria.'
                : 'Get started by adding your first camera.'}
            </p>
            {(!searchTerm && statusFilter === 'all' && typeFilter === 'all') ? (
              <Button onClick={() => navigate('/cameras/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Add Camera
              </Button>
            ) : (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      {filteredCameras.length > 0 && (
        <div className="text-center text-sm text-gray-600">
          Showing {filteredCameras.length} of {cameras.length} cameras
        </div>
      )}
    </div>
  );
};

export default CameraList;