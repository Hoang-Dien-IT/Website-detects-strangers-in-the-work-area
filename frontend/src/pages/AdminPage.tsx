import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Users,
  Activity,
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
import AdminLayout from '@/components/admin/AdminLayout';
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
  const location = useLocation();
  const navigate = useNavigate();
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

  // ✅ Handle tab change with navigation
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'dashboard') {
      navigate('/admin');
    } else {
      navigate(`/admin/${value}`);
    }
  };

  // ✅ Set active tab based on URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/users')) {
      setActiveTab('users');
    } else if (path.includes('/monitoring')) {
      setActiveTab('monitoring');
    } else if (path.includes('/logs')) {
      setActiveTab('logs');
    } else {
      setActiveTab('dashboard');
    }
  }, [location.pathname]);

  // ✅ Enhanced data loading with proper error handling and type transformation
  const loadAdminData = async (isRefresh = false) => {
    try {
      console.log('🔵 AdminPage: Starting loadAdminData, isRefresh:', isRefresh);
      console.log('🔵 AdminPage: Current user:', user);
      console.log('🔵 AdminPage: adminService available:', !!adminService);
      
      if (!isRefresh) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      console.log('🔵 AdminPage: Loading dashboard data...');
      
      // Load dashboard stats - Admin chỉ quản lý người dùng
      try {
        console.log('🔵 AdminPage: Calling adminService.getDashboardStats()...');
        const statsResponse = await adminService.getDashboardStats();
        console.log('✅ AdminPage: Dashboard stats loaded successfully:', statsResponse);
        
        // ✅ Admin chỉ quan tâm đến thống kê người dùng và tài nguyên của họ
        const adminStats = {
          ...statsResponse,
          // Giữ nguyên dữ liệu gốc nhưng admin chỉ hiển thị thống kê tổng quan
          total_users: statsResponse.total_users || 0,
          active_users: statsResponse.active_users || 0,
          admin_users: statsResponse.admin_users || 0,
          // Tổng camera của tất cả người dùng
          total_cameras: statsResponse.total_cameras || 0,
          active_cameras: statsResponse.active_cameras || 0,
          // Tổng known persons của tất cả người dùng  
          total_persons: statsResponse.total_persons || 0,
          active_persons: statsResponse.active_persons || 0,
          // Tổng detections của tất cả người dùng
          total_detections: statsResponse.total_detections || 0,
          known_person_detections: statsResponse.known_person_detections || 0,
          stranger_detections: statsResponse.stranger_detections || 0,
        };
        
        console.log('✅ AdminPage: Processed admin stats:', adminStats);
        setStats(adminStats);
      } catch (error: any) {
        console.error('❌ AdminPage: Error loading dashboard stats:', error);
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

      // Load system health
      try {
        const healthResponse = await adminService.getSystemHealth();
        console.log('✅ AdminPage: System health loaded:', healthResponse);
        setHealth(healthResponse);
      } catch (error: any) {
        console.error('❌ AdminPage: Error loading system health:', error);
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
  };

  useEffect(() => {
    console.log('🔍 AdminPage useEffect triggered - user:', user);
    console.log('🔍 AdminPage useEffect - user.is_admin:', user?.is_admin);
    
    if (user?.is_admin) {
      console.log('✅ User is admin, loading admin data...');
      loadAdminData();
    } else {
      console.log('❌ User is not admin or user is null');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.is_admin]); // ✅ FIX: Only depend on user admin status

  // ✅ Auto refresh every 5 minutes (instead of 30 seconds to reduce server load)
  useEffect(() => {
    if (!user?.is_admin) return;
    
    const interval = setInterval(() => {
      loadAdminData(true);
    }, 300000); // 5 minutes instead of 30 seconds
    
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.is_admin]); // ✅ FIX: Only depend on admin status

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
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Loading admin panel...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
      {/* ✅ Enhanced Modern Header with Gradient Background */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-rose-700 rounded-3xl p-8 text-white shadow-2xl"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black/10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
                            radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%),
                            radial-gradient(circle at 40% 40%, rgba(255,255,255,0.05) 0%, transparent 50%)`
          }} />
        </div>
        
        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-6 sm:space-y-0">
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  SafeFace Admin Panel
                </h1>
                <div className="flex items-center space-x-2">
                  <div className="px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm">
                    <span className="text-sm font-medium">System Admin</span>
                  </div>
                  <div className="px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm">
                    <span className="text-sm font-medium">Administrator</span>
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-blue-100 text-lg mb-4 leading-relaxed">
              User Account Management & System Overview
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-3 p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-blue-100">Last updated</div>
                  <div className="font-semibold">{new Date().toLocaleTimeString()}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-blue-100">Total user accounts</div>
                  <div className="font-semibold">{users.length} users</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Camera className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-blue-100">Total user cameras</div>
                  <div className="font-semibold">{stats?.total_cameras || 0} cameras</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Modern Control Panel */}
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
            {/* System Status Indicator */}
            {health && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center space-x-3 px-4 py-3 bg-white/20 rounded-2xl backdrop-blur-sm"
              >
                <div className={`p-2 rounded-full ${
                  health.database === 'healthy' && health.face_recognition === 'healthy' 
                    ? 'bg-green-500/20' 
                    : 'bg-red-500/20'
                }`}>
                  {health.database === 'healthy' && health.face_recognition === 'healthy' ? (
                    <CheckCircle className="h-5 w-5 text-green-300" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-300" />
                  )}
                </div>
                <div>
                  <div className="text-xs text-blue-200">System Status</div>
                  <div className="font-semibold text-sm">
                    {health.database === 'healthy' && health.face_recognition === 'healthy' 
                      ? 'All Systems Healthy' 
                      : 'Issues Detected'
                    }
                  </div>
                </div>
              </motion.div>
            )}
            
            <div className="flex items-center space-x-3">
              <Button 
                onClick={handleRefresh} 
                variant="secondary"
                disabled={refreshing}
                className="bg-white/20 hover:bg-white/30 border-white/20 text-white backdrop-blur-sm transition-all duration-300 hover:scale-105"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" className="bg-white/20 hover:bg-white/30 border-white/20 text-white backdrop-blur-sm transition-all duration-300 hover:scale-105">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-sm">
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
          </div>
        </div>
      </motion.div>

      {/* Enhanced Modern Quick Stats */}
      {stats && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* Total Accounts - Blue Theme */}
          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-bl-full opacity-20" />
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Users className="h-5 w-5 text-purple-600" />
                      </div>
                      <p className="text-sm font-semibold text-purple-700">Total Accounts</p>
                    </div>
                    <p className="text-3xl font-bold text-purple-900">{stats.total_users}</p>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="bg-green-100 text-green-800 border-0 px-2 py-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                        {stats.active_users} active
                      </Badge>
                      <Badge variant="secondary" className="bg-gray-100 text-gray-800 border-0 px-2 py-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full mr-1" />
                        {stats.total_users - stats.active_users} inactive
                      </Badge>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-lg" />
                    <div className="relative p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Active Users - Green Theme */}
          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-bl-full opacity-20" />
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <UserCheck className="h-5 w-5 text-green-600" />
                      </div>
                      <p className="text-sm font-semibold text-green-700">Active Users</p>
                    </div>
                    <p className="text-3xl font-bold text-green-900">{stats.active_users}</p>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-0 px-2 py-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-1" />
                        {Math.round((stats.active_users / stats.total_users) * 100) || 0}% of total
                      </Badge>
                      <Badge variant="secondary" className="bg-green-100 text-green-800 border-0 px-2 py-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                        online
                      </Badge>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-green-500/20 rounded-full blur-lg" />
                    <div className="relative p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg">
                      <UserCheck className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Admin Users - Purple Theme */}
          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-bl-full opacity-20" />
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Shield className="h-5 w-5 text-purple-600" />
                      </div>
                      <p className="text-sm font-semibold text-purple-700">Admin Users</p>
                    </div>
                    <p className="text-3xl font-bold text-purple-900">{stats.admin_users || 0}</p>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-0 px-2 py-1">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-1" />
                        {Math.round(((stats.admin_users || 0) / stats.total_users) * 100) || 0}% of total
                      </Badge>
                      <Badge variant="secondary" className="bg-red-100 text-red-800 border-0 px-2 py-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-1" />
                        privileged
                      </Badge>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-lg" />
                    <div className="relative p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg">
                      <Shield className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* User Cameras - Orange Theme */}
          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-bl-full opacity-20" />
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-orange-500/20 rounded-lg">
                        <Camera className="h-5 w-5 text-orange-600" />
                      </div>
                      <p className="text-sm font-semibold text-orange-700">User Cameras</p>
                    </div>
                    <p className="text-3xl font-bold text-orange-900">{stats.total_cameras}</p>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="bg-green-100 text-green-800 border-0 px-2 py-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                        {stats.active_cameras} online
                      </Badge>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-0 px-2 py-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-1" />
                        {stats.streaming_cameras || 0} streaming
                      </Badge>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-lg" />
                    <div className="relative p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg">
                      <Camera className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {/* System Health Alert - For Admin User Management */}
      {health && (health.database !== 'healthy' || health.face_recognition !== 'healthy') && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              System health issues detected. This may affect user data and account management. Please check the monitoring tab for details.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Enhanced Modern Tabs */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 bg-white/50 backdrop-blur-sm p-2 rounded-2xl border-0 shadow-lg">
            <TabsTrigger 
              value="dashboard" 
              className="flex items-center space-x-2 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-300 hover:scale-105"
            >
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </div>
              <span className="font-medium">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger 
              value="users" 
              className="flex items-center space-x-2 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-300 hover:scale-105"
            >
              <div className="p-1.5 bg-green-100 rounded-lg">
                <Users className="h-4 w-4 text-green-600" />
              </div>
              <span className="font-medium">Users</span>
            </TabsTrigger>
            <TabsTrigger 
              value="monitoring" 
              className="flex items-center space-x-2 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-300 hover:scale-105"
            >
              <div className="p-1.5 bg-purple-100 rounded-lg">
                <Monitor className="h-4 w-4 text-purple-600" />
              </div>
              <span className="font-medium">Monitoring</span>
            </TabsTrigger>
            <TabsTrigger 
              value="logs" 
              className="flex items-center space-x-2 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-300 hover:scale-105"
            >
              <div className="p-1.5 bg-orange-100 rounded-lg">
                <FileText className="h-4 w-4 text-orange-600" />
              </div>
              <span className="font-medium">Logs</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-8">
            {/* ✅ Enhanced Recent Activity focused on User Management */}
            {stats?.recent_activity && stats.recent_activity.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl shadow-lg">
                          <Activity className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">Recent User Activities</h3>
                          <p className="text-sm text-gray-500">Latest user account and system events</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {stats.recent_activity.length} events
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats.recent_activity.slice(0, 5).map((activity, index) => (
                        <motion.div 
                          key={`activity-${index}-${activity.timestamp}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="group relative"
                        >
                          <div className="flex items-start space-x-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
                            {/* Activity Icon */}
                            <div className="flex-shrink-0">
                              <div className="p-2 bg-gradient-to-br from-blue-100 to-green-100 rounded-xl">
                                {activity.type.toLowerCase().includes('user') ? (
                                  <Users className="w-5 h-5 text-blue-600" />
                                ) : activity.type.toLowerCase().includes('login') ? (
                                  <Shield className="w-5 h-5 text-green-600" />
                                ) : (
                                  <Calendar className="w-5 h-5 text-purple-600" />
                                )}
                              </div>
                            </div>
                            
                            {/* Activity Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                  {activity.type}
                                </h4>
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                  <span className="text-xs text-gray-500 font-medium">
                                    {new Date(activity.timestamp).toLocaleTimeString()}
                                  </span>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 leading-relaxed">
                                {activity.description}
                              </p>
                              <div className="mt-2 text-xs text-gray-400">
                                {new Date(activity.timestamp).toLocaleDateString('vi-VN', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </div>
                            </div>
                            
                            {/* Activity Type Badge */}
                            <div className="flex-shrink-0">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  activity.type.toLowerCase().includes('user') 
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : activity.type.toLowerCase().includes('login')
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : 'bg-purple-50 text-purple-700 border-purple-200'
                                }`}
                              >
                                {activity.type.toLowerCase().includes('user') ? 'User' : 
                                 activity.type.toLowerCase().includes('login') ? 'Auth' : 'System'}
                              </Badge>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    {/* View More Button */}
                    {stats.recent_activity.length > 5 && (
                      <div className="mt-6 text-center">
                        <Button variant="outline" className="bg-gradient-to-r from-blue-50 to-green-50 hover:from-blue-100 hover:to-green-100 border-blue-200">
                          <Activity className="w-4 h-4 mr-2" />
                          View All Activities ({stats.recent_activity.length})
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
            
            {/* User Management Quick Actions Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl shadow-lg">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">User Management Actions</h3>
                      <p className="text-sm text-gray-500">Quick access to user administration tasks</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      className="h-20 bg-gradient-to-br from-pink-50 to-pink-100 hover:from-pink-100 hover:to-pink-200 border-pink-200 transition-all duration-300 hover:scale-105"
                      onClick={() => setActiveTab('users')}
                    >
                      <div className="flex flex-col items-center space-y-3">
                        <div className="p-2 bg-pink-500/20 rounded-lg">
                          <Users className="w-8 h-8 text-pink-600" />
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium text-pink-700">Manage User Accounts</div>
                          <div className="text-xs text-pink-600">View, edit, activate/deactivate users</div>
                        </div>
                      </div>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-20 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border-green-200 transition-all duration-300 hover:scale-105"
                      onClick={() => setActiveTab('monitoring')}
                    >
                      <div className="flex flex-col items-center space-y-3">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                          <Monitor className="w-8 h-8 text-green-600" />
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium text-green-700">System Overview</div>
                          <div className="text-xs text-green-600">Monitor system health & resources</div>
                        </div>
                      </div>
                    </Button>
                  </div>
                  
                  {/* User Statistics Summary */}
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-700 mb-4">User Account Summary</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-xl">
                        <div className="text-2xl font-bold text-blue-600">{users.length}</div>
                        <div className="text-xs text-blue-700 font-medium">Total Accounts</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-xl">
                        <div className="text-2xl font-bold text-green-600">
                          {users.filter(u => u.is_active).length}
                        </div>
                        <div className="text-xs text-green-700 font-medium">Active Users</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-xl">
                        <div className="text-2xl font-bold text-purple-600">
                          {users.filter(u => u.is_admin).length}
                        </div>
                        <div className="text-xs text-purple-700 font-medium">Admin Users</div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-xl">
                        <div className="text-2xl font-bold text-orange-600">
                          {stats?.total_cameras || 0}
                        </div>
                        <div className="text-xs text-orange-700 font-medium">User Cameras</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="users" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Enhanced Modern Search and Filters */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0 lg:space-x-6">
                <div className="flex-1 max-w-2xl">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      placeholder="Search users by name, username, email, or department..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 pr-4 py-3 bg-white border-0 shadow-lg rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    />
                    {searchTerm && (
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSearchTerm('')}
                          className="h-6 w-6 p-0 hover:bg-gray-100 rounded-full"
                        >
                          <XCircle className="h-4 w-4 text-gray-400" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3 text-sm bg-white rounded-2xl px-6 py-3 shadow-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span className="text-gray-700 font-medium">{filteredUsers.length} of {users.length} users</span>
                    </div>
                    <div className="w-px h-4 bg-gray-300" />
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-0">
                      {users.filter(u => u.is_active).length} active
                    </Badge>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-0">
                      {users.filter(u => u.is_admin).length} admins
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Enhanced Modern Users List */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Users Management</h3>
                        <p className="text-sm text-gray-500">Manage user accounts and permissions</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => loadAdminData(true)}
                      disabled={refreshing}
                      className="bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border-blue-200 transition-all duration-300"
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user, index) => (
                        <motion.div
                          key={user.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="group"
                        >
                          <div className="flex items-center space-x-6 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            {/* Enhanced Avatar */}
                            <div className="relative">
                              <Avatar className="h-16 w-16 ring-4 ring-white shadow-lg">
                                <AvatarImage src={user.avatar_url} alt={user.full_name} />
                                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-lg font-bold">
                                  {user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              {/* Status Indicator */}
                              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-3 border-white ${
                                user.is_active ? 'bg-green-500' : 'bg-gray-400'
                              }`} />
                            </div>
                            
                            {/* User Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="text-lg font-bold text-gray-900 truncate group-hover:text-purple-600 transition-colors">
                                  {user.full_name}
                                </h4>
                                <div className="flex items-center space-x-2">
                                  <Badge variant={user.is_active ? "default" : "secondary"} className={`${
                                    user.is_active 
                                      ? 'bg-green-100 text-green-800 border-green-200' 
                                      : 'bg-gray-100 text-gray-600 border-gray-200'
                                  } transition-all duration-300`}>
                                    {user.is_active ? 'Active' : 'Inactive'}
                                  </Badge>
                                  {user.is_admin && (
                                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                                      Admin
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                                <span className="flex items-center space-x-1">
                                  <span className="font-medium">@{user.username}</span>
                                </span>
                                <span className="text-gray-400">•</span>
                                <span className="flex items-center space-x-1">
                                  <span>{user.email}</span>
                                </span>
                              </div>
                              
                              {/* User Details Grid */}
                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                                <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg">
                                  <Calendar className="w-3 h-3 text-blue-600" />
                                  <div>
                                    <div className="text-blue-600 font-medium">Joined</div>
                                    <div className="text-gray-700">{new Date(user.created_at).toLocaleDateString()}</div>
                                  </div>
                                </div>
                                
                                {user.department && (
                                  <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
                                    <div className="w-3 h-3 bg-green-600 rounded-full" />
                                    <div>
                                      <div className="text-green-600 font-medium">Department</div>
                                      <div className="text-gray-700">{user.department}</div>
                                    </div>
                                  </div>
                                )}
                                
                                {user.last_login && (
                                  <div className="flex items-center space-x-2 p-2 bg-purple-50 rounded-lg">
                                    <Activity className="w-3 h-3 text-purple-600" />
                                    <div>
                                      <div className="text-purple-600 font-medium">Last login</div>
                                      <div className="text-gray-700">{new Date(user.last_login).toLocaleDateString()}</div>
                                    </div>
                                  </div>
                                )}
                                
                                {user.stats && (
                                  <div className="flex items-center space-x-2 p-2 bg-orange-50 rounded-lg">
                                    <TrendingUp className="w-3 h-3 text-orange-600" />
                                    <div>
                                      <div className="text-orange-600 font-medium">Stats</div>
                                      <div className="text-gray-700">{user.stats.total_logins || 0} logins</div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Action Menu */}
                            <div className="flex-shrink-0">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="h-10 w-10 rounded-full hover:bg-gray-100 transition-all duration-300 hover:scale-110"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 bg-white/95 backdrop-blur-sm">
                                  <DropdownMenuItem onClick={() => handleViewUserDetails(user)} className="hover:bg-blue-50">
                                    <Eye className="h-4 w-4 mr-2 text-blue-600" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleToggleUserStatus(user)} className="hover:bg-green-50">
                                    {user.is_active ? (
                                      <>
                                        <UserX className="h-4 w-4 mr-2 text-red-600" />
                                        Deactivate User
                                      </>
                                    ) : (
                                      <>
                                        <UserCheck className="h-4 w-4 mr-2 text-green-600" />
                                        Activate User
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleToggleAdminRole(user)} className="hover:bg-purple-50">
                                    <Shield className="h-4 w-4 mr-2 text-purple-600" />
                                    {user.is_admin ? 'Remove Admin' : 'Make Admin'}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => setDeleteDialog({ open: true, user })}
                                    className="text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete User
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16"
                      >
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full blur-xl opacity-50" />
                          <div className="relative p-8 bg-white rounded-2xl shadow-lg max-w-md mx-auto">
                            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No users found</h3>
                            {searchTerm ? (
                              <div className="space-y-3">
                                <p className="text-gray-500">
                                  No users match your search criteria "<strong className="text-gray-700">{searchTerm}</strong>"
                                </p>
                                <Button 
                                  variant="outline" 
                                  onClick={() => setSearchTerm('')}
                                  className="bg-blue-50 hover:bg-blue-100 border-blue-200"
                                >
                                  Clear Search
                                </Button>
                              </div>
                            ) : (
                              <p className="text-gray-500">No users have been created yet</p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* System Health Status */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center space-x-3">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl shadow-lg">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">System Health</h3>
                      <p className="text-sm text-gray-500">Core system components status</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {health && (
                    <div className="space-y-4">
                      {/* Database Status */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="group"
                      >
                        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                          <div className="flex items-center space-x-4">
                            <div className={`p-3 rounded-xl ${
                              health.database === 'healthy' 
                                ? 'bg-green-100' 
                                : 'bg-red-100'
                            }`}>
                              <div className={`w-4 h-4 rounded-full ${
                                health.database === 'healthy' 
                                  ? 'bg-green-500' 
                                  : 'bg-red-500'
                              }`} />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">Database Connection</h4>
                              <p className="text-sm text-gray-600">PostgreSQL database status</p>
                            </div>
                          </div>
                          <Badge 
                            variant={health.database === 'healthy' ? 'default' : 'destructive'}
                            className={`${
                              health.database === 'healthy' 
                                ? 'bg-green-100 text-green-800 border-green-200' 
                                : 'bg-red-100 text-red-800 border-red-200'
                            } transition-all duration-300`}
                          >
                            {health.database === 'healthy' ? 'Healthy' : 'Error'}
                          </Badge>
                        </div>
                      </motion.div>

                      {/* Face Recognition Status */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="group"
                      >
                        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                          <div className="flex items-center space-x-4">
                            <div className={`p-3 rounded-xl ${
                              health.face_recognition === 'healthy' 
                                ? 'bg-green-100' 
                                : 'bg-red-100'
                            }`}>
                              <div className={`w-4 h-4 rounded-full ${
                                health.face_recognition === 'healthy' 
                                  ? 'bg-green-500' 
                                  : 'bg-red-500'
                              }`} />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">Face Recognition AI</h4>
                              <p className="text-sm text-gray-600">Deep learning model status</p>
                            </div>
                          </div>
                          <Badge 
                            variant={health.face_recognition === 'healthy' ? 'default' : 'destructive'}
                            className={`${
                              health.face_recognition === 'healthy' 
                                ? 'bg-green-100 text-green-800 border-green-200' 
                                : 'bg-red-100 text-red-800 border-red-200'
                            } transition-all duration-300`}
                          >
                            {health.face_recognition === 'healthy' ? 'Healthy' : 'Error'}
                          </Badge>
                        </div>
                      </motion.div>

                      {/* WebSocket Status */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="group"
                      >
                        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                          <div className="flex items-center space-x-4">
                            <div className={`p-3 rounded-xl ${
                              health.websocket === 'healthy' 
                                ? 'bg-green-100' 
                                : 'bg-red-100'
                            }`}>
                              <div className={`w-4 h-4 rounded-full ${
                                health.websocket === 'healthy' 
                                  ? 'bg-green-500' 
                                  : 'bg-red-500'
                              }`} />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">WebSocket Connection</h4>
                              <p className="text-sm text-gray-600">Real-time communication</p>
                            </div>
                          </div>
                          <Badge 
                            variant={health.websocket === 'healthy' ? 'default' : 'destructive'}
                            className={`${
                              health.websocket === 'healthy' 
                                ? 'bg-green-100 text-green-800 border-green-200' 
                                : 'bg-red-100 text-red-800 border-red-200'
                            } transition-all duration-300`}
                          >
                            {health.websocket === 'healthy' ? 'Healthy' : 'Unknown'}
                          </Badge>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* System Resources */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center space-x-3">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg">
                      <Monitor className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">System Resources</h3>
                      <p className="text-sm text-gray-500">Server performance metrics</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {health?.system && (
                    <div className="space-y-6">
                      {/* CPU Usage */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-3"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <div className="w-4 h-4 bg-blue-500 rounded" />
                            </div>
                            <span className="font-semibold text-gray-900">CPU Usage</span>
                          </div>
                          <span className="text-lg font-bold text-gray-900">
                            {health.system.cpu.percent.toFixed(1)}%
                          </span>
                        </div>
                        <ProgressBar 
                          value={health.system.cpu.percent} 
                          max={100} 
                          color="bg-blue-500" 
                        />
                      </motion.div>
                      
                      {/* Memory Usage */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-3"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <div className="w-4 h-4 bg-green-500 rounded" />
                            </div>
                            <span className="font-semibold text-gray-900">Memory Usage</span>
                          </div>
                          <span className="text-lg font-bold text-gray-900">
                            {health.system.memory.percent.toFixed(1)}%
                          </span>
                        </div>
                        <ProgressBar 
                          value={health.system.memory.percent} 
                          max={100} 
                          color="bg-green-500" 
                        />
                        <div className="text-xs text-gray-600">
                          {(health.system.memory.used / (1024**3)).toFixed(1)} GB / {(health.system.memory.total / (1024**3)).toFixed(1)} GB
                        </div>
                      </motion.div>
                      
                      {/* Disk Usage */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-3"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <div className="w-4 h-4 bg-purple-500 rounded" />
                            </div>
                            <span className="font-semibold text-gray-900">Disk Usage</span>
                          </div>
                          <span className="text-lg font-bold text-gray-900">
                            {health.system.disk.percent.toFixed(1)}%
                          </span>
                        </div>
                        <ProgressBar 
                          value={health.system.disk.percent} 
                          max={100} 
                          color="bg-purple-500" 
                        />
                        <div className="text-xs text-gray-600">
                          {(health.system.disk.used / (1024**3)).toFixed(1)} GB / {(health.system.disk.total / (1024**3)).toFixed(1)} GB
                        </div>
                      </motion.div>
                      
                      {/* System Uptime */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl border border-gray-100"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gradient-to-br from-rose-500 to-pink-500 rounded-lg">
                              <TrendingUp className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-semibold text-gray-900">System Uptime</span>
                          </div>
                          <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600">
                            {formatUptime(health.uptime)}
                          </span>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="logs" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg">
                        <Activity className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">System Logs</h3>
                        <p className="text-sm text-gray-500">Real-time system events and activities</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse" />
                        {logs.length} entries
                      </Badge>
                      <Button 
                        variant="outline" 
                        onClick={() => loadAdminData(true)}
                        disabled={refreshing}
                        className="bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border-blue-200 transition-all duration-300"
                      >
                        <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {logs.length > 0 ? (
                      logs.map((log, index) => (
                        <motion.div 
                          key={log.id || index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="group relative"
                        >
                          <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.01]">
                            {/* Log Level Indicator */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                              log.level === 'error' ? 'bg-red-500' :
                              log.level === 'warning' ? 'bg-yellow-500' :
                              log.level === 'info' ? 'bg-blue-500' :
                              'bg-gray-400'
                            }`} />
                            
                            <div className="p-6 pl-8">
                              {/* Log Header */}
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                  <div className={`p-2 rounded-lg ${
                                    log.level === 'error' ? 'bg-red-100' :
                                    log.level === 'warning' ? 'bg-yellow-100' :
                                    log.level === 'info' ? 'bg-blue-100' :
                                    'bg-gray-100'
                                  }`}>
                                    <div className={`w-3 h-3 rounded-full ${
                                      log.level === 'error' ? 'bg-red-500' :
                                      log.level === 'warning' ? 'bg-yellow-500' :
                                      log.level === 'info' ? 'bg-blue-500' :
                                      'bg-gray-400'
                                    }`} />
                                  </div>
                                  <div>
                                    <span className="text-sm font-medium text-gray-500">
                                      {new Date(log.timestamp).toLocaleString('vi-VN')}
                                    </span>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <Badge 
                                        variant="outline" 
                                        className={`text-xs ${
                                          log.level === 'error' ? 'bg-red-50 text-red-700 border-red-200' :
                                          log.level === 'warning' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                          log.level === 'info' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                          'bg-gray-50 text-gray-700 border-gray-200'
                                        }`}
                                      >
                                        {(log.level || 'INFO').toUpperCase()}
                                      </Badge>
                                      {log.category && (
                                        <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                          {log.category}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-xs text-gray-400 font-mono">
                                  ID: {(log.id || '').slice(-8)}
                                </div>
                              </div>
                              
                              {/* Log Message */}
                              <div className="space-y-3">
                                <div className="text-gray-800 font-medium leading-relaxed">
                                  {log.message || 'No message available'}
                                </div>
                                
                                {/* Log Details */}
                                {(log.user_id || log.camera_id || log.ip_address) && (
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-gray-100">
                                    {log.user_id && (
                                      <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg">
                                        <UserCheck className="w-4 h-4 text-blue-600" />
                                        <div>
                                          <div className="text-xs text-blue-600 font-medium">User ID</div>
                                          <div className="text-sm text-gray-700 font-mono">{log.user_id}</div>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {log.camera_id && (
                                      <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
                                        <Camera className="w-4 h-4 text-green-600" />
                                        <div>
                                          <div className="text-xs text-green-600 font-medium">Camera ID</div>
                                          <div className="text-sm text-gray-700 font-mono">{log.camera_id}</div>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {log.ip_address && (
                                      <div className="flex items-center space-x-2 p-2 bg-orange-50 rounded-lg">
                                        <Monitor className="w-4 h-4 text-orange-600" />
                                        <div>
                                          <div className="text-xs text-orange-600 font-medium">IP Address</div>
                                          <div className="text-sm text-gray-700 font-mono">{log.ip_address}</div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16"
                      >
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-orange-100 to-red-100 rounded-full blur-xl opacity-50" />
                          <div className="relative p-8 bg-white rounded-2xl shadow-lg max-w-md mx-auto">
                            <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No logs available</h3>
                            <p className="text-gray-500 mb-6">
                              System logs will appear here when events occur
                            </p>
                            <Button 
                              variant="outline" 
                              onClick={() => loadAdminData(true)}
                              disabled={refreshing}
                              className="bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 border-orange-200"
                            >
                              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                              Refresh Logs
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                  
                  {/* Log Stats */}
                  {logs.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-red-50 rounded-xl">
                          <div className="text-2xl font-bold text-red-600">
                            {logs.filter(l => l.level === 'error').length}
                          </div>
                          <div className="text-xs text-red-700 font-medium">Errors</div>
                        </div>
                        <div className="text-center p-3 bg-yellow-50 rounded-xl">
                          <div className="text-2xl font-bold text-yellow-600">
                            {logs.filter(l => l.level === 'warning').length}
                          </div>
                          <div className="text-xs text-yellow-700 font-medium">Warnings</div>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-xl">
                          <div className="text-2xl font-bold text-blue-600">
                            {logs.filter(l => l.level === 'info').length}
                          </div>
                          <div className="text-xs text-blue-700 font-medium">Info</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-xl">
                          <div className="text-2xl font-bold text-green-600">
                            {logs.length}
                          </div>
                          <div className="text-xs text-green-700 font-medium">Total</div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
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
    </AdminLayout>
  );
};

export default AdminPage;