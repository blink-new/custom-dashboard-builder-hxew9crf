import { useState } from 'react';
import { useDrag } from 'react-dnd';
import { 
  BarChart3, 
  Table, 
  Gauge, 
  Type, 
  Image, 
  Calendar, 
  Map, 
  TrendingUp,
  PieChart,
  Activity,
  Search,
  Plus
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../ui/tooltip';
import { Dashboard, Widget, WidgetType, WidgetPaletteItem } from '../../types/dashboard';

interface WidgetPaletteProps {
  onWidgetAdd: (widget: Widget) => void;
  dashboard: Dashboard;
}

export function WidgetPalette({ onWidgetAdd, dashboard }: WidgetPaletteProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const widgetTypes: WidgetPaletteItem[] = [
    {
      type: 'chart',
      name: 'Chart',
      description: 'Line, bar, pie, and area charts',
      icon: 'BarChart3',
      defaultConfig: {
        chartType: 'line',
        backgroundColor: '#ffffff',
        borderRadius: 8,
        padding: 16,
      },
      defaultSize: { w: 6, h: 4 },
    },
    {
      type: 'table',
      name: 'Data Table',
      description: 'Sortable and filterable data tables',
      icon: 'Table',
      defaultConfig: {
        pagination: true,
        pageSize: 10,
        sortable: true,
        filterable: true,
        backgroundColor: '#ffffff',
        borderRadius: 8,
        padding: 16,
      },
      defaultSize: { w: 8, h: 6 },
    },
    {
      type: 'metric',
      name: 'Metric',
      description: 'Key performance indicators',
      icon: 'TrendingUp',
      defaultConfig: {
        format: 'number',
        backgroundColor: '#ffffff',
        borderRadius: 8,
        padding: 16,
      },
      defaultSize: { w: 3, h: 2 },
    },
    {
      type: 'gauge',
      name: 'Gauge',
      description: 'Progress and performance gauges',
      icon: 'Gauge',
      defaultConfig: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        padding: 16,
      },
      defaultSize: { w: 4, h: 4 },
    },
    {
      type: 'text',
      name: 'Text',
      description: 'Rich text and markdown content',
      icon: 'Type',
      defaultConfig: {
        content: 'Enter your text here...',
        markdown: false,
        backgroundColor: '#ffffff',
        borderRadius: 8,
        padding: 16,
      },
      defaultSize: { w: 4, h: 3 },
    },
    {
      type: 'image',
      name: 'Image',
      description: 'Images and media content',
      icon: 'Image',
      defaultConfig: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        padding: 16,
      },
      defaultSize: { w: 4, h: 3 },
    },
    {
      type: 'calendar',
      name: 'Calendar',
      description: 'Event calendars and schedules',
      icon: 'Calendar',
      defaultConfig: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        padding: 16,
      },
      defaultSize: { w: 6, h: 6 },
    },
    {
      type: 'map',
      name: 'Map',
      description: 'Geographic data visualization',
      icon: 'Map',
      defaultConfig: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        padding: 16,
      },
      defaultSize: { w: 6, h: 6 },
    },
    {
      type: 'progress',
      name: 'Progress Bar',
      description: 'Progress indicators and completion status',
      icon: 'Activity',
      defaultConfig: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        padding: 16,
      },
      defaultSize: { w: 4, h: 2 },
    },
  ];

  const categories = [
    { id: 'all', name: 'All Widgets', count: widgetTypes.length },
    { id: 'charts', name: 'Charts', count: widgetTypes.filter(w => ['chart', 'gauge', 'progress'].includes(w.type)).length },
    { id: 'data', name: 'Data', count: widgetTypes.filter(w => ['table', 'metric'].includes(w.type)).length },
    { id: 'content', name: 'Content', count: widgetTypes.filter(w => ['text', 'image'].includes(w.type)).length },
    { id: 'interactive', name: 'Interactive', count: widgetTypes.filter(w => ['calendar', 'map'].includes(w.type)).length },
  ];

  const filteredWidgets = widgetTypes.filter(widget => {
    const matchesSearch = widget.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         widget.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
                           (selectedCategory === 'charts' && ['chart', 'gauge', 'progress'].includes(widget.type)) ||
                           (selectedCategory === 'data' && ['table', 'metric'].includes(widget.type)) ||
                           (selectedCategory === 'content' && ['text', 'image'].includes(widget.type)) ||
                           (selectedCategory === 'interactive' && ['calendar', 'map'].includes(widget.type));
    
    return matchesSearch && matchesCategory;
  });

  const handleWidgetAdd = (widgetType: WidgetPaletteItem) => {
    const newWidget: Widget = {
      id: `temp-${Date.now()}`, // Temporary ID until saved
      dashboardId: dashboard.id,
      userId: '', // Will be set by the API
      type: widgetType.type,
      title: `New ${widgetType.name}`,
      config: widgetType.defaultConfig,
      positionX: 0,
      positionY: 0,
      width: widgetType.defaultSize.w,
      height: widgetType.defaultSize.h,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onWidgetAdd(newWidget);
  };

  const getIcon = (iconName: string) => {
    const icons = {
      BarChart3,
      Table,
      Gauge,
      Type,
      Image,
      Calendar,
      Map,
      TrendingUp,
      PieChart,
      Activity,
    };
    const IconComponent = icons[iconName as keyof typeof icons] || BarChart3;
    return <IconComponent className="h-5 w-5" />;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Widget Palette</h2>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search widgets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Categories */}
        <div className="space-y-1">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="w-full justify-between"
            >
              <span>{category.name}</span>
              <Badge variant="secondary" className="text-xs">
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      {/* Widget List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {filteredWidgets.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">No widgets found</p>
              <p className="text-xs text-gray-400 mt-1">Try adjusting your search or category filter</p>
            </div>
          ) : (
            filteredWidgets.map((widget) => (
              <WidgetPaletteItem
                key={widget.type}
                widget={widget}
                onAdd={() => handleWidgetAdd(widget)}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          Drag widgets to the canvas or click the + button
        </div>
      </div>
    </div>
  );
}

interface WidgetPaletteItemProps {
  widget: WidgetPaletteItem;
  onAdd: () => void;
}

function WidgetPaletteItem({ widget, onAdd }: WidgetPaletteItemProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'widget',
    item: { 
      type: 'new-widget', 
      widgetType: widget.type, 
      widget: {
        type: widget.type,
        name: widget.name,
        defaultConfig: widget.defaultConfig,
        defaultSize: widget.defaultSize,
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const getIcon = (iconName: string) => {
    const icons = {
      BarChart3,
      Table,
      Gauge,
      Type,
      Image,
      Calendar,
      Map,
      TrendingUp,
      PieChart,
      Activity,
    };
    const IconComponent = icons[iconName as keyof typeof icons] || BarChart3;
    return <IconComponent className="h-5 w-5" />;
  };

  return (
    <div
      ref={drag}
      className={`
        group relative bg-white border border-gray-200 rounded-lg p-3 cursor-move
        hover:border-blue-300 hover:shadow-sm transition-all duration-200
        ${isDragging ? 'opacity-50 scale-95' : ''}
      `}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
            {getIcon(widget.icon)}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {widget.name}
          </h3>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
            {widget.description}
          </p>
          
          <div className="flex items-center justify-between mt-2">
            <div className="text-xs text-gray-400">
              {widget.defaultSize.w}×{widget.defaultSize.h}
            </div>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAdd();
                  }}
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add to Dashboard</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
}