import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Eye,
  Users,
  Camera,
  AlertTriangle,
  Download,
  RefreshCw,
  Target,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
// import { useAuth } from '@/hooks/useAuth';
import { detectionService } from '@/services/detection.service';
// import { cameraService } from '@/services/camera.service';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface AnalyticsStats {
  total_detections: number;
  known_detections: number;
  stranger_detections: number;
  accuracy_rate: number;
  cameras_active: number;
  top_cameras: Array<{
    camera_name: string;
    detection_count: number;
    accuracy: number;
  }>;
  detection_trends: Array<{
    date: string;
    known: number;
    strangers: number;
    total: number;
  }>;
  hourly_patterns: Array<{
    hour: number;
    detections: number;
  }>;
  detection_types: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

const AnalyticsPage: React.FC = () => {
  // const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [stats, setStats] = useState<AnalyticsStats>({
    total_detections: 0,
    known_detections: 0,
    stranger_detections: 0,
    accuracy_rate: 0,
    cameras_active: 0,
    top_cameras: [],
    detection_trends: [],
    hourly_patterns: [],
    detection_types: []
  });

  // const detectionTypeColors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B'];

  useEffect(() => {
    loadAnalytics();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Load real data from backend
      const [analyticsResponse, chartResponse] = await Promise.all([
        detectionService.getAnalytics(timeRange),
        detectionService.getChartData(timeRange, 'area')
      ]);
      
      // Transform data for display
      const transformedStats: AnalyticsStats = {
        total_detections: analyticsResponse.overview.total_detections,
        known_detections: analyticsResponse.overview.known_person_detections,
        stranger_detections: analyticsResponse.overview.stranger_detections,
        accuracy_rate: analyticsResponse.overview.detection_accuracy,
        cameras_active: analyticsResponse.camera_stats.active_cameras,
        top_cameras: analyticsResponse.top_cameras.map(camera => ({
          camera_name: camera.camera_name,
          detection_count: camera.detection_count,
          accuracy: camera.stranger_count > 0 ? 
            ((camera.detection_count - camera.stranger_count) / camera.detection_count * 100) : 100
        })),
        detection_trends: chartResponse.labels.map((label, index) => ({
          date: label,
          known: chartResponse.datasets.find(d => d.label.includes('Known'))?.data[index] || 0,
          strangers: chartResponse.datasets.find(d => d.label.includes('Stranger'))?.data[index] || 0,
          total: (chartResponse.datasets.find(d => d.label.includes('Known'))?.data[index] || 0) + 
                 (chartResponse.datasets.find(d => d.label.includes('Stranger'))?.data[index] || 0)
        })),
        hourly_patterns: Object.entries(analyticsResponse.hourly_pattern).map(([hour, detections]) => ({
          hour: parseInt(hour.split(':')[0]),
          detections: detections as number
        })),
        detection_types: [
          { 
            name: 'Known Persons', 
            value: analyticsResponse.overview.known_person_detections, 
            color: '#10B981' 
          },
          { 
            name: 'Strangers', 
            value: analyticsResponse.overview.stranger_detections, 
            color: '#EF4444' 
          }
        ]
      };
      
      setStats(transformedStats);
      
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics data');
      
      // Fallback to empty data
      setStats({
        total_detections: 0,
        known_detections: 0,
        stranger_detections: 0,
        accuracy_rate: 0,
        cameras_active: 0,
        top_cameras: [],
        detection_trends: [],
        hourly_patterns: [],
        detection_types: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async () => {
    try {
      toast.info('🔄 Exporting analytics report...');
      
      const blob = await detectionService.exportStats(timeRange, 'csv');
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-report-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('✅ Analytics report exported successfully');
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('❌ Failed to export analytics report');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights and detection analytics</p>
        </div>
        <div className="flex space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadAnalytics} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleExportReport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Detections</CardTitle>
            <Eye className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_detections.toLocaleString()}</div>
            <p className="text-xs text-green-600">
              +12.5% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Known Persons</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.known_detections.toLocaleString()}</div>
            <p className="text-xs text-gray-600">
              {stats.total_detections > 0 
                ? `${((stats.known_detections / stats.total_detections) * 100).toFixed(1)}% of total`
                : '0% of total'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Strangers Detected</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.stranger_detections.toLocaleString()}</div>
            <p className="text-xs text-gray-600">
              {stats.total_detections > 0 
                ? `${((stats.stranger_detections / stats.total_detections) * 100).toFixed(1)}% of total`
                : '0% of total'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acquaintance rate</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.accuracy_rate}%</div>
            <p className="text-xs text-green-600">
              +0.3% improvement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList>
          <TabsTrigger value="trends">Detection Trends</TabsTrigger>
          <TabsTrigger value="patterns">Time Patterns</TabsTrigger>
          <TabsTrigger value="cameras">Camera Performance</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        {/* Detection Trends */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detection Trends Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.detection_trends.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={stats.detection_trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="known" 
                      stackId="1"
                      stroke="#10B981" 
                      fill="#10B981" 
                      fillOpacity={0.6}
                      name="Known Persons"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="strangers" 
                      stackId="1"
                      stroke="#EF4444" 
                      fill="#EF4444" 
                      fillOpacity={0.6}
                      name="Strangers"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <div className="text-center">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No detection trends data available</p>
                    <p className="text-sm">Data will appear here once detections are recorded</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Time Patterns */}
        <TabsContent value="patterns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hourly Detection Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.hourly_patterns.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={stats.hourly_patterns}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="detections" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <div className="text-center">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No hourly patterns data available</p>
                    <p className="text-sm">Data will appear here once detections are recorded</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Camera Performance */}
        <TabsContent value="cameras" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Cameras</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.top_cameras.length > 0 ? (
                <div className="space-y-4">
                  {stats.top_cameras.map((camera, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Camera className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">{camera.camera_name}</p>
                          <p className="text-sm text-gray-600">
                            {camera.detection_count} detections
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="default">
                          {camera.accuracy.toFixed(1)}% accuracy
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <div className="text-center">
                    <Camera className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No camera performance data available</p>
                    <p className="text-sm">Data will appear here once cameras start detecting</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Detection Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.detection_types.length > 0 && stats.total_detections > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Tooltip />
                        <Pie
                          data={stats.detection_types}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                        >
                          {stats.detection_types.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </RechartsPieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center space-x-4 mt-4">
                      {stats.detection_types.map((type, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: type.color }}
                          />
                          <span className="text-sm">{type.name}: {type.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    <div className="text-center">
                      <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>No detection distribution data available</p>
                      <p className="text-sm">Data will appear here once detections are recorded</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weekly Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.detection_trends.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={stats.detection_trends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="total" 
                        stroke="#3B82F6" 
                        strokeWidth={3}
                        name="Total Detections"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    <div className="text-center">
                      <Eye className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>No weekly summary data available</p>
                      <p className="text-sm">Data will appear here once detections are recorded</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsPage;