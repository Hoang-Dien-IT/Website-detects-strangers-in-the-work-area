import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Filter,
  Camera,
  User,
  Activity,
  Clock,
  MapPin,
  Shield,
  AlertTriangle,
  Target,
  Eye,
  Calendar,
  RefreshCw,
  X,
  ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

// ✅ Import services từ backend integration
import { cameraService } from '@/services/camera.service';
import { personService } from '@/services/person.service';
import { detectionService } from '@/services/detection.service';

// ✅ Enhanced interfaces dựa trên backend structure
interface SearchFilters {
  type: 'all' | 'cameras' | 'persons' | 'detections';
  date_range?: string;
  camera_id?: string;
  detection_type?: string;
  confidence_min?: number;
  active_only?: boolean;
}

interface CameraSearchResult {
  id: string;
  name: string;
  camera_type: string;
  location?: string;
  is_active: boolean;
  is_streaming: boolean;
  detection_enabled: boolean;
  created_at: string;
  type: 'camera';
}

interface PersonSearchResult {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  face_images_count: number;
  created_at: string;
  type: 'person';
}

interface DetectionSearchResult {
  id: string;
  camera_name?: string;
  detection_type: string;
  person_name?: string;
  confidence: number;
  similarity_score?: number;
  timestamp: string;
  image_url?: string;
  is_alert_sent?: boolean;
  type: 'detection';
}

type SearchResult = CameraSearchResult | PersonSearchResult | DetectionSearchResult;

