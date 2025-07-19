import { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  Palette, 
  Database, 
  Layout,
  Type,
  BarChart3,
  Table,
  Gauge,
  Image,
  Calendar,
  Map,
  Activity
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Slider } from '../ui/slider';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dashboard, Widget } from '../../types/dashboard';

interface PropertyPanelProps {
  widget: Widget;
  dashboard: Dashboard;
  onWidgetUpdate: (widget: Widget) => void;
  onClose: () => void;
}

export function PropertyPanel({ widget, dashboard, onWidgetUpdate, onClose }: PropertyPanelProps) {
  const [localWidget, setLocalWidget] = useState<Widget>(widget);

  useEffect(() => {
    setLocalWidget(widget);
  }, [widget]);

  const handleUpdate = (updates: Partial<Widget>) => {
    const updatedWidget = {
      ...localWidget,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    setLocalWidget(updatedWidget);
    onWidgetUpdate(updatedWidget);
  };

  const handleConfigUpdate = (configUpdates: Partial<Widget['config']>) => {
    handleUpdate({
      config: {
        ...localWidget.config,
        ...configUpdates,
      },
    });
  };

  const getWidgetIcon = (type: string) => {
    const icons = {
      chart: BarChart3,
      table: Table,
      metric: BarChart3,
      gauge: Gauge,
      text: Type,
      image: Image,
      calendar: Calendar,
      map: Map,
      progress: Activity,
    };
    const IconComponent = icons[type as keyof typeof icons] || Settings;
    return <IconComponent className="h-4 w-4" />;
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="text-blue-600">
              {getWidgetIcon(localWidget.type)}
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Widget Properties
            </h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="mt-2">
          <p className="text-sm text-gray-500">
            {localWidget.type.charAt(0).toUpperCase() + localWidget.type.slice(1)} Widget
          </p>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">
                <Settings className="h-3 w-3 mr-1" />
                General
              </TabsTrigger>
              <TabsTrigger value="data">
                <Database className="h-3 w-3 mr-1" />
                Data
              </TabsTrigger>
              <TabsTrigger value="style">
                <Palette className="h-3 w-3 mr-1" />
                Style
              </TabsTrigger>
              <TabsTrigger value="layout">
                <Layout className="h-3 w-3 mr-1" />
                Layout
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4 mt-4">
              <GeneralProperties 
                widget={localWidget} 
                onUpdate={handleUpdate}
                onConfigUpdate={handleConfigUpdate}
              />
            </TabsContent>

            <TabsContent value="data" className="space-y-4 mt-4">
              <DataProperties 
                widget={localWidget} 
                dashboard={dashboard}
                onUpdate={handleUpdate}
                onConfigUpdate={handleConfigUpdate}
              />
            </TabsContent>

            <TabsContent value="style" className="space-y-4 mt-4">
              <StyleProperties 
                widget={localWidget} 
                onConfigUpdate={handleConfigUpdate}
              />
            </TabsContent>

            <TabsContent value="layout" className="space-y-4 mt-4">
              <LayoutProperties 
                widget={localWidget} 
                onUpdate={handleUpdate}
              />
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
}

interface PropertySectionProps {
  widget: Widget;
  onUpdate?: (updates: Partial<Widget>) => void;
  onConfigUpdate?: (configUpdates: Partial<Widget['config']>) => void;
  dashboard?: Dashboard;
}

function GeneralProperties({ widget, onUpdate, onConfigUpdate }: PropertySectionProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="title">Widget Title</Label>
            <Input
              id="title"
              value={widget.title}
              onChange={(e) => onUpdate?.({ title: e.target.value })}
              placeholder="Enter widget title"
            />
          </div>

          {widget.type === 'text' && (
            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={widget.config.content || ''}
                onChange={(e) => onConfigUpdate?.({ content: e.target.value })}
                placeholder="Enter your text content"
                rows={4}
              />
            </div>
          )}

          {widget.type === 'chart' && (
            <div>
              <Label htmlFor="chartType">Chart Type</Label>
              <Select
                value={widget.config.chartType || 'line'}
                onValueChange={(value) => onConfigUpdate?.({ chartType: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="pie">Pie Chart</SelectItem>
                  <SelectItem value="doughnut">Doughnut Chart</SelectItem>
                  <SelectItem value="area">Area Chart</SelectItem>
                  <SelectItem value="scatter">Scatter Plot</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {widget.type === 'metric' && (
            <div>
              <Label htmlFor="format">Number Format</Label>
              <Select
                value={widget.config.format || 'number'}
                onValueChange={(value) => onConfigUpdate?.({ format: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="currency">Currency</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Refresh Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="autoRefresh">Auto Refresh</Label>
            <Switch
              id="autoRefresh"
              checked={widget.config.autoRefresh || false}
              onCheckedChange={(checked) => onConfigUpdate?.({ autoRefresh: checked })}
            />
          </div>

          {widget.config.autoRefresh && (
            <div>
              <Label htmlFor="refreshInterval">Refresh Interval (seconds)</Label>
              <Input
                id="refreshInterval"
                type="number"
                value={widget.config.refreshInterval || 60}
                onChange={(e) => onConfigUpdate?.({ refreshInterval: parseInt(e.target.value) })}
                min="10"
                max="3600"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DataProperties({ widget, dashboard, onUpdate, onConfigUpdate }: PropertySectionProps & { dashboard: Dashboard }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Data Source</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="dataSource">Select Data Source</Label>
            <Select
              value={widget.dataSourceId || 'none'}
              onValueChange={(value) => onUpdate?.({ dataSourceId: value === 'none' ? undefined : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a data source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No data source</SelectItem>
                <SelectItem value="sample-1">Sample Sales Data</SelectItem>
                <SelectItem value="sample-2">Sample Analytics Data</SelectItem>
                <SelectItem value="sample-3">Sample User Data</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {widget.dataSourceId && widget.type === 'chart' && (
            <>
              <div>
                <Label htmlFor="xAxis">X-Axis Field</Label>
                <Select
                  value={widget.config.xAxis || 'none'}
                  onValueChange={(value) => onConfigUpdate?.({ xAxis: value === 'none' ? undefined : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Select field</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="yAxis">Y-Axis Field</Label>
                <Select
                  value={widget.config.yAxis || 'none'}
                  onValueChange={(value) => onConfigUpdate?.({ yAxis: value === 'none' ? undefined : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Select field</SelectItem>
                    <SelectItem value="value">Value</SelectItem>
                    <SelectItem value="count">Count</SelectItem>
                    <SelectItem value="revenue">Revenue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {widget.dataSourceId && widget.type === 'metric' && (
            <div>
              <Label htmlFor="valueField">Value Field</Label>
              <Select
                value={widget.config.valueField || 'none'}
                onValueChange={(value) => onConfigUpdate?.({ valueField: value === 'none' ? undefined : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select field</SelectItem>
                  <SelectItem value="total">Total</SelectItem>
                  <SelectItem value="average">Average</SelectItem>
                  <SelectItem value="count">Count</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Data Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500 text-center py-4">
            No filters configured
          </div>
          <Button variant="outline" size="sm" className="w-full">
            Add Filter
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function StyleProperties({ widget, onConfigUpdate }: PropertySectionProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Colors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="backgroundColor">Background Color</Label>
            <div className="flex space-x-2">
              <Input
                id="backgroundColor"
                type="color"
                value={widget.config.backgroundColor || '#ffffff'}
                onChange={(e) => onConfigUpdate?.({ backgroundColor: e.target.value })}
                className="w-12 h-8 p-1 border rounded"
              />
              <Input
                value={widget.config.backgroundColor || '#ffffff'}
                onChange={(e) => onConfigUpdate?.({ backgroundColor: e.target.value })}
                placeholder="#ffffff"
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="textColor">Text Color</Label>
            <div className="flex space-x-2">
              <Input
                id="textColor"
                type="color"
                value={widget.config.textColor || '#000000'}
                onChange={(e) => onConfigUpdate?.({ textColor: e.target.value })}
                className="w-12 h-8 p-1 border rounded"
              />
              <Input
                value={widget.config.textColor || '#000000'}
                onChange={(e) => onConfigUpdate?.({ textColor: e.target.value })}
                placeholder="#000000"
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="borderColor">Border Color</Label>
            <div className="flex space-x-2">
              <Input
                id="borderColor"
                type="color"
                value={widget.config.borderColor || '#e5e7eb'}
                onChange={(e) => onConfigUpdate?.({ borderColor: e.target.value })}
                className="w-12 h-8 p-1 border rounded"
              />
              <Input
                value={widget.config.borderColor || '#e5e7eb'}
                onChange={(e) => onConfigUpdate?.({ borderColor: e.target.value })}
                placeholder="#e5e7eb"
                className="flex-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Spacing & Borders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Border Radius: {widget.config.borderRadius || 8}px</Label>
            <Slider
              value={[widget.config.borderRadius || 8]}
              onValueChange={([value]) => onConfigUpdate?.({ borderRadius: value })}
              max={20}
              min={0}
              step={1}
              className="mt-2"
            />
          </div>

          <div>
            <Label>Padding: {widget.config.padding || 16}px</Label>
            <Slider
              value={[widget.config.padding || 16]}
              onValueChange={([value]) => onConfigUpdate?.({ padding: value })}
              max={32}
              min={0}
              step={4}
              className="mt-2"
            />
          </div>

          <div>
            <Label>Border Width: {widget.config.borderWidth || 1}px</Label>
            <Slider
              value={[widget.config.borderWidth || 1]}
              onValueChange={([value]) => onConfigUpdate?.({ borderWidth: value })}
              max={5}
              min={0}
              step={1}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LayoutProperties({ widget, onUpdate }: PropertySectionProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Position & Size</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="positionX">X Position</Label>
              <Input
                id="positionX"
                type="number"
                value={widget.positionX}
                onChange={(e) => onUpdate?.({ positionX: parseInt(e.target.value) })}
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="positionY">Y Position</Label>
              <Input
                id="positionY"
                type="number"
                value={widget.positionY}
                onChange={(e) => onUpdate?.({ positionY: parseInt(e.target.value) })}
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="width">Width (columns)</Label>
              <Input
                id="width"
                type="number"
                value={widget.width}
                onChange={(e) => onUpdate?.({ width: parseInt(e.target.value) })}
                min="1"
                max="12"
              />
            </div>
            <div>
              <Label htmlFor="height">Height (rows)</Label>
              <Input
                id="height"
                type="number"
                value={widget.height}
                onChange={(e) => onUpdate?.({ height: parseInt(e.target.value) })}
                min="1"
                max="20"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Widget Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm">
            <span className="text-gray-500">Type:</span> {widget.type}
          </div>
          <div className="text-sm">
            <span className="text-gray-500">Created:</span> {new Date(widget.createdAt).toLocaleDateString()}
          </div>
          <div className="text-sm">
            <span className="text-gray-500">Updated:</span> {new Date(widget.updatedAt).toLocaleDateString()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}