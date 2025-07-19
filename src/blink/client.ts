import { createClient } from '@blinkdotnew/sdk';

// Initialize Blink client with project configuration
export const blink = createClient({
  projectId: 'custom-dashboard-builder-hxew9crf',
  authRequired: true
});

// Dashboard API endpoints
export const API_ENDPOINTS = {
  DASHBOARD_API: 'https://hxew9crf--dashboard-api.functions.blink.new',
  DATA_PROCESSOR: 'https://hxew9crf--data-processor.functions.blink.new'
};

// API helper functions
export const dashboardAPI = {
  // Dashboard operations
  async getDashboards() {
    const token = blink.auth.getToken();
    const response = await fetch(`${API_ENDPOINTS.DASHBOARD_API}/dashboards`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  async getDashboard(id: string) {
    const token = blink.auth.getToken();
    const response = await fetch(`${API_ENDPOINTS.DASHBOARD_API}/dashboards/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  async createDashboard(dashboard: any) {
    const token = blink.auth.getToken();
    const response = await fetch(`${API_ENDPOINTS.DASHBOARD_API}/dashboards`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dashboard)
    });
    return response.json();
  },

  async updateDashboard(id: string, dashboard: any) {
    const token = blink.auth.getToken();
    const response = await fetch(`${API_ENDPOINTS.DASHBOARD_API}/dashboards/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dashboard)
    });
    return response.json();
  },

  async deleteDashboard(id: string) {
    const token = blink.auth.getToken();
    const response = await fetch(`${API_ENDPOINTS.DASHBOARD_API}/dashboards/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Data source operations
  async getDataSources() {
    const token = blink.auth.getToken();
    const response = await fetch(`${API_ENDPOINTS.DASHBOARD_API}/data-sources`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  async createDataSource(dataSource: any) {
    const token = blink.auth.getToken();
    const response = await fetch(`${API_ENDPOINTS.DASHBOARD_API}/data-sources`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dataSource)
    });
    return response.json();
  },

  async updateDataSource(id: string, dataSource: any) {
    const token = blink.auth.getToken();
    const response = await fetch(`${API_ENDPOINTS.DASHBOARD_API}/data-sources/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dataSource)
    });
    return response.json();
  },

  async deleteDataSource(id: string) {
    const token = blink.auth.getToken();
    const response = await fetch(`${API_ENDPOINTS.DASHBOARD_API}/data-sources/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Widget operations
  async getWidgets(dashboardId?: string) {
    const token = blink.auth.getToken();
    const url = dashboardId 
      ? `${API_ENDPOINTS.DASHBOARD_API}/widgets?dashboardId=${dashboardId}`
      : `${API_ENDPOINTS.DASHBOARD_API}/widgets`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  async createWidget(widget: any) {
    const token = blink.auth.getToken();
    const response = await fetch(`${API_ENDPOINTS.DASHBOARD_API}/widgets`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(widget)
    });
    return response.json();
  },

  async updateWidget(id: string, widget: any) {
    const token = blink.auth.getToken();
    const response = await fetch(`${API_ENDPOINTS.DASHBOARD_API}/widgets/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(widget)
    });
    return response.json();
  },

  async deleteWidget(id: string) {
    const token = blink.auth.getToken();
    const response = await fetch(`${API_ENDPOINTS.DASHBOARD_API}/widgets/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Template operations
  async getTemplates() {
    const token = blink.auth.getToken();
    const response = await fetch(`${API_ENDPOINTS.DASHBOARD_API}/templates`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  async createTemplate(template: any) {
    const token = blink.auth.getToken();
    const response = await fetch(`${API_ENDPOINTS.DASHBOARD_API}/templates`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(template)
    });
    return response.json();
  }
};

// Data processor API
export const dataAPI = {
  async fetchData(dataSourceId: string, config: any) {
    const token = blink.auth.getToken();
    const response = await fetch(`${API_ENDPOINTS.DATA_PROCESSOR}/fetch-data`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ dataSourceId, config })
    });
    return response.json();
  },

  async transformData(data: any, transformConfig: any) {
    const token = blink.auth.getToken();
    const response = await fetch(`${API_ENDPOINTS.DATA_PROCESSOR}/transform-data`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data, transformConfig })
    });
    return response.json();
  },

  async validateSource(config: any) {
    const token = blink.auth.getToken();
    const response = await fetch(`${API_ENDPOINTS.DATA_PROCESSOR}/validate-source`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ config })
    });
    return response.json();
  },

  async previewData(config: any, limit = 10) {
    const token = blink.auth.getToken();
    const response = await fetch(`${API_ENDPOINTS.DATA_PROCESSOR}/preview-data`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ config, limit })
    });
    return response.json();
  },

  // New data management functions
  async importData(dataSourceId: string, data: any[], schema?: any) {
    const token = blink.auth.getToken();
    const response = await fetch(`${API_ENDPOINTS.DASHBOARD_API}/data/import`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ dataSourceId, data, schema })
    });
    return response.json();
  },

  async getDataSourceData(dataSourceId: string) {
    const token = blink.auth.getToken();
    const response = await fetch(`${API_ENDPOINTS.DASHBOARD_API}/data/fetch/${dataSourceId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  async updateDataSourceRow(dataSourceId: string, rowIndex: number, rowData: any) {
    const token = blink.auth.getToken();
    const response = await fetch(`${API_ENDPOINTS.DASHBOARD_API}/data/update/${dataSourceId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ rowIndex, rowData })
    });
    return response.json();
  },

  async clearDataSourceData(dataSourceId: string) {
    const token = blink.auth.getToken();
    const response = await fetch(`${API_ENDPOINTS.DASHBOARD_API}/data/clear/${dataSourceId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  async fetchFilteredData(dataSourceId: string, options: { filters?: any[], limit?: number, offset?: number } = {}) {
    const token = blink.auth.getToken();
    const response = await fetch(`${API_ENDPOINTS.DASHBOARD_API}/data/fetch/${dataSourceId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(options)
    });
    return response.json();
  }
};