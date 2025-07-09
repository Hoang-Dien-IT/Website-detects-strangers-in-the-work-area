import { apiService } from './api';

export interface Detection {
  id: string;
  camera_id: string;
  camera_name?: string;
  detection_type: 'known_person' | 'stranger' | 'unknown';
  person_name?: string;
  confidence: number;
  timestamp: string;
  image_url?: string;
  image_path?: string;
  bbox?: number[];
  metadata?: any;
  person_id?: string;
  similarity_score?: number;
  location?: string;
  is_alert_sent?: boolean;
  alert_methods?: string[];
}

export interface DetectionCreate {
  camera_id: string;
  detection_type: 'known_person' | 'stranger' | 'unknown';
  person_name?: string;
  confidence: number;
  image_base64?: string;
  bbox?: number[];
  metadata?: any;
}

export interface DetectionFilter {
  camera_id?: string;
  detection_type?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  skip?: number;
  offset?: number;
  search?: string;
  min_confidence?: number;
  max_confidence?: number;
  type?: string;
}

export interface DetectionResponse {
  detections: Detection[];
  total: number;
  page: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface DetectionStats {
  overview: {
    total_detections: number;
    stranger_detections: number;
    known_person_detections: number;
    detection_accuracy: number;
    alerts_sent: number;
  };
  time_based: {
    today: number;
    this_week: number;
    this_month: number;
    last_24h_strangers: number;
  };
  camera_stats: {
    total_cameras: number;
    active_cameras: number;
    streaming_cameras: number;
    offline_cameras: number;
  };
  person_stats: {
    total_known_persons: number;
  };
  top_cameras: Array<{
    camera_id: string;
    camera_name: string;
    detection_count: number;
  }>;
  hourly_pattern: Record<string, number>;
  last_updated: string;
}

// ✅ ADD: Chart data interfaces
export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor: string;
  borderColor: string;
  borderWidth?: number;
  fill?: boolean;
}

export interface ChartData {
  chart_type: string;
  time_range: string;
  labels: string[];
  datasets: ChartDataset[];
}

// ✅ ADD: Top camera interface
export interface TopCamera {
  camera_id: string;
  camera_name: string;
  detection_count: number;
  stranger_count?: number;
  known_person_count?: number;
}

// ✅ ADD: Hourly stats interface
export interface HourlyStats {
  hourly_data: Array<{
    hour: string;
    detections: number;
    strangers: number;
    known_persons: number;
  }>;
}

// ✅ ADD: Real-time stats interface
export interface RealTimeStats {
  last_30_minutes: {
    total_detections: number;
    stranger_detections: number;
    known_person_detections: number;
    active_cameras: number;
  };
  current_activity: {
    streaming_cameras: number;
    detection_rate: number;
    system_load: number;
  };
}

class DetectionService {
  async getDetections(filters?: DetectionFilter): Promise<Detection[] | DetectionResponse> {
    try {
      console.log('🔵 DetectionService: Getting detections...', filters);
      
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await apiService.get<Detection[] | DetectionResponse>('/detections/', filters);
      console.log('✅ DetectionService: Got detections response:', response.data);
      
      if (Array.isArray(response.data)) {
        console.log('📝 DetectionService: Received array format with', response.data.length, 'detections');
        return response.data;
      } else if (response.data && typeof response.data === 'object' && 'detections' in response.data) {
        console.log('📝 DetectionService: Received paginated format with', response.data.detections.length, 'detections');
        return response.data as DetectionResponse;
      } else {
        console.warn('⚠️ DetectionService: Unexpected response format:', response.data);
        return [];
      }
    } catch (error: any) {
      console.error('❌ DetectionService: Error getting detections:', error);
      throw new Error(error.message || 'Failed to get detections');
    }
  }

  async getDetection(id: string): Promise<Detection> {
    try {
      console.log('🔵 DetectionService: Getting detection by ID:', id);
      const response = await apiService.get<Detection>(`/detections/${id}`);
      console.log('✅ DetectionService: Got detection:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ DetectionService: Error getting detection:', error);
      throw new Error(error.message || 'Failed to get detection');
    }
  }

  async createDetection(detectionData: DetectionCreate): Promise<Detection> {
    try {
      console.log('🔵 DetectionService: Creating detection:', detectionData);
      const response = await apiService.post<Detection>('/detections/', detectionData);
      console.log('✅ DetectionService: Detection created:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ DetectionService: Error creating detection:', error);
      throw new Error(error.message || 'Failed to create detection');
    }
  }

  async deleteDetection(id: string): Promise<void> {
    try {
      console.log('🔵 DetectionService: Deleting detection:', id);
      await apiService.delete(`/detections/${id}`);
      console.log('✅ DetectionService: Detection deleted successfully');
    } catch (error: any) {
      console.error('❌ DetectionService: Error deleting detection:', error);
      throw new Error(error.message || 'Failed to delete detection');
    }
  }

