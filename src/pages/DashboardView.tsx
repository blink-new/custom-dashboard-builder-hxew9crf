import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { dashboardAPI } from '../blink/client';
import { Dashboard } from '../types/dashboard';
import { LoadingScreen } from '../components/ui/LoadingScreen';

export function DashboardView() {
  const { id } = useParams<{ id: string }>();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadDashboard(id);
    }
  }, [id]);

  const loadDashboard = async (dashboardId: string) => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getDashboard(dashboardId);
      if (response.data) {
        setDashboard(response.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!dashboard) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard Not Found</h2>
        <p className="text-gray-600">The dashboard you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{dashboard.name}</h1>
          {dashboard.description && (
            <p className="text-gray-600">{dashboard.description}</p>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Dashboard Editor Coming Soon
          </h3>
          <p className="text-gray-600">
            The drag-and-drop dashboard editor will be implemented next.
          </p>
        </div>
      </div>
    </div>
  );
}