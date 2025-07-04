import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Upload,
  X,
  Camera,
  Check,
  AlertTriangle,
  FileImage,
  Plus,
  Trash2,
  Eye,
  RefreshCw
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { personService } from '@/services/person.service';
import { toast } from 'sonner';

interface FaceImageUploadProps {
  personId: string;
  personName: string;
  existingImages?: FaceImage[];
  onComplete?: () => void;
  onImageAdded?: (image: FaceImage) => void;
  onImageRemoved?: (imageIndex: number) => void;
  allowSkip?: boolean;
  maxImages?: number;
}

interface FaceImage {
  id?: string;
  image_url: string;
  uploaded_at: string;
  is_primary?: boolean;
}

interface UploadState {
  file: File;
  preview: string;
  uploading: boolean;
  uploaded: boolean;
  error?: string;
  progress: number;
}

const FaceImageUpload: React.FC<FaceImageUploadProps> = ({
  personId,
  personName,
  existingImages = [],
  onComplete,
  onImageAdded,
  onImageRemoved,
  allowSkip = false,
  maxImages = 10
}) => {
  const [uploads, setUploads] = useState<UploadState[]>([]);
  const [validating, setValidating] = useState(false);
  const [totalProgress, setTotalProgress] = useState(0);


  const onDrop = useCallback((acceptedFiles: File[]) => {
    const totalImages = existingImages.length + uploads.length + acceptedFiles.length;
    
    if (totalImages > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed per person`);
      return;
    }

    const newUploads = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      uploading: false,
      uploaded: false,
      progress: 0
    }));

    setUploads(prev => [...prev, ...newUploads]);
  }, [existingImages.length, uploads.length, maxImages]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp']
    },
    multiple: true,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const uploadImage = async (index: number) => {
    const upload = uploads[index];
    if (!upload || upload.uploading || upload.uploaded) return;
  
    try {
      setUploads(prev => prev.map((u, i) => 
        i === index ? { ...u, uploading: true, progress: 0 } : u
      ));
  
      // Convert to base64
      const base64 = await convertToBase64(upload.file);
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploads(prev => prev.map((u, i) => 
          i === index ? { ...u, progress: Math.min(u.progress + 10, 90) } : u
        ));
      }, 100);
  
      // ✅ Fix: Pass the base64 string directly, not wrapped in an object
      await personService.addFaceImage(personId, base64);
  
      clearInterval(progressInterval);
  
      setUploads(prev => prev.map((u, i) => 
        i === index ? { 
          ...u, 
          uploading: false, 
          uploaded: true, 
          progress: 100,
          error: undefined
        } : u
      ));
  
      onImageAdded?.({
        image_url: base64,
        uploaded_at: new Date().toISOString(),
        is_primary: existingImages.length === 0 && index === 0
      });
  
      toast.success('Face image uploaded successfully');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      setUploads(prev => prev.map((u, i) => 
        i === index ? { 
          ...u, 
          uploading: false, 
          uploaded: false, 
          progress: 0,
          error: error.response?.data?.detail || 'Upload failed'
        } : u
      ));
      toast.error('Failed to upload image');
    }
  };

  const uploadAllImages = async () => {
    const pendingUploads = uploads
      .map((upload, index) => ({ upload, index }))
      .filter(({ upload }) => !upload.uploaded && !upload.uploading);

    if (pendingUploads.length === 0) {
      onComplete?.();
      return;
    }

    // Upload all pending images
    for (const { index } of pendingUploads) {
      await uploadImage(index);
    }

    // Update total progress
    updateTotalProgress();
  };

  const updateTotalProgress = () => {
    if (uploads.length === 0) {
      setTotalProgress(0);
      return;
    }

    const totalProgress = uploads.reduce((sum, upload) => sum + upload.progress, 0);
    setTotalProgress(totalProgress / uploads.length);
  };

  const removeUpload = (index: number) => {
    const upload = uploads[index];
    if (upload.preview) {
      URL.revokeObjectURL(upload.preview);
    }
    setUploads(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (imageIndex: number) => {
    try {
      await personService.removeFaceImage(personId, imageIndex);
      onImageRemoved?.(imageIndex);
      toast.success('Face image removed successfully');
    } catch (error) {
      console.error('Error removing image:', error);
      toast.error('Failed to remove image');
    }
  };

  const validateImages = async () => {
    try {
      setValidating(true);
      await personService.validateFaceImages(personId);
      toast.success('Face images validated successfully');
    } catch (error: any) {
      console.error('Error validating images:', error);
      toast.error(error.response?.data?.detail || 'Validation failed');
    } finally {
      setValidating(false);
    }
  };

  const hasUploaded = uploads.some(u => u.uploaded);
  const hasUploading = uploads.some(u => u.uploading);
  const allUploaded = uploads.length > 0 && uploads.every(u => u.uploaded);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900">Add Face Images</h3>
        <p className="text-gray-600 mt-1">
          Upload clear photos of {personName} for accurate face recognition
        </p>
      </div>

      {/* Guidelines */}
      <Alert>
        <Camera className="h-4 w-4" />
        <AlertDescription>
          <strong>Photo Guidelines:</strong>
          <ul className="mt-2 space-y-1 text-sm">
            <li>• Use clear, well-lit photos with the face clearly visible</li>
            <li>• Include different angles and expressions for better accuracy</li>
            <li>• Avoid sunglasses, masks, or heavy shadows</li>
            <li>• Supported formats: JPEG, PNG, GIF, BMP, WebP (max 10MB each)</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Existing Images */}
      {existingImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              Existing Images ({existingImages.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {existingImages.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image.image_url}
                    alt={`${personName} ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border"
                  />
                  {image.is_primary && (
                    <Badge className="absolute top-1 left-1 text-xs bg-green-600">
                      Primary
                    </Badge>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeExistingImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Area */}
      <Card>
        <CardContent className="pt-6">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
              }
            `}
          >
            <input {...getInputProps()} />
            <FileImage className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              {isDragActive ? 'Drop images here' : 'Upload Face Images'}
            </p>
            <p className="text-gray-600 mb-4">
              Drag and drop images here, or click to select files
            </p>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Select Images
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upload Queue */}
      {uploads.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm">
                Upload Queue ({uploads.length})
              </CardTitle>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={uploadAllImages}
                  disabled={hasUploading || allUploaded}
                >
                  {hasUploading ? (
                    <>
                      <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : allUploaded ? (
                    <>
                      <Check className="h-3 w-3 mr-2" />
                      All Uploaded
                    </>
                  ) : (
                    <>
                      <Upload className="h-3 w-3 mr-2" />
                      Upload All
                    </>
                  )}
                </Button>
              </div>
            </div>
            {hasUploading && (
              <div className="mt-2">
                <Progress value={totalProgress} className="h-2" />
                <p className="text-xs text-gray-600 mt-1">
                  Overall progress: {Math.round(totalProgress)}%
                </p>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploads.map((upload, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg">
                  <img
                    src={upload.preview}
                    alt={`Upload ${index + 1}`}
                    className="w-16 h-16 object-cover rounded"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{upload.file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(upload.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    
                    {upload.uploading && (
                      <div className="mt-2">
                        <Progress value={upload.progress} className="h-1" />
                        <p className="text-xs text-gray-500 mt-1">
                          {upload.progress}% uploaded
                        </p>
                      </div>
                    )}
                    
                    {upload.error && (
                      <p className="text-xs text-red-500 mt-1 flex items-center">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {upload.error}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {upload.uploaded ? (
                      <Badge variant="default" className="bg-green-600">
                        <Check className="h-3 w-3 mr-1" />
                        Uploaded
                      </Badge>
                    ) : upload.uploading ? (
                      <Badge variant="secondary">
                        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                        Uploading
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => uploadImage(index)}
                        disabled={upload.uploading}
                      >
                        <Upload className="h-3 w-3 mr-1" />
                        Upload
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeUpload(index)}
                      disabled={upload.uploading}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          {(existingImages.length > 0 || hasUploaded) && (
            <Button
              variant="outline"
              onClick={validateImages}
              disabled={validating}
            >
              {validating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Validate Images
                </>
              )}
            </Button>
          )}
        </div>

        <div className="flex space-x-3">
          {allowSkip && (
            <Button variant="outline" onClick={onComplete}>
              Skip for Now
            </Button>
          )}
          
          {(hasUploaded || existingImages.length > 0) && (
            <Button onClick={onComplete}>
              <Check className="h-4 w-4 mr-2" />
              Complete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FaceImageUpload;