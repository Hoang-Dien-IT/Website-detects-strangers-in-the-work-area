import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  ReferenceLine
} from 'recharts';
import {
  TrendingUp,
  BarChart3,
  Activity,
  Calendar,
  Clock,
  Eye,
  Download,
  RefreshCw,
  Zap,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { detectionService } from '@/services/detection.service';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface TrendsData {
  daily_trends: Array<{
    date: string;
    total_detections: number;
    known_detections: number;
    stranger_detections: number;
    accuracy_rate: number;
  }>;
  hourly_trends: Array<{
    hour: string;
    detections: number;
    peak_activity: boolean;
  }>;
  monthly_comparison: Array<{
    month: string;
    current_year: number;
    previous_year: number;
    growth_rate: number;
  }>;
  detection_patterns: Array<{
    pattern_type: string;
    count: number;
    percentage: number;
    color: string;
  }>;
  performance_metrics: {
    avg_response_time: number;
    peak_detection_hour: string;
    most_active_day: string;
    detection_growth: number;
    accuracy_trend: number;
  };
}

const TrendsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('30d');
  const [chartType, setChartType] = useState('line');
  const [trendsData, setTrendsData] = useState<TrendsData>({
    daily_trends: [],
    hourly_trends: [],
    monthly_comparison: [],
    detection_patterns: [],
    performance_metrics: {
      avg_response_time: 0,
      peak_detection_hour: '',
      most_active_day: '',
      detection_growth: 0,
      accuracy_trend: 0
    }
  });

  useEffect(() => {
    const fetchTrendsData = async () => {
      try {
        if (!loading) setRefreshing(true);
        
        const trendsResponse = await detectionService.getTrendsData(timeRange);
        
        // Use real data from backend
        const transformedData: TrendsData = {
          daily_trends: (trendsResponse.daily_trends || []).map((day: any) => ({
            ...day,
            date: new Date(day.date).toLocaleDateString('vi-VN', { 
              month: 'short', 
              day: 'numeric' 
            })
          })),
          hourly_trends: Object.entries(trendsResponse.hourly_pattern || {}).map(([hour, detections]) => ({
            hour: hour.includes(':') ? hour : `${hour.padStart(2, '0')}:00`,
            detections: detections as number,
            peak_activity: parseInt(hour.split(':')[0]) >= 8 && parseInt(hour.split(':')[0]) <= 18
          })).sort((a, b) => {
            const hourA = parseInt(a.hour.split(':')[0]);
            const hourB = parseInt(b.hour.split(':')[0]);
            return hourA - hourB;
          }),
          monthly_comparison: trendsResponse.monthly_comparison || [],
          detection_patterns: trendsResponse.detection_patterns || [],
          performance_metrics: {
            avg_response_time: trendsResponse.performance_metrics?.avg_response_time || 0.85,
            peak_detection_hour: trendsResponse.performance_metrics?.peak_detection_hour || '14:00',
            most_active_day: trendsResponse.performance_metrics?.most_active_day || 'Wednesday',
            detection_growth: trendsResponse.performance_metrics?.detection_growth || 0,
            accuracy_trend: trendsResponse.performance_metrics?.accuracy_trend || 0
          }
        };
        
        setTrendsData(transformedData);
        
      } catch (error) {
        console.error('Error loading trends data:', error);
        toast.error('Failed to load trends data');
        
        // Fallback to empty data
        setTrendsData({
          daily_trends: [],
          hourly_trends: [],
          monthly_comparison: [],
          detection_patterns: [],
          performance_metrics: {
            avg_response_time: 0,
            peak_detection_hour: '14:00',
            most_active_day: 'Wednesday',
            detection_growth: 0,
            accuracy_trend: 0
          }
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };
    
    fetchTrendsData();
  }, [timeRange, loading]);

  const handleExportTrends = async () => {
    try {
      toast.info('🔄 Exporting trends report...');
      
      // Use trends data instead of general analytics
      const trendsResponse = await detectionService.getTrendsData(timeRange);
      
      // Create CSV content
      const csvContent = [
        // Header
        'Date,Total Detections,Known Detections,Stranger Detections,Accuracy Rate',
        // Data rows
        ...trendsResponse.daily_trends.map((day: any) => 
          `${day.date},${day.total_detections},${day.known_detections},${day.stranger_detections},${day.accuracy_rate}%`
        ),
        '',
        'Monthly Comparison',
        'Month,Current Year,Previous Year,Growth Rate',
        ...trendsResponse.monthly_comparison.map((month: any) => 
          `${month.month},${month.current_year},${month.previous_year},${month.growth_rate}%`
        )
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `trends-report-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('✅ Trends report exported successfully');
    } catch (error) {
      console.error('Error exporting trends:', error);
      toast.error('❌ Failed to export trends report');
    }
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) return <ArrowUp className="h-4 w-4 text-green-500" />;
    if (value < 0) return <ArrowDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getTrendColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 p-6 space-y-6">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Trends Analysis</h1>
              <p className="text-gray-600">Historical patterns and trend analysis</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Select value={chartType} onValueChange={setChartType}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">Line Chart</SelectItem>
                <SelectItem value="bar">Bar Chart</SelectItem>
                <SelectItem value="area">Area Chart</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => {
                setLoading(true);
                setRefreshing(true);
                window.location.reload();
              }}
              variant="outline"
              disabled={refreshing}
              className="shadow-sm hover:shadow-md transition-shadow"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button
              onClick={handleExportTrends}
              className="shadow-sm hover:shadow-md transition-shadow"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Trends
            </Button>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Detection Growth</CardTitle>
            <TrendingUp className={`h-4 w-4 ${trendsData.performance_metrics.detection_growth >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${trendsData.performance_metrics.detection_growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trendsData.performance_metrics.detection_growth > 0 ? '+' : ''}
              {trendsData.performance_metrics.detection_growth}%
            </div>
            <div className="flex items-center space-x-2 mt-2">
              {getTrendIcon(trendsData.performance_metrics.detection_growth)}
              <span className={`text-sm ${getTrendColor(trendsData.performance_metrics.detection_growth)}`}>
                vs last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Accuracy Trend</CardTitle>
            <Activity className={`h-4 w-4 ${trendsData.performance_metrics.accuracy_trend >= 0 ? 'text-blue-600' : 'text-red-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${trendsData.performance_metrics.accuracy_trend >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {trendsData.performance_metrics.accuracy_trend > 0 ? '+' : ''}
              {trendsData.performance_metrics.accuracy_trend}%
            </div>
            <div className="flex items-center space-x-2 mt-2">
              {getTrendIcon(trendsData.performance_metrics.accuracy_trend)}
              <span className={`text-sm ${getTrendColor(trendsData.performance_metrics.accuracy_trend)}`}>
                improvement
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Peak Hour</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{trendsData.performance_metrics.peak_detection_hour}</div>
            <div className="flex items-center space-x-2 mt-2">
              <Zap className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-orange-600">
                Highest activity
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Response Time</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{trendsData.performance_metrics.avg_response_time}s</div>
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant="outline" className="bg-purple-50 text-purple-700">
                Average
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Trends Chart */}
        <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <span>Daily Detection Trends</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              {chartType === 'line' ? (
                <LineChart data={trendsData.daily_trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="total_detections"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    name="Total Detections"
                  />
                  <Line
                    type="monotone"
                    dataKey="known_detections"
                    stroke="#10B981"
                    strokeWidth={2}
                    name="Known Persons"
                  />
                  <Line
                    type="monotone"
                    dataKey="stranger_detections"
                    stroke="#EF4444"
                    strokeWidth={2}
                    name="Strangers"
                  />
                </LineChart>
              ) : chartType === 'bar' ? (
                <BarChart data={trendsData.daily_trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total_detections" fill="#3B82F6" name="Total Detections" />
                  <Bar dataKey="known_detections" fill="#10B981" name="Known Persons" />
                  <Bar dataKey="stranger_detections" fill="#EF4444" name="Strangers" />
                </BarChart>
              ) : (
                <AreaChart data={trendsData.daily_trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="total_detections"
                    stackId="1"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    name="Total Detections"
                  />
                  <Area
                    type="monotone"
                    dataKey="known_detections"
                    stackId="1"
                    stroke="#10B981"
                    fill="#10B981"
                    name="Known Persons"
                  />
                  <Area
                    type="monotone"
                    dataKey="stranger_detections"
                    stackId="1"
                    stroke="#EF4444"
                    fill="#EF4444"
                    name="Strangers"
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Hourly Activity Pattern */}
        <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <span>Hourly Activity Pattern</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trendsData.hourly_trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="detections" fill="#F59E0B" name="Detections" />
                <ReferenceLine y={30} stroke="#EF4444" strokeDasharray="5 5" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detection Patterns and Monthly Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Detection Patterns */}
        <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-purple-600" />
              <span>Detection Patterns</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={trendsData.detection_patterns}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ pattern_type, percentage }) => `${pattern_type} ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {trendsData.detection_patterns.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Comparison */}
        <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <span>Monthly Comparison</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trendsData.monthly_comparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="previous_year" fill="#94A3B8" name="Previous Year" />
                <Bar dataKey="current_year" fill="#3B82F6" name="Current Year" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Insights Summary */}
      <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-blue-600" />
            <span>Key Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">Growth Trend</span>
              </div>
              <p className="text-sm text-green-700">
                Detection accuracy has improved by {trendsData.performance_metrics.accuracy_trend}% over the selected period, 
                indicating better system performance.
              </p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <span className="font-medium text-orange-800">Peak Activity</span>
              </div>
              <p className="text-sm text-orange-700">
                Highest detection activity occurs at {trendsData.performance_metrics.peak_detection_hour}, 
                typically during business hours.
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-800">Performance</span>
              </div>
              <p className="text-sm text-blue-700">
                Average response time is {trendsData.performance_metrics.avg_response_time}s, 
                meeting optimal performance standards.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrendsPage;
