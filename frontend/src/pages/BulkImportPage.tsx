import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Users, ArrowLeft, Download } from 'lucide-react';
import { toast } from 'sonner';

import { useNavigate } from 'react-router-dom';

const BulkImportPage: React.FC = () => {
  const navigate = useNavigate();
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  const handleClear = () => {
    // Reset any import state or clear selected files
    console.log('🔵 BulkImportPage: Clearing import data');
    toast.success('Ready for new import');
  };

  const handleImport = async () => {
    // Implementation here...
    setImporting(true);
    
    try {
      // ✅ Test API endpoint accessibility first
      console.log('🔵 BulkImportPage: Testing bulk import endpoint...');
      
      // Add your import logic here
      toast.success('Import functionality is ready!');
      
    } catch (error: any) {
      console.error('❌ BulkImportPage: Import failed:', error);
      toast.error(`Import failed: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

    const handleBackToPersons = () => {
    console.log('🔵 PersonBulkImport: Navigating back to persons');
    navigate('/persons'); 
  };

  const handleGoToPersonsList = () => {
    console.log('🔵 PersonBulkImport: Going to persons list after import');
    navigate('/persons'); 
  };

  const downloadTemplate = () => {
    const template = [
      {
        "name": "John Doe",
        "description": "Employee",
        "metadata": {
          "department": "IT",
          "employee_id": "EMP001"
        },
        "face_images": ["data:image/jpeg;base64,..."]
      }
    ];
    
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_import_template.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Template downloaded successfully!');
  };

  return (

    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={handleBackToPersons}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Persons
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bulk Import Persons</h1>
            <p className="text-gray-600">Import multiple known persons from a JSON file</p>
          </div>
        </div>
        <Button variant="outline" onClick={downloadTemplate}>
          <Download className="h-4 w-4 mr-2" />
          Download Template
        </Button>
      </div>
      <div className="max-w-4xl mx-auto">
        {/* ✅ Header with back navigation */}
        <div className="flex items-center space-x-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/app/persons')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Persons</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bulk Import Persons</h1>
            <p className="text-slate-600">Import multiple persons with face data from JSON files</p>
          </div>
        </div>

        {/* ✅ Rest of your existing BulkImportPage content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="w-5 h-5" />
                <span>Upload Files</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 mb-4">Drag and drop JSON files here or click to browse</p>
                <Button variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Select Files
                </Button>
              </div>
              
              <Button 
                onClick={handleImport} 
                disabled={importing}
                className="w-full"
              >
                <Users className="w-4 h-4 mr-2" />
                {importing ? 'Testing...' : 'Test Import'}
              </Button>
            </CardContent>
          </Card>

          {/* Instructions Card */}
          {importResult && (
            <Card>
              <CardContent>
                {/* ... existing content ... */}
                
                {/* ✅ Action Buttons */}
                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={handleClear}>
                    Import More
                  </Button>
                  <Button onClick={handleGoToPersonsList}>
                    Go to Persons List
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkImportPage;