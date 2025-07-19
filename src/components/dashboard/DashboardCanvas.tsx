import { useState, useCallback, useMemo } from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import { useDrop } from 'react-dnd';
import { Plus, Grid } from 'lucide-react';
import { Button } from '../ui/button';
import { WidgetRenderer } from './WidgetRenderer';
import { Dashboard, Widget, WidgetType, DragItem } from '../../types/dashboard';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardCanvasProps {
  dashboard: Dashboard;
  widgets: Widget[];
  selectedWidget: Widget | null;
  viewMode: 'desktop' | 'tablet' | 'mobile';
  previewMode: boolean;
  onWidgetSelect: (widget: Widget | null) => void;
  onWidgetUpdate: (widget: Widget) => void;
  onWidgetDelete: (widgetId: string) => void;
  onLayoutChange: (layouts: any) => void;
}

export function DashboardCanvas({
  dashboard,
  widgets,
  selectedWidget,
  viewMode,
  previewMode,
  onWidgetSelect,
  onWidgetUpdate,
  onWidgetDelete,
  onLayoutChange,
}: DashboardCanvasProps) {
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [canvasRef, setCanvasRef] = useState<HTMLDivElement | null>(null);

  // Convert viewMode to breakpoint
  const currentBreakpoint = useMemo(() => {
    switch (viewMode) {
      case 'mobile': return 'xs';
      case 'tablet': return 'md';
      case 'desktop': return 'lg';
      default: return 'lg';
    }
  }, [viewMode]);

  // Convert widgets to layout items
  const layouts = useMemo(() => {
    const layoutItems = widgets.map(widget => ({
      i: widget.id,
      x: widget.positionX,
      y: widget.positionY,
      w: widget.width,
      h: widget.height,
      minW: 1,
      minH: 1,
      isDraggable: !previewMode,
      isResizable: !previewMode,
    }));

    return {
      lg: layoutItems,
      md: layoutItems.map(item => ({ ...item, w: Math.min(item.w, 8) })),
      sm: layoutItems.map(item => ({ ...item, w: Math.min(item.w, 6) })),
      xs: layoutItems.map(item => ({ ...item, w: Math.min(item.w, 4) })),
      xxs: layoutItems.map(item => ({ ...item, w: Math.min(item.w, 2) })),
    };
  }, [widgets, previewMode]);

  // Handle drop from widget palette
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'widget',
    drop: (item: DragItem, monitor) => {
      console.log('Drop event triggered:', item);
      
      if (item.type === 'new-widget' && item.widget) {
        const offset = monitor.getClientOffset();
        
        // Calculate grid position based on drop location
        let x = 0;
        let y = 0;
        
        if (offset && canvasRef) {
          const canvasRect = canvasRef.getBoundingClientRect();
          const cols = dashboard.layoutConfig.cols;
          const cellWidth = canvasRect.width / cols;
          x = Math.floor((offset.x - canvasRect.left) / cellWidth);
          y = Math.floor((offset.y - canvasRect.top) / dashboard.layoutConfig.rowHeight);
          
          // Ensure position is within bounds
          x = Math.max(0, Math.min(x, cols - 1));
          y = Math.max(0, y);
        }

        // Find next available position if current position is occupied
        const occupiedPositions = new Set(
          widgets.map(w => `${w.positionX},${w.positionY}`)
        );
        
        while (occupiedPositions.has(`${x},${y}`)) {
          x++;
          if (x >= dashboard.layoutConfig.cols) {
            x = 0;
            y++;
          }
        }

        const newWidget: Widget = {
          id: `temp-${Date.now()}`,
          dashboardId: dashboard.id,
          userId: '', // Will be set by the API
          type: item.widget.type,
          title: `New ${item.widget.name}`,
          config: item.widget.defaultConfig,
          positionX: x,
          positionY: y,
          width: Math.min(item.widget.defaultSize.w, dashboard.layoutConfig.cols - x),
          height: item.widget.defaultSize.h,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        console.log('Creating new widget:', newWidget);
        onWidgetUpdate(newWidget);
      } else {
        console.log('Drop conditions not met:', { type: item.type, hasWidget: !!item.widget });
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }), [canvasRef, dashboard, widgets, onWidgetUpdate]);

  const handleLayoutChange = useCallback((layout: Layout[], layouts: any) => {
    // Update widget positions based on layout changes
    layout.forEach(layoutItem => {
      const widget = widgets.find(w => w.id === layoutItem.i);
      if (widget && (
        widget.positionX !== layoutItem.x ||
        widget.positionY !== layoutItem.y ||
        widget.width !== layoutItem.w ||
        widget.height !== layoutItem.h
      )) {
        const updatedWidget: Widget = {
          ...widget,
          positionX: layoutItem.x,
          positionY: layoutItem.y,
          width: layoutItem.w,
          height: layoutItem.h,
          updatedAt: new Date().toISOString(),
        };
        onWidgetUpdate(updatedWidget);
      }
    });

    onLayoutChange(layouts);
  }, [widgets, onWidgetUpdate, onLayoutChange]);

  const handleWidgetClick = useCallback((widget: Widget, event: React.MouseEvent) => {
    if (previewMode) return;
    
    event.stopPropagation();
    onWidgetSelect(widget);
  }, [previewMode, onWidgetSelect]);

  const handleCanvasClick = useCallback(() => {
    if (!previewMode) {
      onWidgetSelect(null);
    }
  }, [previewMode, onWidgetSelect]);

  // Get canvas dimensions based on view mode
  const getCanvasStyle = () => {
    switch (viewMode) {
      case 'mobile':
        return { maxWidth: '375px', margin: '0 auto' };
      case 'tablet':
        return { maxWidth: '768px', margin: '0 auto' };
      case 'desktop':
      default:
        return { width: '100%' };
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Canvas Header */}
      {!previewMode && (
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h3 className="text-sm font-medium text-gray-900">Canvas</h3>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Grid className="h-3 w-3" />
                <span>{dashboard.layoutConfig.cols} columns</span>
                <span>•</span>
                <span>{dashboard.layoutConfig.rowHeight}px rows</span>
              </div>
            </div>
            
            <div className="text-xs text-gray-500">
              {widgets.length} widget{widgets.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      )}

      {/* Canvas Area */}
      <div 
        className="flex-1 overflow-auto p-6"
        onClick={handleCanvasClick}
      >
        <div style={getCanvasStyle()}>
          <div
            ref={(el) => {
              drop(el);
              setCanvasRef(el);
            }}
            className={`
              min-h-full relative
              ${isOver && canDrop ? 'bg-blue-50 border-2 border-dashed border-blue-300' : ''}
              ${!previewMode ? 'border border-gray-200 rounded-lg' : ''}
            `}
            style={{ 
              minHeight: previewMode ? 'auto' : '600px',
              backgroundColor: dashboard.themeConfig.backgroundColor,
            }}
          >
            {widgets.length === 0 && !previewMode ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Start building your dashboard
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-sm">
                    Drag widgets from the palette or click the + button to add your first widget
                  </p>
                  {isOver && canDrop && (
                    <div className="text-blue-600 font-medium">
                      Drop widget here
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <ResponsiveGridLayout
                className="layout"
                layouts={layouts}
                breakpoints={dashboard.layoutConfig.breakpoints}
                cols={{
                  lg: dashboard.layoutConfig.cols,
                  md: Math.min(dashboard.layoutConfig.cols, 8),
                  sm: Math.min(dashboard.layoutConfig.cols, 6),
                  xs: Math.min(dashboard.layoutConfig.cols, 4),
                  xxs: Math.min(dashboard.layoutConfig.cols, 2),
                }}
                rowHeight={dashboard.layoutConfig.rowHeight}
                margin={dashboard.layoutConfig.margin}
                containerPadding={dashboard.layoutConfig.containerPadding}
                onLayoutChange={handleLayoutChange}
                isDraggable={!previewMode}
                isResizable={!previewMode}
                compactType="vertical"
                preventCollision={false}
              >
                {widgets.map((widget) => (
                  <div
                    key={widget.id}
                    className={`
                      widget-container relative
                      ${!previewMode ? 'cursor-pointer' : ''}
                      ${selectedWidget?.id === widget.id ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                    `}
                    onClick={(e) => handleWidgetClick(widget, e)}
                  >
                    <WidgetRenderer
                      widget={widget}
                      dashboard={dashboard}
                      isSelected={selectedWidget?.id === widget.id}
                      previewMode={previewMode}
                      onUpdate={onWidgetUpdate}
                      onDelete={onWidgetDelete}
                    />
                  </div>
                ))}
              </ResponsiveGridLayout>
            )}
          </div>
        </div>
      </div>

      {/* Drop Zone Indicator */}
      {isOver && canDrop && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-10 border-2 border-dashed border-blue-400 rounded-lg flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-lg px-4 py-2 shadow-lg">
            <p className="text-blue-600 font-medium">Drop widget here</p>
          </div>
        </div>
      )}
    </div>
  );
}