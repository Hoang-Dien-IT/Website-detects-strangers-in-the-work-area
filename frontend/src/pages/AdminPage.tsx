import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Users,
  Settings,
  Activity,
  Database,
  Server,
  UserCheck,
  UserX,
  Shield,
  MoreVertical,
  Search,
  Download,
  Trash2,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Calendar,
  TrendingUp,
  HardDrive,
  Cpu,
  MemoryStick,
  Monitor,
  BarChart3,
  FileText,
  Camera
} from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// ✅ Import unified types from admin.types.ts instead of defining local ones
import { DashboardStats, SystemHealth, SystemLog, UserWithStats } from '@/types/admin.types';
import { adminService } from '@/services/admin.service';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { motion } from 'framer-motion';

// ✅ REMOVE: All local interface definitions that conflict with unified types
// interface DashboardStats { ... } - DELETED
// interface SystemHealth { ... } - DELETED
// interface UserWithStats { ... } - DELETED
// interface SystemLog { ... } - DELETED

// ✅ Import UserDetails from unified types instead of defining locally
import { UserDetails } from '@/types/admin.types';

const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // ✅ Use unified types
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [showUserDetailsDialog, setShowUserDetailsDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; user: UserWithStats | null }>({
    open: false,
    user: null
  });

  // ✅ Enhanced data loading with proper error handling and type transformation
  const loadAdminData = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      console.log('🔵 AdminPage: Loading dashboard data...');
      
      // Load dashboard stats
      try {
        const statsResponse = await adminService.getDashboardStats();
        console.log('✅ AdminPage: Dashboard stats loaded:', statsResponse);
        setStats(statsResponse);
      } catch (error: any) {
        console.error('❌ AdminPage: Error loading dashboard stats:', error);
        if (!stats) {
          setStats({
            total_users: 0,
            active_users: 0,
            admin_users: 0,
            total_cameras: 0,
            active_cameras: 0,
            streaming_cameras: 0,
            total_persons: 0,
            active_persons: 0,
            total_detections: 0,
            stranger_detections: 0,
            known_person_detections: 0,
            today_detections: 0,
            this_week_detections: 0,
            recent_activity: [],
            system_status: 'error',
            last_updated: new Date().toISOString()
          });
        }
      }

      // Load system health
      try {
        const healthResponse = await adminService.getSystemHealth();
        console.log('✅ AdminPage: System health loaded:', healthResponse);
        setHealth(healthResponse);
      } catch (error: any) {
        console.error('❌ AdminPage: Error loading system health:', error);
        if (!health) {
          setHealth({
            database: 'error',
            face_recognition: 'error',
            websocket: 'error',
            uptime: 0,
            system: {
              memory: { total: 0, available: 0, used: 0, percent: 0 },
              cpu: { percent: 0 },
              disk: { total: 0, used: 0, free: 0, percent: 0 }
            },
            // ✅ FIX: Use correct property name
            last_check: new Date().toISOString()
          });
        }
      }

      // ✅ FIX: Load users and transform to UserWithStats
      try {
        const usersResponse = await adminService.getAllUsers();
        console.log('✅ AdminPage: Users loaded:', usersResponse);
        
        // ✅ If already UserWithStats[], use directly; otherwise transform
        if (usersResponse.length > 0 && 'stats' in usersResponse[0]) {
          // Already UserWithStats[]
          setUsers(usersResponse as UserWithStats[]);
        } else {
          // Transform User[] to UserWithStats[]
          const usersWithStats: UserWithStats[] = (usersResponse as any[]).map(user => ({
            ...user,
            role: user.role || (user.is_admin ? 'admin' : 'user'),
            permissions: user.permissions || [],
            stats: {
              total_logins: user.login_count || 0,
              last_activity: user.last_login || user.created_at,
              devices_count: 1,
              permissions_count: user.permissions?.length || 0
            }
          }));
          setUsers(usersWithStats);
        }
      } catch (error: any) {
        console.error('❌ AdminPage: Error loading users:', error);
        if (users.length === 0) {
          setUsers([]);
        }
      }

      // ✅ FIX: Load logs and ensure proper format
      try {
        const logsResponse = await adminService.getSystemLogs(50);
        console.log('✅ AdminPage: Logs loaded:', logsResponse);
        
        // ✅ Transform logs to match expected SystemLog interface
        const formattedLogs: SystemLog[] = (logsResponse || []).map((log: any) => {
          // Check if log is already in the expected format
          if (log && typeof log === 'object' && 'level' in log && 'category' in log) {
            // Already matches SystemLog from admin.types.ts
            return log as SystemLog;
          } else {
            // Transform from old format to new SystemLog format
            return {
              id: log?.id || `log_${Date.now()}_${Math.random()}`,
              timestamp: log?.timestamp || new Date().toISOString(),
              level: log?.level || 'info',
              category: log?.type || 'system',
              message: log?.message || 'Unknown log entry',
              details: log?.details || {},
              user_id: log?.user_id,
              camera_id: log?.camera_id,
              ip_address: log?.ip_address,
              user_agent: log?.user_agent,
              session_id: log?.session_id
            } as SystemLog;
          }
        });
        
        setLogs(formattedLogs);
      } catch (error: any) {
        console.error('❌ AdminPage: Error loading logs:', error);
        if (logs.length === 0) {
          setLogs([]);
        }
      }

      if (isRefresh) {
        toast.success('Admin dashboard refreshed successfully');
      }

    } catch (error: any) {
      console.error('❌ AdminPage: Error loading admin data:', error);
      
      if (isRefresh) {
        toast.error('Failed to refresh admin dashboard');
      } else {
        toast.error('Failed to load admin dashboard. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [stats, health, users, logs]);

  useEffect(() => {
    if (user?.is_admin) {
      loadAdminData();
    }
  }, [user, loadAdminData]);

  // ✅ Auto refresh every 30 seconds
  useEffect(() => {
    if (!user?.is_admin) return;
    
    const interval = setInterval(() => {
      loadAdminData(true);
    }, 30000);
    
    return () => clearInterval(interval);
  }, [user, loadAdminData]);

  // ✅ Enhanced user filtering
  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.department && user.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // ✅ Enhanced toggle user status with backend endpoint from #backend
  const handleToggleUserStatus = async (user: UserWithStats) => {
    try {
      console.log('🔵 AdminPage: Toggling user status:', user.id, !user.is_active);
      
      await adminService.toggleUserStatus(user.id, !user.is_active);
      
      // Update local state immediately for better UX
      setUsers(prevUsers =>
        prevUsers.map(u =>
          u.id === user.id ? { ...u, is_active: !u.is_active } : u
        )
      );
      
      toast.success(`User ${user.username} ${user.is_active ? 'deactivated' : 'activated'} successfully`);
      console.log('✅ AdminPage: User status toggled successfully');
      
    } catch (error: any) {
      console.error('❌ AdminPage: Error toggling user status:', error);
      toast.error(`Failed to update user status: ${error.message || 'Unknown error'}`);
      
      // Reload data to ensure consistency
      await loadAdminData(true);
    }
  };

  // ✅ Enhanced toggle admin role with backend endpoint from #backend
  const handleToggleAdminRole = async (user: UserWithStats) => {
    try {
      console.log('🔵 AdminPage: Toggling admin role:', user.id, !user.is_admin);
      
      await adminService.toggleAdminRole(user.id, !user.is_admin);
      
      // Update local state immediately for better UX
      setUsers(prevUsers =>
        prevUsers.map(u =>
          u.id === user.id ? { 
            ...u, 
            is_admin: !u.is_admin, 
            role: !u.is_admin ? 'admin' : 'user' 
          } : u
        )
      );
      
      toast.success(`Admin role ${user.is_admin ? 'removed from' : 'granted to'} ${user.username}`);
      console.log('✅ AdminPage: Admin role toggled successfully');
      
    } catch (error: any) {
      console.error('❌ AdminPage: Error toggling admin role:', error);
      toast.error(`Failed to update admin role: ${error.message || 'Unknown error'}`);
      
      // Reload data to ensure consistency
      await loadAdminData(true);
    }
  };

  // ✅ Enhanced delete user - Check if backend has this endpoint
  const handleDeleteUser = async (user: UserWithStats) => {
    try {
      console.log('🔵 AdminPage: Attempting to delete user:', user.id);
      
      // ✅ Check if backend has delete endpoint based on #backend structure
      if (typeof adminService.deleteUser === 'function') {
        await adminService.deleteUser(user.id);
        
        // Update local state
        setUsers(prevUsers => prevUsers.filter(u => u.id !== user.id));
        
        toast.success(`User ${user.username} deleted successfully`);
        console.log('✅ AdminPage: User deleted successfully');
      } else {
        // Backend doesn't have delete endpoint yet
        throw new Error('User deletion functionality not implemented in backend yet');
      }
      
      setDeleteDialog({ open: false, user: null });
      
    } catch (error: any) {
      console.error('❌ AdminPage: Error deleting user:', error);
      
      let errorMessage = 'Failed to delete user';
      if (error.message.includes('not implemented')) {
        errorMessage = 'User deletion feature is not yet implemented in backend';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    }
  };

  // ✅ Enhanced view user details with backend endpoint from #backend
  const handleViewUserDetails = async (user: UserWithStats) => {
    try {
      console.log('🔵 AdminPage: Getting user details:', user.id);
      
      // Based on #backend/app/services/admin_service.py
      const userDetails = await adminService.getUserDetails(user.id);
      console.log('✅ AdminPage: User details loaded:', userDetails);
      
      if (userDetails) {
        setSelectedUser(userDetails);
        setShowUserDetailsDialog(true);
      } else {
        throw new Error('User details not found');
      }
      
    } catch (error: any) {
      console.error('❌ AdminPage: Error getting user details:', error);
      toast.error(`Failed to load user details: ${error.message || 'Unknown error'}`);
    }
  };

  // ✅ Enhanced export functionality
  const handleExportData = async (dataType: 'users' | 'logs' | 'stats') => {
    try {
      console.log('🔵 AdminPage: Exporting', dataType);
      
      let data: any;
      let filename: string;
      
      switch (dataType) {
        case 'users':
          data = users.map(user => ({
            id: user.id,
            username: user.username,
            email: user.email,
            full_name: user.full_name,
            is_active: user.is_active,
            is_admin: user.is_admin,
            role: user.role,
            created_at: user.created_at,
            department: user.department,
            stats: user.stats
          }));
          filename = `safeface-users-${new Date().toISOString().split('T')[0]}.json`;
          break;
          
        case 'logs':
          data = logs;
          filename = `safeface-logs-${new Date().toISOString().split('T')[0]}.json`;
          break;
          
        case 'stats':
          data = { stats, health, exported_at: new Date().toISOString() };
          filename = `safeface-stats-${new Date().toISOString().split('T')[0]}.json`;
          break;
          
        default:
          throw new Error('Invalid data type');
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`${dataType.charAt(0).toUpperCase() + dataType.slice(1)} exported successfully`);
      console.log('✅ AdminPage: Export completed:', filename);
      
    } catch (error: any) {
      console.error('❌ AdminPage: Error exporting data:', error);
      toast.error(`Failed to export ${dataType}: ${error.message || 'Unknown error'}`);
    }
  };

  const handleRefresh = () => {
    loadAdminData(true);
  };

  // ✅ Helper functions
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (uptime: string | number) => {
    if (typeof uptime === 'string') return uptime;
    
    const seconds = uptime;
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'healthy':
      case 'online':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
      case 'offline':
      case 'unhealthy':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'healthy':
      case 'online':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'error':
      case 'offline':
      case 'unhealthy':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  // ✅ Enhanced progress bar component
  const ProgressBar: React.FC<{ value: number; max: number; color?: string }> = ({ 
    value, 
    max, 
    color = 'bg-blue-500' 
  }) => {
    const percentage = Math.min((value / max) * 100, 100);
    const colorClass = percentage > 80 ? 'bg-red-500' : percentage > 60 ? 'bg-yellow-500' : color;
    
    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };

  // ✅ Check if user is admin
  if (!user?.is_admin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">You need administrator privileges to view this page.</p>
        </div>
      </div>
    );
  }

  // ✅ Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ✅ Enhanced Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-gray-700 bg-clip-text text-transparent">
            System Administration
          </h1>
          <p className="text-gray-600 mt-1">
            Manage users, monitor system health, and configure settings
          </p>
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
            <span>•</span>
            <span>{users.length} total users</span>
            <span>•</span>
            <span>{stats?.total_cameras || 0} cameras</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* System Status Indicator */}
          {health && (
            <div className="flex items-center space-x-2">
              {health.database === 'healthy' && health.face_recognition === 'healthy' ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              )}
              <span className={`text-sm font-medium ${
                health.database === 'healthy' && health.face_recognition === 'healthy' 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {health.database === 'healthy' && health.face_recognition === 'healthy' 
                  ? 'System Healthy' 
                  : 'System Issues'
                }
              </span>
            </div>
          )}
          
          <Button 
            onClick={handleRefresh} 
            variant="outline"
            disabled={refreshing}
            className="shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExportData('users')}>
                <Users className="h-4 w-4 mr-2" />
                Export Users
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportData('logs')}>
                <Activity className="h-4 w-4 mr-2" />
                Export Logs
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportData('stats')}>
                <TrendingUp className="h-4 w-4 mr-2" />
                Export Statistics
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      {/* Quick Stats */}
      {stats && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* Total Users */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold text-blue-900">{stats.total_users}</p>
                  <div className="flex items-center space-x-2 text-xs mt-1">
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                      {stats.active_users} active
                    </Badge>
                    <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                      {stats.admin_users || 0} admin
                    </Badge>
                  </div>
                </div>
                <div className="p-3 bg-blue-100 rounded-full shadow-lg">
                  <Users className="h-6 w-6 text-blue-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Cameras */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Cameras</p>
                  <p className="text-3xl font-bold text-green-900">{stats.total_cameras}</p>
                  <div className="flex items-center space-x-2 text-xs mt-1">
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                      {stats.active_cameras} online
                    </Badge>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                      {stats.streaming_cameras || 0} streaming
                    </Badge>
                  </div>
                </div>
                <div className="p-3 bg-green-100 rounded-full shadow-lg">
                  <Camera className="h-6 w-6 text-green-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Persons */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Known Persons</p>
                  <p className="text-3xl font-bold text-purple-900">{stats.total_persons}</p>
                  <div className="flex items-center space-x-2 text-xs mt-1">
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                      {stats.active_persons || 0} active
                    </Badge>
                  </div>
                </div>
                <div className="p-3 bg-purple-100 rounded-full shadow-lg">
                  <UserCheck className="h-6 w-6 text-purple-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Detections */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Detections</p>
                  <p className="text-3xl font-bold text-orange-900">{stats.total_detections}</p>
                  <div className="flex items-center space-x-2 text-xs mt-1">
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                      {stats.known_person_detections} known
                    </Badge>
                    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                      {stats.stranger_detections} unknown
                    </Badge>
                  </div>
                </div>
                <div className="p-3 bg-orange-100 rounded-full shadow-lg">
                  <Eye className="h-6 w-6 text-orange-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* System Health Alert */}
      {health && (health.database !== 'healthy' || health.face_recognition !== 'healthy') && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              System health issues detected. Please check the system monitoring tab for details.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Main Content Tabs */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Users</span>
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="flex items-center space-x-2">
              <Monitor className="h-4 w-4" />
              <span>Monitoring</span>
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Logs</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* ✅ Enhanced Recent Activity based on #backend */}
            {stats?.recent_activity && stats.recent_activity.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-gray-700" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.recent_activity.slice(0, 5).map((activity, index) => (
                      <div key={`activity-${index}-${activity.timestamp}`} className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{activity.type}</p>
                          <p className="text-xs text-gray-600">{activity.description}</p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="space-y-4">
              {/* Enhanced Search and Filters */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search users by name, username, email, or department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>{filteredUsers.length} of {users.length} users</span>
                  <Badge variant="outline">
                    {users.filter(u => u.is_active).length} active
                  </Badge>
                  <Badge variant="outline">
                    {users.filter(u => u.is_admin).length} admins
                  </Badge>
                </div>
              </div>

              {/* Enhanced Users List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Users Management</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => loadAdminData(true)}
                      disabled={refreshing}
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <div key={user.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={user.avatar_url} alt={user.full_name} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                              {user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <p className="font-medium text-gray-900 truncate">{user.full_name}</p>
                              <Badge variant={user.is_active ? "default" : "secondary"}>
                                {user.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                              {user.is_admin && (
                                <Badge variant="destructive">Admin</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 truncate">@{user.username} • {user.email}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <p className="text-xs text-gray-500">
                                <Calendar className="w-3 h-3 inline mr-1" />
                                Joined: {new Date(user.created_at).toLocaleDateString()}
                              </p>
                              {user.department && (
                                <p className="text-xs text-gray-500">
                                  Department: {user.department}
                                </p>
                              )}
                              {user.last_login && (
                                <p className="text-xs text-gray-500">
                                  Last login: {new Date(user.last_login).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            {user.stats && (
                              <div className="flex items-center space-x-4 mt-1">
                                <p className="text-xs text-blue-600">
                                  🔧 {user.stats.devices_count || 0} devices
                                </p>
                                <p className="text-xs text-green-600">
                                  🔑 {user.stats.permissions_count || 0} permissions
                                </p>
                                <p className="text-xs text-purple-600">
                                  📊 {user.stats.total_logins || 0} total logins
                                </p>
                              </div>
                            )}
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewUserDetails(user)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleUserStatus(user)}>
                                {user.is_active ? (
                                  <>
                                    <UserX className="h-4 w-4 mr-2" />
                                    Deactivate User
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    Activate User
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleAdminRole(user)}>
                                <Shield className="h-4 w-4 mr-2" />
                                {user.is_admin ? 'Remove Admin' : 'Make Admin'}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => setDeleteDialog({ open: true, user })}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                        {searchTerm ? (
                          <p className="text-gray-500">
                            No users match your search criteria "<strong>{searchTerm}</strong>"
                          </p>
                        ) : (
                          <p className="text-gray-500">No users have been created yet</p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>System Monitoring</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* System Health */}
                  {health && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">System Health</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 border rounded">
                          <span className="font-medium">Database</span>
                          <Badge variant={health.database === 'healthy' ? 'default' : 'destructive'}>
                            {health.database}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded">
                          <span className="font-medium">Face Recognition</span>
                          <Badge variant={health.face_recognition === 'healthy' ? 'default' : 'destructive'}>
                            {health.face_recognition}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded">
                          <span className="font-medium">WebSocket</span>
                          <Badge variant={health.websocket === 'healthy' ? 'default' : 'destructive'}>
                            {health.websocket || 'Unknown'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* System Resources */}
                  {health?.system && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">System Resources</h3>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>CPU Usage</span>
                            <span>{health.system.cpu.percent}%</span>
                          </div>
                          <ProgressBar value={health.system.cpu.percent} max={100} />
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Memory Usage</span>
                            <span>{health.system.memory.percent}%</span>
                          </div>
                          <ProgressBar value={health.system.memory.percent} max={100} />
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Disk Usage</span>
                            <span>{health.system.disk.percent}%</span>
                          </div>
                          <ProgressBar value={health.system.disk.percent} max={100} />
                        </div>
                        
                        <div className="text-sm">
                          {/* ✅ FIX: Access uptime from correct location based on #backend */}
                          <span className="font-medium">Uptime:</span> {formatUptime(health.uptime)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-5 h-5" />
                    <span>System Logs</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      {logs.length} entries
                    </Badge>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => loadAdminData(true)}
                      disabled={refreshing}
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {logs.length > 0 ? (
                    logs.map((log, index) => (
                      <div key={log.id || index} className="group hover:bg-gray-50 transition-colors">
                        <div className="text-sm font-mono p-4 border-l-4 border-blue-400 bg-white rounded-r border border-l-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-500 font-medium">
                                {new Date(log.timestamp).toLocaleString()}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {log.level || 'INFO'}
                              </Badge>
                              {log.category && (
                                <Badge variant="outline" className="text-xs">
                                  {log.category}
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-gray-400">
                              #{(log.id || '').slice(-6)}
                            </div>
                          </div>
                          <div className="text-gray-800 space-y-1">
                            <div className="font-medium">
                              {log.message || 'No message'}
                            </div>
                            {log.user_id && (
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-blue-600">User ID:</span>
                                <span>{log.user_id}</span>
                              </div>
                            )}
                            {log.camera_id && (
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-green-600">Camera ID:</span>
                                <span>{log.camera_id}</span>
                              </div>
                            )}
                            {log.ip_address && (
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-orange-600">IP:</span>
                                <span>{log.ip_address}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No logs available</h3>
                      <p className="text-gray-500 mb-4">
                        System logs will appear here when available
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={() => loadAdminData(true)}
                        disabled={refreshing}
                      >
                        <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh Logs
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* ✅ Enhanced User Details Dialog */}
      <Dialog open={showUserDetailsDialog} onOpenChange={setShowUserDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={selectedUser?.user.avatar_url} alt={selectedUser?.user.full_name} />
                <AvatarFallback>
                  {selectedUser?.user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span>User Details: {selectedUser?.user.full_name}</span>
            </DialogTitle>
            <DialogDescription>
              Detailed information about {selectedUser?.user.username}'s account and activity
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Account Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Username:</span>
                      <span className="font-medium">{selectedUser.user.username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{selectedUser.user.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge variant={selectedUser.user.is_active ? "default" : "secondary"}>
                        {selectedUser.user.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Role:</span>
                      <Badge variant={selectedUser.user.is_admin ? "destructive" : "outline"}>
                        {selectedUser.user.is_admin ? 'Admin' : 'User'}
                      </Badge>
                    </div>
                    {selectedUser.user.department && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Department:</span>
                        <span className="font-medium">{selectedUser.user.department}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Activity Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Cameras:</span>
                      <span className="font-medium">{selectedUser.stats.total_cameras}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Known Persons:</span>
                      <span className="font-medium">{selectedUser.stats.total_persons}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Recent Detections:</span>
                      <span className="font-medium">{selectedUser.stats.recent_detections}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Joined:</span>
                      <span className="font-medium">{new Date(selectedUser.user.created_at).toLocaleDateString()}</span>
                    </div>
                    {selectedUser.user.last_login && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Login:</span>
                        <span className="font-medium">{new Date(selectedUser.user.last_login).toLocaleDateString()}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Cameras */}
              {selectedUser.cameras && selectedUser.cameras.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Cameras ({selectedUser.cameras.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedUser.cameras.map((camera) => (
                        <div key={camera.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div>
                            <span className="font-medium">{camera.name}</span>
                            <span className="text-gray-500 ml-2">({(camera as any).camera_type || 'Unknown'})</span>
                          </div>
                          <Badge variant={camera.is_active ? "default" : "secondary"}>
                            {camera.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Persons */}
              {selectedUser.persons && selectedUser.persons.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Known Persons ({selectedUser.persons.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedUser.persons.map((person) => (
                        <div key={person.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="font-medium">{person.name}</span>
                          <span className="text-sm text-gray-600">{person.face_images_count} images</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ✅ Enhanced Delete User Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, user: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <span>Delete User Account</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left space-y-3">
              <p>
                Are you sure you want to permanently delete user "<strong>{deleteDialog.user?.username}</strong>"? 
                This action cannot be undone.
              </p>
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-red-800 font-medium text-sm">This will permanently delete:</p>
                <ul className="list-disc list-inside text-red-700 text-sm mt-2 space-y-1">
                  <li>User profile and account data</li>
                  <li>All cameras and their configurations</li>
                  <li>All known persons and face images</li>
                  <li>All detection logs and history</li>
                  <li>All settings and preferences</li>
                </ul>
              </div>
              <p className="text-sm text-gray-600">
                <strong>Note:</strong> This feature may not be fully implemented in the backend yet. 
                Please contact system administrators for account management.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteDialog.user && handleDeleteUser(deleteDialog.user)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPage;