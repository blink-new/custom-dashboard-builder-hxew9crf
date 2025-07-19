import { useState } from 'react';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Copy, 
  Settings,
  BarChart3,
  Table,
  Gauge,
  Type,
  Image,
  Calendar,
  Map,
  TrendingUp,
  Activity
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';
import { Dashboard, Widget } from '../../types/dashboard';

interface WidgetRendererProps {
  widget: Widget;
  dashboard: Dashboard;
  isSelected: boolean;
  previewMode: boolean;
  onUpdate: (widget: Widget) => void;
  onDelete: (widgetId: string) => void;
}

export function WidgetRenderer({
  widget,
  dashboard,
  isSelected,
  previewMode,
  onUpdate,
  onDelete,
}: WidgetRendererProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getWidgetIcon = (type: string) => {
    const icons = {
      chart: BarChart3,
      table: Table,
      metric: TrendingUp,
      gauge: Gauge,
      text: Type,
      image: Image,
      calendar: Calendar,
      map: Map,
      progress: Activity,
    };
    const IconComponent = icons[type as keyof typeof icons] || BarChart3;
    return <IconComponent className="h-4 w-4" />;
  };

  const handleEdit = () => {
    // This will be handled by the parent component through selection
  };

  const handleDuplicate = () => {
    const duplicatedWidget: Widget = {
      ...widget,
      id: `temp-${Date.now()}`,
      title: `${widget.title} (Copy)`,
      positionX: widget.positionX + 1,
      positionY: widget.positionY + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onUpdate(duplicatedWidget);
  };

  const handleDelete = () => {
    onDelete(widget.id);
  };

  const renderWidgetContent = () => {
    switch (widget.type) {
      case 'chart':
        return <ChartWidget widget={widget} />;
      case 'table':
        return <TableWidget widget={widget} />;
      case 'metric':
        return <MetricWidget widget={widget} />;
      case 'gauge':
        return <GaugeWidget widget={widget} />;
      case 'text':
        return <TextWidget widget={widget} />;
      case 'image':
        return <ImageWidget widget={widget} />;
      case 'calendar':
        return <CalendarWidget widget={widget} />;
      case 'map':
        return <MapWidget widget={widget} />;
      case 'progress':
        return <ProgressWidget widget={widget} />;
      default:
        return <DefaultWidget widget={widget} />;
    }
  };

  return (
    <div
      className="h-full w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card 
        className={`
          h-full w-full transition-all duration-200
          ${isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
          ${isHovered && !previewMode ? 'shadow-md' : 'shadow-sm'}
        `}
        style={{
          backgroundColor: widget.config.backgroundColor || '#ffffff',
          borderRadius: widget.config.borderRadius || 8,
        }}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="text-blue-600">
                {getWidgetIcon(widget.type)}
              </div>
              <CardTitle className="text-sm font-medium truncate">
                {widget.title}
              </CardTitle>
              {widget.dataSourceId && (
                <Badge variant="outline" className="text-xs">
                  Connected
                </Badge>
              )}
            </div>
            
            {!previewMode && (isHovered || isSelected) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="h-3 w-3 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDuplicate}>
                    <Copy className="h-3 w-3 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleDelete}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-3 w-3 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 h-full">
          <div className="h-full">
            {renderWidgetContent()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Individual widget components
function ChartWidget({ widget }: { widget: Widget }) {
  return (
    <div className="h-full flex items-center justify-center bg-gray-50 rounded border-2 border-dashed border-gray-200">
      <div className="text-center">
        <BarChart3 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500">Chart Widget</p>
        <p className="text-xs text-gray-400 mt-1">
          {widget.config.chartType || 'line'} chart
        </p>
      </div>
    </div>
  );
}

function TableWidget({ widget }: { widget: Widget }) {
  return (
    <div className="h-full flex items-center justify-center bg-gray-50 rounded border-2 border-dashed border-gray-200">
      <div className="text-center">
        <Table className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500">Data Table</p>
        <p className="text-xs text-gray-400 mt-1">
          {widget.config.pagination ? 'Paginated' : 'Simple'} table
        </p>
      </div>
    </div>
  );
}

function MetricWidget({ widget }: { widget: Widget }) {
  return (
    <div className="h-full flex flex-col justify-center p-4">
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-900 mb-1">
          {widget.config.valueField ? '1,234' : '---'}
        </div>
        <div className="text-sm text-gray-500">
          {widget.title}
        </div>
        <div className="text-xs text-green-600 mt-1">
          +12.5% from last month
        </div>
      </div>
    </div>
  );
}

function GaugeWidget({ widget }: { widget: Widget }) {
  return (
    <div className="h-full flex items-center justify-center bg-gray-50 rounded border-2 border-dashed border-gray-200">
      <div className="text-center">
        <Gauge className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500">Gauge Widget</p>
        <p className="text-xs text-gray-400 mt-1">75%</p>
      </div>
    </div>
  );
}

function TextWidget({ widget }: { widget: Widget }) {
  return (
    <div className="h-full p-4">
      <div 
        className="text-sm text-gray-700"
        style={{ color: widget.config.textColor }}
      >
        {widget.config.content || 'Enter your text here...'}
      </div>
    </div>
  );
}

function ImageWidget({ widget }: { widget: Widget }) {
  return (
    <div className="h-full flex items-center justify-center bg-gray-50 rounded border-2 border-dashed border-gray-200">
      <div className="text-center">
        <Image className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500">Image Widget</p>
        <p className="text-xs text-gray-400 mt-1">No image selected</p>
      </div>
    </div>
  );
}

function CalendarWidget({ widget }: { widget: Widget }) {
  return (
    <div className="h-full flex items-center justify-center bg-gray-50 rounded border-2 border-dashed border-gray-200">
      <div className="text-center">
        <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500">Calendar Widget</p>
        <p className="text-xs text-gray-400 mt-1">No events</p>
      </div>
    </div>
  );
}

function MapWidget({ widget }: { widget: Widget }) {
  return (
    <div className="h-full flex items-center justify-center bg-gray-50 rounded border-2 border-dashed border-gray-200">
      <div className="text-center">
        <Map className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500">Map Widget</p>
        <p className="text-xs text-gray-400 mt-1">No location set</p>
      </div>
    </div>
  );
}

function ProgressWidget({ widget }: { widget: Widget }) {
  return (
    <div className="h-full flex flex-col justify-center p-4">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-700">{widget.title}</span>
          <span className="text-gray-500">75%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: '75%' }}
          ></div>
        </div>
      </div>
    </div>
  );
}

function DefaultWidget({ widget }: { widget: Widget }) {
  return (
    <div className="h-full flex items-center justify-center bg-gray-50 rounded border-2 border-dashed border-gray-200">
      <div className="text-center">
        <Settings className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500">Unknown Widget</p>
        <p className="text-xs text-gray-400 mt-1">{widget.type}</p>
      </div>
    </div>
  );
}