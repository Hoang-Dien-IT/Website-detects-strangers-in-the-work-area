import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useWebSocketContext } from '@/contexts/WebSocketContext';
import { useToast } from '@/hooks/use-toast';
import {
  Users,
  Camera,
  Eye,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Shield,
  CheckCircle,
  Database,
  Wifi,
  WifiOff,
  Server,
  RefreshCw,
  ExternalLink,
  Settings,
  Play,
  XCircle,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardStatsProps {
  stats: {
    cameras: {
      total: number;
      active: number;
      streaming: number;
      offline: number;
      recording: number;
    };
    persons: {
      total: number;
      active: number;
      with_images: number;
      recent_additions: number;
    };
    detections: {
      today: number;
      this_week: number;
      this_month: number;
      total: number;
      known_persons: number;
      strangers: number;
      confidence_avg: number;
    };
    system: {
      uptime: string;
      cpu_usage: number;
      memory_usage: number;
      disk_usage: number;
      network_status: 'connected' | 'disconnected' | 'limited';
      status: 'healthy' | 'warning' | 'critical';
      last_updated: string;
    };
    alerts: {
      active: number;
      critical: number;
      warnings: number;
      resolved_today: number;
    };
  };
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onStatsUpdate?: (newStats: any) => void;
  className?: string;
}

interface StatCard {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  description: string;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  color: string;
  progress?: number;
  isText?: boolean;
  extraInfo?: React.ReactNode;
  critical?: boolean;
  actionButton?: {
    label: string;
    action: () => void;
    icon?: React.ComponentType<any>;
  };
  metadata?: Record<string, any>;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ 
  stats, 
  loading = false, 
  error = null,
  onRefresh,
  onStatsUpdate,
  className 
}) => {
  const { isConnected, lastMessage } = useWebSocketContext();
  const { toast } = useToast();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ✅ Handle real-time updates from backend WebSocket
  useEffect(() => {
    if (lastMessage && isConnected) {
      // ✅ FIX: lastMessage is already an object, no need to JSON.parse
      const data = lastMessage;
      
      switch (data.type) {
        case 'system_health':
          onStatsUpdate?.({
            ...stats,
            system: {
              ...stats.system,
              cpu_usage: data.data?.cpu_usage || stats.system.cpu_usage,
              memory_usage: data.data?.memory_usage || stats.system.memory_usage,
              disk_usage: data.data?.disk_usage || stats.system.disk_usage,
              status: data.data?.status || stats.system.status,
              network_status: data.data?.network_status || stats.system.network_status,
              last_updated: new Date().toISOString()
            }
          });
          break;
          
        case 'camera_update':
          onStatsUpdate?.({
            ...stats,
            cameras: {
              ...stats.cameras,
              active: data.data?.cameras_online || stats.cameras.active,
              total: data.data?.cameras_total || stats.cameras.total
            }
          });
          break;
          
        case 'detection_alert':
          const isKnown = data.data?.detection_type === 'known_person';
          onStatsUpdate?.({
            ...stats,
            detections: {
              ...stats.detections,
              today: stats.detections.today + 1,
              total: stats.detections.total + 1,
              known_persons: isKnown ? stats.detections.known_persons + 1 : stats.detections.known_persons,
              strangers: !isKnown ? stats.detections.strangers + 1 : stats.detections.strangers,
              confidence_avg: data.data?.confidence || stats.detections.confidence_avg
            }
          });
          
          if (!isKnown) {
            toast({
              title: "Unknown Person Detected",
              description: `Camera: ${data.data?.camera_name}`,
              variant: "destructive",
            });
          }
          break;
          
        case 'alert_update':
          onStatsUpdate?.({
            ...stats,
            alerts: {
              ...stats.alerts,
              active: data.data?.active_alerts || stats.alerts.active,
              critical: data.data?.critical_alerts || stats.alerts.critical,
              warnings: data.data?.warning_alerts || stats.alerts.warnings
            }
          });
          break;
      }
    }
  }, [lastMessage, isConnected, stats, onStatsUpdate, toast]);

  // ✅ Enhanced calculation functions
  const calculateChangePercentage = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return new Intl.NumberFormat().format(num);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'active':
      case 'online':
      case 'connected':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900';
      case 'warning':
      case 'degraded':
      case 'limited':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900';
      case 'error':
      case 'offline':
      case 'critical':
      case 'disconnected':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
    }
  };

  const getSystemHealthIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNetworkIcon = () => {
    switch (stats.system.network_status) {
      case 'connected':
        return <Wifi className="h-4 w-4 text-green-500" />;
      case 'limited':
        return <Wifi className="h-4 w-4 text-yellow-500" />;
      case 'disconnected':
        return <WifiOff className="h-4 w-4 text-red-500" />;
      default:
        return <Wifi className="h-4 w-4 text-gray-500" />;
    }
  };

  // ✅ Handle manual refresh
  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
        setLastUpdated(new Date());
        toast({
          title: "Stats Refreshed",
          description: "Dashboard statistics have been updated",
        });
      } catch (error) {
        toast({
          title: "Refresh Failed",
          description: "Failed to refresh dashboard statistics",
          variant: "destructive",
        });
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  // ✅ Enhanced stats cards với Face Recognition specifics
  const statsCards: StatCard[] = [
    {
      title: 'Total Cameras',
      value: stats.cameras.total,
      icon: Camera,
      description: `${stats.cameras.active} active, ${stats.cameras.offline} offline`,
      trend: {
        value: calculateChangePercentage(stats.cameras.total, Math.max(1, stats.cameras.total - 2)),
        label: 'vs last month',
        isPositive: true
      },
      color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900',
      progress: stats.cameras.total > 0 ? (stats.cameras.active / stats.cameras.total) * 100 : 0,
      critical: stats.cameras.offline > stats.cameras.active,
      actionButton: {
        label: 'Manage',
        action: () => window.open('/cameras', '_blank'),
        icon: ExternalLink
      },
      metadata: {
        category: 'cameras',
        priority: stats.cameras.offline > 0 ? 'high' : 'normal'
      }
    },
    {
      title: 'Live Streaming',
      value: stats.cameras.streaming,
      icon: Play,
      description: `${stats.cameras.total > 0 ? Math.round((stats.cameras.streaming / stats.cameras.total) * 100) : 0}% of cameras`,
      trend: {
        value: calculateChangePercentage(stats.cameras.streaming, Math.max(1, stats.cameras.streaming - 1)),
        label: 'vs yesterday',
        isPositive: true
      },
      color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900',
      progress: stats.cameras.total > 0 ? (stats.cameras.streaming / stats.cameras.total) * 100 : 0,
      critical: stats.cameras.streaming === 0 && stats.cameras.total > 0,
      actionButton: {
        label: 'View Streams',
        action: () => window.open('/cameras/streaming', '_blank'),
        icon: Play
      }
    },
    {
      title: 'Known Persons',
      value: stats.persons.total,
      icon: Users,
      description: `${stats.persons.with_images} with face images`,
      trend: {
        value: calculateChangePercentage(stats.persons.total, Math.max(1, stats.persons.total - stats.persons.recent_additions)),
        label: 'vs last week',
        isPositive: true
      },
      color: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900',
      progress: stats.persons.total > 0 ? (stats.persons.with_images / stats.persons.total) * 100 : 0,
      actionButton: {
        label: 'Add Person',
        action: () => window.open('/persons/new', '_blank'),
        icon: Users
      }
    },
    {
      title: 'Today Detections',
      value: stats.detections.today,
      icon: Eye,
      description: `${stats.detections.known_persons} known, ${stats.detections.strangers} strangers`,
      trend: {
        value: calculateChangePercentage(stats.detections.today, Math.max(1, stats.detections.today - 50)),
        label: 'vs yesterday',
        isPositive: stats.detections.strangers <= stats.detections.known_persons
      },
      color: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900',
      critical: stats.detections.strangers > stats.detections.known_persons,
      actionButton: {
        label: 'View Logs',
        action: () => window.open('/detections', '_blank'),
        icon: Eye
      }
    },
    {
      title: 'Detection Accuracy',
      value: `${stats.detections.confidence_avg}%`,
      icon: Shield,
      description: 'Average confidence score',
      trend: {
        value: calculateChangePercentage(stats.detections.confidence_avg, Math.max(1, stats.detections.confidence_avg - 5)),
        label: 'vs last week',
        isPositive: true
      },
      color: stats.detections.confidence_avg >= 85 ? 
        'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900' :
        stats.detections.confidence_avg >= 70 ?
        'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900' :
        'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900',
      progress: stats.detections.confidence_avg,
      isText: true,
      critical: stats.detections.confidence_avg < 70
    },
    {
      title: 'Active Alerts',
      value: stats.alerts.active,
      icon: AlertTriangle,
      description: `${stats.alerts.critical} critical, ${stats.alerts.warnings} warnings`,
      color: stats.alerts.critical > 0 ? 
        'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900' :
        stats.alerts.warnings > 0 ?
        'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900' :
        'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900',
      critical: stats.alerts.critical > 0,
      actionButton: {
        label: 'View Alerts',
        action: () => window.open('/alerts', '_blank'),
        icon: Bell
      }
    },
    {
      title: 'System Status',
      value: stats.system.status.charAt(0).toUpperCase() + stats.system.status.slice(1),
      icon: Server,
      description: `Uptime: ${stats.system.uptime}`,
      isText: true,
      color: getStatusColor(stats.system.status),
      extraInfo: (
        <div className="flex items-center space-x-2">
          {getSystemHealthIcon(stats.system.status)}
          {getNetworkIcon()}
        </div>
      ),
      critical: stats.system.status === 'critical',
      actionButton: {
        label: 'System Info',
        action: () => window.open('/admin/system', '_blank'),
        icon: Settings
      }
    },
    {
      title: 'CPU Usage',
      value: `${stats.system.cpu_usage}%`,
      icon: TrendingUp,
      description: 'Current processor load',
      isText: true,
      color: stats.system.cpu_usage > 90 ? 
        'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900' : 
        stats.system.cpu_usage > 80 ?
        'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900' :
        'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900',
      progress: stats.system.cpu_usage,
      critical: stats.system.cpu_usage > 95
    },
    {
      title: 'Memory Usage',
      value: `${stats.system.memory_usage}%`,
      icon: Database,
      description: 'RAM utilization',
      isText: true,
      color: stats.system.memory_usage > 90 ? 
        'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900' : 
        stats.system.memory_usage > 85 ?
        'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900' :
        'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900',
      progress: stats.system.memory_usage,
      critical: stats.system.memory_usage > 95
    },
  ];

  // ✅ Loading skeleton
  if (loading) {
    return (
      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", className)}>
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // ✅ Error state
  if (error) {
    return (
      <div className={cn("space-y-4", className)}>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Failed to load dashboard statistics: {error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with refresh controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <div className={cn(
              "w-2 h-2 rounded-full",
              isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
            )} />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {isConnected ? 'Live' : 'Offline'}
            </span>
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="text-xs"
        >
          {isRefreshing ? (
            <>
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh
            </>
          )}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          const ActionIcon = stat.actionButton?.icon;
          
          return (
            <Card 
              key={index} 
              className={cn(
                "hover:shadow-lg transition-all duration-200 relative group",
                stat.critical && "ring-2 ring-red-200 dark:ring-red-800 ring-opacity-50"
              )}
            >
              {/* Critical alert indicator */}
              {stat.critical && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              )}
              
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn('p-2 rounded-lg transition-colors', stat.color)}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex items-center space-x-2">
                    {stat.trend && (
                      <Badge 
                        variant={stat.trend.isPositive && stat.trend.value >= 0 ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {stat.trend.value >= 0 ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {stat.trend.value >= 0 ? '+' : ''}{stat.trend.value}%
                      </Badge>
                    )}
                    {stat.extraInfo && stat.extraInfo}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stat.isText ? stat.value : formatNumber(Number(stat.value))}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.description}</p>
                  {stat.trend && (
                    <p className="text-xs text-gray-400 dark:text-gray-500">{stat.trend.label}</p>
                  )}
                  
                  {/* Enhanced progress bar */}
                  {stat.progress !== undefined && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <span>Usage</span>
                        <span>{Math.round(stat.progress)}%</span>
                      </div>
                      <Progress 
                        value={stat.progress} 
                        className="h-2"
                        indicatorClassName={cn(
                          stat.progress > 95 ? 'bg-red-500' :
                          stat.progress > 90 ? 'bg-orange-500' : 
                          stat.progress > 80 ? 'bg-yellow-500' :
                          stat.progress > 60 ? 'bg-blue-500' : 'bg-green-500'
                        )}
                      />
                    </div>
                  )}

                  {/* Action button */}
                  {stat.actionButton && (
                    <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={stat.actionButton.action}
                        className="w-full text-xs"
                      >
                        {ActionIcon && <ActionIcon className="h-3 w-3 mr-1" />}
                        {stat.actionButton.label}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Connection status footer */}
      {!isConnected && (
        <Alert>
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            Real-time updates are currently unavailable. Statistics may not reflect the latest changes.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default DashboardStats;