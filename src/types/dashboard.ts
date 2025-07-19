// Dashboard Builder Type Definitions

export interface Dashboard {
  id: string;
  userId: string;
  name: string;
  description?: string;
  layoutConfig: LayoutConfig;
  themeConfig: ThemeConfig;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LayoutConfig {
  cols: number;
  rowHeight: number;
  margin: [number, number];
  containerPadding: [number, number];
  breakpoints: {
    lg: number;
    md: number;
    sm: number;
    xs: number;
    xxs: number;
  };
  layouts: {
    lg: LayoutItem[];
    md: LayoutItem[];
    sm: LayoutItem[];
    xs: LayoutItem[];
    xxs: LayoutItem[];
  };
}

export interface LayoutItem {
  i: string; // widget id
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
  static?: boolean;
  isDraggable?: boolean;
  isResizable?: boolean;
}

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  borderRadius: number;
  spacing: number;
  fontFamily: string;
  fontSize: {
    small: string;
    medium: string;
    large: string;
    xlarge: string;
  };
}

export interface DataSource {
  id: string;
  userId: string;
  name: string;
  type: 'api' | 'csv' | 'json' | 'static' | 'database';
  connectionConfig: ConnectionConfig;
  schemaConfig: SchemaConfig;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConnectionConfig {
  url?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  params?: Record<string, string>;
  body?: any;
  refreshInterval?: number; // in minutes
  dataType?: 'sales' | 'users' | 'analytics' | 'custom';
}

export interface SchemaConfig {
  columns: ColumnSchema[];
  primaryKey?: string;
  relationships?: Relationship[];
}

export interface ColumnSchema {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
  nullable: boolean;
  description?: string;
  format?: string; // for dates, numbers, etc.
}

export interface Relationship {
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  targetTable: string;
  foreignKey: string;
  targetKey: string;
}

export interface Widget {
  id: string;
  dashboardId: string;
  userId: string;
  type: WidgetType;
  title: string;
  dataSourceId?: string;
  config: WidgetConfig;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  createdAt: string;
  updatedAt: string;
}

export type WidgetType = 
  | 'chart' 
  | 'table' 
  | 'metric' 
  | 'text' 
  | 'image' 
  | 'iframe' 
  | 'map' 
  | 'calendar' 
  | 'gauge' 
  | 'progress';

export interface WidgetConfig {
  // Chart specific
  chartType?: 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'scatter' | 'radar';
  xAxis?: string;
  yAxis?: string | string[];
  groupBy?: string;
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  
  // Table specific
  columns?: TableColumn[];
  pagination?: boolean;
  pageSize?: number;
  sortable?: boolean;
  filterable?: boolean;
  
  // Metric specific
  valueField?: string;
  format?: 'number' | 'currency' | 'percentage';
  prefix?: string;
  suffix?: string;
  
  // Text specific
  content?: string;
  markdown?: boolean;
  
  // Styling
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  padding?: number;
  
  // Data transformation
  filters?: DataFilter[];
  sort?: DataSort;
  limit?: number;
  
  // Refresh settings
  autoRefresh?: boolean;
  refreshInterval?: number; // in seconds
}

export interface TableColumn {
  key: string;
  title: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
  format?: string;
}

export interface DataFilter {
  column: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'greater_equal' | 'less_equal' | 'in' | 'not_in';
  value: any;
}

export interface DataSort {
  column: string;
  direction: 'asc' | 'desc';
}

export interface DashboardTemplate {
  id: string;
  userId: string;
  name: string;
  description?: string;
  templateConfig: TemplateConfig;
  isPublic: boolean;
  category: string;
  createdAt: string;
}

export interface TemplateConfig {
  dashboard: Omit<Dashboard, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;
  widgets: Omit<Widget, 'id' | 'dashboardId' | 'userId' | 'createdAt' | 'updatedAt'>[];
  dataSources: Omit<DataSource, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[];
}

// UI State Types
export interface DashboardBuilderState {
  currentDashboard: Dashboard | null;
  widgets: Widget[];
  dataSources: DataSource[];
  selectedWidget: Widget | null;
  isEditing: boolean;
  isDragging: boolean;
  showWidgetPalette: boolean;
  showDataSourcePanel: boolean;
  showPropertyPanel: boolean;
  previewMode: boolean;
}

export interface WidgetPaletteItem {
  type: WidgetType;
  name: string;
  description: string;
  icon: string;
  defaultConfig: Partial<WidgetConfig>;
  defaultSize: {
    w: number;
    h: number;
  };
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface DataResponse {
  data: any[];
  metadata: {
    rowCount: number;
    columns: string[];
    lastUpdated: string;
    isPreview?: boolean;
    limit?: number;
  };
}

export interface ValidationResponse {
  isValid: boolean;
  schema?: SchemaConfig;
  sampleData?: any[];
  error?: string;
  message?: string;
}

// Drag and Drop Types
export interface DragItem {
  type: 'widget' | 'new-widget';
  widgetType?: WidgetType;
  widgetId?: string;
  widget?: Widget;
}

// Export/Import Types
export interface ExportConfig {
  format: 'json' | 'pdf' | 'png' | 'csv';
  includeData: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface ImportConfig {
  type: 'dashboard' | 'template' | 'data';
  source: 'file' | 'url';
  data: any;
}