import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  User,
  Save,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Image,
  Building,
  Phone,
  Mail,
  BadgeCheck
} from 'lucide-react';
import { personService } from '@/services/person.service';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import FaceImageUpload from './FaceImageUpload';

interface PersonFormData {
  name: string;
  description: string;
  metadata: {
    department?: string;
    employee_id?: string;
    phone?: string;
    email?: string;
    position?: string;
    access_level?: string;
  };
}

interface PersonFormProps {
  mode?: 'create' | 'edit';
  onSuccess?: (person: any) => void;
  onCancel?: () => void;
}

const PersonForm: React.FC<PersonFormProps> = ({ 
  mode = 'create', 
  onSuccess, 
  onCancel 
}) => {
  const navigate = useNavigate();
  const { id: personId } = useParams();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [person, setPerson] = useState<any>(null);
  const [showFaceUpload, setShowFaceUpload] = useState(false);
  
  const [formData, setFormData] = useState<PersonFormData>({
    name: '',
    description: '',
    metadata: {}
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === 'edit' && personId) {
      loadPerson();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, personId]);

  const loadPerson = async () => {
    if (!personId) return;
    
    try {
      setLoading(true);
      // ✅ Fix: Use getPersonDetail for full person data
      const response = await personService.getPersonDetail(personId);
      setPerson(response);
      setFormData({
        name: response.name || '',
        description: response.description || '',
        metadata: response.metadata || {}
      });
    } catch (error) {
      console.error('Error loading person:', error);
      toast.error('Failed to load person details');
      navigate('/persons');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name must be less than 100 characters';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    if (formData.metadata.email && !isValidEmail(formData.metadata.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.metadata.phone && !isValidPhone(formData.metadata.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhone = (phone: string): boolean => {
    const phoneRegex = /^[+]?[\d\s\-()]{8,}$/;
    return phoneRegex.test(phone);
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('metadata.')) {
      const metadataField = field.replace('metadata.', '');
      setFormData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          [metadataField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    try {
      setSubmitting(true);
      
      const submitData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        metadata: Object.keys(formData.metadata).length > 0 ? formData.metadata : undefined
      };

      let result;
      if (mode === 'create') {
        result = await personService.createPerson(submitData);
        toast.success('Person created successfully');
      } else {
        result = await personService.updatePerson(personId!, submitData);
        toast.success('Person updated successfully');
      }

      if (mode === 'create') {
        // For new person, show face upload option
        setShowFaceUpload(true);
        setPerson(result);
      } else {
        onSuccess?.(result);
        if (!onSuccess) {
          navigate('/persons');
        }
      }
    } catch (error: any) {
      console.error('Error saving person:', error);
      toast.error(error.response?.data?.detail || 'Failed to save person');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate('/persons');
    }
  };

  const handleFaceUploadComplete = () => {
    setShowFaceUpload(false);
    toast.success('Person created successfully with face images');
    navigate('/persons');
  };

  const handleSkipFaceUpload = () => {
    setShowFaceUpload(false);
    toast.success('Person created successfully');
    navigate('/persons');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  // Show face upload dialog for new person
  if (showFaceUpload && person) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Image className="h-5 w-5" />
              <span>Add Face Images for {person.name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Person created successfully! You can now add face images to enable recognition.
                </AlertDescription>
              </Alert>

              <FaceImageUpload
                personId={person.id}
                personName={person.name}
                onComplete={handleFaceUploadComplete}
                allowSkip={true}
              />

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={handleSkipFaceUpload}>
                  Skip for Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {mode === 'create' ? 'Add New Person' : `Edit ${person?.name || 'Person'}`}
              </h1>
              <p className="text-gray-600">
                {mode === 'create' 
                  ? 'Create a new person profile for face recognition'
                  : 'Update person information and settings'
                }
              </p>
            </div>
          </div>
          
          {mode === 'edit' && person && (
            <Badge variant={person.is_active ? "default" : "secondary"}>
              {person.is_active ? 'Active' : 'Inactive'}
            </Badge>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Basic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter person's full name"
                  className={errors.name ? 'border-red-500' : ''}
                  disabled={submitting}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Optional description or notes about this person"
                  rows={3}
                  className={errors.description ? 'border-red-500' : ''}
                  disabled={submitting}
                />
                {errors.description && (
                  <p className="text-sm text-red-500 flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {errors.description}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  {formData.description.length}/500 characters
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BadgeCheck className="h-5 w-5" />
                <span>Additional Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Department */}
                <div className="space-y-2">
                  <Label htmlFor="department">
                    <Building className="h-4 w-4 inline mr-1" />
                    Department
                  </Label>
                  <Input
                    id="department"
                    value={formData.metadata.department || ''}
                    onChange={(e) => handleInputChange('metadata.department', e.target.value)}
                    placeholder="e.g., Engineering, Marketing"
                    disabled={submitting}
                  />
                </div>

                {/* Employee ID */}
                <div className="space-y-2">
                  <Label htmlFor="employee_id">Employee ID</Label>
                  <Input
                    id="employee_id"
                    value={formData.metadata.employee_id || ''}
                    onChange={(e) => handleInputChange('metadata.employee_id', e.target.value)}
                    placeholder="e.g., EMP001"
                    disabled={submitting}
                  />
                </div>

                {/* Position */}
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    value={formData.metadata.position || ''}
                    onChange={(e) => handleInputChange('metadata.position', e.target.value)}
                    placeholder="e.g., Software Engineer"
                    disabled={submitting}
                  />
                </div>

                {/* Access Level */}
                <div className="space-y-2">
                  <Label htmlFor="access_level">Access Level</Label>
                  <Select 
                    value={formData.metadata.access_level || ''} 
                    onValueChange={(value) => handleInputChange('metadata.access_level', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select access level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">
                    <Mail className="h-4 w-4 inline mr-1" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.metadata.email || ''}
                    onChange={(e) => handleInputChange('metadata.email', e.target.value)}
                    placeholder="person@company.com"
                    className={errors.email ? 'border-red-500' : ''}
                    disabled={submitting}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    <Phone className="h-4 w-4 inline mr-1" />
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    value={formData.metadata.phone || ''}
                    onChange={(e) => handleInputChange('metadata.phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className={errors.phone ? 'border-red-500' : ''}
                    disabled={submitting}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500 flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="min-w-32"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {mode === 'create' ? 'Create Person' : 'Update Person'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonForm;