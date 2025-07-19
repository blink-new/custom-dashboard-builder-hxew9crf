import { useState, useEffect } from 'react';
import { Plus, Database, Globe, FileText, Server, Eye } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { dashboardAPI } from '../blink/client';
import { DataSource } from '../types/dashboard';
import { AddDataSourceDialog } from '../components/dashboard/AddDataSourceDialog';
import { CommodityChart } from '../components/dashboard/CommodityChart';
import { DataSourceViewer } from '../components/dashboard/DataSourceViewer';

export function DataSources() {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedDataSource, setSelectedDataSource] = useState<DataSource | null>(null);

  useEffect(() => {
    loadDataSources();
  }, []);

  const loadDataSources = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getDataSources();
      if (response.data) {
        setDataSources(response.data);
      }
    } catch (error) {
      console.error('Failed to load data sources:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDataSourceIcon = (type: string) => {
    switch (type) {
      case 'api':
        return Globe;
      case 'csv':
        return FileText;
      case 'json':
        return FileText;
      case 'database':
        return Server;
      default:
        return Database;
    }
  };

  const getDataSourceColor = (type: string) => {
    switch (type) {
      case 'api':
        return 'bg-blue-100 text-blue-600';
      case 'csv':
        return 'bg-green-100 text-green-600';
      case 'json':
        return 'bg-purple-100 text-purple-600';
      case 'database':
        return 'bg-orange-100 text-orange-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Data Sources</h1>
            <p className="text-gray-600">Connect and manage your data sources</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Sources</h1>
          <p className="text-gray-600">Connect and manage your data sources</p>
        </div>
        
        <Button 
          className="flex items-center space-x-2"
          onClick={() => setShowAddDialog(true)}
        >
          <Plus className="h-4 w-4" />
          <span>Add Data Source</span>
        </Button>
      </div>

      {dataSources.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Database className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No data sources yet</h3>
          <p className="text-gray-600 mb-6">
            Connect your first data source to start building dashboards
          </p>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Data Source
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Data Source Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dataSources.map((dataSource) => {
              const Icon = getDataSourceIcon(dataSource.type);
              const colorClass = getDataSourceColor(dataSource.type);
              
              return (
                <Card key={dataSource.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <Badge variant={dataSource.isActive ? 'default' : 'secondary'}>
                        {dataSource.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{dataSource.name}</CardTitle>
                    <CardDescription className="capitalize">{dataSource.type} Data Source</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Columns:</span> {dataSource.schemaConfig?.columns?.length || 0}
                        </div>
                        <div className="text-sm text-gray-500">
                          Created {new Date(dataSource.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      
                      {dataSource.type === 'csv' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => setSelectedDataSource(dataSource)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Data
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Live Data Visualization */}
          {dataSources.length > 0 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Live Data Visualization</h2>
                <p className="text-gray-600">Real-time charts from your connected data sources</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {dataSources
                  .filter(ds => ds.isActive && ds.type === 'api')
                  .map((dataSource) => (
                    <CommodityChart
                      key={dataSource.id}
                      dataSource={dataSource}
                      title={dataSource.name}
                      chartType="line"
                      height={350}
                    />
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Data Viewer Section */}
      {selectedDataSource && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Data Viewer</h2>
            <Button 
              variant="outline" 
              onClick={() => setSelectedDataSource(null)}
            >
              Close Viewer
            </Button>
          </div>
          
          <DataSourceViewer 
            dataSource={selectedDataSource}
            onDataUpdated={loadDataSources}
          />
        </div>
      )}

      <AddDataSourceDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onDataSourceAdded={loadDataSources}
      />
    </div>
  );
}