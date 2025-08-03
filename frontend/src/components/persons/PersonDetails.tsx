import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Image,
  Calendar,
  UserCheck,
  UserX,
  Building,
  Badge as BadgeIcon,
  Phone,
  Mail,
  Shield,
  Upload,
  Eye,
  X,
  Plus,
  AlertTriangle,
  Brain,        // ✅ ADD: Import Brain icon
  Loader2,      // ✅ ADD: Import Loader2 icon
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
import { personService } from '@/services/person.service';
import type { FaceImage } from '@/services/person.service';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import FaceImageUpload from './FaceImageUpload';

// ✅ Updated interface to match backend PersonDetailResponse from #backend
interface PersonDetailResponse {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  face_images: FaceImageResponse[];
  metadata: Record<string, any>;
  face_images_count?: number; // Computed field
}

// ✅ Updated to match backend FaceImageResponse from #backend
interface FaceImageResponse {
  image_url: string;
  uploaded_at: string;
  is_primary?: boolean; // Optional for UI logic
}

const PersonDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [person, setPerson] = useState<PersonDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState(false);
  const [regeneratingEmbeddings, setRegeneratingEmbeddings] = useState(false);

  // ✅ Updated to use backend endpoint GET /persons/{person_id}
  const loadPersonDetails = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      console.log('🔵 PersonDetails: Loading person details for:', id);
      
      // ✅ FIX: Use getPerson method (correct method name)
      const response = await personService.getPerson(id);
      
      // ✅ FIX: Transform response with proper type handling
      const personDetail: PersonDetailResponse = {
        id: response.id,
        name: response.name,
        description: response.description,
        is_active: response.is_active,
        created_at: response.created_at,
        updated_at: response.updated_at || response.created_at,
        metadata: response.metadata || {},
        // ✅ FIX: Proper type annotation and null safety
        face_images: (response.face_images || []).map((img: FaceImage) => ({
          image_url: img.image_url,
          uploaded_at: img.created_at || img.uploaded_at || new Date().toISOString(),
          is_primary: img.is_primary || false
        })),
        face_images_count: response.face_images?.length || response.face_images_count || 0
      };
      
      setPerson(personDetail);
      console.log('✅ PersonDetails: Person loaded:', personDetail);
    } catch (error: any) {
      console.error('❌ PersonDetails: Error loading person details:', error);
      toast.error('Failed to load person details');
      navigate('/persons');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  // Load person details when component mounts or id changes
  useEffect(() => {
    if (id) {
      loadPersonDetails();
    }
  }, [id, loadPersonDetails]);

  const handleEdit = () => {
    navigate(`/persons/${id}/edit`);
  };

  // ✅ Updated to use backend PUT /persons/{person_id} endpoint
  const handleToggleStatus = async () => {
    if (!person || processingAction) return;
    
    try {
      setProcessingAction(true);
      console.log('🔵 PersonDetails: Toggling status for:', person.name);
      
      await personService.updatePerson(id!, { 
        is_active: !person.is_active 
      });
      
      toast.success(`Person ${person.is_active ? 'deactivated' : 'activated'} successfully`);
      await loadPersonDetails(); // Reload to get updated data
    } catch (error: any) {
      console.error('❌ PersonDetails: Error toggling status:', error);
      toast.error('Failed to update person status');
    } finally {
      setProcessingAction(false);
    }
  };

  // ✅ Updated to use backend DELETE /persons/{person_id} endpoint
  const handleDelete = async () => {
    if (!person || processingAction) return;
    
    try {
      setProcessingAction(true);
      console.log('🔵 PersonDetails: Deleting person:', person.name);
      
      await personService.deletePerson(id!);
      
      toast.success('Person deleted successfully');
      navigate('/persons');
    } catch (error: any) {
      console.error('❌ PersonDetails: Error deleting person:', error);
      toast.error('Failed to delete person');
      setProcessingAction(false);
    }
  };

  const handleImageAdded = async () => {
    await loadPersonDetails();
    setShowImageUpload(false);
    toast.success('Face images uploaded successfully! You can now view them below.', {
      duration: 3000
    });
  };

  // ✅ Updated to use backend DELETE /persons/{person_id}/faces/{image_index}
  const handleRemoveImage = async (imageIndex: number) => {
    if (!person || processingAction) return;
    
    try {
      setProcessingAction(true);
      console.log('🔵 PersonDetails: Removing face image at index:', imageIndex);
      
      await personService.removeFaceImage(person.id, imageIndex);
      
      await loadPersonDetails(); // Reload to get updated data
      toast.success('Face image removed successfully');
    } catch (error: any) {
      console.error('❌ PersonDetails: Error removing face image:', error);
      toast.error('Failed to remove image');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRegenerateEmbeddings = async () => {
    if (!person) return;
    
    setRegeneratingEmbeddings(true);
    try {
      const result = await personService.regenerateFaceEmbeddings(person.id);
      
      toast.success('Face embeddings regenerated successfully!', {
        description: `${result.successful_extractions}/${result.total_images} embeddings extracted`
      });
      
      // Reload person data to show updated embeddings count
      await loadPersonDetails();
      
    } catch (error: any) {
      console.error('❌ PersonDetails: Error regenerating embeddings:', error);
      toast.error('Failed to regenerate face embeddings', {
        description: error.message
      });
    } finally {
      setRegeneratingEmbeddings(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAccessLevelColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner />
      </div>
    );
  }

  if (!person) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="text-center py-16">
            <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Person Not Found</h3>
            <p className="text-gray-600 mb-6">The person you're looking for doesn't exist or has been deleted.</p>
            <Button onClick={() => navigate('/persons')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Persons
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* ✅ Enhanced Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/persons')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Persons
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{person.name}</h1>
            <p className="text-gray-600">Person details and face images</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge 
            variant={person.is_active ? "default" : "secondary"}
            className="shadow-sm"
          >
            {person.is_active ? 'Active' : 'Inactive'}
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleToggleStatus}
            disabled={processingAction}
          >
            {person.is_active ? (
              <>
                <UserX className="h-4 w-4 mr-2" />
                Deactivate
              </>
            ) : (
              <>
                <UserCheck className="h-4 w-4 mr-2" />
                Activate
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowDeleteDialog(true)} 
            className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
            disabled={processingAction}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ✅ Enhanced Person Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Basic Info */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <span>Person Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* ✅ Enhanced Avatar */}
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24 ring-4 ring-gray-100">
                  <AvatarImage 
                    src={person.face_images?.[0]?.image_url} 
                    alt={person.name}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-2xl">
                    {getInitials(person.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="font-semibold text-lg">{person.name}</h3>
                  <div className="flex items-center justify-center space-x-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      <Image className="h-3 w-3 mr-1" />
                      {person.face_images_count || 0} images
                    </Badge>
                    {person.is_active && (
                      <Badge className="text-xs bg-green-100 text-green-800 border-green-300">
                        Active
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              {person.description && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Description</label>
                  <p className="text-gray-900 mt-1 p-3 bg-gray-50 rounded-lg border">
                    {person.description}
                  </p>
                </div>
              )}

              {/* ✅ Enhanced Timestamps */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Created</label>
                  <div className="flex items-center text-sm text-gray-900 mt-1 p-2 bg-gray-50 rounded border">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    {formatDate(person.created_at)}
                  </div>
                </div>
                {person.updated_at && person.updated_at !== person.created_at && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Last Updated</label>
                    <div className="flex items-center text-sm text-gray-900 mt-1 p-2 bg-gray-50 rounded border">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      {formatDate(person.updated_at)}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ✅ Enhanced Metadata */}
          {person.metadata && Object.keys(person.metadata).length > 0 && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BadgeIcon className="h-5 w-5 text-purple-600" />
                  <span>Additional Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {person.metadata.department && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Department</label>
                    <div className="flex items-center text-sm text-gray-900 mt-1 p-2 bg-gray-50 rounded border">
                      <Building className="h-4 w-4 mr-2 text-gray-500" />
                      {person.metadata.department}
                    </div>
                  </div>
                )}

                {person.metadata.employee_id && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Employee ID</label>
                    <div className="flex items-center text-sm text-gray-900 mt-1 p-2 bg-gray-50 rounded border">
                      <BadgeIcon className="h-4 w-4 mr-2 text-gray-500" />
                      {person.metadata.employee_id}
                    </div>
                  </div>
                )}

                {person.metadata.position && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Position</label>
                    <p className="text-gray-900 mt-1 p-2 bg-gray-50 rounded border">
                      {person.metadata.position}
                    </p>
                  </div>
                )}

                {person.metadata.access_level && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Access Level</label>
                    <div className="mt-1">
                      <Badge className={`text-xs ${getAccessLevelColor(person.metadata.access_level)}`}>
                        <Shield className="h-3 w-3 mr-1" />
                        {person.metadata.access_level.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                )}

                {person.metadata.email && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <div className="flex items-center text-sm mt-1 p-2 bg-gray-50 rounded border">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      <a 
                        href={`mailto:${person.metadata.email}`} 
                        className="text-blue-600 hover:underline"
                      >
                        {person.metadata.email}
                      </a>
                    </div>
                  </div>
                )}

                {person.metadata.phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phone</label>
                    <div className="flex items-center text-sm mt-1 p-2 bg-gray-50 rounded border">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      <a 
                        href={`tel:${person.metadata.phone}`} 
                        className="text-blue-600 hover:underline"
                      >
                        {person.metadata.phone}
                      </a>
                    </div>
                  </div>
                )}

                {/* ✅ Show other metadata fields */}
                {Object.entries(person.metadata).map(([key, value]) => {
                  if (!['department', 'employee_id', 'position', 'access_level', 'email', 'phone'].includes(key)) {
                    return (
                      <div key={key}>
                        <label className="text-sm font-medium text-gray-600 capitalize">
                          {key.replace(/_/g, ' ')}
                        </label>
                        <p className="text-gray-900 mt-1 p-2 bg-gray-50 rounded border">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </p>
                      </div>
                    );
                  }
                  return null;
                })}
              </CardContent>
            </Card>
          )}

        </div>

        {/* ✅ Enhanced Face Images */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Image className="h-5 w-5 text-green-600" />
                  <span>Face Images ({person.face_images_count || 0})</span>
                </CardTitle>
                <Button 
                  size="sm" 
                  onClick={() => setShowImageUpload(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Images
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {person.face_images && person.face_images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {person.face_images.map((image, index) => (
                    <div 
                      key={index} 
                      className="relative group cursor-pointer"
                      onClick={() => setSelectedImage(image.image_url)}
                    >
                      <img
                        src={image.image_url}
                        alt={`${person.name} ${index + 1}`}
                        className="w-full aspect-square object-cover rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors shadow-sm"
                        onError={(e) => {
                          // Fallback image
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Y2EzYWYiIGR5PSIuM2VtIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JbWFnZSBOb3QgRm91bmQ8L3RleHQ+PC9zdmc+';
                        }}
                      />
                      
                      {/* ✅ Enhanced Upload date display */}
                      <div className="absolute bottom-2 left-2 right-2">
                        <Badge className="text-xs bg-black bg-opacity-70 text-white border-none">
                          {new Date(image.uploaded_at).toLocaleDateString()}
                        </Badge>
                      </div>
                      
                      {/* ✅ Hover overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg flex items-center justify-center">
                        <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      
                      {/* ✅ Enhanced delete button */}
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        disabled={processingAction}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(index);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Face Images</h3>
                  <p className="text-gray-600 mb-6">
                    Add face images to enable recognition for this person. You can upload multiple images for better accuracy.
                  </p>
                  <Button 
                    onClick={() => setShowImageUpload(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Add First Image
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ✅ ADD: Face Recognition Card */}
          {person && (person.face_images_count || 0) > 0 && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  <span>Face Recognition</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">Face Embeddings</h4>
                    <p className="text-sm text-gray-600">
                      Face embeddings are required for stranger detection and recognition.
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-sm">
                        <span className="font-medium text-blue-600">{person.face_images_count}</span> images uploaded
                      </span>
                      <Badge variant="outline" className="text-xs">
                        <Brain className="h-3 w-3 mr-1" />
                        Embeddings: Processing required
                      </Badge>
                    </div>
                  </div>
                  <Button 
                    onClick={handleRegenerateEmbeddings}
                    disabled={regeneratingEmbeddings}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {regeneratingEmbeddings ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 w-4 mr-2" />
                        Generate Embeddings
                      </>
                    )}
                  </Button>
                </div>
                
                {/* ✅ Info about face recognition */}
                <div className="text-sm text-gray-600 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-yellow-800">Face Recognition Setup</p>
                      <p className="mt-1">
                        Click "Generate Embeddings" to process face images for recognition. 
                        This enables the system to identify this person in camera streams and detect strangers.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </div>

      {/* ✅ Enhanced Image Upload Dialog */}
      <Dialog open={showImageUpload} onOpenChange={setShowImageUpload}>
        <DialogContent className="max-w-[95vw] max-h-[90vh] w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl overflow-hidden">
          <DialogHeader>
            <DialogTitle>Add Face Images</DialogTitle>
            <DialogDescription>
              Upload new face images for {person.name}. Make sure the images clearly show the person's face.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[70vh]">
            <FaceImageUpload
              personId={person.id}
              personName={person.name}
              existingImages={person.face_images}
              onComplete={handleImageAdded}
              onImageAdded={handleImageAdded}
              onImageRemoved={() => loadPersonDetails()}
              allowSkip={false}
              maxImages={10} // ✅ Backend limit from #backend
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* ✅ Enhanced Image Preview Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Face Image Preview</DialogTitle>
            <DialogDescription>
              Full size view of the face image
            </DialogDescription>
          </DialogHeader>
          {selectedImage && (
            <div className="flex justify-center overflow-auto max-h-[70vh]">
              <img
                src={selectedImage}
                alt="Face preview"
                className="max-w-full max-h-full object-contain rounded-lg shadow-lg border"
                onError={(e) => {
                  toast.error('Failed to load image');
                  setSelectedImage(null);
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ✅ Enhanced Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span>Delete Person</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left space-y-2">
              <p>
                Are you sure you want to delete <strong>"{person.name}"</strong>?
              </p>
              <p className="text-red-600 font-medium">
                This action cannot be undone and will:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Remove all associated face images ({person.face_images_count || 0} images)</li>
                <li>Delete all detection history for this person</li>
                <li>Remove all metadata and associated data</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processingAction}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-red-600 hover:bg-red-700"
              disabled={processingAction}
            >
              {processingAction ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete Person'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PersonDetails;