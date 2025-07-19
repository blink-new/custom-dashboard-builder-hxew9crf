import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { blink } from './blink/client';
import { DashboardBuilder } from './pages/DashboardBuilder';
import { DashboardView } from './pages/DashboardView';
import { DashboardEditor } from './components/dashboard/DashboardEditor';
import { DataSources } from './pages/DataSources';
import { Templates } from './pages/Templates';
import { Settings } from './pages/Settings';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { Toaster } from 'react-hot-toast';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user);
      setLoading(state.isLoading);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Custom Dashboard Builder
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Create beautiful, interactive dashboards with drag-and-drop simplicity
          </p>
          <button
            onClick={() => blink.auth.login()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg transition-colors"
          >
            Sign In to Get Started
          </button>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" />
        
        {/* Header */}
        <Header 
          user={user} 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <Routes>
          {/* Full-screen dashboard editor */}
          <Route path="/dashboard/:id" element={<DashboardEditor />} />
          
          {/* Regular layout for other pages */}
          <Route path="*" element={
            <div className="flex">
              {/* Sidebar */}
              <Sidebar 
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
              />
              
              {/* Main Content */}
              <main className={`flex-1 transition-all duration-300 ${
                sidebarOpen ? 'lg:ml-64' : 'ml-0'
              }`}>
                <div className="p-6">
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboards" replace />} />
                    <Route path="/dashboards" element={<DashboardBuilder />} />
                    <Route path="/dashboard/:id/view" element={<DashboardView />} />
                    <Route path="/data-sources" element={<DataSources />} />
                    <Route path="/templates" element={<Templates />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                </div>
              </main>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;