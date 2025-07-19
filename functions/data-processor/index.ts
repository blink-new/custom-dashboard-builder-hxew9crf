import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// Data Processor - Handles data fetching, transformation, and caching
serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    // Extract JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const token = authHeader.substring(7);
    
    // Route handling
    if (path.startsWith('/fetch-data')) {
      return await handleDataFetch(req, token);
    } else if (path.startsWith('/transform-data')) {
      return await handleDataTransform(req, token);
    } else if (path.startsWith('/validate-source')) {
      return await handleSourceValidation(req, token);
    } else if (path.startsWith('/preview-data')) {
      return await handleDataPreview(req, token);
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });

  } catch (error) {
    console.error('Data Processor Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
});

// Helper function to verify JWT and extract user ID
async function verifyToken(token: string): Promise<string> {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || payload.user_id;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

// Fetch data from external sources
async function handleDataFetch(req: Request, token: string) {
  const userId = await verifyToken(token);
  const body = await req.json();
  
  const { dataSourceId, config } = body;
  
  try {
    let data;
    
    switch (config.type) {
      case 'api':
        data = await fetchApiData(config);
        break;
      case 'csv':
        data = await fetchCsvData(config);
        break;
      case 'json':
        data = await fetchJsonData(config);
        break;
      case 'static':
        data = await generateStaticData(config);
        break;
      default:
        throw new Error(`Unsupported data source type: ${config.type}`);
    }

    // Cache the data
    await cacheWidgetData(dataSourceId, data);

    return new Response(JSON.stringify({ 
      data,
      metadata: {
        rowCount: Array.isArray(data) ? data.length : 1,
        columns: Array.isArray(data) && data.length > 0 ? Object.keys(data[0]) : [],
        lastUpdated: new Date().toISOString()
      }
    }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });

  } catch (error) {
    console.error('Data fetch error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch data',
      details: error.message 
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}

// Transform data based on widget requirements
async function handleDataTransform(req: Request, token: string) {
  const userId = await verifyToken(token);
  const body = await req.json();
  
  const { data, transformConfig } = body;
  
  try {
    let transformedData = data;

    // Apply filters
    if (transformConfig.filters && transformConfig.filters.length > 0) {
      transformedData = applyFilters(transformedData, transformConfig.filters);
    }

    // Apply sorting
    if (transformConfig.sort) {
      transformedData = applySorting(transformedData, transformConfig.sort);
    }

    // Apply aggregations
    if (transformConfig.aggregations) {
      transformedData = applyAggregations(transformedData, transformConfig.aggregations);
    }

    // Apply grouping
    if (transformConfig.groupBy) {
      transformedData = applyGrouping(transformedData, transformConfig.groupBy);
    }

    // Apply pagination
    if (transformConfig.pagination) {
      transformedData = applyPagination(transformedData, transformConfig.pagination);
    }

    return new Response(JSON.stringify({ 
      data: transformedData,
      metadata: {
        originalRowCount: Array.isArray(data) ? data.length : 1,
        transformedRowCount: Array.isArray(transformedData) ? transformedData.length : 1,
        transformations: Object.keys(transformConfig)
      }
    }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });

  } catch (error) {
    console.error('Data transform error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to transform data',
      details: error.message 
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}

// Validate data source connection
async function handleSourceValidation(req: Request, token: string) {
  const userId = await verifyToken(token);
  const body = await req.json();
  
  const { config } = body;
  
  try {
    let isValid = false;
    let schema = null;
    let sampleData = null;

    switch (config.type) {
      case 'api': {
        const apiResult = await validateApiSource(config);
        isValid = apiResult.isValid;
        schema = apiResult.schema;
        sampleData = apiResult.sampleData;
        break;
      }
      case 'csv': {
        const csvResult = await validateCsvSource(config);
        isValid = csvResult.isValid;
        schema = csvResult.schema;
        sampleData = csvResult.sampleData;
        break;
      }
      case 'json': {
        const jsonResult = await validateJsonSource(config);
        isValid = jsonResult.isValid;
        schema = jsonResult.schema;
        sampleData = jsonResult.sampleData;
        break;
      }
      default:
        isValid = true;
        schema = { columns: [] };
        sampleData = [];
    }

    return new Response(JSON.stringify({ 
      isValid,
      schema,
      sampleData,
      message: isValid ? 'Data source is valid' : 'Data source validation failed'
    }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });

  } catch (error) {
    console.error('Source validation error:', error);
    return new Response(JSON.stringify({ 
      isValid: false,
      error: 'Failed to validate data source',
      details: error.message 
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}

// Preview data from source
async function handleDataPreview(req: Request, token: string) {
  const userId = await verifyToken(token);
  const body = await req.json();
  
  const { config, limit = 10 } = body;
  
  try {
    let previewData;
    
    switch (config.type) {
      case 'api':
        previewData = await fetchApiData(config, limit);
        break;
      case 'csv':
        previewData = await fetchCsvData(config, limit);
        break;
      case 'json':
        previewData = await fetchJsonData(config, limit);
        break;
      case 'static':
        previewData = await generateStaticData(config, limit);
        break;
      default:
        previewData = [];
    }

    return new Response(JSON.stringify({ 
      data: previewData,
      metadata: {
        rowCount: Array.isArray(previewData) ? previewData.length : 1,
        columns: Array.isArray(previewData) && previewData.length > 0 ? Object.keys(previewData[0]) : [],
        isPreview: true,
        limit
      }
    }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });

  } catch (error) {
    console.error('Data preview error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to preview data',
      details: error.message 
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}

// Data fetching implementations
async function fetchApiData(config: any, limit?: number) {
  const { url, method = 'GET', headers = {}, params = {} } = config;
  
  const queryParams = new URLSearchParams(params);
  const fullUrl = `${url}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  
  // Process headers to substitute environment variables
  const processedHeaders: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  
  // Process each header and substitute environment variables
  Object.entries(headers).forEach(([key, value]) => {
    if (typeof value === 'string' && value.includes('{{API_KEY}}')) {
      // Replace {{API_KEY}} with the actual environment variable
      const apiKey = Deno.env.get('API_KEY');
      if (apiKey) {
        processedHeaders[key] = value.replace('{{API_KEY}}', apiKey);
      } else {
        console.warn('API_KEY environment variable not found');
        processedHeaders[key] = value;
      }
    } else {
      processedHeaders[key] = value as string;
    }
  });
  
  console.log('Fetching from URL:', fullUrl);
  console.log('Using headers:', processedHeaders);
  
  const response = await fetch(fullUrl, {
    method,
    headers: processedHeaders
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('API request failed:', response.status, response.statusText, errorText);
    throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  console.log('API response data:', data);
  
  // If data is an array and limit is specified, slice it
  if (Array.isArray(data) && limit) {
    return data.slice(0, limit);
  }
  
  return data;
}

async function fetchCsvData(config: any, limit?: number) {
  const { url } = config;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`CSV fetch failed: ${response.status} ${response.statusText}`);
  }

  const csvText = await response.text();
  const lines = csvText.split('\n').filter(line => line.trim());
  
  if (lines.length === 0) {
    return [];
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const dataLines = limit ? lines.slice(1, limit + 1) : lines.slice(1);
  
  return dataLines.map(line => {
    const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    return row;
  });
}

async function fetchJsonData(config: any, limit?: number) {
  const { url } = config;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`JSON fetch failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  if (Array.isArray(data) && limit) {
    return data.slice(0, limit);
  }
  
  return data;
}

async function generateStaticData(config: any, limit?: number) {
  const { dataType = 'sales' } = config;
  const count = limit || 100;
  
  const data = [];
  
  for (let i = 0; i < count; i++) {
    switch (dataType) {
      case 'sales':
        data.push({
          id: i + 1,
          date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          product: ['Product A', 'Product B', 'Product C'][Math.floor(Math.random() * 3)],
          revenue: Math.floor(Math.random() * 10000) + 1000,
          quantity: Math.floor(Math.random() * 100) + 1,
          region: ['North', 'South', 'East', 'West'][Math.floor(Math.random() * 4)]
        });
        break;
      case 'users':
        data.push({
          id: i + 1,
          name: `User ${i + 1}`,
          email: `user${i + 1}@example.com`,
          signupDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: ['active', 'inactive'][Math.floor(Math.random() * 2)],
          plan: ['free', 'pro', 'enterprise'][Math.floor(Math.random() * 3)]
        });
        break;
      default:
        data.push({
          id: i + 1,
          value: Math.floor(Math.random() * 1000),
          category: `Category ${Math.floor(Math.random() * 5) + 1}`,
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
        });
    }
  }
  
  return data;
}

// Data transformation functions
function applyFilters(data: any[], filters: any[]) {
  return data.filter(row => {
    return filters.every(filter => {
      const { column, operator, value } = filter;
      const cellValue = row[column];
      
      switch (operator) {
        case 'equals':
          return cellValue === value;
        case 'not_equals':
          return cellValue !== value;
        case 'contains':
          return String(cellValue).toLowerCase().includes(String(value).toLowerCase());
        case 'greater_than':
          return Number(cellValue) > Number(value);
        case 'less_than':
          return Number(cellValue) < Number(value);
        case 'greater_equal':
          return Number(cellValue) >= Number(value);
        case 'less_equal':
          return Number(cellValue) <= Number(value);
        default:
          return true;
      }
    });
  });
}

function applySorting(data: any[], sort: any) {
  const { column, direction = 'asc' } = sort;
  
  return [...data].sort((a, b) => {
    const aVal = a[column];
    const bVal = b[column];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

function applyAggregations(data: any[], aggregations: any) {
  // Simple aggregation implementation
  const result: any = {};
  
  Object.entries(aggregations).forEach(([column, operation]) => {
    const values = data.map(row => Number(row[column])).filter(val => !isNaN(val));
    
    switch (operation) {
      case 'sum':
        result[`${column}_sum`] = values.reduce((sum, val) => sum + val, 0);
        break;
      case 'avg':
        result[`${column}_avg`] = values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
        break;
      case 'min':
        result[`${column}_min`] = values.length > 0 ? Math.min(...values) : 0;
        break;
      case 'max':
        result[`${column}_max`] = values.length > 0 ? Math.max(...values) : 0;
        break;
      case 'count':
        result[`${column}_count`] = values.length;
        break;
    }
  });
  
  return [result];
}

function applyGrouping(data: any[], groupBy: string) {
  const groups: any = {};
  
  data.forEach(row => {
    const groupKey = row[groupBy];
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(row);
  });
  
  return Object.entries(groups).map(([key, values]) => ({
    [groupBy]: key,
    items: values,
    count: (values as any[]).length
  }));
}

function applyPagination(data: any[], pagination: any) {
  const { page = 1, pageSize = 10 } = pagination;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  return data.slice(startIndex, endIndex);
}

// Validation functions
async function validateApiSource(config: any) {
  try {
    const sampleData = await fetchApiData(config, 5);
    const schema = inferSchema(sampleData);
    return { isValid: true, schema, sampleData };
  } catch (error) {
    return { isValid: false, schema: null, sampleData: null };
  }
}

async function validateCsvSource(config: any) {
  try {
    const sampleData = await fetchCsvData(config, 5);
    const schema = inferSchema(sampleData);
    return { isValid: true, schema, sampleData };
  } catch (error) {
    return { isValid: false, schema: null, sampleData: null };
  }
}

async function validateJsonSource(config: any) {
  try {
    const sampleData = await fetchJsonData(config, 5);
    const schema = inferSchema(sampleData);
    return { isValid: true, schema, sampleData };
  } catch (error) {
    return { isValid: false, schema: null, sampleData: null };
  }
}

function inferSchema(data: any[]) {
  if (!Array.isArray(data) || data.length === 0) {
    return { columns: [] };
  }
  
  const sample = data[0];
  const columns = Object.keys(sample).map(key => ({
    name: key,
    type: inferDataType(sample[key]),
    nullable: data.some(row => row[key] == null)
  }));
  
  return { columns };
}

function inferDataType(value: any): string {
  if (value == null) return 'string';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  if (value instanceof Date) return 'date';
  if (typeof value === 'string') {
    // Try to infer more specific types
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) return 'date';
    if (/^\d+$/.test(value)) return 'number';
    if (/^\d+\.\d+$/.test(value)) return 'number';
  }
  return 'string';
}

// Cache widget data
async function cacheWidgetData(widgetId: string, data: any) {
  // In a real implementation, this would save to the database
  // For now, we'll just log it
  console.log(`Caching data for widget ${widgetId}:`, data);
}