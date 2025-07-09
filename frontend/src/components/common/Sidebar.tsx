import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useWebSocketContext } from '@/contexts/WebSocketContext';
import { useSidebarCounts } from '@/hooks/useSidebarCounts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  LayoutDashboard,
  Camera,
  Users,
  Settings,
  Shield,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Plus,
  Activity,
  Wifi,
  WifiOff,
  LogOut,
  User,
  ChevronDown,
  ChevronUp,
  Upload,
  TrendingUp,
  Bell,
  Lock,
  Video,
  UserPlus,
  Clock,
  AlertTriangle,
  LineChart,
  FileText,
  Calendar,
  Scan,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

interface MenuItem {
  title: string;
  icon: any;
  path: string;
  badge?: string;
  subItems?: {
    title: string;
    icon: any;
    path: string;
    badge?: string;
  }[];
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed = false, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isConnected } = useWebSocketContext();
  const { counts } = useSidebarCounts();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // ✅ Enhanced menu structure with dynamic counts
  const menuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/app/dashboard',
    },
    {
      title: 'Cameras',
      icon: Camera,
      path: '/app/cameras',
      badge: counts.isLoading ? '...' : counts.totalCameras.toString(),
      subItems: [
        {
          title: 'All Cameras',
          icon: Camera,
          path: '/app/cameras',
        },
        {
          title: 'Add Camera',
          icon: Plus,
          path: '/app/cameras/new',
        },
        {
          title: 'Live Streams',
          icon: Video,
          path: '/app/live',
          badge: counts.isLoading ? '...' : counts.activeCameras.toString(),
        }
      ]
    },
    {
      title: 'Known Persons',
      icon: Users,
      path: '/app/persons',
      badge: counts.isLoading ? '...' : counts.totalPersons.toString(),
      subItems: [
        {
          title: 'All Persons',
          icon: Users,
          path: '/app/persons',
        },
        {
          title: 'Add Person',
          icon: UserPlus,
          path: '/app/persons/new',
        },
        {
          title: 'Import Persons',
          icon: Upload,
          path: '/app/persons/import',
        }
      ]
    },
    {
      title: 'Detections',
      icon: Shield,
      path: '/app/detections',
      badge: counts.isLoading ? '...' : counts.todayDetections.toString(),
      subItems: [
        {
          title: 'Detection History',
          icon: Clock,
          path: '/app/detections/history',
        },
        {
          title: 'Alerts',
          icon: AlertTriangle,
          path: '/app/detections/alerts',
          badge: counts.isLoading ? '...' : counts.unreadAlerts.toString(),
        }
      ]
    },
    {
      title: 'Analytics',
      icon: BarChart3,
      path: '/app/analytics',
      subItems: [
        {
          title: 'Overview',
          icon: TrendingUp,
          path: '/app/analytics/overview',
        },
        {
          title: 'Trends',
          icon: LineChart,
          path: '/app/analytics/trends',
        },
        {
          title: 'Reports',
          icon: FileText,
          path: '/app/analytics/reports',
        }
      ]
    },
    {
      title: 'Settings',
      icon: Settings,
      path: '/app/settings',
      subItems: [
        {
          title: 'General',
          icon: Settings,
          path: '/app/settings/general',
        },
        {
          title: 'Face Recognition',
          icon: Scan,
          path: '/app/settings/face-recognition',
        },
        {
          title: 'Notifications',
          icon: Bell,
          path: '/app/settings/notifications',
        },
        {
          title: 'Security',
          icon: Shield,
          path: '/app/settings/security',
        }
      ]
    }
  ];

  // const adminMenuItems: MenuItem[] = user?.is_admin ? [
  //   {
  //     title: 'Admin Panel',
  //     icon: Crown,
  //     path: '/app/admin',
  //     subItems: [
  //       {
  //         title: 'User Management',
  //         icon: Users,
  //         path: '/app/admin/users',
  //       },
  //       {
  //         title: 'System Monitor',
  //         icon: Monitor,
  //         path: '/app/admin/monitoring',
  //       },
  //       {
  //         title: 'System Logs',
  //         icon: FileText,
  //         path: '/app/admin/logs',
  //       },
  //       {
  //         title: 'Backup & Restore',
  //         icon: Database,
  //         path: '/app/admin/backup',
  //       }
  //     ]
  //   }
  // ] : [];

  const isActive = (path: string): boolean => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const isExpanded = (title: string): boolean => {
    return expandedItems.includes(title);
  };

  const toggleExpanded = (title: string): void => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const handleNavigation = (path: string): void => {
    navigate(path);
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div 
      className={cn(
        "h-screen flex flex-col transition-all duration-300 border-r sidebar-container",
        collapsed ? "w-16" : "w-64"
      )}
      style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 20%, #f1f5f9 60%, #e0f2fe 100%)',
        borderRight: '1px solid #e2e8f0',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        backdropFilter: 'blur(20px)'
      }}
    >
      {/* ✅ Header với Modern Design */}
      <div 
        className="p-4 border-b border-slate-200/80"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #e0f2fe 100%)',
          borderBottom: '1px solid #e2e8f0'
        }}
      >
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                }}
              >
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">SafeFace</h2>
                <p className="text-sm text-slate-600">AI Security Platform</p>
              </div>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="p-2 hover:bg-slate-100 border border-slate-200/50 shadow-sm"
            style={{ color: '#475569' }}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* ✅ Connection Status */}
      <div 
        className="px-4 py-3 border-b border-slate-200/80"
        style={{
          background: 'rgba(255, 255, 255, 0.9)',
          borderBottom: '1px solid #e2e8f0'
        }}
      >
        <div className="flex items-center justify-between">
          {!collapsed && (
            <span className="text-sm font-semibold text-slate-700">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          )}
          <div className="flex items-center space-x-1">
            {isConnected ? (
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/30"></div>
                {!collapsed && (
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-xs shadow-sm">
                    <Wifi className="w-3 h-3 mr-1" />
                    Live
                  </Badge>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded-full shadow-lg shadow-red-500/30"></div>
                {!collapsed && (
                  <Badge className="bg-red-100 text-red-800 border-red-300 text-xs shadow-sm">
                    <WifiOff className="w-3 h-3 mr-1" />
                    Offline
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ Enhanced Navigation Menu */}
      <ScrollArea 
        className="flex-1"
        style={{
          background: 'rgba(255, 255, 255, 0.6)'
        }}
      >
        <div className="p-4 space-y-2">
          <div className="space-y-1">
            {!collapsed && (
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-4 px-2">
                Navigation
              </p>
            )}
            
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              const expanded = isExpanded(item.title);
              const hasSubItems = item.subItems && item.subItems.length > 0;
              
              return (
                <div key={item.title}>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start transition-all duration-300 shadow-sm nav-item",
                            collapsed ? "px-3" : "px-4",
                            active && "nav-item active"
                          )}
                          style={active ? {
                            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                            color: 'white',
                            borderColor: '#3b82f6',
                            boxShadow: '0 8px 25px -8px rgba(59, 130, 246, 0.5)'
                          } : {
                            color: '#475569',
                            background: 'transparent',
                            border: '1px solid transparent'
                          }}
                          onClick={() => {
                            if (hasSubItems && !collapsed) {
                              toggleExpanded(item.title);
                            } else {
                              handleNavigation(item.path);
                            }
                          }}
                          onMouseEnter={(e) => {
                            if (!active) {
                              e.currentTarget.style.background = 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)';
                              e.currentTarget.style.borderColor = '#e2e8f0';
                              e.currentTarget.style.boxShadow = '0 4px 12px -2px rgba(0, 0, 0, 0.1)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!active) {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.borderColor = 'transparent';
                              e.currentTarget.style.boxShadow = 'none';
                            }
                          }}
                        >
                          <Icon className={cn(
                            "w-5 h-5 transition-colors",
                            collapsed ? "mx-auto" : "mr-3"
                          )} />
                          {!collapsed && (
                            <>
                              <span className="flex-1 text-left font-medium">{item.title}</span>
                              <div className="flex items-center space-x-2">
                                {item.badge && (
                                  <Badge 
                                    className={cn(
                                      "text-xs shadow-sm",
                                      active 
                                        ? "bg-white/20 text-white border-white/30" 
                                        : "bg-red-100 text-red-800 border-red-300"
                                    )}
                                  >
                                    {item.badge}
                                  </Badge>
                                )}
                                {hasSubItems && (
                                  expanded ? 
                                    <ChevronUp className="w-4 h-4" /> : 
                                    <ChevronDown className="w-4 h-4" />
                                )}
                              </div>
                            </>
                          )}
                        </Button>
                      </TooltipTrigger>
                      {collapsed && (
                        <TooltipContent side="right" className="bg-slate-900 text-white shadow-xl">
                          <p>{item.title}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>

                  {/* ✅ Sub Items */}
                  {hasSubItems && !collapsed && expanded && (
                    <div className="ml-6 mt-2 space-y-1">
                      {item.subItems!.map((subItem) => {
                        const SubIcon = subItem.icon;
                        const subActive = location.pathname === subItem.path || 
                                         (subItem.path.includes('?') && location.pathname + location.search === subItem.path);
                        
                        return (
                          <Button
                            key={subItem.path}
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "w-full justify-start text-sm transition-all duration-200",
                              subActive && "bg-blue-50 text-blue-700 border-l-2 border-blue-500"
                            )}
                            style={subActive ? {
                              background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                              color: '#1d4ed8',
                              borderLeft: '3px solid #3b82f6'
                            } : {
                              color: '#64748b'
                            }}
                            onClick={() => handleNavigation(subItem.path)}
                          >
                            <SubIcon className="w-4 h-4 mr-3" />
                            <span className="font-medium">{subItem.title}</span>
                            {subItem.badge && (
                              <Badge variant="secondary" className="ml-auto text-xs">
                                {subItem.badge}
                              </Badge>
                            )}
                          </Button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>

      {/* ✅ System Status */}
      <div 
        className="p-4 border-t border-slate-200/80"
        style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)'
        }}
      >
        {!collapsed && (
          <div 
            className="p-3 rounded-xl border shadow-sm"
            style={{
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              borderColor: '#e2e8f0'
            }}
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                isConnected ? "bg-emerald-500" : "bg-red-500"
              )}></div>
              <span className="text-sm font-semibold text-slate-700">System Status</span>
            </div>
            <div className="space-y-1 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Network:</span>
                <span className={cn(
                  "font-medium",
                  isConnected ? "text-emerald-600" : "text-red-600"
                )}>
                  {isConnected ? "Connected" : "Disconnected"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Cameras:</span>
                <span className="font-medium text-blue-600">4 Active</span>
              </div>
              <div className="flex justify-between">
                <span>Detection:</span>
                <span className="font-medium text-emerald-600">Running</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ✅ User Profile */}
      <div 
        className="p-4 border-t border-slate-200/80"
        style={{
          background: 'linear-gradient(135deg, #f1f5f9 0%, #e0f2fe 100%)'
        }}
      >
        <div 
          className="flex items-center space-x-3 p-3 rounded-xl border shadow-lg"
          style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            borderColor: '#e2e8f0'
          }}
        >
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
            }}
          >
            <User className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">
                {user?.full_name || 'User'}
              </p>
              <p className="text-xs text-slate-600 truncate">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="p-2 hover:bg-red-50 text-red-600 border border-red-200/50"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side={collapsed ? "right" : "top"} className="bg-slate-900 text-white shadow-xl">
                <p>Logout</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;