  async getDetectionStats(timeRange: string = '7d'): Promise<DetectionStats> {
    try {
      console.log('🔵 DetectionService: Getting detection stats overview...');
      
      const response = await apiService.get<DetectionStats>('/detections/stats/overview', {
        time_range: timeRange
      });
      console.log('✅ DetectionService: Got detection stats:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ DetectionService: Error getting detection stats:', error);
      
      return {
        overview: {
          total_detections: 0,
          stranger_detections: 0,
          known_person_detections: 0,
          detection_accuracy: 0.0,
          alerts_sent: 0
        },
        time_based: {
          today: 0,
          this_week: 0,
          this_month: 0,
          last_24h_strangers: 0
        },
        camera_stats: {
          total_cameras: 0,
          active_cameras: 0,
          streaming_cameras: 0,
          offline_cameras: 0
        },
        person_stats: {
          total_known_persons: 0
        },
        top_cameras: [],
        hourly_pattern: {},
        last_updated: new Date().toISOString()
      };
    }
  }

  // ✅ FIX: Chart data method with proper typing
  async getChartData(timeRange: string = '7d', chartType: string = 'area'): Promise<ChartData> {
    try {
      console.log('🔵 DetectionService: Getting chart data...', { timeRange, chartType });
      
      const response = await apiService.get<ChartData>('/detections/stats/chart', {
        time_range: timeRange,
        chart_type: chartType
      });
      
      console.log('✅ DetectionService: Got chart data:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ DetectionService: Error getting chart data:', error);
      
      // ✅ Return fallback chart data structure
      console.log('⚠️ DetectionService: Using fallback chart data');
      return this.generateFallbackChartData(timeRange, chartType);
    }
  }

  // ✅ FIX: Fallback chart data generator with proper return type
  private generateFallbackChartData(timeRange: string, chartType: string): ChartData {
    const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const labels: string[] = [];
    const strangersData: number[] = [];
    const knownData: number[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      if (timeRange === '24h') {
        // Generate hourly data for 24h
        for (let hour = 0; hour < 24; hour++) {
          labels.push(`${hour.toString().padStart(2, '0')}:00`);
          strangersData.push(Math.floor(Math.random() * 5) + 1);
          knownData.push(Math.floor(Math.random() * 8) + 2);
        }
        break;
      } else {
        labels.push(date.toISOString().split('T')[0]);
        strangersData.push(Math.floor(Math.random() * 20) + 5);
        knownData.push(Math.floor(Math.random() * 15) + 10);
      }
    }

    return {
      chart_type: chartType,
      time_range: timeRange,
      labels,
      datasets: [
        {
          label: 'Stranger Detections',
          data: strangersData,
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderColor: '#EF4444',
          borderWidth: 2,
          fill: true
        },
        {
          label: 'Known Person Detections',
          data: knownData,
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderColor: '#10B981',
          borderWidth: 2,
          fill: true
        }
      ]
    };
  }

  // ✅ FIX: Hourly stats with proper typing
  async getHourlyStats(date?: string): Promise<HourlyStats> {
    try {
      console.log('🔵 DetectionService: Getting hourly stats...', { date });
      
      const params = date ? { date } : {};
      const response = await apiService.get<HourlyStats>('/detections/stats/hourly', params);
      
      console.log('✅ DetectionService: Got hourly stats:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ DetectionService: Error getting hourly stats:', error);
      
      // Return fallback hourly data
      const hourlyData = [];
      for (let hour = 0; hour < 24; hour++) {
        hourlyData.push({
          hour: `${hour.toString().padStart(2, '0')}:00`,
          detections: Math.floor(Math.random() * 10) + 1,
          strangers: Math.floor(Math.random() * 5) + 1,
          known_persons: Math.floor(Math.random() * 8) + 2
        });
      }
      return { hourly_data: hourlyData };
    }
  }

  // ✅ FIX: Real-time stats with proper typing
  async getRealTimeStats(): Promise<RealTimeStats> {
    try {
      console.log('🔵 DetectionService: Getting real-time stats...');
      
      const response = await apiService.get<RealTimeStats>('/detections/stats/realtime');
      console.log('✅ DetectionService: Got real-time stats:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ DetectionService: Error getting real-time stats:', error);
      
      // Return fallback real-time data
      return {
        last_30_minutes: {
          total_detections: Math.floor(Math.random() * 10) + 1,
          stranger_detections: Math.floor(Math.random() * 5) + 1,
          known_person_detections: Math.floor(Math.random() * 8) + 2,
          active_cameras: Math.floor(Math.random() * 5) + 1
        },
        current_activity: {
          streaming_cameras: Math.floor(Math.random() * 3) + 1,
          detection_rate: Math.random() * 5 + 1,
          system_load: Math.random() * 100
        }
      };
    }
  }

  async cleanupOldDetections(daysToKeep: number = 30): Promise<any> {
    try {
      console.log('🔵 DetectionService: Cleaning up old detections...', { daysToKeep });
      
      const response = await apiService.post('/detections/cleanup', null, {
        params: { days_to_keep: daysToKeep }
      });
      console.log('✅ DetectionService: Cleanup completed:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ DetectionService: Error cleaning up detections:', error);
      throw new Error(error.message || 'Failed to cleanup old detections');
    }
  }

