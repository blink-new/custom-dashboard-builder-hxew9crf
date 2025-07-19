import { useState, useEffect } from 'react';
import { Plus, Grid, List, Search, Filter, SortAsc, LayoutDashboard, MoreHorizontal } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../components/ui/dropdown-menu';
import { dashboardAPI } from '../blink/client';
import { Dashboard } from '../types/dashboard';
import { useNavigate } from 'react-router-dom';
import { CreateDashboardDialog } from '../components/dashboard/CreateDashboardDialog';
import toast from 'react-hot-toast';

export function DashboardBuilder() {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboards();
  }, []);

  const loadDashboards = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getDashboards();
      if (response.data) {
        setDashboards(response.data);
      }
    } catch (error) {
      console.error('Failed to load dashboards:', error);
      toast.error('Failed to load dashboards');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDashboard = async (dashboardData: any) => {
    try {
      const response = await dashboardAPI.createDashboard(dashboardData);
      if (response.data) {
        setDashboards(prev => [response.data, ...prev]);
        setShowCreateDialog(false);
        toast.success('Dashboard created successfully');
        navigate(`/dashboard/${response.data.id}`);
      }
    } catch (error) {
      console.error('Failed to create dashboard:', error);
      toast.error('Failed to create dashboard');
    }
  };

  const handleDeleteDashboard = async (id: string) => {
    try {
      await dashboardAPI.deleteDashboard(id);
      setDashboards(prev => prev.filter(d => d.id !== id));
      toast.success('Dashboard deleted successfully');
    } catch (error) {
      console.error('Failed to delete dashboard:', error);
      toast.error('Failed to delete dashboard');
    }
  };

  const filteredDashboards = dashboards.filter(dashboard =>
    dashboard.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dashboard.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboards</h1>
            <p className="text-gray-600">Create and manage your interactive dashboards</p>
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
                <div className="h-32 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboards</h1>
          <p className="text-gray-600">Create and manage your interactive dashboards</p>
        </div>
        
        <Button 
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Dashboard</span>
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center justify-between space-x-4">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search dashboards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>All Dashboards</DropdownMenuItem>
              <DropdownMenuItem>My Dashboards</DropdownMenuItem>
              <DropdownMenuItem>Shared with Me</DropdownMenuItem>
              <DropdownMenuItem>Public</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <SortAsc className="h-4 w-4 mr-2" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Name A-Z</DropdownMenuItem>
              <DropdownMenuItem>Name Z-A</DropdownMenuItem>
              <DropdownMenuItem>Recently Updated</DropdownMenuItem>
              <DropdownMenuItem>Recently Created</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Dashboard Grid/List */}
      {filteredDashboards.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LayoutDashboard className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No dashboards yet</h3>
          <p className="text-gray-600 mb-6">
            Get started by creating your first interactive dashboard
          </p>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Dashboard
          </Button>
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        }>
          {filteredDashboards.map((dashboard) => (
            <DashboardCard
              key={dashboard.id}
              dashboard={dashboard}
              viewMode={viewMode}
              onEdit={() => navigate(`/dashboard/${dashboard.id}`)}
              onDelete={() => handleDeleteDashboard(dashboard.id)}
            />
          ))}
        </div>
      )}

      {/* Create Dashboard Dialog */}
      <CreateDashboardDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreateDashboard}
      />
    </div>
  );
}

interface DashboardCardProps {
  dashboard: Dashboard;
  viewMode: 'grid' | 'list';
  onEdit: () => void;
  onDelete: () => void;
}

function DashboardCard({ dashboard, viewMode, onEdit, onDelete }: DashboardCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onEdit}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{dashboard.name}</h3>
                <p className="text-sm text-gray-600">{dashboard.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Updated {formatDate(dashboard.updatedAt)}</p>
                <div className="flex items-center space-x-2 mt-1">
                  {dashboard.isPublic && (
                    <Badge variant="secondary" className="text-xs">Public</Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {dashboard.layoutConfig?.layouts?.lg?.length || 0} widgets
                  </Badge>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
                  <DropdownMenuItem>Duplicate</DropdownMenuItem>
                  <DropdownMenuItem>Share</DropdownMenuItem>
                  <DropdownMenuItem onClick={onDelete} className="text-red-600">
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onEdit}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{dashboard.name}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem>Share</DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription>{dashboard.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center mb-4">
          <div className="text-center">
            <LayoutDashboard className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              {dashboard.layoutConfig?.layouts?.lg?.length || 0} widgets
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Updated {formatDate(dashboard.updatedAt)}</span>
          <div className="flex items-center space-x-2">
            {dashboard.isPublic && (
              <Badge variant="secondary" className="text-xs">Public</Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}