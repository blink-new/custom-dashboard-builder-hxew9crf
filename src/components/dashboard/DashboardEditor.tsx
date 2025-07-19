import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { 
  Save, 
  Eye, 
  Settings, 
  Undo, 
  Redo, 
  Grid, 
  Smartphone, 
  Monitor,
  Share,
  Download,
  Play
} from 'lucide-react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { DashboardCanvas } from './DashboardCanvas';
import { WidgetPalette } from './WidgetPalette';
import { PropertyPanel } from './PropertyPanel';
import { dashboardAPI } from '../../blink/client';
import { Dashboard, Widget, DashboardBuilderState } from '../../types/dashboard';
import toast from 'react-hot-toast';

export function DashboardEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [state, setState] = useState<DashboardBuilderState>({
    currentDashboard: null,
    widgets: [],
    dataSources: [],
    selectedWidget: null,
    isEditing: true,
    isDragging: false,
    showWidgetPalette: true,
    showDataSourcePanel: false,
    showPropertyPanel: false,
    previewMode: false,
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const loadDashboard = useCallback(async (dashboardId: string) => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getDashboard(dashboardId);
      if (response.data) {
        setState(prev => ({
          ...prev,
          currentDashboard: response.data,
        }));
        
        // Load widgets for this dashboard
        const widgetsResponse = await dashboardAPI.getWidgets(dashboardId);
        if (widgetsResponse.data) {
          setState(prev => ({
            ...prev,
            widgets: widgetsResponse.data,
          }));
        }
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      toast.error('Failed to load dashboard');
      navigate('/dashboard-builder');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (id) {
      loadDashboard(id);
    }
  }, [id, loadDashboard]);

  const handleSave = async () => {
    if (!state.currentDashboard) return;
    
    try {
      setSaving(true);
      await dashboardAPI.updateDashboard(state.currentDashboard.id, state.currentDashboard);
      
      // Save all widgets
      for (const widget of state.widgets) {
        if (widget.id.startsWith('temp-')) {
          // Create new widget
          const { id, ...widgetData } = widget;
          await dashboardAPI.createWidget({
            ...widgetData,
            dashboardId: state.currentDashboard.id,
          });
        } else {
          // Update existing widget
          await dashboardAPI.updateWidget(widget.id, widget);
        }
      }
      
      setHasUnsavedChanges(false);
      toast.success('Dashboard saved successfully');
    } catch (error) {
      console.error('Failed to save dashboard:', error);
      toast.error('Failed to save dashboard');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    setState(prev => ({ ...prev, previewMode: !prev.previewMode }));
  };

  const handleWidgetSelect = useCallback((widget: Widget | null) => {
    setState(prev => ({
      ...prev,
      selectedWidget: widget,
      showPropertyPanel: !!widget,
    }));
  }, []);

  const handleWidgetUpdate = useCallback((updatedWidget: Widget) => {
    setState(prev => {
      const existingWidget = prev.widgets.find(w => w.id === updatedWidget.id);
      
      if (existingWidget) {
        // Update existing widget
        return {
          ...prev,
          widgets: prev.widgets.map(w => 
            w.id === updatedWidget.id ? updatedWidget : w
          ),
          selectedWidget: updatedWidget,
        };
      } else {
        // Add new widget
        return {
          ...prev,
          widgets: [...prev.widgets, updatedWidget],
          selectedWidget: updatedWidget,
        };
      }
    });
    setHasUnsavedChanges(true);
  }, []);

  const handleWidgetAdd = useCallback((widget: Widget) => {
    setState(prev => ({
      ...prev,
      widgets: [...prev.widgets, widget],
    }));
    setHasUnsavedChanges(true);
  }, []);

  const handleWidgetDelete = useCallback((widgetId: string) => {
    setState(prev => ({
      ...prev,
      widgets: prev.widgets.filter(w => w.id !== widgetId),
      selectedWidget: prev.selectedWidget?.id === widgetId ? null : prev.selectedWidget,
      showPropertyPanel: prev.selectedWidget?.id === widgetId ? false : prev.showPropertyPanel,
    }));
    setHasUnsavedChanges(true);
  }, []);

  const handleLayoutChange = useCallback((layouts: any) => {
    if (!state.currentDashboard) return;
    
    setState(prev => ({
      ...prev,
      currentDashboard: prev.currentDashboard ? {
        ...prev.currentDashboard,
        layoutConfig: {
          ...prev.currentDashboard.layoutConfig,
          layouts,
        },
      } : null,
    }));
    setHasUnsavedChanges(true);
  }, [state.currentDashboard]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!state.currentDashboard) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Dashboard not found</p>
          <Button onClick={() => navigate('/dashboard-builder')} className="mt-4">
            Back to Dashboards
          </Button>
        </div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <TooltipProvider>
        <div className="h-screen flex flex-col bg-gray-50">
          {/* Top Toolbar */}
          <div className="bg-white border-b border-gray-200 px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    {state.currentDashboard.name}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {state.widgets.length} widgets
                    {hasUnsavedChanges && (
                      <Badge variant="secondary" className="ml-2">
                        Unsaved changes
                      </Badge>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* View Mode Toggle */}
                <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={viewMode === 'desktop' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('desktop')}
                        className="h-8 w-8 p-0"
                      >
                        <Monitor className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Desktop View</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={viewMode === 'tablet' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('tablet')}
                        className="h-8 w-8 p-0"
                      >
                        <Grid className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Tablet View</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={viewMode === 'mobile' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('mobile')}
                        className="h-8 w-8 p-0"
                      >
                        <Smartphone className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Mobile View</TooltipContent>
                  </Tooltip>
                </div>

                <Separator orientation="vertical" className="h-6" />

                {/* Action Buttons */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" disabled>
                      <Undo className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Undo</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" disabled>
                      <Redo className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Redo</TooltipContent>
                </Tooltip>

                <Separator orientation="vertical" className="h-6" />

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={handlePreview}>
                      {state.previewMode ? <Settings className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {state.previewMode ? 'Edit Mode' : 'Preview Mode'}
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Share className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Share Dashboard</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Export Dashboard</TooltipContent>
                </Tooltip>

                <Button 
                  onClick={handleSave} 
                  disabled={saving || !hasUnsavedChanges}
                  size="sm"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </>
                  )}
                </Button>

                <Button 
                  onClick={() => navigate(`/dashboard/${id}/view`)}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Play className="h-4 w-4 mr-2" />
                  View
                </Button>
              </div>
            </div>
          </div>

          {/* Main Editor Area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Widget Palette */}
            {state.showWidgetPalette && !state.previewMode && (
              <div className="w-80 bg-white border-r border-gray-200 flex-shrink-0">
                <WidgetPalette 
                  onWidgetAdd={handleWidgetAdd}
                  dashboard={state.currentDashboard}
                />
              </div>
            )}

            {/* Canvas Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <DashboardCanvas
                dashboard={state.currentDashboard}
                widgets={state.widgets}
                selectedWidget={state.selectedWidget}
                viewMode={viewMode}
                previewMode={state.previewMode}
                onWidgetSelect={handleWidgetSelect}
                onWidgetUpdate={handleWidgetUpdate}
                onWidgetDelete={handleWidgetDelete}
                onLayoutChange={handleLayoutChange}
              />
            </div>

            {/* Property Panel */}
            {state.showPropertyPanel && state.selectedWidget && !state.previewMode && (
              <div className="w-80 bg-white border-l border-gray-200 flex-shrink-0">
                <PropertyPanel
                  widget={state.selectedWidget}
                  dashboard={state.currentDashboard}
                  onWidgetUpdate={handleWidgetUpdate}
                  onClose={() => setState(prev => ({ 
                    ...prev, 
                    showPropertyPanel: false, 
                    selectedWidget: null 
                  }))}
                />
              </div>
            )}
          </div>
        </div>
      </TooltipProvider>
    </DndProvider>
  );
}