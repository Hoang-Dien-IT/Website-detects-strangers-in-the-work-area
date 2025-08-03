import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cameraService } from '@/services/camera.service';
import { Camera as CameraType } from '@/types/camera.types';
import { toast } from 'sonner';

interface CameraTestProps {
  cameras: CameraType[];
}

export const CameraTest: React.FC<CameraTestProps> = ({ cameras }) => {
  const [selectedCamera, setSelectedCamera] = useState<CameraType | null>(null);
  const [currentFrame, setCurrentFrame] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  const testCamera = async (camera: CameraType) => {
    console.log('🧪 Testing camera:', camera.name, camera.id);
    setIsLoading(true);
    setSelectedCamera(camera);
    
    try {
      // Test single frame capture
      const result = await cameraService.captureFrame(camera.id);
      console.log('✅ Frame captured:', result);
      
      if (result.image_data) {
        const imageUrl = `data:image/jpeg;base64,${result.image_data}`;
        console.log('✅ Image URL created:', imageUrl.substring(0, 50) + '...');
        
        setCurrentFrame(imageUrl);
        toast.success('Camera test successful!');
      } else {
        throw new Error('No image data received');
      }
      
    } catch (error: any) {
      console.error('❌ Camera test failed:', error);
      toast.error('Camera test failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Camera Test</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Camera Selection */}
          <div>
            <h3 className="font-medium mb-2">Select Camera to Test:</h3>
            <div className="grid gap-2">
              {cameras.map((camera) => (
                <Button
                  key={camera.id}
                  onClick={() => testCamera(camera)}
                  disabled={isLoading}
                  variant={selectedCamera?.id === camera.id ? "default" : "outline"}
                  className="justify-start"
                >
                  {camera.name} ({camera.camera_type})
                  {isLoading && selectedCamera?.id === camera.id && " - Testing..."}
                </Button>
              ))}
            </div>
          </div>

          {/* Image Display */}
          {currentFrame && (
            <div>
              <h3 className="font-medium mb-2">Captured Frame:</h3>
              <div className="border rounded-lg overflow-hidden">
                <img
                  ref={imageRef}
                  src={currentFrame}
                  alt="Camera capture"
                  className="w-full h-auto"
                  onLoad={() => console.log('✅ Image loaded successfully')}
                  onError={(e) => console.error('❌ Image load error:', e)}
                />
              </div>
            </div>
          )}

          {/* Debug Info */}
          <div className="text-sm text-gray-600">
            <p>Selected Camera: {selectedCamera?.name || 'None'}</p>
            <p>Frame Available: {currentFrame ? 'Yes' : 'No'}</p>
            <p>Frame Length: {currentFrame.length} characters</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