interface SearchStats {
  total_results: number;
  cameras_count: number;
  persons_count: number;
  detections_count: number;
  search_time: number;
}

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // ✅ Enhanced state management
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [stats, setStats] = useState<SearchStats>({
    total_results: 0,
    cameras_count: 0,
    persons_count: 0,
    detections_count: 0,
    search_time: 0
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [filters, setFilters] = useState<SearchFilters>({
    type: 'all',
    active_only: true
  });
  
  // ✅ Get available cameras for filter
  const [cameras, setCameras] = useState<Array<{id: string, name: string}>>([]);

  // ✅ Load cameras for filter dropdown
  useEffect(() => {
    loadCameras();
  }, []);

  // ✅ Search when query or filters change
  useEffect(() => {
    const queryParam = searchParams.get('q');
    const typeParam = searchParams.get('type') as SearchFilters['type'];
    
    if (queryParam) {
      setQuery(queryParam);
      if (typeParam && ['all', 'cameras', 'persons', 'detections'].includes(typeParam)) {
        setFilters(prev => ({ ...prev, type: typeParam }));
        setActiveTab(typeParam);
      }
      performSearch(queryParam, filters);
    }
  }, [searchParams]);

  // ✅ Enhanced search function với backend integration
  const performSearch = useCallback(async (searchQuery: string, searchFilters: SearchFilters = filters) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setStats({
        total_results: 0,
        cameras_count: 0,
        persons_count: 0,
        detections_count: 0,
        search_time: 0
      });
      return;
    }

    setLoading(true);
    const startTime = Date.now();
    
    try {
      console.log('🔵 SearchPage: Performing search...', { query: searchQuery, filters: searchFilters });
      
      let allResults: SearchResult[] = [];
      let camerasCount = 0, personsCount = 0, detectionsCount = 0;

      // ✅ Search cameras if needed
      if (searchFilters.type === 'all' || searchFilters.type === 'cameras') {
        try {
          const camerasData = await cameraService.getCameras();
          const filteredCameras = camerasData
            .filter(camera => {
              const matchesQuery = 
                camera.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                camera.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                camera.camera_type.toLowerCase().includes(searchQuery.toLowerCase());
              
              const matchesFilters = searchFilters.active_only ? camera.is_active : true;
              
              return matchesQuery && matchesFilters;
            })
            .map(camera => ({
              ...camera,
              type: 'camera' as const
            }));
          
          allResults.push(...filteredCameras);
          camerasCount = filteredCameras.length;
          console.log('✅ SearchPage: Found', camerasCount, 'cameras');
        } catch (error) {
          console.warn('⚠️ SearchPage: Error searching cameras:', error);
        }
      }

      // ✅ Search persons if needed
      if (searchFilters.type === 'all' || searchFilters.type === 'persons') {
        try {
          const personsData = await personService.getPersons();
          const filteredPersons = personsData
            .filter(person => {
              const matchesQuery = 
                person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                person.description?.toLowerCase().includes(searchQuery.toLowerCase());
              
              const matchesFilters = searchFilters.active_only ? person.is_active : true;
              
              return matchesQuery && matchesFilters;
            })
            .map(person => ({
              ...person,
              type: 'person' as const
            }));
          
          allResults.push(...filteredPersons);
          personsCount = filteredPersons.length;
          console.log('✅ SearchPage: Found', personsCount, 'persons');
        } catch (error) {
          console.warn('⚠️ SearchPage: Error searching persons:', error);
        }
      }

      // ✅ Search detections if needed
      if (searchFilters.type === 'all' || searchFilters.type === 'detections') {
        try {
          const detectionsResponse = await detectionService.getDetections({ 
            limit: 100,
            camera_id: searchFilters.camera_id,
            detection_type: searchFilters.detection_type
          });
          
          const detections = Array.isArray(detectionsResponse) ? detectionsResponse : 
            (detectionsResponse && 'detections' in detectionsResponse ? detectionsResponse.detections : []);
          
          const filteredDetections = detections
            .filter(detection => {
              const matchesQuery = 
                detection.person_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                detection.camera_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                detection.detection_type.toLowerCase().includes(searchQuery.toLowerCase());
              
              const matchesConfidence = searchFilters.confidence_min ? 
                detection.confidence >= searchFilters.confidence_min : true;
              
              return matchesQuery && matchesConfidence;
            })
            .map(detection => ({
              ...detection,
              type: 'detection' as const
            }));
          
          allResults.push(...filteredDetections);
          detectionsCount = filteredDetections.length;
          console.log('✅ SearchPage: Found', detectionsCount, 'detections');
        } catch (error) {
          console.warn('⚠️ SearchPage: Error searching detections:', error);
        }
      }

      // ✅ Sort results by relevance and date
      allResults.sort((a, b) => {
        // Prioritize exact matches
        const aExact = a.type === 'camera' ? a.name.toLowerCase() === searchQuery.toLowerCase() :
                      a.type === 'person' ? a.name.toLowerCase() === searchQuery.toLowerCase() :
                      a.person_name?.toLowerCase() === searchQuery.toLowerCase();
        
        const bExact = b.type === 'camera' ? b.name.toLowerCase() === searchQuery.toLowerCase() :
                      b.type === 'person' ? b.name.toLowerCase() === searchQuery.toLowerCase() :
                      b.person_name?.toLowerCase() === searchQuery.toLowerCase();
        
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        
        // Then sort by date (most recent first)
        const aDate = a.type === 'detection' ? new Date(a.timestamp) : new Date(a.created_at);
        const bDate = b.type === 'detection' ? new Date(b.timestamp) : new Date(b.created_at);
        
        return bDate.getTime() - aDate.getTime();
      });

      const searchTime = Date.now() - startTime;

      setResults(allResults);
      setStats({
        total_results: allResults.length,
        cameras_count: camerasCount,
        persons_count: personsCount,
        detections_count: detectionsCount,
        search_time: searchTime
      });

      console.log('✅ SearchPage: Search completed', {
        total: allResults.length,
        cameras: camerasCount,
        persons: personsCount,
        detections: detectionsCount,
        time: searchTime + 'ms'
      });

      // ✅ Success feedback
      if (allResults.length > 0) {
        toast.success(`Found ${allResults.length} results in ${searchTime}ms`);
      }

    } catch (error: any) {
      console.error('❌ SearchPage: Search error:', error);
      toast.error(`Search failed: ${error.message || 'Unknown error'}`);
      setResults([]);
      setStats({
        total_results: 0,
        cameras_count: 0,
        persons_count: 0,
        detections_count: 0,
        search_time: 0
      });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // ✅ Load cameras for filter dropdown
  const loadCameras = async () => {
    try {
      const camerasData = await cameraService.getCameras();
      setCameras(camerasData.map(camera => ({
        id: camera.id,
        name: camera.name
      })));
    } catch (error) {
      console.warn('⚠️ SearchPage: Error loading cameras:', error);
    }
  };

  // ✅ Handle search input
  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    
    // Update URL params
    const newParams = new URLSearchParams();
    if (searchQuery) newParams.set('q', searchQuery);
    if (filters.type !== 'all') newParams.set('type', filters.type);
    setSearchParams(newParams);
    
    performSearch(searchQuery, filters);
  };

  // ✅ Handle filter changes
  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    if (query) {
      performSearch(query, newFilters);
    }
  };

  // ✅ Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const newType = tab as SearchFilters['type'];
    handleFilterChange('type', newType);
  };

  // ✅ Clear filters
  const clearFilters = () => {
    setFilters({
      type: 'all',
      active_only: true
    });
    setActiveTab('all');
    if (query) {
      performSearch(query, {
        type: 'all',
        active_only: true
      });
    }
  };

  // ✅ Filter results by tab
  const getFilteredResults = () => {
    if (activeTab === 'all') return results;
    return results.filter(result => result.type === activeTab || 
      (activeTab === 'detections' && result.type === 'detection'));
  };

  // ✅ Navigate to detail pages
  const handleResultClick = (result: SearchResult) => {
    switch (result.type) {
      case 'camera':
        navigate(`/cameras/${result.id}`);
        break;
      case 'person':
        navigate(`/persons/${result.id}`);
        break;
      case 'detection':
        navigate(`/detections?id=${result.id}`);
        break;
    }
  };

  // ✅ Format time helper
  const formatTimeAgo = (timestamp: string) => {
    try {
      const now = new Date();
      const time = new Date(timestamp);
      const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    } catch (error) {
      return 'Unknown time';
    }
  };

  const filteredResults = getFilteredResults();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* ✅ Enhanced Header */}
      <motion.div 
        className="bg-white/90 backdrop-blur-xl border-b border-slate-200/60 shadow-lg p-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Search className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Search
              </h1>
              <p className="text-gray-600">Find cameras, persons, and detections</p>
            </div>
          </div>
          
          {/* ✅ Enhanced Search Input */}
          <div className="relative max-w-3xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search cameras, persons, detections..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 pr-12 py-4 text-lg bg-white shadow-lg border-gray-200 focus:border-purple-500 focus:ring-purple-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(query);
                }
              }}
            />
            {query && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => {
                  setQuery('');
                  setResults([]);
                  setSearchParams({});
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* ✅ Enhanced Search Button */}
          <div className="flex items-center space-x-3 mt-4">
            <Button
              onClick={() => handleSearch(query)}
              disabled={loading || !query.trim()}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </>
              )}
            </Button>

            {/* Quick Search Suggestions */}
            <div className="hidden lg:flex items-center space-x-2 text-sm text-gray-500">
              <span>Try:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSearch('webcam')}
                className="text-blue-600 hover:text-blue-800"
              >
                webcam
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSearch('stranger')}
                className="text-red-600 hover:text-red-800"
              >
                stranger
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSearch('detection')}
                className="text-purple-600 hover:text-purple-800"
              >
                detection
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto p-6">
        {/* ✅ Enhanced Filters Section */}
        {query && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="mb-6 bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Filter className="h-5 w-5" />
                    <span>Search Filters</span>
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Date Range Filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Date Range</label>
                    <Select value={filters.date_range || ''} onValueChange={(value) => handleFilterChange('date_range', value || undefined)}>
                      <SelectTrigger>
                        <SelectValue placeholder="All time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All time</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">This week</SelectItem>
                        <SelectItem value="month">This month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Camera Filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Camera</label>
                    <Select value={filters.camera_id || ''} onValueChange={(value) => handleFilterChange('camera_id', value || undefined)}>
                      <SelectTrigger>
                        <SelectValue placeholder="All cameras" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All cameras</SelectItem>
                        {cameras.map(camera => (
                          <SelectItem key={camera.id} value={camera.id}>
                            {camera.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Detection Type Filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Detection Type</label>
                    <Select value={filters.detection_type || ''} onValueChange={(value) => handleFilterChange('detection_type', value || undefined)}>
                      <SelectTrigger>
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All types</SelectItem>
                        <SelectItem value="known_person">Known Person</SelectItem>
                        <SelectItem value="stranger">Unknown Person</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Active Only Toggle */}
                  <div className="flex items-center space-x-2 pt-7">
                    <input
                      type="checkbox"
                      id="activeOnly"
                      checked={filters.active_only || false}
                      onChange={(e) => handleFilterChange('active_only', e.target.checked)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor="activeOnly" className="text-sm font-medium text-gray-700">
                      Active only
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ✅ Enhanced Search Results */}
        {query && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Search className="h-5 w-5" />
                    <span>Search Results for "{query}"</span>
                  </CardTitle>
                  
                  {/* ✅ Search Stats */}
                  {stats.total_results > 0 && (
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{stats.total_results} results</span>
                      <span>•</span>
                      <span>{stats.search_time}ms</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                {loading ? (
                  <motion.div 
                    className="flex items-center justify-center py-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="text-center">
                      <RefreshCw className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
                      <p className="text-gray-600">Searching across cameras, persons, and detections...</p>
                    </div>
                  </motion.div>
                ) : results.length === 0 ? (
                  <motion.div 
                    className="text-center py-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                    <p className="text-gray-600 mb-6">
                      No items match your search criteria. Try adjusting your search terms or filters.
                    </p>
                    <div className="flex justify-center space-x-3">
                      <Button variant="outline" onClick={clearFilters}>
                        Clear Filters
                      </Button>
                      <Button onClick={() => handleSearch('')}>
                        Clear Search
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <>
                    {/* ✅ Results Tabs */}
                    <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="all" className="flex items-center space-x-2">
                          <Search className="h-4 w-4" />
                          <span>All ({stats.total_results})</span>
                        </TabsTrigger>
                        <TabsTrigger value="cameras" className="flex items-center space-x-2">
                          <Camera className="h-4 w-4" />
                          <span>Cameras ({stats.cameras_count})</span>
                        </TabsTrigger>
                        <TabsTrigger value="persons" className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>Persons ({stats.persons_count})</span>
                        </TabsTrigger>
                        <TabsTrigger value="detections" className="flex items-center space-x-2">
                          <Activity className="h-4 w-4" />
                          <span>Detections ({stats.detections_count})</span>
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value={activeTab} className="mt-6">
                        <div className="space-y-4">
                          {filteredResults.map((result, index) => (
                            <motion.div
                              key={`${result.type}-${result.id}`}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="p-6 border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-200 cursor-pointer bg-gradient-to-r from-white to-gray-50"
                              onClick={() => handleResultClick(result)}
                            >
                              {/* ✅ Camera Result */}
                              {result.type === 'camera' && (
                                <div className="flex items-center space-x-4">
                                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                                    result.is_active 
                                      ? 'bg-gradient-to-r from-emerald-500 to-green-500' 
                                      : 'bg-gradient-to-r from-gray-400 to-gray-500'
                                  }`}>
                                    <Camera className="h-6 w-6 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                      <h3 className="text-lg font-semibold text-gray-900">{result.name}</h3>
                                      <Badge variant={result.is_active ? "default" : "secondary"}>
                                        {result.is_active ? 'Active' : 'Inactive'}
                                      </Badge>
                                      {result.is_streaming && (
                                        <Badge className="bg-blue-100 text-blue-800">
                                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-1 animate-pulse" />
                                          Live
                                        </Badge>
                                      )}
                                      {result.detection_enabled && (
                                        <Badge className="bg-purple-100 text-purple-800">
                                          <Shield className="h-3 w-3 mr-1" />
                                          AI Detection
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                                      <div className="flex items-center space-x-1">
                                        <Camera className="h-4 w-4" />
                                        <span className="capitalize">{result.camera_type}</span>
                                      </div>
                                      {result.location && (
                                        <div className="flex items-center space-x-1">
                                          <MapPin className="h-4 w-4" />
                                          <span>{result.location}</span>
                                        </div>
                                      )}
                                      <div className="flex items-center space-x-1">
                                        <Calendar className="h-4 w-4" />
                                        <span>Created {formatTimeAgo(result.created_at)}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <ExternalLink className="h-5 w-5 text-gray-400" />
                                </div>
                              )}

                              {/* ✅ Person Result */}
                              {result.type === 'person' && (
                                <div className="flex items-center space-x-4">
                                  <Avatar className="h-12 w-12 border-2 border-white shadow-lg">
                                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg font-semibold">
                                      {result.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                      <h3 className="text-lg font-semibold text-gray-900">{result.name}</h3>
                                      <Badge variant={result.is_active ? "default" : "secondary"}>
                                        {result.is_active ? 'Active' : 'Inactive'}
                                      </Badge>
                                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                        <Eye className="h-3 w-3 mr-1" />
                                        {result.face_images_count} images
                                      </Badge>
                                    </div>
                                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                                      {result.description && (
                                        <span className="truncate max-w-md">{result.description}</span>
                                      )}
                                      <div className="flex items-center space-x-1">
                                        <Calendar className="h-4 w-4" />
                                        <span>Added {formatTimeAgo(result.created_at)}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <ExternalLink className="h-5 w-5 text-gray-400" />
                                </div>
                              )}

                              {/* ✅ Detection Result */}
                              {result.type === 'detection' && (
                                <div className="flex items-center space-x-4">
                                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                                    result.detection_type === 'stranger' 
                                      ? 'bg-gradient-to-r from-red-500 to-red-600' 
                                      : 'bg-gradient-to-r from-emerald-500 to-green-500'
                                  }`}>
                                    {result.detection_type === 'stranger' ? (
                                      <AlertTriangle className="h-6 w-6 text-white" />
                                    ) : (
                                      <User className="h-6 w-6 text-white" />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                      <h3 className="text-lg font-semibold text-gray-900">
                                        {result.detection_type === 'stranger' 
                                          ? '🚫 Unknown Person Detected' 
                                          : `👤 ${result.person_name} Detected`
                                        }
                                      </h3>
                                      <Badge variant={result.detection_type === 'stranger' ? "destructive" : "default"}>
                                        <Target className="h-3 w-3 mr-1" />
                                        {Math.round(result.confidence * 100)}%
                                      </Badge>
                                      {result.similarity_score && (
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                          <Shield className="h-3 w-3 mr-1" />
                                          {Math.round(result.similarity_score * 100)}%
                                        </Badge>
                                      )}
                                      {result.is_alert_sent && (
                                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                                          🔔 Alert Sent
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                                      <div className="flex items-center space-x-1">
                                        <Camera className="h-4 w-4" />
                                        <span>{result.camera_name}</span>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <Clock className="h-4 w-4" />
                                        <span>{formatTimeAgo(result.timestamp)}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <ExternalLink className="h-5 w-5 text-gray-400" />
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ✅ Empty State for No Query */}
        {!query && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-24 h-24 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Search Your SafeFace System
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Find cameras, known persons, and detection records quickly and easily. 
              Use the search bar above to get started, or try our suggested searches.
            </p>
            
            {/* ✅ Search Suggestions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleSearch('webcam')}>
                <Camera className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Search Cameras</h3>
                <p className="text-gray-600 text-sm">Find cameras by name, type, or location</p>
              </Card>
              
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleSearch('person')}>
                <User className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Search Persons</h3>
                <p className="text-gray-600 text-sm">Find known persons in your database</p>
              </Card>
              
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleSearch('stranger')}>
                <Activity className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Search Detections</h3>
                <p className="text-gray-600 text-sm">Find detection records and alerts</p>
              </Card>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;