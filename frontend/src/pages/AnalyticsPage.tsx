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
// import { detectionService } from '@/services/detection.service';
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

  // Sample data for charts
  const mockDetectionTrends = [
    { date: '2024-01-01', known: 45, strangers: 12, total: 57 },
    { date: '2024-01-02', known: 52, strangers: 8, total: 60 },
    { date: '2024-01-03', known: 38, strangers: 15, total: 53 },
    { date: '2024-01-04', known: 61, strangers: 6, total: 67 },
    { date: '2024-01-05', known: 49, strangers: 11, total: 60 },
    { date: '2024-01-06', known: 44, strangers: 9, total: 53 },
    { date: '2024-01-07', known: 56, strangers: 13, total: 69 }
  ];

  const mockHourlyPatterns = [
    { hour: 0, detections: 2 }, { hour: 1, detections: 1 }, { hour: 2, detections: 0 },
    { hour: 3, detections: 1 }, { hour: 4, detections: 0 }, { hour: 5, detections: 3 },
    { hour: 6, detections: 8 }, { hour: 7, detections: 15 }, { hour: 8, detections: 25 },
    { hour: 9, detections: 32 }, { hour: 10, detections: 28 }, { hour: 11, detections: 35 },
    { hour: 12, detections: 30 }, { hour: 13, detections: 38 }, { hour: 14, detections: 33 },
    { hour: 15, detections: 29 }, { hour: 16, detections: 31 }, { hour: 17, detections: 27 },
    { hour: 18, detections: 22 }, { hour: 19, detections: 18 }, { hour: 20, detections: 12 },
    { hour: 21, detections: 8 }, { hour: 22, detections: 5 }, { hour: 23, detections: 3 }
  ];

  // const detectionTypeColors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B'];

  useEffect(() => {
    loadAnalytics();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Mock data for now - replace with actual API calls
      const mockStats: AnalyticsStats = {
        total_detections: 1247,
        known_detections: 952,
        stranger_detections: 295,
        accuracy_rate: 97.8,
        cameras_active: 8,
        top_cameras: [
          { camera_name: 'Main Entrance', detection_count: 342, accuracy: 98.2 },
          { camera_name: 'Office Floor 1', detection_count: 287, accuracy: 97.1 },
          { camera_name: 'Parking Lot', detection_count: 156, accuracy: 96.8 },
          { camera_name: 'Reception Area', detection_count: 134, accuracy: 98.9 },
          { camera_name: 'Conference Room', detection_count: 89, accuracy: 99.1 }
        ],
        detection_trends: mockDetectionTrends,
        hourly_patterns: mockHourlyPatterns,
        detection_types: [
          { name: 'Known Persons', value: 952, color: '#10B981' },
          { name: 'Strangers', value: 295, color: '#EF4444' }
        ]
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    toast.success('Analytics report exported successfully');
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
              {((stats.known_detections / stats.total_detections) * 100).toFixed(1)}% of total
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
              {((stats.stranger_detections / stats.total_detections) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accuracy Rate</CardTitle>
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
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={mockDetectionTrends}>
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
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={mockHourlyPatterns}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="detections" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
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
                        {camera.accuracy}% accuracy
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
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
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Tooltip />
                    <RechartsPieChart
                      data={stats.detection_types}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                    >
                      {stats.detection_types.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </RechartsPieChart>
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="flex justify-center space-x-4 mt-4">
                  {stats.detection_types.map((type, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: type.color }}
                      />
                      <span className="text-sm">{type.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weekly Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockDetectionTrends}>
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
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsPage;