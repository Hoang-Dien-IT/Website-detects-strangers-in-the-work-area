import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '@/components/common/Sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Bell, 
  Settings, 
  HelpCircle, 
  Menu,
  X,
  Plus,
  Camera,
  Users,
  ChevronDown,
  Maximize2,
  Calendar,
  Clock,
  Wifi,
  WifiOff,
  Shield,
  Activity,
  LogOut,
  User,
  BarChart3,
  CheckCircle,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useWebSocketContext } from '@/contexts/WebSocketContext';
import { toast } from 'sonner';

// interface SystemMetrics {
//   cpu: number;
//   memory: number;
//   storage: number;
//   network: number;
// }

interface QuickAction {
  title: string;
  icon: React.ComponentType<any>;
  action: () => void;
  color: string;
  shortcut?: string;
}

// ✅ Interface cho Notifications
interface Notification {
  id: string;
  type: 'detection' | 'system' | 'camera' | 'security' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  metadata?: {
    camera_name?: string;
    person_name?: string;
    confidence?: number;
    image_url?: string;
    camera_id?: string;
    detection_id?: string;
    [key: string]: any;
  };
  actions?: Array<{
    label: string;
    action: () => void;
    variant?: 'default' | 'destructive' | 'outline';
  }>;
}

const DashboardLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  // const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
  //   cpu: 45,
  //   memory: 62,
  //   storage: 78,
  //   network: 85
  // });
  const [, setFullscreen] = useState(false);
  
  
  // ✅ Enhanced Notifications State
  // ✅ REFINED: Chỉ notifications cần thiết và quan trọng
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'detection',
      title: '🚨 Stranger Alert',
      message: 'Unknown person detected at Main Gate',
      timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      read: false,
      priority: 'high',
      metadata: {
        camera_name: 'Main Gate',
        camera_id: 'cam_001',
        confidence: 0.94
      },
      actions: [
        {
          label: 'View',
          action: () => navigate('/detections/latest'),
          variant: 'default'
        }
      ]
    },
    {
      id: '2',
      type: 'camera',
      title: '📹 Camera Offline',
      message: 'Parking Camera disconnected',
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      read: false,
      priority: 'high',
      metadata: {
        camera_name: 'Parking Camera',
        camera_id: 'cam_003'
      },
      actions: [
        {
          label: 'Check',
          action: () => navigate('/cameras/cam_003'),
          variant: 'outline'
        }
      ]
    },
    {
      id: '3',
      type: 'system',
      title: '⚡ High CPU',
      message: 'System resources at 85%',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      read: true,
      priority: 'medium',
      metadata: {
        cpu_usage: 85
      }
    }
  ]);
  
  const { user, logout } = useAuth();
  const { isConnected, sendPing } = useWebSocketContext();
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Real-time clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);


  const testWebSocket = () => {
    if (isConnected) {
      sendPing();
      toast.success('🧪 WebSocket ping sent');
    } else {
      toast.error('❌ WebSocket not connected');
    }
  };
  // // ✅ Simulate system metrics update
  // useEffect(() => {
  //   const metricsTimer = setInterval(() => {
  //     setSystemMetrics(prev => ({
  //       cpu: Math.max(20, Math.min(90, prev.cpu + (Math.random() - 0.5) * 10)),
  //       memory: Math.max(30, Math.min(85, prev.memory + (Math.random() - 0.5) * 8)),
  //       storage: Math.max(40, Math.min(95, prev.storage + (Math.random() - 0.5) * 2)),
  //       network: Math.max(50, Math.min(100, prev.network + (Math.random() - 0.5) * 15))
  //     }));
  //   }, 3000);
  //   return () => clearInterval(metricsTimer);
  // }, []);

  // ✅ Simulate new notifications
  useEffect(() => {
    const notificationTimer = setInterval(() => {
      if (Math.random() > 0.85) { // Chỉ 15% chance - ít thông báo hơn
        const importantNotifications = [
          {
            type: 'detection',
            title: '🚨 Security Alert',
            message: 'Unauthorized access detected',
            priority: 'high'
          },
          {
            type: 'camera',
            title: '📹 Camera Issue',
            message: 'Camera connection lost',
            priority: 'high'
          },
          {
            type: 'system',
            title: '⚠️ System Warning',
            message: 'Resource usage critical',
            priority: 'medium'
          }
        ];

        const randomNotif = importantNotifications[Math.floor(Math.random() * importantNotifications.length)];
        
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: randomNotif.type as any,
          title: randomNotif.title,
          message: randomNotif.message,
          timestamp: new Date(),
          read: false,
          priority: randomNotif.priority as any,
          metadata: {
            camera_name: 'Security Gate',
            confidence: 0.92
          }
        };
        
        setNotifications(prev => [newNotification, ...prev.slice(0, 4)]); // Keep max 5
        toast.info('New alert received');
      }
    }, 30000); // Every 30 seconds instead of 10

    return () => clearInterval(notificationTimer);
  }, []);

  // ✅ Enhanced navigation handlers
  const quickActions: QuickAction[] = [
    {
      title: 'Add Camera',
      icon: Camera,
      action: () => { navigate('/app/cameras/new'); toast.success('Opening Add Camera'); },
      color: 'from-blue-500 to-blue-600',
      shortcut: '⌘+C'
    },
    {
      title: 'Add Person',
      icon: Users,
      action: () => { navigate('/app/persons/new'); toast.success('Opening Add Person'); },
      color: 'from-emerald-500 to-emerald-600',
      shortcut: '⌘+P'
    },
    {
      title: 'Live Monitor',
      icon: Activity,
      action: () => { navigate('/app/live'); toast.success('Opening Live Monitor'); },
      color: 'from-purple-500 to-purple-600',
      shortcut: '⌘+L'
    },
    {
      title: 'Analytics',
      icon: BarChart3,
      action: () => { navigate('/app/analytics'); toast.success('Opening Analytics'); },
      color: 'from-orange-500 to-orange-600',
      shortcut: '⌘+A'
    }
  ];

  // ✅ Notification helper functions
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  // const getNotificationActions = (notification: Notification) => {
  //   const baseActions = [
  //     {
  //       label: 'View',
  //       action: () => {
  //         if (notification.type === 'detection') {
  //           navigate('/app/detections/latest');
  //         } else if (notification.type === 'camera') {
  //           navigate(`/app/cameras/${notification.metadata?.camera_id || ''}`);
  //         } else {
  //           navigate('/app/settings');
  //         }
  //       },
  //       variant: 'default' as const
  //     }
  //   ];
  //   return baseActions;
  // };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  // const clearAllNotifications = () => {
  //   setNotifications([]);
  // };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'detection': return <Eye className="w-4 h-4 text-purple-600" />;
      case 'camera': return <Camera className="w-4 h-4 text-blue-600" />;
      case 'system': return <Settings className="w-4 h-4 text-gray-600" />;
      case 'security': return <Shield className="w-4 h-4 text-red-600" />;
      default: return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-l-red-500 bg-red-50';
      case 'high': return 'border-l-orange-500 bg-orange-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-blue-500 bg-blue-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/app/search?q=${encodeURIComponent(query.trim())}`);
      toast.info(`Searching for: ${query}`);
    }
  };

  const handleSettings = () => {
    navigate('/app/settings');
    toast.info('Opening settings');
  };

  // const handleHelp = () => {
  //   navigate('/app/help');
  //   toast.info('Opening help center');
  // };

  const handleProfileClick = () => {
    navigate('/app/profile'); // ✅ FIX: Removed 'app/' prefix
    toast.info('Opening user profile');
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  const getPageTitle = (): string => {
    const path = location.pathname;
    const titles: Record<string, string> = {
      '/dashboard': 'Dashboard Overview',
      '/cameras': 'Camera Management',
      '/cameras/new': 'Add New Camera',
      '/cameras/live': 'Live Monitoring',
      '/persons': 'Person Management',
      '/persons/new': 'Add New Person',
      '/detections': 'Detection Logs',
      '/analytics': 'Analytics & Reports',
      '/settings': 'System Settings',
      '/profile': 'User Profile'
    };
    return titles[path] || 'SafeFace Platform';
  };


  return (
    <div 
      className="min-h-screen dashboard-layout"
      style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 30%, #f1f5f9 70%, #e0f2fe 100%)'
      }}
    >
      <div className="flex">
        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* ✅ Enhanced Sidebar */}
        <div className={cn(
          "lg:relative lg:translate-x-0 transition-all duration-300 z-50",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
          <Sidebar 
            collapsed={sidebarCollapsed} 
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
          />
        </div>
        
        {/* Main Content */}
        <main className="flex-1 flex flex-col min-h-screen">
          {/* ✅ Ultimate Modern Header */}
          <header 
            className="border-b backdrop-blur-xl sticky top-0 z-30"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 50%, rgba(224, 242, 254, 0.8) 100%)',
              borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
            }}
          >
            {/* Top Bar */}
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                {/* Left Section */}
                <div className="flex items-center space-x-4">
                  {/* Mobile Menu */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="lg:hidden text-slate-600 hover:text-slate-900 hover:bg-white/80 rounded-xl border border-slate-200/50 shadow-sm transition-all duration-200"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  >
                    {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </Button>

                  {/* Enhanced Title Section */}
                  <div className="space-y-1">
                    <div className="flex items-center space-x-3">
                      <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 bg-clip-text text-transparent">
                        {getPageTitle()}
                      </h1>
                      <div className="flex items-center space-x-2">
                        {isConnected ? (
                          <Badge 
                            className="shadow-sm border-0 animate-pulse"
                            style={{
                              background: 'linear-gradient(135deg, #dcfdf7 0%, #a7f3d0 100%)',
                              color: '#065f46'
                            }}
                          >
                            <Wifi className="w-3 h-3 mr-1" />
                            Live
                          </Badge>
                        ) : (
                          <Badge 
                            className="shadow-sm border-0"
                            style={{
                              background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                              color: '#991b1b'
                            }}
                          >
                            <WifiOff className="w-3 h-3 mr-1" />
                            Offline
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {/* Breadcrumb & Time */}
                    <div className="flex items-center space-x-4 text-sm text-slate-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{currentTime.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span className="font-mono">
                          {currentTime.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Center Section - Enhanced Search */}
                <div className="hidden md:flex flex-1 max-w-2xl mx-8">
                  <div className="relative w-full">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input
                      placeholder="Search anything... (⌘+K)"
                      className="pl-12 pr-4 py-3 text-lg border-slate-200/80 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400/50 shadow-sm transition-all duration-300"
                      style={{
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)'
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSearch(e.currentTarget.value);
                        }
                      }}
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                      <kbd className="px-2 py-1 text-xs bg-slate-100 border border-slate-200 rounded">
                        ⌘K
                      </kbd>
                    </div>
                  </div>
                </div>

                {/* Right Section - Enhanced Actions */}
                <div className="flex items-center space-x-2">
                  {/* Quick Actions Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        className="text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                        style={{
                          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Quick Add
                        <ChevronDown className="w-3 h-3 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 p-2">
                      <DropdownMenuLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 py-2">
                        Quick Actions
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {quickActions.map((action, index) => {
                        const Icon = action.icon;
                        return (
                          <DropdownMenuItem
                            key={index}
                            onClick={action.action}
                            className="p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center space-x-3">
                                <div 
                                  className={`p-2 rounded-lg bg-gradient-to-r ${action.color} text-white`}
                                >
                                  <Icon className="w-4 h-4" />
                                </div>
                                <span className="font-medium">{action.title}</span>
                              </div>
                              {action.shortcut && (
                                <kbd className="px-2 py-1 text-xs bg-slate-100 border border-slate-200 rounded">
                                  {action.shortcut}
                                </kbd>
                              )}
                            </div>
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={testWebSocket}
                    className="hidden md:flex"
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Test WS
                  </Button>

                  {/* System Metrics */}
                  {/* <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hidden lg:flex items-center space-x-2 text-slate-600 hover:text-slate-900 hover:bg-white/80 rounded-xl border border-slate-200/50 shadow-sm transition-all duration-200"
                        >
                          <Activity className="w-4 h-4" />
                          <div className="flex items-center space-x-1">
                            <div className={cn("w-2 h-2 rounded-full", getSystemHealthBg(systemMetrics.cpu))}>
                              <div className={cn("w-full h-full rounded-full", systemMetrics.cpu < 60 ? "bg-emerald-500" : systemMetrics.cpu < 80 ? "bg-amber-500" : "bg-red-500")}></div>
                            </div>
                            <span className="text-xs font-mono">{Math.round(systemMetrics.cpu)}%</span>
                          </div>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="p-4 w-64">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-sm">System Metrics</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-slate-600">CPU</span>
                              <span className={cn("text-xs font-mono", getSystemHealthColor(systemMetrics.cpu))}>
                                {Math.round(systemMetrics.cpu)}%
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-slate-600">Memory</span>
                              <span className={cn("text-xs font-mono", getSystemHealthColor(systemMetrics.memory))}>
                                {Math.round(systemMetrics.memory)}%
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-slate-600">Storage</span>
                              <span className={cn("text-xs font-mono", getSystemHealthColor(systemMetrics.storage))}>
                                {Math.round(systemMetrics.storage)}%
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-slate-600">Network</span>
                              <span className={cn("text-xs font-mono", getSystemHealthColor(systemMetrics.network))}>
                                {Math.round(systemMetrics.network)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider> */}

                  {/* ✅ OPTIMIZED: Essential Notifications Only */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="relative text-slate-600 hover:text-slate-900 hover:bg-white/80 rounded-xl border border-slate-200/50 shadow-sm transition-all duration-200"
                      >
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full flex items-center justify-center shadow-lg animate-pulse font-bold">
                            {unreadCount}
                          </div>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 p-0">
                      {/* Compact Header */}
                      <div className="p-3 border-b bg-gradient-to-r from-blue-50 to-slate-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Bell className="w-4 h-4 text-blue-600" />
                            <h3 className="font-semibold text-slate-900">Alerts</h3>
                            {unreadCount > 0 && (
                              <Badge variant="destructive" className="text-xs px-2">
                                {unreadCount}
                              </Badge>
                            )}
                          </div>
                          {unreadCount > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={markAllAsRead}
                              className="text-xs px-2 py-1 h-auto text-blue-600 hover:text-blue-700"
                            >
                              Clear all
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Compact Notifications List */}
                      <ScrollArea className="h-[300px]">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center">
                            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                            <p className="text-slate-600 text-sm font-medium">All Clear!</p>
                            <p className="text-slate-400 text-xs">No alerts at the moment</p>
                          </div>
                        ) : (
                          <div className="p-1">
                            {notifications.map((notification) => (
                              <div
                                key={notification.id}
                                className={cn(
                                  "p-3 mx-1 my-1 rounded-lg border-l-3 cursor-pointer transition-all duration-200 hover:shadow-sm hover:bg-slate-50",
                                  getPriorityColor(notification.priority),
                                  !notification.read && "ring-1 ring-blue-100",
                                  notification.read && "opacity-60"
                                )}
                                onClick={() => markAsRead(notification.id)}
                              >
                                <div className="flex items-start space-x-3">
                                  {/* Compact Icon */}
                                  <div className="flex-shrink-0">
                                    {getNotificationIcon(notification.type)}
                                  </div>

                                  {/* Compact Content */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <h4 className="text-sm font-medium text-slate-900 mb-1 truncate">
                                          {notification.title}
                                        </h4>
                                        <p className="text-xs text-slate-600 mb-2 line-clamp-1">
                                          {notification.message}
                                        </p>

                                        {/* Compact Footer */}
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center space-x-2 text-xs text-slate-400">
                                            <Clock className="w-3 h-3" />
                                            <span>{formatTimeAgo(notification.timestamp)}</span>
                                            {notification.metadata?.camera_name && (
                                              <>
                                                <span>•</span>
                                                <span>{notification.metadata.camera_name}</span>
                                              </>
                                            )}
                                          </div>

                                          {/* Compact Action */}
                                          {notification.actions && notification.actions[0] && (
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="h-6 text-xs px-2 ml-2"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                notification.actions![0].action();
                                              }}
                                            >
                                              {notification.actions[0].label}
                                            </Button>
                                          )}
                                        </div>
                                      </div>

                                      {/* Compact Delete */}
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="p-1 h-auto ml-1 opacity-0 hover:opacity-100 transition-opacity"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          deleteNotification(notification.id);
                                        }}
                                      >
                                        <X className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </ScrollArea>

                      {/* Compact Footer */}
                      {notifications.length > 0 && (
                        <div className="p-2 border-t bg-slate-50">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-xs text-slate-600 hover:text-slate-700"
                          onClick={() => navigate('/app/detections')} // ✅ FIXED: Add /app prefix
                        >
                          View detailed logs
                        </Button>
                        </div>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Fullscreen Toggle */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-600 hover:text-slate-900 hover:bg-white/80 rounded-xl border border-slate-200/50 shadow-sm transition-all duration-200"
                          onClick={toggleFullscreen}
                        >
                          <Maximize2 className="w-5 h-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Toggle Fullscreen</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {/* Settings */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-600 hover:text-slate-900 hover:bg-white/80 rounded-xl border border-slate-200/50 shadow-sm transition-all duration-200"
                          onClick={handleSettings}
                        >
                          <Settings className="w-5 h-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Settings</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {/* User Profile Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="flex items-center space-x-3 pl-4 ml-3 border-l border-slate-200/60 cursor-pointer hover:bg-gradient-to-r hover:from-white hover:to-blue-50 rounded-xl p-2 transition-all duration-300 shadow-sm hover:shadow-md">
                        <div 
                          className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg relative ring-2 ring-white ring-opacity-50"
                          style={{
                            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #1e40af 100%)',
                            boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4)'
                          }}
                        >
                          <span className="text-white text-sm font-bold drop-shadow-sm">
                            {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                          </span>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-emerald-400 to-emerald-500 border-2 border-white rounded-full shadow-sm animate-pulse"></div>
                        </div>
                        <div className="hidden md:block">
                          <p className="text-sm font-semibold text-slate-900 mb-0.5">
                            {user?.full_name || user?.username || 'User'}
                          </p>
                          <p className="text-xs text-slate-600">
                            {user?.email || 'user@example.com'}
                          </p>
                        </div>
                        <ChevronDown className="w-4 h-4 text-slate-400 transition-transform duration-200 hover:rotate-180" />
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="end" 
                      className="w-72 p-0 shadow-2xl border-0 rounded-2xl overflow-hidden"
                      style={{
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #e0f2fe 100%)',
                        backdropFilter: 'blur(20px)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                      }}
                    >
                      {/* Enhanced Profile Header */}
                      <div 
                        className="p-4 relative overflow-hidden"
                        style={{
                          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #1e40af 100%)'
                        }}
                      >
                        {/* Background Pattern */}
                        <div 
                          className="absolute inset-0 opacity-10"
                          style={{
                            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                            backgroundSize: '20px 20px'
                          }}
                        />
                        
                        <div className="relative flex items-center space-x-4">
                          <div 
                            className="w-16 h-16 rounded-3xl flex items-center justify-center ring-4 ring-white ring-opacity-30 shadow-xl"
                            style={{
                              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)'
                            }}
                          >
                            <span className="text-blue-600 text-2xl font-bold">
                              {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-white text-lg drop-shadow-sm">
                              {user?.full_name || user?.username || 'User'}
                            </p>
                            <p className="text-blue-100 text-sm mb-2">
                              {user?.email || 'user@example.com'}
                            </p>
                            <Badge 
                              className="shadow-lg border-0 text-xs px-3 py-1"
                              style={{
                                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%)',
                                color: '#1e40af'
                              }}
                            >
                              Administrator
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      {/* Menu Items */}
                      <div className="p-2 space-y-1">
                        <DropdownMenuItem 
                          onClick={handleProfileClick} 
                          className="p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 cursor-pointer group"
                        >
                          <div 
                            className="w-10 h-10 rounded-xl mr-3 flex items-center justify-center group-hover:scale-105 transition-transform duration-200"
                            style={{
                              background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)'
                            }}
                          >
                            <User className="w-5 h-5 text-slate-600" />
                          </div>
                          <div>
                            <span className="font-medium text-slate-900">Profile Settings</span>
                            <p className="text-xs text-slate-500 mt-0.5">Manage your account</p>
                          </div>
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                          onClick={() => navigate('/app/settings')} 
                          className="p-4 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200 cursor-pointer group"
                        >
                          <div 
                            className="w-10 h-10 rounded-xl mr-3 flex items-center justify-center group-hover:scale-105 transition-transform duration-200"
                            style={{
                              background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)'
                            }}
                          >
                            <Settings className="w-5 h-5 text-slate-600" />
                          </div>
                          <div>
                            <span className="font-medium text-slate-900">Preferences</span>
                            <p className="text-xs text-slate-500 mt-0.5">Customize settings</p>
                          </div>
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                          onClick={() => navigate('/help')}
                          className="p-4 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50 transition-all duration-200 cursor-pointer group"
                        >
                          <div 
                            className="w-10 h-10 rounded-xl mr-3 flex items-center justify-center group-hover:scale-105 transition-transform duration-200"
                            style={{
                              background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)'
                            }}
                          >
                            <HelpCircle className="w-5 h-5 text-slate-600" />
                          </div>
                          <div>
                            <span className="font-medium text-slate-900">Help & Support</span>
                            <p className="text-xs text-slate-500 mt-0.5">Get assistance</p>
                          </div>
                        </DropdownMenuItem>
                      </div>
                      
                      <DropdownMenuSeparator className="mx-2 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                      
                      <div className="p-2">
                        <DropdownMenuItem 
                          onClick={handleLogout} 
                          className="p-4 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-200 cursor-pointer group"
                        >
                          <div 
                            className="w-10 h-10 rounded-xl mr-3 flex items-center justify-center group-hover:scale-105 transition-transform duration-200"
                            style={{
                              background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)'
                            }}
                          >
                            <LogOut className="w-5 h-5 text-red-600" />
                          </div>
                          <div>
                            <span className="font-medium text-red-600">Sign Out</span>
                            <p className="text-xs text-red-400 mt-0.5">End your session</p>
                          </div>
                        </DropdownMenuItem>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </header>

          {/* ✅ Enhanced Content Area */}
          <div 
            className="flex-1 min-h-[calc(100vh-80px)] relative"
            style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)'
            }}
          >
            {/* Background Pattern */}
            <div 
              className="absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, #64748b 1px, transparent 0)`,
                backgroundSize: '32px 32px'
              }}
            />
            
            {/* Content */}
            <div className="relative z-10">
              <Outlet />
            </div>
            
            {/* Floating Action Button for Mobile */}
            <div className="fixed bottom-6 right-6 lg:hidden z-50">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="lg"
                    className="w-14 h-14 rounded-full shadow-2xl text-white border-0"
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                    }}
                  >
                    <Plus className="w-6 h-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 mb-2">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <DropdownMenuItem
                        key={index}
                        onClick={action.action}
                        className="p-3 rounded-lg"
                      >
                        <Icon className="w-4 h-4 mr-3" />
                        <span>{action.title}</span>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;