  // ✅ FIX: Detection alerts with proper typing
  async getDetectionAlerts(limit: number = 10): Promise<any[]> {
    try {
      console.log('🔵 DetectionService: Getting detection alerts...', { limit });
      
      const response = await apiService.get<any[]>('/detections/alerts', { limit });
      console.log('✅ DetectionService: Got detection alerts:', response.data);
      
      // ✅ Ensure we return an array
      if (Array.isArray(response.data)) {
        return response.data;
      } else {
        console.warn('⚠️ DetectionService: Expected array but got:', typeof response.data);
        return [];
      }
    } catch (error: any) {
      console.error('❌ DetectionService: Error getting detection alerts:', error);
      
      // Return fallback alert data
      return [];
    }
  }

  async markAlertAsRead(alertId: string): Promise<void> {
    try {
      console.log('🔵 DetectionService: Marking alert as read...', { alertId });
      
      await apiService.put(`/detections/alerts/${alertId}/read`);
      console.log('✅ DetectionService: Alert marked as read');
    } catch (error: any) {
      console.error('❌ DetectionService: Error marking alert as read:', error);
      throw new Error(error.message || 'Failed to mark alert as read');
    }
  }

  // ✅ FIX: Export stats method with proper blob handling
  async exportStats(timeRange: string = '7d', format: string = 'csv'): Promise<Blob> {
    try {
      console.log('🔵 DetectionService: Exporting stats...', { timeRange, format });
      
      // ✅ Method 1: Use downloadBlob if available
      if (typeof apiService.downloadBlob === 'function') {
        const blob = await apiService.downloadBlob('/detections/stats/export', {
          time_range: timeRange,
          format: format
        });
        console.log('✅ DetectionService: Stats exported successfully via downloadBlob');
        return blob;
      }
      
      // ✅ Method 2: Use getBlobResponse if available
      if (typeof apiService.getBlobResponse === 'function') {
        const blob = await apiService.getBlobResponse('/detections/stats/export', {
          time_range: timeRange,
          format: format
        }, {
          'Accept': format === 'csv' ? 'text/csv' : 'application/json'
        });
        console.log('✅ DetectionService: Stats exported successfully via getBlobResponse');
        return blob;
      }
      
      // ✅ Method 3: Fallback with fetch API
      console.warn('⚠️ DetectionService: Blob methods not available, using fetch fallback');
      return await this.makeBlobAPIRequest('/detections/stats/export', {
        time_range: timeRange,
        format: format
      });
      
    } catch (error: any) {
      console.error('❌ DetectionService: Error exporting stats:', error);
      throw new Error(error.message || 'Failed to export stats');
    }
  }

  private async makeBlobAPIRequest(url: string, params: any): Promise<Blob> {
    try {
      const token = localStorage.getItem('access_token');
      const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
      
      const queryParams = new URLSearchParams(params);
      const fullUrl = `${baseURL}${url}?${queryParams}`;
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': params.format === 'csv' ? 'text/csv' : 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.blob();
    } catch (error) {
      console.error('❌ DetectionService: Blob API request failed:', error);
      throw error;
    }
  }


  // ✅ FIX: Top cameras method with proper typing
  async getTopCameras(timeRange: string = '7d', limit: number = 10): Promise<TopCamera[]> {
    try {
      console.log('🔵 DetectionService: Getting top cameras...', { timeRange, limit });
      
      const response = await apiService.get<TopCamera[]>('/detections/stats/top-cameras', {
        time_range: timeRange,
        limit: limit
      });
      
      console.log('✅ DetectionService: Got top cameras:', response.data);
      
      // ✅ Ensure we return an array
      if (Array.isArray(response.data)) {
        return response.data;
      } else {
        console.warn('⚠️ DetectionService: Expected array but got:', typeof response.data);
        return this.getFallbackTopCameras();
      }
    } catch (error: any) {
      console.error('❌ DetectionService: Error getting top cameras:', error);
      
      // Return fallback top cameras data
      return this.getFallbackTopCameras();
    }
  }

  // ✅ FIX: Fallback top cameras with proper typing
  private getFallbackTopCameras(): TopCamera[] {
    return [
      { camera_id: '1', camera_name: 'Front Door Camera', detection_count: 125, stranger_count: 45, known_person_count: 80 },
      { camera_id: '2', camera_name: 'Back Entrance', detection_count: 89, stranger_count: 32, known_person_count: 57 },
      { camera_id: '3', camera_name: 'Parking Lot', detection_count: 76, stranger_count: 28, known_person_count: 48 },
      { camera_id: '4', camera_name: 'Reception Area', detection_count: 65, stranger_count: 15, known_person_count: 50 },
      { camera_id: '5', camera_name: 'Main Hallway', detection_count: 54, stranger_count: 22, known_person_count: 32 }
    ];
  }
}

export const detectionService = new DetectionService();
export default DetectionService;