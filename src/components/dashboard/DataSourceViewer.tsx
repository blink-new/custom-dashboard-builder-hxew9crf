import { useState, useEffect, useCallback } from 'react';
import { 
  Table, 
  Edit, 
  Save, 
  X, 
  Plus, 
  Trash2, 
  Download, 
  Upload,
  Filter,
  Search,
  RefreshCw,
  Eye,
  Database
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '../ui/dialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Alert, AlertDescription } from '../ui/alert';
import { dataAPI } from '../../blink/client';
import { DataSource } from '../../types/dashboard';
import { useToast } from '../../hooks/use-toast';

interface DataSourceViewerProps {
  dataSource: DataSource;
  onDataUpdated?: () => void;
}

interface DataRow {
  [key: string]: any;
}

export function DataSourceViewer({ dataSource, onDataUpdated }: DataSourceViewerProps) {
  const [data, setData] = useState<DataRow[]>([]);
  const [schema, setSchema] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<DataRow>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dataAPI.getDataSourceData(dataSource.id);
      
      if (response.data) {
        setData(response.data.rows || []);
        setSchema(response.data.schema);
      } else {
        throw new Error('Failed to load data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [dataSource.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEditRow = (index: number) => {
    setEditingRow(index);
    setEditingData({ ...data[index] });
  };

  const handleSaveRow = async () => {
    if (editingRow === null) return;

    try {
      await dataAPI.updateDataSourceRow(dataSource.id, editingRow, editingData);
      
      const newData = [...data];
      newData[editingRow] = editingData;
      setData(newData);
      
      setEditingRow(null);
      setEditingData({});
      
      toast({
        title: "Success",
        description: "Row updated successfully"
      });
      
      onDataUpdated?.();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update row",
        variant: "destructive"
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingRow(null);
    setEditingData({});
  };

  const handleCellChange = (column: string, value: any) => {
    setEditingData(prev => ({
      ...prev,
      [column]: value
    }));
  };

  const filteredData = data.filter(row => {
    if (!searchQuery) return true;
    
    return Object.values(row).some(value => 
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const columns = schema?.columns || [];
  const hasData = data.length > 0;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
            <span>Loading data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={loadData} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>{dataSource.name}</span>
          </CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Table className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Found</h3>
            <p className="text-gray-600 mb-4">
              This data source doesn't contain any data yet.
            </p>
            <Button onClick={loadData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>{dataSource.name}</span>
            </CardTitle>
            <CardDescription>
              {filteredData.length} of {data.length} rows
              {searchQuery && ` (filtered)`}
            </CardDescription>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{dataSource.type.toUpperCase()}</Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={loadData}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Upload className="h-4 w-4 mr-2" />
                  Import More Data
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Search */}
        <div className="flex items-center space-x-2 mt-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search data..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-900 w-16">
                    #
                  </th>
                  {columns.map((column: any) => (
                    <th key={column.name} className="px-4 py-3 text-left font-medium text-gray-900">
                      <div className="flex items-center space-x-2">
                        <span>{column.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {column.type}
                        </Badge>
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left font-medium text-gray-900 w-24">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                      {index + 1}
                    </td>
                    {columns.map((column: any) => (
                      <td key={column.name} className="px-4 py-3">
                        {editingRow === index ? (
                          <Input
                            value={editingData[column.name] || ''}
                            onChange={(e) => handleCellChange(column.name, e.target.value)}
                            className="h-8 text-sm"
                            type={column.type === 'number' ? 'number' : 'text'}
                          />
                        ) : (
                          <span className="text-gray-700">
                            {column.type === 'date' && row[column.name] 
                              ? new Date(row[column.name]).toLocaleDateString()
                              : row[column.name] || '-'
                            }
                          </span>
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      {editingRow === index ? (
                        <div className="flex items-center space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleSaveRow}
                            className="h-6 w-6 p-0"
                          >
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleCancelEdit}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditRow(index)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Summary */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <div>
            Showing {filteredData.length} of {data.length} rows
          </div>
          <div>
            Last updated: {new Date(dataSource.updatedAt).toLocaleString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}