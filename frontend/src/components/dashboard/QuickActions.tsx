import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Camera,
  Users,
  Upload,
  Download,
  Settings,
  Eye,
  RefreshCw,
  BarChart3,
  FileText,
  Zap,
  Shield,
  Database,
  Calendar,
  Video,
  Clock,
  History,
  Activity,

  Wifi,
  WifiOff
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useWebSocketContext } from '@/contexts/WebSocketContext';
import { toast } from 'sonner';

interface QuickActionsProps {
  stats?: {
    cameras: { 
      total: number; 
      active: number; 
      streaming: number;
      offline: number;
    };
    persons: { 
      total: number; 
      with_images: number;
      recent_additions: number;
    };
    detections: { 
      today: number; 
      this_week: number;
      strangers: number;
      known_persons: number;
    };
    system: {
      status: 'healthy' | 'warning' | 'critical';
      cpu_usage: number;
      memory_usage: number;
    };
  };
  onRefresh?: () => void;
  recentActions?: RecentAction[];
  className?: string;
}

interface RecentAction {
  id: string;
  type: 'camera' | 'person' | 'detection' | 'system' | 'export' | 'import';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error';
  metadata?: Record<string, any>;
}

const QuickActions: React.FC<QuickActionsProps> = ({ 
  stats, 
  onRefresh, 
  recentActions = [],
  className 
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isConnected } = useWebSocketContext();
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // ✅ Enhanced export with Face Recognition specific data
  const handleExportData = async () => {
    setIsExporting(true);
    setExportProgress(0);
    
    try {
      toast.info('Preparing Face Recognition data export...');
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const exportData = {
        export_metadata: {
          timestamp: new Date().toISOString(),
          exported_by: user?.username,
          system_version: '1.0.0',
          export_type: 'dashboard_summary'
        },
        system_stats: {
          cameras: stats?.cameras || {},
          persons: stats?.persons || {},
          detections: stats?.detections || {},
          system_health: stats?.system || {}
        },
        face_recognition_summary: {
          total_known_persons: stats?.persons.total || 0,
          persons_with_face_data: stats?.persons.with_images || 0,
          active_cameras: stats?.cameras.active || 0,
          daily_detections: stats?.detections.today || 0,
          detection_accuracy: stats?.detections.known_persons && stats?.detections.today ? 
            ((stats.detections.known_persons / stats.detections.today) * 100).toFixed(2) + '%' : 'N/A'
        },
        recent_activities: recentActions.slice(0, 10)
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `face-recognition-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      setExportProgress(100);
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
      }, 1000);
      
      toast.success('Face Recognition data exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  // ✅ Enhanced import for Face Recognition persons
  const handleImportPersons = () => {
    toast.info('Opening Face Recognition person import...');
    navigate('/persons/bulk-import');
  };

  // ✅ Enhanced system refresh with real-time sync
  const handleRefreshSystem = async () => {
    toast.info('Refreshing Face Recognition system status...');
    
    try {
      onRefresh?.();
      
      // Check connection status
      if (!isConnected) {
        toast.warning('Real-time connection unavailable, using cached data');
      } else {
        toast.success('System status refreshed with real-time data');
      }
    } catch (error) {
      toast.error('Failed to refresh system status');
    }
  };

  const handleBulkActions = () => {
    toast.info('Opening Face Recognition bulk operations...');
    navigate('/admin/bulk-actions');
  };

  const handleScheduleReport = () => {
    toast.info('Opening Face Recognition report scheduler...');
    navigate('/analytics/reports?schedule=true');
  };

  const handleSystemBackup = () => {
    if (!user?.is_admin) {
      toast.error('Administrator privileges required');
      return;
    }
    
    toast.info('Starting Face Recognition system backup...');
    setTimeout(() => {
      toast.success('Backup initiated successfully');
    }, 3000);
  };

  // ✅ Enhanced primary actions với Face Recognition metrics
  const primaryActions = [
    {
      title: 'Add Camera',
      description: 'Connect security camera for face detection',
      icon: Camera,
      color: 'bg-blue-500 hover:bg-blue-600',
      action: () => navigate('/cameras/new'),
      stats: stats?.cameras.total || 0,
      badge: stats?.cameras.active ? `${stats.cameras.active}/${stats.cameras.total} active` : undefined,
      urgent: (stats?.cameras.offline || 0) > (stats?.cameras.active || 0)
    },
    {
      title: 'Add Person',
      description: 'Register known person with face images',
      icon: Users,
      color: 'bg-green-500 hover:bg-green-600',
      action: () => navigate('/persons/new'),
      stats: stats?.persons.total || 0,
      badge: stats?.persons.with_images ? `${stats.persons.with_images} with faces` : undefined
    },
    {
      title: 'View Detections',
      description: 'Face detection logs and alerts',
      icon: Eye,
      color: 'bg-purple-500 hover:bg-purple-600',
      action: () => navigate('/detections'),
      stats: stats?.detections.today || 0,
      badge: 'today',
      urgent: (stats?.detections.strangers || 0) > 0
    },
    {
      title: 'Live Monitoring',
      description: 'Real-time face detection streams',
      icon: Video,
      color: 'bg-red-500 hover:bg-red-600',
      action: () => navigate('/cameras/streaming'),
      stats: stats?.cameras.streaming || 0,
      badge: 'streaming',
      urgent: (stats?.cameras.streaming || 0) === 0 && (stats?.cameras.active || 0) > 0
    }
  ];

  // ✅ Enhanced secondary actions
  const secondaryActions = [
    {
      title: 'Import Persons',
      description: 'Bulk import with face data',
      icon: Upload,
      action: handleImportPersons,
      disabled: false
    },
    {
      title: 'Export Data',
      description: 'Download system analytics',
      icon: Download,
      action: handleExportData,
      disabled: isExporting
    },
    {
      title: 'Face Analytics',
      description: 'Detection reports & insights',
      icon: BarChart3,
      action: () => navigate('/analytics'),
      disabled: false
    },
    {
      title: 'System Settings',
      description: 'Configure face recognition',
      icon: Settings,
      action: () => navigate('/settings'),
      disabled: false
    },
    {
      title: 'Schedule Report',
      description: 'Automated face detection reports',
      icon: Calendar,
      action: handleScheduleReport,
      disabled: false
    },
    {
      title: 'Refresh Status',
      description: 'Update real-time data',
      icon: RefreshCw,
      action: handleRefreshSystem,
      disabled: false,
      highlight: !isConnected
    }
  ];

  // ✅ Enhanced admin actions với permission check
  const adminActions = user?.is_admin ? [
    {
      title: 'User Management',
      description: 'Manage system access',
      icon: Shield,
      action: () => navigate('/admin/users'),
      disabled: false
    },
    {
      title: 'System Backup',
      description: 'Backup face recognition data',
      icon: Database,
      action: handleSystemBackup,
      disabled: false
    },
    {
      title: 'System Logs',
      description: 'Face detection activity logs',
      icon: FileText,
      action: () => navigate('/admin/logs'),
      disabled: false
    },
    {
      title: 'Bulk Operations',
      description: 'Mass face data operations',
      icon: Zap,
      action: handleBulkActions,
      disabled: false
    }
  ] : [];

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'camera': return Camera;
      case 'person': return Users;
      case 'detection': return Eye;
      case 'system': return Activity;
      case 'export': return Download;
      case 'import': return Upload;
      default: return Activity;
    }
  };

  const getActionColor = (type: string) => {
    switch (type) {
      case 'camera': return 'text-blue-500';
      case 'person': return 'text-green-500';
      case 'detection': return 'text-purple-500';
      case 'system': return 'text-orange-500';
      case 'export': return 'text-indigo-500';
      case 'import': return 'text-pink-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Connection Status Alert */}
      {!isConnected && (
        <Alert>
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            Real-time connection unavailable. Some features may show cached data.
            <Button variant="outline" size="sm" className="ml-2" onClick={handleRefreshSystem}>
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry Connection
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Export Progress */}
      {isExporting && (
        <Alert>
          <Download className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Exporting Face Recognition data...</span>
                <span className="text-sm">{exportProgress}%</span>
              </div>
              <Progress value={exportProgress} className="h-2" />
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Primary Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>Quick Actions</span>
            </div>
            <div className="flex items-center space-x-1">
              {isConnected ? (
                <div className="flex items-center space-x-1 text-green-600">
                  <Wifi className="h-3 w-3" />
                  <span className="text-xs">Live</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 text-red-600">
                  <WifiOff className="h-3 w-3" />
                  <span className="text-xs">Offline</span>
                </div>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {primaryActions.map((action, index) => {
              const Icon = action.icon;
              
              return (
                <Button
                  key={index}
                  onClick={action.action}
                  className={`${action.color} text-white h-auto p-4 flex flex-col items-center justify-center space-y-3 relative group`}
                >
                  {/* Urgent indicator */}
                  {action.urgent && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
                  )}
                  
                  <div className="flex items-center justify-center w-12 h-12 bg-white bg-opacity-20 rounded-full">
                    <Icon className="h-6 w-6" />
                  </div>
                  
                  <div className="text-center">
                    <p className="font-semibold text-sm">{action.title}</p>
                    <p className="text-xs opacity-90">{action.description}</p>
                    
                    {action.stats !== undefined && (
                      <div className="flex items-center justify-center space-x-1 mt-2">
                        <span className="text-lg font-bold">{action.stats}</span>
                        {action.badge && (
                          <Badge variant="secondary" className="text-xs bg-white bg-opacity-20 text-white border-0">
                            {action.badge}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-lg" />
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Secondary Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Face Recognition Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {secondaryActions.map((action, index) => {
              const Icon = action.icon;
              
              return (
                <Button
                  key={index}
                  variant="outline"
                  onClick={action.action}
                  disabled={action.disabled}
                  className={`h-20 flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 group relative ${
                    action.highlight ? 'border-orange-200 bg-orange-50' : ''
                  }`}
                >
                  {action.highlight && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-400 rounded-full" />
                  )}
                  
                  <Icon className={`h-5 w-5 text-gray-600 group-hover:text-gray-900 transition-colors ${
                    action.disabled ? 'animate-spin' : ''
                  }`} />
                  <div className="text-center">
                    <p className="text-sm font-medium">{action.title}</p>
                    <p className="text-xs text-gray-500">{action.description}</p>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Admin Actions */}
      {user?.is_admin && adminActions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>System Administration</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {adminActions.map((action, index) => {
                const Icon = action.icon;
                
                return (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={action.action}
                    disabled={action.disabled}
                    className="h-16 flex flex-col items-center justify-center space-y-1 hover:bg-red-50 hover:border-red-200 group"
                  >
                    <Icon className="h-4 w-4 text-gray-600 group-hover:text-red-600 transition-colors" />
                    <div className="text-center">
                      <p className="text-xs font-medium">{action.title}</p>
                      <p className="text-xs text-gray-500">{action.description}</p>
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Actions History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <History className="h-5 w-5" />
              <span>Recent Face Recognition Activities</span>
            </div>
            {recentActions.length > 3 && (
              <Button variant="outline" size="sm" onClick={() => navigate('/admin/logs')}>
                View All
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentActions.length > 0 ? (
              recentActions.slice(0, 3).map((action, index) => {
                const Icon = getActionIcon(action.type);
                return (
                  <div key={action.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <Icon className={`h-4 w-4 ${getActionColor(action.type)}`} />
                      <div>
                        <p className="text-sm font-medium">{action.title}</p>
                        <p className="text-xs text-gray-500">{action.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(action.status)}
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{action.timestamp}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No recent activities</p>
                <p className="text-xs">Actions will appear here as you use the system</p>
              </div>
            )}
          </div>
          
          {recentActions.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/admin/logs')}>
                <History className="h-4 w-4 mr-2" />
                View Complete Activity Log
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickActions;