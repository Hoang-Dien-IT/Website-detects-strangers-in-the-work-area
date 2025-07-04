import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PersonDetails from '@/components/persons/PersonDetails';

const PersonDetailPage: React.FC = () => {
  // const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/persons')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Persons
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">Person Details</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6">
        <PersonDetails />
      </div>
    </div>
  );
};

export default PersonDetailPage;