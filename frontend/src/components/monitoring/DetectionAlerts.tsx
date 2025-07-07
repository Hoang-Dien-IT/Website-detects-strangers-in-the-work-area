import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import {
  AlertTriangle,
  User,
  Camera,
  Clock,
  Eye,
  X,
  UserX,
  Shield,
  MapPin,
  Bell,
  BellOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebSocketContext } from '../../contexts/WebSocketContext';
import { toast } from 'sonner';

interface DetectionAlert {
  id: string;
  type: 'unknown_person' | 'known_person' | 'suspicious_activity';
  camera_id: string;
  camera_name: string;
  person_id?: string;
  person_name?: string;
  confidence: number;
  timestamp: number;
  bbox?: number[];
  is_read: boolean;
  severity: 'low' | 'medium' | 'high';
  location?: string;
  image_url?: string;
}

interface DetectionAlertsProps {
  className?: string;
  maxAlerts?: number;
  showOnlyUnread?: boolean;
}

const DetectionAlerts: React.FC<DetectionAlertsProps> = ({
  className = '',
  maxAlerts = 10,
  showOnlyUnread = false
}) => {
  const [alerts, setAlerts] = useState<DetectionAlert[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { lastMessage, isConnected } = useWebSocketContext();

  // Load alerts from localStorage on mount
  useEffect(() => {
    const savedAlerts = localStorage.getItem('detection_alerts');
    if (savedAlerts) {
      try {
        const parsedAlerts = JSON.parse(savedAlerts);
        setAlerts(parsedAlerts.slice(0, maxAlerts));
      } catch (error) {
        console.error('Error loading saved alerts:', error);
      }
    }
  }, [maxAlerts]);

  // Save alerts to localStorage
  useEffect(() => {
    localStorage.setItem('detection_alerts', JSON.stringify(alerts));
  }, [alerts]);

  // Handle WebSocket messages for real-time alerts
  useEffect(() => {
    if (lastMessage && lastMessage.data) {
      try {
        // Check if data is valid JSON string
        if (typeof lastMessage.data === 'string' && lastMessage.data.trim()) {
          const message = JSON.parse(lastMessage.data);
          
          if (message.type === 'detection_alert') {
            handleNewDetectionAlert(message.data);
          }
        }
      } catch (error) {
        console.warn('Failed to parse WebSocket message:', error, 'Data:', lastMessage.data);
      }
    }
  }, [lastMessage]);

  const handleNewDetectionAlert = (alertData: any) => {
    const newAlert: DetectionAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: alertData.person_id ? 'known_person' : 'unknown_person',
      camera_id: alertData.camera_id,
      camera_name: alertData.camera_name || `Camera ${alertData.camera_id}`,
      person_id: alertData.person_id,
      person_name: alertData.person_name,
      confidence: alertData.confidence || 0,
      timestamp: alertData.timestamp * 1000, // Convert to milliseconds
      bbox: alertData.bbox,
      is_read: false,
      severity: alertData.person_id ? 'low' : 'high', // Unknown person = high severity
      location: alertData.location,
      image_url: alertData.image_url
    };

    // Add to alerts list
    setAlerts(prev => {
      const newAlerts = [newAlert, ...prev].slice(0, maxAlerts);
      return newAlerts;
    });

    // Show toast notification
    if (newAlert.type === 'unknown_person') {
      toast.error(`🚨 Unknown Person Detected at ${newAlert.camera_name}`, {
        description: `Confidence: ${(newAlert.confidence * 100).toFixed(1)}%`,
        duration: 5000,
      });

      // Play notification sound
      if (soundEnabled) {
        playNotificationSound();
      }
    } else {
      toast.info(`👤 Known Person: ${newAlert.person_name} at ${newAlert.camera_name}`, {
        description: `Confidence: ${(newAlert.confidence * 100).toFixed(1)}%`,
        duration: 3000,
      });
    }
  };

  const playNotificationSound = () => {
    try {
      // Create audio context for notification sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  };

  const markAsRead = (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, is_read: true } : alert
      )
    );
  };

  const removeAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const clearAllAlerts = () => {
    setAlerts([]);
  };

  const markAllAsRead = () => {
    setAlerts(prev => prev.map(alert => ({ ...alert, is_read: true })));
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getAlertIcon = (type: string, severity: string) => {
    switch (type) {
      case 'unknown_person':
        return <UserX className="w-4 h-4" />;
      case 'known_person':
        return <User className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getAlertColor = (type: string, severity: string) => {
    if (type === 'unknown_person') {
      return 'bg-red-100 border-red-300 text-red-800';
    } else if (type === 'known_person') {
      return 'bg-green-100 border-green-300 text-green-800';
    }
    return 'bg-yellow-100 border-yellow-300 text-yellow-800';
  };

  const filteredAlerts = showOnlyUnread 
    ? alerts.filter(alert => !alert.is_read)
    : alerts;

  const unreadCount = alerts.filter(alert => !alert.is_read).length;

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center space-x-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <span>Detection Alerts</span>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="text-gray-500 hover:text-gray-700"
            >
              {soundEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
            </Button>
            {alerts.length > 0 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Mark All Read
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllAlerts}
                  className="text-red-600 hover:text-red-800"
                >
                  Clear All
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
          <span>•</span>
          <span>{filteredAlerts.length} alerts</span>
        </div>
      </CardHeader>
      <CardContent>
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No detection alerts</p>
            <p className="text-sm text-gray-400">All quiet on the security front</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {filteredAlerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`p-3 rounded-lg border ${getAlertColor(alert.type, alert.severity)} ${
                    !alert.is_read ? 'ring-2 ring-blue-200' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {getAlertIcon(alert.type, alert.severity)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-medium text-sm">
                            {alert.type === 'unknown_person' 
                              ? '🚨 Unknown Person Detected' 
                              : `👤 ${alert.person_name} Detected`
                            }
                          </p>
                          {!alert.is_read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-600 mb-2">
                          <div className="flex items-center space-x-1">
                            <Camera className="w-3 h-3" />
                            <span>{alert.camera_name}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatTimestamp(alert.timestamp)}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {(alert.confidence * 100).toFixed(1)}%
                          </Badge>
                        </div>
                        {alert.location && (
                          <div className="flex items-center space-x-1 text-xs text-gray-500 mb-2">
                            <MapPin className="w-3 h-3" />
                            <span>{alert.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 ml-2">
                      {!alert.is_read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(alert.id)}
                          className="text-blue-600 hover:text-blue-800 h-6 w-6 p-0"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAlert(alert.id)}
                        className="text-red-600 hover:text-red-800 h-6 w-6 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DetectionAlerts;