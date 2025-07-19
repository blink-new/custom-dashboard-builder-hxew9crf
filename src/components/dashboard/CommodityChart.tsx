import { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { dataAPI } from '../../blink/client';
import { DataSource } from '../../types/dashboard';

interface CommodityChartProps {
  dataSource: DataSource;
  title?: string;
  chartType?: 'line' | 'bar';
  height?: number;
}

export function CommodityChart({ 
  dataSource, 
  title = 'Commodity Price', 
  chartType = 'line',
  height = 300 
}: CommodityChartProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Prepare the config with the type field that the data-processor expects
      const config = {
        ...dataSource.connectionConfig,
        type: dataSource.type // Add the type field from the dataSource
      };
      
      const response = await dataAPI.fetchData(dataSource.id, config);
      
      if (response.data) {
        // Handle both single object and array responses
        const rawData = Array.isArray(response.data) ? response.data : [response.data];
        
        if (rawData.length > 0 && rawData[0]) {
          // Transform the data for chart display
          const transformedData = rawData.map((item: any, index: number) => ({
            id: index,
            name: item.name || 'Commodity',
            price: parseFloat(item.price) || 0,
            exchange: item.exchange || 'Unknown',
            updated: item.updated ? new Date(item.updated * 1000).toLocaleString() : 'Unknown',
            timestamp: item.updated || Date.now() / 1000
          }));
          
          setData(transformedData);
          setLastUpdated(new Date());
        } else {
          setError('No data available');
        }
      } else {
        setError('No data available');
      }
    } catch (err) {
      console.error('Failed to fetch commodity data:', err);
      setError('Failed to fetch data. Please check your API configuration.');
    } finally {
      setLoading(false);
    }
  }, [dataSource.id, dataSource.connectionConfig, dataSource.type]);

  useEffect(() => {
    fetchData();
    
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchData]);

  const currentPrice = data.length > 0 ? data[0].price : 0;
  const commodityName = data.length > 0 ? data[0].name : 'Commodity';
  const exchange = data.length > 0 ? data[0].exchange : 'Unknown';

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Loading {title}...</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse space-y-4 w-full">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-red-600">{title} - Error</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 mb-4">Unable to load commodity data</p>
              <Button onClick={fetchData} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <span>{commodityName} Price</span>
              <Badge variant="secondary">{exchange}</Badge>
            </CardTitle>
            <CardDescription>
              Real-time commodity pricing data
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current Price Display */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold text-green-600">
                ${currentPrice.toLocaleString()}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {lastUpdated?.toLocaleTimeString() || 'Unknown'}
            </div>
          </div>

          {/* Chart */}
          <div style={{ height: height }}>
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    formatter={(value: any) => [`$${value}`, 'Price']}
                    labelFormatter={(label) => `Commodity: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#2563EB" 
                    strokeWidth={2}
                    dot={{ fill: '#2563EB', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#2563EB', strokeWidth: 2 }}
                  />
                </LineChart>
              ) : (
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    formatter={(value: any) => [`$${value}`, 'Price']}
                    labelFormatter={(label) => `Commodity: ${label}`}
                  />
                  <Bar 
                    dataKey="price" 
                    fill="#2563EB"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Data Details */}
          {data.length > 0 && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm font-medium text-gray-600">Exchange</p>
                <p className="text-lg font-semibold">{exchange}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Last Update</p>
                <p className="text-lg font-semibold">
                  {data[0].updated}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}