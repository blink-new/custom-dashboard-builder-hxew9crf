import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// Initialize database connection
const DB_URL = Deno.env.get('DATABASE_URL') || 'file:./dashboard.db';

// Database helper functions
async function executeQuery(query: string, params: any[] = []) {
  try {
    const response = await fetch('https://hxew9crf-zf7023des557.deno.dev', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, params })
    });
    return await response.json();
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Dashboard API - Main handler for all dashboard operations
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
    if (path.startsWith('/dashboards')) {
      return await handleDashboards(req, method, path, token);
    } else if (path.startsWith('/data-sources')) {
      return await handleDataSources(req, method, path, token);
    } else if (path.startsWith('/widgets')) {
      return await handleWidgets(req, method, path, token);
    } else if (path.startsWith('/templates')) {
      return await handleTemplates(req, method, path, token);
    } else if (path.startsWith('/data')) {
      return await handleData(req, method, path, token);
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });

  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
});

// In-memory storage for demo purposes (replace with actual database)
const storage = {
  dataSources: new Map(),
  dashboards: new Map(),
  widgets: new Map(),
  templates: new Map()
};

// Dashboard operations
async function handleDashboards(req: Request, method: string, path: string, token: string) {
  const url = new URL(req.url);
  const dashboardId = path.split('/')[2];

  switch (method) {
    case 'GET':
      if (dashboardId) {
        return await getDashboard(dashboardId, token);
      } else {
        return await getDashboards(token);
      }
    case 'POST':
      return await createDashboard(req, token);
    case 'PUT':
      return await updateDashboard(dashboardId, req, token);
    case 'DELETE':
      return await deleteDashboard(dashboardId, token);
    default:
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
  }
}

// Data source operations
async function handleDataSources(req: Request, method: string, path: string, token: string) {
  const dataSourceId = path.split('/')[2];

  switch (method) {
    case 'GET':
      if (dataSourceId) {
        return await getDataSource(dataSourceId, token);
      } else {
        return await getDataSources(token);
      }
    case 'POST':
      return await createDataSource(req, token);
    case 'PUT':
      return await updateDataSource(dataSourceId, req, token);
    case 'DELETE':
      return await deleteDataSource(dataSourceId, token);
    default:
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
  }
}

// Widget operations
async function handleWidgets(req: Request, method: string, path: string, token: string) {
  const widgetId = path.split('/')[2];

  switch (method) {
    case 'GET':
      if (widgetId) {
        return await getWidget(widgetId, token);
      } else {
        const url = new URL(req.url);
        const dashboardId = url.searchParams.get('dashboardId');
        return await getWidgets(dashboardId, token);
      }
    case 'POST':
      return await createWidget(req, token);
    case 'PUT':
      return await updateWidget(widgetId, req, token);
    case 'DELETE':
      return await deleteWidget(widgetId, token);
    default:
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
  }
}

// Template operations
async function handleTemplates(req: Request, method: string, path: string, token: string) {
  const templateId = path.split('/')[2];

  switch (method) {
    case 'GET':
      if (templateId) {
        return await getTemplate(templateId, token);
      } else {
        return await getTemplates(token);
      }
    case 'POST':
      return await createTemplate(req, token);
    case 'DELETE':
      return await deleteTemplate(templateId, token);
    default:
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
  }
}

