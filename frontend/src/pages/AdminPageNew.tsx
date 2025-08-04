import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Users,
  Activity,
  Database,
  UserCheck,
  Shield,
  RefreshCw,
  Download,
  Calendar,
  TrendingUp,
  Monitor,
  BarChart3,
  FileText,
  Camera,
  Eye,
  AlertTriangle,
  CheckCircle
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

import { DashboardStats, SystemHealth } from '@/types/admin.types';
import { adminService } from '@/services/admin.service';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { motion } from 'framer-motion';

const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);

  // Handle tab change with navigation
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'dashboard') {
      navigate('/admin');
    } else {
      navigate(`/admin/${value}`);
    }
  };

  // Set active tab based on URL
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

  // Load admin data
  const loadAdminData = async (isRefresh = false) => {
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
          last_check: new Date().toISOString()
        });
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
    if (user?.is_admin) {
      loadAdminData();
    }
  }, [user?.is_admin]);

  // Export functionality
  const handleExportData = async (dataType: 'users' | 'logs' | 'stats') => {
    try {
      console.log('🔵 AdminPage: Exporting', dataType);
      
      let data: any;
      let filename: string;
      
      switch (dataType) {
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

  // Check if user is admin
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

  // Loading state
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
      <div className="space-y-8">
        {/* Modern Header with Gradient */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 p-8 text-white shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-indigo-500/20" />
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-6 lg:space-y-0">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold">
                  System Administration
                </h1>
                <p className="text-blue-100 text-lg">
                  Manage users, monitor system health, and configure settings
                </p>
                <div className="flex items-center space-x-6 text-sm text-blue-100 mt-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Last updated: {new Date().toLocaleTimeString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>{stats?.total_users || 0} total users</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Camera className="h-4 w-4" />
                    <span>{stats?.total_cameras || 0} cameras</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Modern System Status */}
                {health && (
                  <div className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-3 border border-white/20">
                    <div className="flex items-center space-x-3">
                      {health.database === 'healthy' && health.face_recognition === 'healthy' ? (
                        <div className="flex items-center space-x-2">
                          <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse" />
                          <span className="text-sm font-semibold text-green-100">System Healthy</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <div className="h-3 w-3 bg-red-400 rounded-full animate-pulse" />
                          <span className="text-sm font-semibold text-red-100">System Issues</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <Button 
                  onClick={handleRefresh} 
                  variant="secondary"
                  disabled={refreshing}
                  className="bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-md"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" className="bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-md">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="backdrop-blur-md">
                    <DropdownMenuItem onClick={() => handleExportData('stats')}>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Export Stats
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
          
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 w-96 h-96 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-br from-white via-transparent to-transparent rounded-full transform rotate-45" />
          </div>
        </motion.div>

        {/* Modern Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-50 p-1 rounded-xl shadow-inner">
            <TabsTrigger 
              value="dashboard" 
              className="flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger 
              value="users" 
              className="flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Users className="w-4 h-4" />
              <span>Users</span>
            </TabsTrigger>
            <TabsTrigger 
              value="monitoring" 
              className="flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Monitor className="w-4 h-4" />
              <span>Monitoring</span>
            </TabsTrigger>
            <TabsTrigger 
              value="logs" 
              className="flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <FileText className="w-4 h-4" />
              <span>Logs</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab Content */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Modern Stats Cards */}
            {stats && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {/* Total Users Card */}
                <Card className="relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-indigo-100">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Total Users</p>
                        <p className="text-3xl font-bold text-blue-900">{stats.total_users}</p>
                        <div className="flex items-center space-x-2 text-xs mt-2">
                          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-300">
                            {stats.active_users} active
                          </Badge>
                          <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-300">
                            {stats.admin_users || 0} admin
                          </Badge>
                        </div>
                      </div>
                      <div className="p-3 bg-white/50 backdrop-blur-sm rounded-xl shadow-lg">
                        <Users className="h-6 w-6 text-blue-700" />
                      </div>
                    </div>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-300/20 to-transparent rounded-full transform translate-x-10 -translate-y-10" />
                  </CardContent>
                </Card>

                {/* Total Cameras Card */}
                <Card className="relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-emerald-100">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Total Cameras</p>
                        <p className="text-3xl font-bold text-green-900">{stats.total_cameras}</p>
                        <div className="flex items-center space-x-2 text-xs mt-2">
                          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-300">
                            {stats.active_cameras} online
                          </Badge>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-300">
                            {stats.streaming_cameras} streaming
                          </Badge>
                        </div>
                      </div>
                      <div className="p-3 bg-white/50 backdrop-blur-sm rounded-xl shadow-lg">
                        <Camera className="h-6 w-6 text-green-700" />
                      </div>
                    </div>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-300/20 to-transparent rounded-full transform translate-x-10 -translate-y-10" />
                  </CardContent>
                </Card>

                {/* Known Persons Card */}
                <Card className="relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-violet-100">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Known Persons</p>
                        <p className="text-3xl font-bold text-purple-900">{stats.total_persons}</p>
                        <div className="flex items-center space-x-2 text-xs mt-2">
                          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-300">
                            {stats.active_persons} active
                          </Badge>
                        </div>
                      </div>
                      <div className="p-3 bg-white/50 backdrop-blur-sm rounded-xl shadow-lg">
                        <UserCheck className="h-6 w-6 text-purple-700" />
                      </div>
                    </div>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-300/20 to-transparent rounded-full transform translate-x-10 -translate-y-10" />
                  </CardContent>
                </Card>

                {/* Total Detections Card */}
                <Card className="relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-orange-50 to-amber-100">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Total Detections</p>
                        <p className="text-3xl font-bold text-orange-900">{stats.total_detections}</p>
                        <div className="flex items-center space-x-2 text-xs mt-2">
                          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-300">
                            {stats.known_person_detections} known
                          </Badge>
                          <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-300">
                            {stats.stranger_detections} unknown
                          </Badge>
                        </div>
                      </div>
                      <div className="p-3 bg-white/50 backdrop-blur-sm rounded-xl shadow-lg">
                        <Eye className="h-6 w-6 text-orange-700" />
                      </div>
                    </div>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-300/20 to-transparent rounded-full transform translate-x-10 -translate-y-10" />
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
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    System health issues detected. Please check the system monitoring tab for details.
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </TabsContent>

          {/* Users Tab Content */}
          <TabsContent value="users" className="space-y-6">
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Users Management</h3>
              <p className="text-gray-600">User management features coming soon...</p>
            </div>
          </TabsContent>

          {/* Monitoring Tab Content */}
          <TabsContent value="monitoring" className="space-y-6">
            <div className="text-center py-12">
              <Monitor className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">System Monitoring</h3>
              <p className="text-gray-600">System monitoring features coming soon...</p>
            </div>
          </TabsContent>

          {/* Logs Tab Content */}
          <TabsContent value="logs" className="space-y-6">
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">System Logs</h3>
              <p className="text-gray-600">System logs features coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminPage;
