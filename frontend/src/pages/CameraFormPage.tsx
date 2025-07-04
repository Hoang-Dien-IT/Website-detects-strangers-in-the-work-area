import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera as CameraIcon, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import CameraForm from '@/components/cameras/CameraForm';
import { cameraService } from '@/services/camera.service';
import { Camera, CameraCreate, CameraUpdate } from '@/types/camera.types';
import { toast } from 'sonner';

const CameraFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // ✅ Enhanced state management
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [camera, setCamera] = useState<Camera | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  // Determine mode
  const isEdit = Boolean(id);
  const pageTitle = isEdit ? 'Edit Camera' : 'Add New Camera';
  const pageDescription = isEdit 
    ? 'Update camera settings and configuration' 
    : 'Configure your camera for face detection monitoring';

  // ✅ Load camera data for edit mode
  useEffect(() => {
    if (isEdit && id) {
      loadCamera(id);
    }
  }, [id, isEdit]);

  const loadCamera = async (cameraId: string) => {
    try {
      setInitialLoading(true);
      setError(null);
      console.log('🔵 CameraFormPage: Loading camera for edit:', cameraId);
      
      const cameraData = await cameraService.getCamera(cameraId);
      console.log('✅ CameraFormPage: Camera loaded:', cameraData);
      
      setCamera(cameraData);
      
    } catch (error: any) {
      console.error('❌ CameraFormPage: Error loading camera:', error);
      const errorMessage = error.message || 'Failed to load camera data';
      setError(errorMessage);
      toast.error('Failed to load camera', {
        description: errorMessage
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSave = async (formData: CameraCreate | CameraUpdate) => {
    try {
      setLoading(true);
      setSaveStatus('saving');
      setError(null);
      
      console.log('🔵 CameraFormPage: Saving camera data:', { isEdit, formData });
      
      if (isEdit && id) {
        const updatedCamera = await cameraService.updateCamera(id, formData as CameraUpdate);
        console.log('✅ CameraFormPage: Camera updated successfully:', updatedCamera);
        
        toast.success('Camera updated successfully');
        setSaveStatus('success');
        setCamera(updatedCamera);
        
        setTimeout(() => {
          navigate('/app/cameras');
        }, 1500);
      } else {
        const newCamera = await cameraService.createCamera(formData as CameraCreate);
        console.log('✅ CameraFormPage: Camera created successfully:', newCamera);
        
        toast.success('Camera added successfully');
        setSaveStatus('success');
        
        setTimeout(() => {
          navigate('/app/cameras');
        }, 1500);
      }
    } catch (error: any) {
      console.error(`❌ Failed to ${isEdit ? 'update' : 'create'} camera:`, error);
      
      let errorMessage = `Failed to ${isEdit ? 'update' : 'create'} camera`;
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      setError(errorMessage);
      setSaveStatus('error');
      toast.error(`Failed to ${isEdit ? 'update' : 'create'} camera`, {
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/app/cameras');
  };

  const handleGoBack = () => {
    navigate('/app/cameras');
  };

  // ✅ Show loading screen while fetching camera data
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGoBack}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Cameras
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{pageTitle}</h1>
              <p className="text-sm text-gray-600">{pageDescription}</p>
            </div>
          </div>
        </header>

        <div className="flex items-center justify-center py-16">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Loading Camera Details
              </h3>
              <p className="text-sm text-gray-600 text-center">
                Please wait while we fetch the camera information...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGoBack}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cameras
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{pageTitle}</h1>
            <p className="text-sm text-gray-600">{pageDescription}</p>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-6">
        <div className="space-y-6">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Status */}
          {saveStatus === 'success' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Camera {isEdit ? 'updated' : 'created'} successfully! Redirecting...
              </AlertDescription>
            </Alert>
          )}

          {/* Camera Form - ✅ FIX: Pass camera directly, CameraForm now handles the type properly */}
          <CameraForm
            camera={camera}
            onSave={handleSave}
            onCancel={handleCancel}
            loading={loading}
          />

          {/* Debug Info (only in development) */}
          {process.env.NODE_ENV === 'development' && (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4">
                <h4 className="font-medium text-yellow-900 mb-2">Debug Information</h4>
                <div className="text-sm text-yellow-800 space-y-1">
                  <p><strong>Mode:</strong> {isEdit ? 'Edit' : 'Create'}</p>
                  <p><strong>Camera ID:</strong> {id || 'N/A'}</p>
                  <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
                  <p><strong>Save Status:</strong> {saveStatus}</p>
                  <p><strong>Has Camera Data:</strong> {camera ? 'Yes' : 'No'}</p>
                  {camera && (
                    <div className="mt-2 p-2 bg-yellow-100 rounded text-xs">
                      <p><strong>Camera Type:</strong> {camera.camera_type}</p>
                      <p><strong>Camera URL:</strong> {camera.camera_url || 'N/A'}</p>
                      <p><strong>Detection Enabled:</strong> {camera.detection_enabled ? 'Yes' : 'No'}</p>
                    </div>
                  )}
                  <p><strong>Backend Endpoints Used:</strong></p>
                  <div className="ml-4 space-y-1">
                    <p>• GET /api/cameras/{'{id}'} - Load camera for edit</p>
                    <p>• POST /api/cameras - Create new camera</p>
                    <p>• PUT /api/cameras/{'{id}'} - Update camera</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraFormPage;