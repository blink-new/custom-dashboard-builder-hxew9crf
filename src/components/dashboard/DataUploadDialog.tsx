import { useState, useRef } from 'react';
import { Upload, FileText, Table, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { dashboardAPI, dataAPI } from '../../blink/client';
import { useToast } from '../../hooks/use-toast';

interface DataUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDataSourceCreated: () => void;
}

interface ParsedData {
  headers: string[];
  rows: any[][];
  schema: any[];
}

export function DataUploadDialog({ open, onOpenChange, onDataSourceCreated }: DataUploadDialogProps) {
  const [step, setStep] = useState<'upload' | 'preview' | 'configure'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [dataSourceName, setDataSourceName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const resetDialog = () => {
    setStep('upload');
    setFile(null);
    setParsedData(null);
    setDataSourceName('');
    setError(null);
  };

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setDataSourceName(selectedFile.name.replace(/\.[^/.]+$/, ''));
    setError(null);
  };

  const parseCSV = (csvText: string): ParsedData => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      throw new Error('File is empty');
    }

    // Parse CSV with basic comma separation (could be enhanced with proper CSV parser)
    const parseCSVLine = (line: string): string[] => {
      const result = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      
      result.push(current.trim());
      return result;
    };

    const headers = parseCSVLine(lines[0]);
    const rows = lines.slice(1).map(line => parseCSVLine(line));

    // Detect column types
    const schema = headers.map((header, index) => {
      const sampleValues = rows.slice(0, 10).map(row => row[index]).filter(val => val && val.trim());
      
      let type = 'string';
      if (sampleValues.length > 0) {
        const isNumber = sampleValues.every(val => !isNaN(Number(val)) && val.trim() !== '');
        const isDate = sampleValues.every(val => !isNaN(Date.parse(val)));
        
        if (isNumber) {
          type = 'number';
        } else if (isDate && !isNumber) {
          type = 'date';
        }
      }

      return {
        name: header,
        type,
        nullable: true,
        description: `${header} column`
      };
    });

    return { headers, rows, schema };
  };

  const handleFileUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const parsed = parseCSV(text);
      setParsedData(parsed);
      setStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDataSource = async () => {
    if (!parsedData || !dataSourceName) return;

    setLoading(true);
    try {
      // Create data source
      const dataSourceResponse = await dashboardAPI.createDataSource({
        name: dataSourceName,
        type: 'csv',
        connectionConfig: {
          fileName: file?.name,
          uploadedAt: new Date().toISOString()
        },
        schemaConfig: {
          columns: parsedData.schema
        },
        isActive: true
      });

      if (!dataSourceResponse.data) {
        throw new Error('Failed to create data source');
      }

      // Convert rows to objects
      const dataObjects = parsedData.rows.map(row => {
        const obj: any = {};
        parsedData.headers.forEach((header, index) => {
          let value = row[index] || '';
          
          // Convert based on detected type
          const columnSchema = parsedData.schema[index];
          if (columnSchema.type === 'number' && value) {
            value = Number(value);
          } else if (columnSchema.type === 'date' && value) {
            value = new Date(value).toISOString();
          }
          
          obj[header] = value;
        });
        return obj;
      });

      // Import data
      await dataAPI.importData(dataSourceResponse.data.id, dataObjects, {
        columns: parsedData.schema
      });

      toast({
        title: "Success",
        description: `Data source "${dataSourceName}" created with ${dataObjects.length} rows`
      });

      onDataSourceCreated();
      onOpenChange(false);
      resetDialog();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create data source');
    } finally {
      setLoading(false);
    }
  };

  const renderUploadStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Upload className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Your Data</h3>
        <p className="text-gray-600">
          Upload a CSV file to create a new data source for your dashboards
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="file-upload">Select CSV File</Label>
          <div className="mt-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0];
                if (selectedFile) handleFileSelect(selectedFile);
              }}
              className="hidden"
            />
            
            {!file ? (
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Click to select a CSV file</p>
                <p className="text-sm text-gray-500 mt-1">Supports .csv and .txt files</p>
              </div>
            ) : (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Change
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {file && (
          <div>
            <Label htmlFor="dataSourceName">Data Source Name</Label>
            <Input
              id="dataSourceName"
              value={dataSourceName}
              onChange={(e) => setDataSourceName(e.target.value)}
              placeholder="Enter a name for this data source"
            />
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );

  const renderPreviewStep = () => {
    if (!parsedData) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Data Preview</h3>
            <p className="text-gray-600">
              {parsedData.rows.length} rows, {parsedData.headers.length} columns
            </p>
          </div>
          <Badge variant="secondary" className="flex items-center space-x-1">
            <CheckCircle className="h-3 w-3" />
            <span>Parsed Successfully</span>
          </Badge>
        </div>

        <Tabs defaultValue="data" className="w-full">
          <TabsList>
            <TabsTrigger value="data">Data Preview</TabsTrigger>
            <TabsTrigger value="schema">Column Types</TabsTrigger>
          </TabsList>

          <TabsContent value="data" className="space-y-4">
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      {parsedData.headers.map((header, index) => (
                        <th key={index} className="px-4 py-2 text-left font-medium text-gray-900">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.rows.slice(0, 10).map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-b hover:bg-gray-50">
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="px-4 py-2 text-gray-700">
                            {cell || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedData.rows.length > 10 && (
                <div className="bg-gray-50 px-4 py-2 text-sm text-gray-600 text-center">
                  Showing first 10 rows of {parsedData.rows.length} total rows
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="schema" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {parsedData.schema.map((column, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{column.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Type:</span>
                        <Badge variant="outline">{column.type}</Badge>
                      </div>
                      <div className="text-xs text-gray-500">
                        Auto-detected from sample data
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) resetDialog();
    }}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 'upload' && 'Upload Data Source'}
            {step === 'preview' && 'Preview Data'}
            {step === 'configure' && 'Configure Data Source'}
          </DialogTitle>
          <DialogDescription>
            {step === 'upload' && 'Upload a CSV file to create a new data source'}
            {step === 'preview' && 'Review your data before creating the data source'}
            {step === 'configure' && 'Configure how your data should be processed'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {step === 'upload' && renderUploadStep()}
          {step === 'preview' && renderPreviewStep()}
        </div>

        <DialogFooter>
          {step === 'preview' && (
            <>
              <Button variant="outline" onClick={() => setStep('upload')}>
                Back
              </Button>
              <Button 
                onClick={handleCreateDataSource} 
                disabled={loading || !dataSourceName.trim()}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  'Create Data Source'
                )}
              </Button>
            </>
          )}
          {step === 'upload' && (
            <Button 
              onClick={handleFileUpload} 
              disabled={!file || loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                'Preview Data'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}