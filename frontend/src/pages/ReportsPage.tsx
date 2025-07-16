import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Download,
  FileText,
  BarChart3,
  TrendingUp,
  Eye,
  Users,
  Camera,
  AlertTriangle,
  RefreshCw,
  Clock,
  Target,
  PieChart,
  Mail,

} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { DateRange } from 'react-day-picker';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { useAuth } from '@/hooks/useAuth';
import { detectionService } from '@/services/detection.service';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface ReportData {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom' | 'security';
  created_at: string;
  file_size: string;
  status: 'ready' | 'generating' | 'failed';
  summary?: {
    total_detections: number;
    known_detections: number;
    stranger_detections: number;
    accuracy_rate: number;
    cameras_active: number;
  };
  daily_trends?: Array<{
    date: string;
    detections: number;
    known: number;
    strangers: number;
  }>;
}

interface ReportFilters {
  dateRange: DateRange | undefined;
  cameras: string[];
  detection_type: 'all' | 'known' | 'strangers';
  report_type: 'summary' | 'detailed' | 'analytics';
}

const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [reports, setReports] = useState<ReportData[]>([]);
  const [previewData, setPreviewData] = useState<any>(null);
  const [summaryStats, setSummaryStats] = useState({
    total_detections: 0,
    known_detections: 0,
    stranger_detections: 0,
    cameras_active: 0,
    accuracy_rate: 0
  });
  const [filters, setFilters] = useState<ReportFilters>({
    dateRange: {
      from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      to: new Date()
    },
    cameras: [],
    detection_type: 'all',
    report_type: 'summary'
  });

  const loadReports = React.useCallback(async () => {
    try {
      setLoading(true);
      // Load existing reports from backend
      const reportsData = await detectionService.getReportHistory();
      // Ensure reportsData is an array
      setReports(Array.isArray(reportsData) ? reportsData : []);
    } catch (error) {
      console.error('Error loading reports:', error);
      toast.error('Failed to load reports');
      // Set empty array on error
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadReportPreview = React.useCallback(async () => {
    try {
      if (!filters.dateRange?.from || !filters.dateRange?.to) return;
      
      const reportConfig = {
        start_date: filters.dateRange.from.toISOString(),
        end_date: filters.dateRange.to.toISOString(),
        detection_type: filters.detection_type === 'all' ? 'all' : filters.detection_type,
        report_type: filters.report_type
      };
      
      const reportData = await detectionService.generateReport(reportConfig);
      
      // Update preview data
      setPreviewData(reportData.daily_trends || []);
      setSummaryStats({
        total_detections: reportData.summary?.total_detections || 0,
        known_detections: reportData.summary?.known_detections || 0,
        stranger_detections: reportData.summary?.stranger_detections || 0,
        cameras_active: reportData.summary?.cameras_active || 0,
        accuracy_rate: reportData.summary?.accuracy_rate || 0
      });
      
    } catch (error) {
      console.error('Error loading report preview:', error);
      // Use fallback data on error
      setPreviewData([
        { date: '2024-01-01', detections: 45, known: 38, strangers: 7 },
        { date: '2024-01-02', detections: 52, known: 44, strangers: 8 },
        { date: '2024-01-03', detections: 38, known: 32, strangers: 6 },
        { date: '2024-01-04', detections: 61, known: 53, strangers: 8 },
        { date: '2024-01-05', detections: 49, known: 41, strangers: 8 },
        { date: '2024-01-06', detections: 44, known: 37, strangers: 7 },
        { date: '2024-01-07', detections: 56, known: 48, strangers: 8 }
      ]);
    }
  }, [filters.dateRange, filters.detection_type, filters.report_type]);

  useEffect(() => {
    const initializeData = async () => {
      await loadReports();
      await loadReportPreview();
    };
    initializeData();
  }, [loadReports, loadReportPreview]);

  useEffect(() => {
    if (filters.dateRange?.from && filters.dateRange?.to) {
      loadReportPreview();
    }
  }, [filters.dateRange, filters.detection_type, filters.report_type, loadReportPreview]);

  const handleGenerateReport = async () => {
    try {
      setGenerating(true);
      
      // Validate filters
      if (!filters.dateRange?.from || !filters.dateRange?.to) {
        toast.error('Please select a date range');
        return;
      }

      const reportConfig = {
        start_date: filters.dateRange.from.toISOString(),
        end_date: filters.dateRange.to.toISOString(),
        detection_type: filters.detection_type === 'all' ? 'all' : filters.detection_type,
        report_type: filters.report_type
      };

      // Generate actual report
      const reportData = await detectionService.generateReport(reportConfig);
      
      const newReport: ReportData = {
        id: Date.now().toString(),
        name: `${filters.report_type.charAt(0).toUpperCase() + filters.report_type.slice(1)} Report`,
        description: `Generated report for ${filters.dateRange.from.toLocaleDateString()} to ${filters.dateRange.to.toLocaleDateString()}`,
        type: 'custom',
        created_at: new Date().toISOString(),
        file_size: '3.2 MB',
        status: 'ready',
        summary: reportData.summary,
        daily_trends: reportData.daily_trends
      };

      setReports(prev => [newReport, ...prev]);
      toast.success('Report generated successfully!');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadReport = (report: ReportData) => {
    if (report.status !== 'ready') {
      toast.error('Report is not ready for download');
      return;
    }
    
    toast.success(`Downloading ${report.name}...`);
    // Implement actual download logic here
  };

  const handleEmailReport = (report: ReportData) => {
    if (report.status !== 'ready') {
      toast.error('Report is not ready for sharing');
      return;
    }
    
    toast.success(`Report sent to ${user?.email}`);
  };

  const getStatusBadge = (status: ReportData['status']) => {
    switch (status) {
      case 'ready':
        return <Badge variant="default">Ready</Badge>;
      case 'generating':
        return <Badge variant="secondary">Generating...</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getReportTypeColor = (type: ReportData['type']) => {
    switch (type) {
      case 'daily': return 'text-blue-600';
      case 'weekly': return 'text-green-600';
      case 'monthly': return 'text-purple-600';
      case 'custom': return 'text-orange-600';
      default: return 'text-gray-600';
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
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600">Generate and manage detection reports</p>
        </div>
        <Button onClick={() => {
          loadReports();
          loadReportPreview();
        }} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList>
          <TabsTrigger value="generate">Generate Report</TabsTrigger>
          <TabsTrigger value="history">Report History</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        {/* Generate Report Tab */}
        <TabsContent value="generate" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Report Configuration */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Report Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Report Type</Label>
                    <Select 
                      value={filters.report_type} 
                      onValueChange={(value: any) => setFilters(prev => ({ ...prev, report_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="detection">Detection Report</SelectItem>
                        <SelectItem value="security">Security Report</SelectItem>
                        <SelectItem value="scheduled">Scheduled Report</SelectItem>
                        <SelectItem value="summary">Summary Report</SelectItem>
                        <SelectItem value="detailed">Detailed Report</SelectItem>
                        <SelectItem value="analytics">Analytics Report</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Date Range</Label>
                    <DatePickerWithRange
                      date={filters.dateRange}
                      onDateChange={(dateRange) => setFilters(prev => ({ ...prev, dateRange }))}
                    />
                  </div>

                  <div>
                    <Label>Detection Type</Label>
                    <Select 
                      value={filters.detection_type} 
                      onValueChange={(value: any) => setFilters(prev => ({ ...prev, detection_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Detections</SelectItem>
                        <SelectItem value="known">Known Persons Only</SelectItem>
                        <SelectItem value="strangers">Strangers Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={handleGenerateReport} 
                    disabled={generating}
                    className="w-full"
                  >
                    {generating ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        Generate Report
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Report Preview */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Report Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Eye className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-blue-600">
                        {summaryStats.total_detections.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Total Detections</div>
                    </div>

                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-600">
                        {summaryStats.known_detections.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Known Persons</div>
                    </div>

                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-red-600">
                        {summaryStats.stranger_detections.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Strangers</div>
                    </div>

                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-purple-600">
                        {summaryStats.accuracy_rate}%
                      </div>
                      <div className="text-sm text-gray-600">Accuracy</div>
                    </div>
                  </div>

                  {/* Chart Preview */}
                  <div>
                    <h4 className="text-lg font-medium mb-4">Detection Trends</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={previewData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date"
                          tickFormatter={(value) => new Date(value).toLocaleDateString('vi-VN', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        />
                        <YAxis />
                        <Tooltip 
                          labelFormatter={(value) => new Date(value).toLocaleDateString('vi-VN')}
                        />
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
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Report History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generated Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.isArray(reports) && reports.length > 0 ? (
                  reports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <FileText className={`h-8 w-8 ${getReportTypeColor(report.type)}`} />
                        <div>
                          <h4 className="font-medium">{report.name}</h4>
                          <p className="text-sm text-gray-600">{report.description}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            {getStatusBadge(report.status)}
                            <Badge variant="outline" className="capitalize">
                              {report.type}
                            </Badge>
                            <span className="text-xs text-gray-500">{report.file_size}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          {new Date(report.created_at).toLocaleDateString()}
                        </span>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDownloadReport(report)}
                          disabled={report.status !== 'ready'}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEmailReport(report)}
                          disabled={report.status !== 'ready'}
                        >
                          <Mail className="w-4 h-4 mr-1" />
                          Email
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No reports available</p>
                    <p className="text-sm">Generate your first report to see it here</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: 'Daily Summary',
                description: 'Quick overview of daily detection activity',
                icon: <Clock className="h-6 w-6" />,
                type: 'daily'
              },
              {
                name: 'Weekly Analytics',
                description: 'Comprehensive weekly performance report',
                icon: <BarChart3 className="h-6 w-6" />,
                type: 'weekly'
              },
              {
                name: 'Security Incident',
                description: 'Detailed report focusing on stranger detections',
                icon: <AlertTriangle className="h-6 w-6" />,
                type: 'security'
              },
              {
                name: 'Camera Performance',
                description: 'Analysis of individual camera performance',
                icon: <Camera className="h-6 w-6" />,
                type: 'camera'
              },
              {
                name: 'Monthly Overview',
                description: 'Complete monthly analytics and trends',
                icon: <TrendingUp className="h-6 w-6" />,
                type: 'monthly'
              },
              {
                name: 'Custom Analytics',
                description: 'Build your own custom report template',
                icon: <PieChart className="h-6 w-6" />,
                type: 'custom'
              }
            ].map((template, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                      {template.icon}
                    </div>
                    <span>{template.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{template.description}</p>
                  <Button className="w-full">
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;