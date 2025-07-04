import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  Image,
  Calendar,
  UserCheck,
  UserX
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Person {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  face_images_count: number; // ✅ Match backend
  metadata?: {
    department?: string;
    employee_id?: string;
    phone?: string;
    email?: string;
    position?: string;
    access_level?: string;
  };
}


interface PersonListProps {
  persons: Person[];
  onEdit: (person: Person) => void;
  onDelete: (person: Person) => void;
  onViewDetails: (person: Person) => void;
  onToggleStatus: (person: Person) => void;
  loading?: boolean;
}

const PersonList: React.FC<PersonListProps> = ({
  persons,
  onEdit,
  onDelete,
  onViewDetails,
  onToggleStatus,
  loading = false
}) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="flex space-x-2">
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (persons.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No persons registered</h3>
        <p className="text-gray-600 mb-6">Start by adding people to your face recognition system.</p>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Person
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {persons.map((person) => (
        <Card key={person.id} className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <Avatar className="h-12 w-12">
                    {/* ✅ Fix: Use gradient fallback since no primary image */}
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                      {getInitials(person.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {person.name}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={person.is_active ? "default" : "secondary"}>
                        {person.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <div className="flex items-center text-xs text-gray-500">
                        <Image className="h-3 w-3 mr-1" />
                        {person.face_images_count} {/* ✅ Use count from backend */}
                      </div>
                    </div>
                  </div>
                </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="p-1">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewDetails(person)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(person)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onToggleStatus(person)}>
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
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDelete(person)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Description */}
              {/* Description */}
              {person.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {person.description}
                </p>
              )}

              {/* Metadata */}
              {person.metadata && (
                <div className="space-y-1">
                  {person.metadata.department && (
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">Dept:</span> {person.metadata.department}
                    </div>
                  )}
                  {person.metadata.employee_id && (
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">ID:</span> {person.metadata.employee_id}
                    </div>
                  )}
                  {person.metadata.phone && (
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">Phone:</span> {person.metadata.phone}
                    </div>
                  )}
                </div>
              )}

              {/* ✅ Remove images grid since backend doesn't provide images array */}
              {/* Face images count display instead */}
              {person.face_images_count > 0 && (
                <div className="flex items-center justify-center p-3 bg-gray-50 rounded-lg">
                  <Image className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {person.face_images_count} face image{person.face_images_count !== 1 ? 's' : ''}
                  </span>
                </div>
              )}

              {/* Action Buttons remain the same */}
              <div className="flex space-x-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onViewDetails(person)}
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                <Button
                  size="sm"
                  onClick={() => onEdit(person)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              </div>

              {/* Footer */}
              <div className="text-xs text-gray-400 pt-2 border-t flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  Added {formatDate(person.created_at)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PersonList;