// Data operations
async function handleData(req: Request, method: string, path: string, token: string) {
  const pathParts = path.split('/');
  const operation = pathParts[2]; // 'import', 'fetch', etc.
  const dataSourceId = pathParts[3];

  switch (method) {
    case 'POST':
      if (operation === 'import') {
        return await importData(req, token);
      } else if (operation === 'fetch' && dataSourceId) {
        return await fetchDataSourceData(dataSourceId, req, token);
      }
      break;
    case 'GET':
      if (operation === 'fetch' && dataSourceId) {
        return await getDataSourceData(dataSourceId, token);
      }
      break;
    case 'PUT':
      if (operation === 'update' && dataSourceId) {
        return await updateDataSourceData(dataSourceId, req, token);
      }
      break;
    case 'DELETE':
      if (operation === 'clear' && dataSourceId) {
        return await clearDataSourceData(dataSourceId, token);
      }
      break;
    default:
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
  }

  return new Response(JSON.stringify({ error: 'Invalid data operation' }), {
    status: 400,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

// Helper function to verify JWT and extract user ID
async function verifyToken(token: string): Promise<string> {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || payload.user_id;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

// Dashboard CRUD operations
async function getDashboards(token: string) {
  const userId = await verifyToken(token);
  
  const dashboards = Array.from(storage.dashboards.values())
    .filter((d: any) => d.userId === userId);

  return new Response(JSON.stringify({ data: dashboards }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

async function getDashboard(dashboardId: string, token: string) {
  const userId = await verifyToken(token);
  
  const dashboard = storage.dashboards.get(dashboardId);
  if (!dashboard || dashboard.userId !== userId) {
    return new Response(JSON.stringify({ error: 'Dashboard not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  return new Response(JSON.stringify({ data: dashboard }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

async function createDashboard(req: Request, token: string) {
  const userId = await verifyToken(token);
  const body = await req.json();
  
  const dashboardId = `dash_${Date.now()}`;
  const now = new Date().toISOString();
  
  const dashboard = {
    id: dashboardId,
    userId,
    name: body.name,
    description: body.description || '',
    layoutConfig: body.layoutConfig || {},
    themeConfig: body.themeConfig || {},
    isPublic: body.isPublic || false,
    createdAt: now,
    updatedAt: now
  };

  storage.dashboards.set(dashboardId, dashboard);

  return new Response(JSON.stringify({ data: dashboard }), {
    status: 201,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

async function updateDashboard(dashboardId: string, req: Request, token: string) {
  const userId = await verifyToken(token);
  const body = await req.json();
  
  const dashboard = storage.dashboards.get(dashboardId);
  if (!dashboard || dashboard.userId !== userId) {
    return new Response(JSON.stringify({ error: 'Dashboard not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  const updatedDashboard = {
    ...dashboard,
    ...body,
    id: dashboardId,
    userId,
    updatedAt: new Date().toISOString()
  };

  storage.dashboards.set(dashboardId, updatedDashboard);

  return new Response(JSON.stringify({ data: updatedDashboard }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

async function deleteDashboard(dashboardId: string, token: string) {
  const userId = await verifyToken(token);
  
  const dashboard = storage.dashboards.get(dashboardId);
  if (!dashboard || dashboard.userId !== userId) {
    return new Response(JSON.stringify({ error: 'Dashboard not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  storage.dashboards.delete(dashboardId);

  return new Response(JSON.stringify({ message: 'Dashboard deleted successfully' }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

// Data Source CRUD operations
async function getDataSources(token: string) {
  const userId = await verifyToken(token);
  
  try {
    const result = await executeQuery(
      'SELECT * FROM data_sources WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    
    const dataSources = result.data?.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      name: row.name,
      type: row.type,
      connectionConfig: row.connection_config ? JSON.parse(row.connection_config) : {},
      schemaConfig: row.schema_config ? JSON.parse(row.schema_config) : {},
      isActive: Boolean(row.is_active),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    })) || [];

    return new Response(JSON.stringify({ data: dataSources }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (error) {
    console.error('Error fetching data sources:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch data sources' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}

async function getDataSource(dataSourceId: string, token: string) {
  const userId = await verifyToken(token);
  
  const dataSource = storage.dataSources.get(dataSourceId);
  if (!dataSource || dataSource.userId !== userId) {
    return new Response(JSON.stringify({ error: 'Data source not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  return new Response(JSON.stringify({ data: dataSource }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

async function createDataSource(req: Request, token: string) {
  const userId = await verifyToken(token);
  const body = await req.json();
  
  const dataSourceId = `ds_${Date.now()}`;
  const now = new Date().toISOString();
  
  try {
    await executeQuery(
      `INSERT INTO data_sources (id, user_id, name, type, connection_config, schema_config, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        dataSourceId,
        userId,
        body.name,
        body.type,
        JSON.stringify(body.connectionConfig || {}),
        JSON.stringify(body.schemaConfig || {}),
        body.isActive !== false ? 1 : 0,
        now,
        now
      ]
    );

    const dataSource = {
      id: dataSourceId,
      userId,
      name: body.name,
      type: body.type,
      connectionConfig: body.connectionConfig || {},
      schemaConfig: body.schemaConfig || {},
      isActive: body.isActive !== false,
      createdAt: now,
      updatedAt: now
    };

    return new Response(JSON.stringify({ data: dataSource }), {
      status: 201,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (error) {
    console.error('Error creating data source:', error);
    return new Response(JSON.stringify({ error: 'Failed to create data source' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}

async function updateDataSource(dataSourceId: string, req: Request, token: string) {
  const userId = await verifyToken(token);
  const body = await req.json();
  
  const dataSource = storage.dataSources.get(dataSourceId);
  if (!dataSource || dataSource.userId !== userId) {
    return new Response(JSON.stringify({ error: 'Data source not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  const updatedDataSource = {
    ...dataSource,
    ...body,
    id: dataSourceId,
    userId,
    updatedAt: new Date().toISOString()
  };

  storage.dataSources.set(dataSourceId, updatedDataSource);

  return new Response(JSON.stringify({ data: updatedDataSource }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

async function deleteDataSource(dataSourceId: string, token: string) {
  const userId = await verifyToken(token);
  
  const dataSource = storage.dataSources.get(dataSourceId);
  if (!dataSource || dataSource.userId !== userId) {
    return new Response(JSON.stringify({ error: 'Data source not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  storage.dataSources.delete(dataSourceId);

  return new Response(JSON.stringify({ message: 'Data source deleted successfully' }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

// Widget CRUD operations
async function getWidgets(dashboardId: string | null, token: string) {
  const userId = await verifyToken(token);
  
  let widgets = Array.from(storage.widgets.values())
    .filter((w: any) => w.userId === userId);

  if (dashboardId) {
    widgets = widgets.filter((w: any) => w.dashboardId === dashboardId);
  }

  return new Response(JSON.stringify({ data: widgets }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

async function getWidget(widgetId: string, token: string) {
  const userId = await verifyToken(token);
  
  const widget = storage.widgets.get(widgetId);
  if (!widget || widget.userId !== userId) {
    return new Response(JSON.stringify({ error: 'Widget not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  return new Response(JSON.stringify({ data: widget }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

async function createWidget(req: Request, token: string) {
  const userId = await verifyToken(token);
  const body = await req.json();
  
  const widgetId = `widget_${Date.now()}`;
  const now = new Date().toISOString();
  
  const widget = {
    id: widgetId,
    dashboardId: body.dashboardId,
    userId,
    type: body.type,
    title: body.title,
    dataSourceId: body.dataSourceId || null,
    config: body.config || {},
    positionX: body.positionX || 0,
    positionY: body.positionY || 0,
    width: body.width || 4,
    height: body.height || 4,
    createdAt: now,
    updatedAt: now
  };

  storage.widgets.set(widgetId, widget);

  return new Response(JSON.stringify({ data: widget }), {
    status: 201,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

async function updateWidget(widgetId: string, req: Request, token: string) {
  const userId = await verifyToken(token);
  const body = await req.json();
  
  const widget = storage.widgets.get(widgetId);
  if (!widget || widget.userId !== userId) {
    return new Response(JSON.stringify({ error: 'Widget not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  const updatedWidget = {
    ...widget,
    ...body,
    id: widgetId,
    userId,
    updatedAt: new Date().toISOString()
  };

  storage.widgets.set(widgetId, updatedWidget);

  return new Response(JSON.stringify({ data: updatedWidget }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

async function deleteWidget(widgetId: string, token: string) {
  const userId = await verifyToken(token);
  
  const widget = storage.widgets.get(widgetId);
  if (!widget || widget.userId !== userId) {
    return new Response(JSON.stringify({ error: 'Widget not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  storage.widgets.delete(widgetId);

  return new Response(JSON.stringify({ message: 'Widget deleted successfully' }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

// Template operations
async function getTemplates(token: string) {
  const userId = await verifyToken(token);
  
  const templates = Array.from(storage.templates.values())
    .filter((t: any) => t.userId === userId || t.isPublic);

  return new Response(JSON.stringify({ data: templates }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

async function getTemplate(templateId: string, token: string) {
  const userId = await verifyToken(token);
  
  const template = storage.templates.get(templateId);
  if (!template || (template.userId !== userId && !template.isPublic)) {
    return new Response(JSON.stringify({ error: 'Template not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  return new Response(JSON.stringify({ data: template }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

async function createTemplate(req: Request, token: string) {
  const userId = await verifyToken(token);
  const body = await req.json();
  
  const templateId = `template_${Date.now()}`;
  const now = new Date().toISOString();
  
  const template = {
    id: templateId,
    userId,
    name: body.name,
    description: body.description || '',
    templateConfig: body.templateConfig || {},
    isPublic: body.isPublic || false,
    category: body.category || 'custom',
    createdAt: now
  };

  storage.templates.set(templateId, template);

  return new Response(JSON.stringify({ data: template }), {
    status: 201,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

async function deleteTemplate(templateId: string, token: string) {
  const userId = await verifyToken(token);
  
  const template = storage.templates.get(templateId);
  if (!template || template.userId !== userId) {
    return new Response(JSON.stringify({ error: 'Template not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  storage.templates.delete(templateId);

  return new Response(JSON.stringify({ message: 'Template deleted successfully' }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

// Data management functions
async function importData(req: Request, token: string) {
  const userId = await verifyToken(token);
  const body = await req.json();
  
  try {
    const { dataSourceId, data, schema } = body;
    
    // Verify data source belongs to user
    const dsResult = await executeQuery(
      'SELECT id FROM data_sources WHERE id = ? AND user_id = ?',
      [dataSourceId, userId]
    );
    
    if (!dsResult.data || dsResult.data.length === 0) {
      return new Response(JSON.stringify({ error: 'Data source not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Clear existing data
    await executeQuery(
      'DELETE FROM data_source_data WHERE data_source_id = ? AND user_id = ?',
      [dataSourceId, userId]
    );

    // Insert new data
    const insertPromises = data.map((row: any, index: number) => {
      const rowId = `row_${dataSourceId}_${Date.now()}_${index}`;
      return executeQuery(
        'INSERT INTO data_source_data (id, data_source_id, user_id, row_data, row_index) VALUES (?, ?, ?, ?, ?)',
        [rowId, dataSourceId, userId, JSON.stringify(row), index]
      );
    });

    await Promise.all(insertPromises);

    // Update schema if provided
    if (schema) {
      await executeQuery(
        'UPDATE data_sources SET schema_config = ?, updated_at = ? WHERE id = ? AND user_id = ?',
        [JSON.stringify(schema), new Date().toISOString(), dataSourceId, userId]
      );
    }

    return new Response(JSON.stringify({ 
      data: { 
        message: 'Data imported successfully', 
        rowCount: data.length,
        dataSourceId 
      } 
    }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (error) {
    console.error('Error importing data:', error);
    return new Response(JSON.stringify({ error: 'Failed to import data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}

async function getDataSourceData(dataSourceId: string, token: string) {
  const userId = await verifyToken(token);
  
  try {
    // Verify data source belongs to user
    const dsResult = await executeQuery(
      'SELECT * FROM data_sources WHERE id = ? AND user_id = ?',
      [dataSourceId, userId]
    );
    
    if (!dsResult.data || dsResult.data.length === 0) {
      return new Response(JSON.stringify({ error: 'Data source not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const dataSource = dsResult.data[0];

    // Get data
    const dataResult = await executeQuery(
      'SELECT row_data, row_index FROM data_source_data WHERE data_source_id = ? AND user_id = ? ORDER BY row_index',
      [dataSourceId, userId]
    );

    const data = dataResult.data?.map((row: any) => JSON.parse(row.row_data)) || [];
    const schema = dataSource.schema_config ? JSON.parse(dataSource.schema_config) : null;

    return new Response(JSON.stringify({ 
      data: {
        rows: data,
        schema: schema,
        metadata: {
          rowCount: data.length,
          dataSourceId: dataSourceId,
          lastUpdated: dataSource.updated_at
        }
      }
    }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (error) {
    console.error('Error fetching data source data:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}

async function updateDataSourceData(dataSourceId: string, req: Request, token: string) {
  const userId = await verifyToken(token);
  const body = await req.json();
  
  try {
    const { rowIndex, rowData } = body;
    
    // Verify data source belongs to user
    const dsResult = await executeQuery(
      'SELECT id FROM data_sources WHERE id = ? AND user_id = ?',
      [dataSourceId, userId]
    );
    
    if (!dsResult.data || dsResult.data.length === 0) {
      return new Response(JSON.stringify({ error: 'Data source not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Update the specific row
    await executeQuery(
      'UPDATE data_source_data SET row_data = ? WHERE data_source_id = ? AND user_id = ? AND row_index = ?',
      [JSON.stringify(rowData), dataSourceId, userId, rowIndex]
    );

    // Update data source timestamp
    await executeQuery(
      'UPDATE data_sources SET updated_at = ? WHERE id = ? AND user_id = ?',
      [new Date().toISOString(), dataSourceId, userId]
    );

    return new Response(JSON.stringify({ 
      data: { message: 'Row updated successfully' } 
    }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (error) {
    console.error('Error updating data source data:', error);
    return new Response(JSON.stringify({ error: 'Failed to update data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}

async function clearDataSourceData(dataSourceId: string, token: string) {
  const userId = await verifyToken(token);
  
  try {
    // Verify data source belongs to user
    const dsResult = await executeQuery(
      'SELECT id FROM data_sources WHERE id = ? AND user_id = ?',
      [dataSourceId, userId]
    );
    
    if (!dsResult.data || dsResult.data.length === 0) {
      return new Response(JSON.stringify({ error: 'Data source not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Clear all data
    await executeQuery(
      'DELETE FROM data_source_data WHERE data_source_id = ? AND user_id = ?',
      [dataSourceId, userId]
    );

    // Update data source timestamp
    await executeQuery(
      'UPDATE data_sources SET updated_at = ? WHERE id = ? AND user_id = ?',
      [new Date().toISOString(), dataSourceId, userId]
    );

    return new Response(JSON.stringify({ 
      data: { message: 'Data cleared successfully' } 
    }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (error) {
    console.error('Error clearing data source data:', error);
    return new Response(JSON.stringify({ error: 'Failed to clear data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}

async function fetchDataSourceData(dataSourceId: string, req: Request, token: string) {
  const userId = await verifyToken(token);
  const body = await req.json();
  
  try {
    const { filters, limit, offset } = body;
    
    // Verify data source belongs to user
    const dsResult = await executeQuery(
      'SELECT * FROM data_sources WHERE id = ? AND user_id = ?',
      [dataSourceId, userId]
    );
    
    if (!dsResult.data || dsResult.data.length === 0) {
      return new Response(JSON.stringify({ error: 'Data source not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Build query with filters
    let query = 'SELECT row_data, row_index FROM data_source_data WHERE data_source_id = ? AND user_id = ?';
    const params = [dataSourceId, userId];

    // Add ordering
    query += ' ORDER BY row_index';

    // Add pagination
    if (limit) {
      query += ' LIMIT ?';
      params.push(limit);
      
      if (offset) {
        query += ' OFFSET ?';
        params.push(offset);
      }
    }

    const dataResult = await executeQuery(query, params);
    const data = dataResult.data?.map((row: any) => JSON.parse(row.row_data)) || [];

    // Apply client-side filters if provided
    let filteredData = data;
    if (filters && filters.length > 0) {
      filteredData = data.filter((row: any) => {
        return filters.every((filter: any) => {
          const value = row[filter.column];
          switch (filter.operator) {
            case 'equals':
              return value === filter.value;
            case 'contains':
              return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
            case 'greater_than':
              return Number(value) > Number(filter.value);
            case 'less_than':
              return Number(value) < Number(filter.value);
            default:
              return true;
          }
        });
      });
    }

    return new Response(JSON.stringify({ 
      data: {
        rows: filteredData,
        metadata: {
          totalRows: data.length,
          filteredRows: filteredData.length,
          hasMore: limit && data.length === limit
        }
      }
    }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (error) {
    console.error('Error fetching filtered data:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}