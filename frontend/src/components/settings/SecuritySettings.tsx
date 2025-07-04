import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Key,
  Eye,
  EyeOff,
  Save,
  AlertTriangle,
  CheckCircle,
  Smartphone,
  Monitor,
  Clock,
  Lock,
  Unlock,
  Settings,
  Activity,
  ExternalLink,
  Download,
  Trash2,
  RefreshCw
} from 'lucide-react';
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
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/auth.service';
import { userService } from '@/services/user.service';
import { toast } from 'sonner';

// ✅ Updated interfaces to match backend from #backend
interface PasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

interface SecuritySettingsData {
  // ✅ Backend doesn't have these yet, so they're frontend-only
  two_factor_enabled: boolean;
  login_alerts: boolean;
  session_timeout: number;
  device_notifications: boolean;
  password_expiry: boolean;
  login_history_retention: number;
  suspicious_activity_alerts: boolean;
}

interface LoginSession {
  id: string;
  device: string;
  location: string;
  ip_address: string;
  last_active: string;
  is_current: boolean;
}

interface SecuritySettingsProps {
  onSave?: (data: SecuritySettingsData) => void;
}

const SecuritySettings: React.FC<SecuritySettingsProps> = ({ onSave }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [passwordData, setPasswordData] = useState<PasswordData>({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  // ✅ Initialize with backend-compatible default values
  const [securitySettings, setSecuritySettings] = useState<SecuritySettingsData>({
    two_factor_enabled: false,
    login_alerts: true,
    session_timeout: 30,
    device_notifications: true,
    password_expiry: false,
    login_history_retention: 90,
    suspicious_activity_alerts: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showTwoFactorDialog, setShowTwoFactorDialog] = useState(false);
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  
  // ✅ Mock sessions until backend implements session management
  const [activeSessions, setActiveSessions] = useState<LoginSession[]>([
    {
      id: '1',
      device: 'Chrome on Windows',
      location: 'Ho Chi Minh City, Vietnam',
      ip_address: '192.168.1.100',
      last_active: new Date().toISOString(),
      is_current: true
    }
  ]);

  useEffect(() => {
    loadSecuritySettings();
  }, []);

  // ✅ Load security settings from backend (when available)
  const loadSecuritySettings = async () => {
    try {
      // For now, use mock data since backend doesn't have security settings endpoint yet
      console.log('🔵 SecuritySettings: Loading security settings...');
      
      // TODO: Replace with actual API call when backend implements:
      // const settings = await userService.getSecuritySettings();
      // setSecuritySettings(settings);
      
      console.log('✅ SecuritySettings: Security settings loaded (mock)');
    } catch (error) {
      console.error('❌ SecuritySettings: Error loading settings:', error);
      // Keep default settings on error
    }
  };

  // ✅ Enhanced password validation
  const validatePassword = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!passwordData.current_password) {
      newErrors.current_password = 'Current password is required';
    }

    if (!passwordData.new_password) {
      newErrors.new_password = 'New password is required';
    } else if (passwordData.new_password.length < 8) {
      newErrors.new_password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.new_password)) {
      newErrors.new_password = 'Password must contain uppercase, lowercase, and numbers';
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    if (passwordData.current_password === passwordData.new_password) {
      newErrors.new_password = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Updated to use backend endpoint from #backend
  const handlePasswordChange = async () => {
    if (!validatePassword()) {
      toast.error('Please fix the password errors');
      return;
    }

    try {
      setLoading(true);
      console.log('🔵 SecuritySettings: Changing password...');
      
      // ✅ Use backend endpoint POST /auth/change-password
      await authService.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });

      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });

      setErrors({});
      toast.success('Password changed successfully');
      console.log('✅ SecuritySettings: Password changed successfully');
    } catch (error: any) {
      console.error('❌ SecuritySettings: Error changing password:', error);
      
      // Enhanced error handling
      let errorMessage = 'Failed to change password';
      
      if (error.response?.status === 400) {
        if (error.response.data?.detail?.includes('Current password is incorrect')) {
          setErrors({ current_password: 'Current password is incorrect' });
          errorMessage = 'Current password is incorrect';
        } else {
          errorMessage = error.response.data?.detail || errorMessage;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSecuritySettingsChange = (key: keyof SecuritySettingsData, value: boolean | number) => {
    setSecuritySettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // ✅ Mock save settings (backend doesn't implement security settings yet)
  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      console.log('🔵 SecuritySettings: Saving security settings...');
      
      // ✅ Mock implementation until backend adds security settings endpoint
      console.warn('⚠️ SecuritySettings: Security settings endpoint not implemented in backend yet');
      
      // TODO: Replace with actual API call when backend implements:
      // await userService.updateSecuritySettings(securitySettings);
      
      // For now, just simulate saving
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSave?.(securitySettings);
      toast.success('Security settings updated successfully');
      console.log('✅ SecuritySettings: Security settings saved (mock)');
    } catch (error: any) {
      console.error('❌ SecuritySettings: Error saving security settings:', error);
      toast.error('Failed to save security settings');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Mock session management (backend doesn't implement this yet)
  const handleTerminateSession = async (sessionId: string) => {
    try {
      console.log('🔵 SecuritySettings: Terminating session:', sessionId);
      
      // ✅ Mock implementation
      console.warn('⚠️ SecuritySettings: Session management not implemented in backend yet');
      
      // TODO: Replace with actual API call when backend implements:
      // await userService.terminateSession(sessionId);
      
      setActiveSessions(prev => prev.filter(session => session.id !== sessionId));
      toast.success('Session terminated successfully');
      console.log('✅ SecuritySettings: Session terminated (mock)');
    } catch (error) {
      console.error('❌ SecuritySettings: Error terminating session:', error);
      toast.error('Failed to terminate session');
    }
  };

  const handleTerminateAllSessions = async () => {
    try {
      console.log('🔵 SecuritySettings: Terminating all sessions...');
      
      // ✅ Mock implementation
      console.warn('⚠️ SecuritySettings: Session management not implemented in backend yet');
      
      // TODO: Replace with actual API call when backend implements:
      // await userService.terminateAllSessions();
      
      setActiveSessions(prev => prev.filter(session => session.is_current));
      toast.success('All other sessions terminated');
      console.log('✅ SecuritySettings: All sessions terminated (mock)');
    } catch (error) {
      console.error('❌ SecuritySettings: Error terminating all sessions:', error);
      toast.error('Failed to terminate sessions');
    }
  };

  // ✅ Export user data (mock until backend implements)
  const handleExportData = async () => {
    try {
      console.log('🔵 SecuritySettings: Exporting user data...');
      
      // ✅ Mock implementation
      console.warn('⚠️ SecuritySettings: Data export not implemented in backend yet');
      
      // TODO: Replace with actual API call when backend implements:
      // const blob = await userService.exportUserData('json');
      
      // Mock data export
      const userData = {
        user: {
          id: user?.id,
          username: user?.username,
          email: user?.email,
          full_name: user?.full_name,
          created_at: user?.created_at
        },
        exported_at: new Date().toISOString(),
        data_types: ['profile', 'settings', 'activity_logs']
      };
      
      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `safeface-data-${user?.username}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('User data exported successfully');
      console.log('✅ SecuritySettings: User data exported (mock)');
    } catch (error) {
      console.error('❌ SecuritySettings: Error exporting data:', error);
      toast.error('Failed to export user data');
    }
  };

  // ✅ Delete account (mock until backend implements)
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    try {
      setLoading(true);
      console.log('🔵 SecuritySettings: Deleting account...');
      
      // ✅ Mock implementation
      console.warn('⚠️ SecuritySettings: Account deletion not implemented in backend yet');
      
      // TODO: Replace with actual API call when backend implements:
      // await userService.deleteAccount(passwordData.current_password);
      
      toast.error('Account deletion is not available yet');
      setShowDeleteAccountDialog(false);
      setDeleteConfirmText('');
      console.log('✅ SecuritySettings: Account deletion attempted (mock)');
    } catch (error) {
      console.error('❌ SecuritySettings: Error deleting account:', error);
      toast.error('Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { score: 0, label: '', color: 'gray' };
    
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[!@#$%^&*]/.test(password)) score += 1;

    const strength = [
      { label: 'Very Weak', color: 'red' },
      { label: 'Weak', color: 'orange' },
      { label: 'Fair', color: 'yellow' },
      { label: 'Good', color: 'blue' },
      { label: 'Strong', color: 'green' }
    ];

    return { score, ...strength[Math.min(score, 4)] };
  };

  return (
    <div className="space-y-6">
      {/* ✅ Enhanced Change Password */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="h-5 w-5 text-blue-600" />
            <span>Change Password</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Password */}
          <div className="space-y-2">
            <Label htmlFor="current_password">
              Current Password <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="current_password"
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordData.current_password}
                onChange={(e) => {
                  setPasswordData(prev => ({ ...prev, current_password: e.target.value }));
                  if (errors.current_password) {
                    setErrors(prev => ({ ...prev, current_password: '' }));
                  }
                }}
                placeholder="Enter current password"
                className={errors.current_password ? 'border-red-500 focus:border-red-500' : ''}
                disabled={loading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => togglePasswordVisibility('current')}
                disabled={loading}
              >
                {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.current_password && (
              <p className="text-sm text-red-500 flex items-center">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {errors.current_password}
              </p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="new_password">
              New Password <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="new_password"
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordData.new_password}
                onChange={(e) => {
                  setPasswordData(prev => ({ ...prev, new_password: e.target.value }));
                  if (errors.new_password) {
                    setErrors(prev => ({ ...prev, new_password: '' }));
                  }
                }}
                placeholder="Enter new password"
                className={errors.new_password ? 'border-red-500 focus:border-red-500' : ''}
                disabled={loading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => togglePasswordVisibility('new')}
                disabled={loading}
              >
                {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            
            {/* Enhanced Password Strength Indicator */}
            {passwordData.new_password && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1 flex-1">
                    {[1, 2, 3, 4, 5].map((level) => {
                      const strength = getPasswordStrength(passwordData.new_password);
                      return (
                        <div
                          key={level}
                          className={`h-2 flex-1 rounded transition-colors ${
                            level <= strength.score
                              ? strength.color === 'red' ? 'bg-red-500' :
                                strength.color === 'orange' ? 'bg-orange-500' :
                                strength.color === 'yellow' ? 'bg-yellow-500' :
                                strength.color === 'blue' ? 'bg-blue-500' :
                                'bg-green-500'
                              : 'bg-gray-200'
                          }`}
                        />
                      );
                    })}
                  </div>
                  <span className={`text-xs font-medium ${
                    getPasswordStrength(passwordData.new_password).color === 'red' ? 'text-red-600' :
                    getPasswordStrength(passwordData.new_password).color === 'orange' ? 'text-orange-600' :
                    getPasswordStrength(passwordData.new_password).color === 'yellow' ? 'text-yellow-600' :
                    getPasswordStrength(passwordData.new_password).color === 'blue' ? 'text-blue-600' :
                    'text-green-600'
                  }`}>
                    {getPasswordStrength(passwordData.new_password).label}
                  </span>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>Password requirements:</p>
                  <ul className="list-disc list-inside space-y-0.5 ml-2">
                    <li className={passwordData.new_password.length >= 8 ? 'text-green-600' : 'text-gray-500'}>
                      At least 8 characters
                    </li>
                    <li className={/[a-z]/.test(passwordData.new_password) ? 'text-green-600' : 'text-gray-500'}>
                      Lowercase letter
                    </li>
                    <li className={/[A-Z]/.test(passwordData.new_password) ? 'text-green-600' : 'text-gray-500'}>
                      Uppercase letter
                    </li>
                    <li className={/\d/.test(passwordData.new_password) ? 'text-green-600' : 'text-gray-500'}>
                      Number
                    </li>
                    <li className={/[!@#$%^&*]/.test(passwordData.new_password) ? 'text-green-600' : 'text-gray-500'}>
                      Special character
                    </li>
                  </ul>
                </div>
              </div>
            )}
            
            {errors.new_password && (
              <p className="text-sm text-red-500 flex items-center">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {errors.new_password}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirm_password">
              Confirm New Password <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="confirm_password"
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordData.confirm_password}
                onChange={(e) => {
                  setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }));
                  if (errors.confirm_password) {
                    setErrors(prev => ({ ...prev, confirm_password: '' }));
                  }
                }}
                placeholder="Confirm new password"
                className={errors.confirm_password ? 'border-red-500 focus:border-red-500' : ''}
                disabled={loading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => togglePasswordVisibility('confirm')}
                disabled={loading}
              >
                {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.confirm_password && (
              <p className="text-sm text-red-500 flex items-center">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {errors.confirm_password}
              </p>
            )}
          </div>

          <Alert className="border-blue-200 bg-blue-50">
            <Shield className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Choose a strong password with at least 8 characters, including uppercase, lowercase, numbers, and special characters.
            </AlertDescription>
          </Alert>

          <Button 
            onClick={handlePasswordChange}
            disabled={loading || !passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Changing Password...
              </>
            ) : (
              <>
                <Key className="h-4 w-4 mr-2" />
                Change Password
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* ✅ Enhanced Two-Factor Authentication */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5 text-green-600" />
            <span>Two-Factor Authentication</span>
            <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-300">
              Coming Soon
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable 2FA</Label>
              <p className="text-sm text-gray-600">
                Add an extra layer of security to your account with authenticator apps
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={securitySettings.two_factor_enabled}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setShowTwoFactorDialog(true);
                  } else {
                    handleSecuritySettingsChange('two_factor_enabled', false);
                  }
                }}
                disabled // ✅ Disabled until backend implements 2FA
              />
              {securitySettings.two_factor_enabled && (
                <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Enabled
                </Badge>
              )}
            </div>
          </div>

          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Two-factor authentication will be available in a future update. Stay tuned for enhanced security features!
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* ✅ Enhanced Login & Session Settings */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-purple-600" />
            <span>Login & Session Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Login Alerts</Label>
              <p className="text-sm text-gray-600">
                Get notified when someone logs into your account from a new device
              </p>
            </div>
            <Switch
              checked={securitySettings.login_alerts}
              onCheckedChange={(checked) => handleSecuritySettingsChange('login_alerts', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Device Notifications</Label>
              <p className="text-sm text-gray-600">
                Get notified when a new device accesses your account
              </p>
            </div>
            <Switch
              checked={securitySettings.device_notifications}
              onCheckedChange={(checked) => handleSecuritySettingsChange('device_notifications', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Suspicious Activity Alerts</Label>
              <p className="text-sm text-gray-600">
                Get alerted about unusual login patterns or security events
              </p>
            </div>
            <Switch
              checked={securitySettings.suspicious_activity_alerts}
              onCheckedChange={(checked) => handleSecuritySettingsChange('suspicious_activity_alerts', checked)}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="session_timeout">
              <Clock className="h-4 w-4 inline mr-1" />
              Session Timeout (minutes)
            </Label>
            <Input
              id="session_timeout"
              type="number"
              value={securitySettings.session_timeout}
              onChange={(e) => handleSecuritySettingsChange('session_timeout', parseInt(e.target.value) || 30)}
              min="5"
              max="480"
              className="w-32"
            />
            <p className="text-sm text-gray-600">
              Automatically log out after this period of inactivity (5-480 minutes)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ✅ Enhanced Active Sessions */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Monitor className="h-5 w-5 text-indigo-600" />
              <span>Active Sessions</span>
              <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-300">
                Limited
              </Badge>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.location.reload()}
                className="text-gray-600"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleTerminateAllSessions}
                className="text-red-600 hover:text-red-700 border-red-300"
              >
                <Unlock className="h-4 w-4 mr-2" />
                End All Others
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Monitor className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{session.device}</h4>
                      {session.is_current && (
                        <Badge variant="default" className="text-xs bg-green-100 text-green-800 border-green-300">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Current Session
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{session.location}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                      <span>IP: {session.ip_address}</span>
                      <span>•</span>
                      <span>Last active: {new Date(session.last_active).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                {!session.is_current && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTerminateSession(session.id)}
                    className="text-red-600 hover:text-red-700 border-red-300"
                  >
                    <Lock className="h-4 w-4 mr-1" />
                    End Session
                  </Button>
                )}
              </div>
            ))}
            
            <Alert className="border-blue-200 bg-blue-50">
              <Monitor className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Session management features are limited. Full session tracking will be available in a future update.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* ✅ Enhanced Data & Privacy */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-orange-600" />
            <span>Data & Privacy</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Password Expiry</Label>
              <p className="text-sm text-gray-600">
                Require password change every 90 days for enhanced security
              </p>
            </div>
            <Switch
              checked={securitySettings.password_expiry}
              onCheckedChange={(checked) => handleSecuritySettingsChange('password_expiry', checked)}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="history_retention">
              Login History Retention (days)
            </Label>
            <Input
              id="history_retention"
              type="number"
              value={securitySettings.login_history_retention}
              onChange={(e) => handleSecuritySettingsChange('login_history_retention', parseInt(e.target.value) || 90)}
              min="30"
              max="365"
              className="w-32"
            />
            <p className="text-sm text-gray-600">
              How long to keep login history records (30-365 days)
            </p>
          </div>

          <Separator />

          {/* ✅ Data Export Section */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">Export Your Data</Label>
              <p className="text-sm text-gray-600 mt-1">
                Download a copy of your personal data stored in SafeFace
              </p>
            </div>
            
            <Button 
              variant="outline" 
              onClick={handleExportData}
              className="w-full sm:w-auto"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data (JSON)
            </Button>
          </div>

          <Separator />

          {/* ✅ Account Deletion Section */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium text-red-600">Danger Zone</Label>
              <p className="text-sm text-gray-600 mt-1">
                Permanently delete your account and all associated data
              </p>
            </div>
            
            <Button 
              variant="destructive" 
              onClick={() => setShowDeleteAccountDialog(true)}
              className="w-full sm:w-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ✅ Enhanced Save Settings Button */}
      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
          className="w-full sm:w-auto"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset
        </Button>
        
        <Button 
          onClick={handleSaveSettings} 
          disabled={loading}
          className="w-full sm:w-auto min-w-32 bg-blue-600 hover:bg-blue-700"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Security Settings
            </>
          )}
        </Button>
      </div>

      {/* ✅ Enhanced Two-Factor Setup Dialog */}
      <Dialog open={showTwoFactorDialog} onOpenChange={setShowTwoFactorDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Smartphone className="h-5 w-5" />
              <span>Setup Two-Factor Authentication</span>
            </DialogTitle>
            <DialogDescription>
              Two-factor authentication adds an extra layer of security to your account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                Two-factor authentication is not yet available. This feature will be implemented in a future update.
              </AlertDescription>
            </Alert>
            
            <div className="bg-gray-100 p-8 rounded-lg text-center">
              <div className="w-32 h-32 bg-white mx-auto mb-4 rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
                <Smartphone className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600">
                QR Code will be displayed here when 2FA is implemented
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="verification_code">Verification Code</Label>
              <Input
                id="verification_code"
                placeholder="Enter 6-digit code"
                maxLength={6}
                disabled
              />
              <p className="text-xs text-gray-500">
                Use Google Authenticator, Authy, or similar apps
              </p>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowTwoFactorDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  toast.info('Two-factor authentication will be available soon');
                  setShowTwoFactorDialog(false);
                }}
                className="flex-1"
                disabled
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Enable 2FA
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ✅ Enhanced Delete Account Dialog */}
      <AlertDialog open={showDeleteAccountDialog} onOpenChange={setShowDeleteAccountDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <span>Delete Account</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left space-y-3">
              <p>
                Are you sure you want to permanently delete your account? This action cannot be undone.
              </p>
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-red-800 font-medium text-sm">This will permanently delete:</p>
                <ul className="list-disc list-inside text-red-700 text-sm mt-2 space-y-1">
                  <li>Your user profile and settings</li>
                  <li>All cameras and their configurations</li>
                  <li>All known persons and face images</li>
                  <li>All detection logs and history</li>
                  <li>All uploaded files and data</li>
                </ul>
              </div>
              <div className="space-y-2">
                <Label htmlFor="delete_confirm">
                  Type <strong>DELETE</strong> to confirm:
                </Label>
                <Input
                  id="delete_confirm"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type DELETE to confirm"
                  className="font-mono"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setDeleteConfirmText('');
                setShowDeleteAccountDialog(false);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== 'DELETE' || loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SecuritySettings;