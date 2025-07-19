import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Database, 
  FileText, 
  Settings, 
  X,
  ChevronDown,
  Plus,
  Folder
} from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const [dashboardsOpen, setDashboardsOpen] = useState(true);

  const navigation = [
    {
      name: 'Dashboards',
      href: '/dashboards',
      icon: LayoutDashboard,
      current: location.pathname === '/dashboards',
      hasSubmenu: true,
      submenu: [
        { name: 'All Dashboards', href: '/dashboards' },
        { name: 'Recent', href: '/dashboards?filter=recent' },
        { name: 'Shared', href: '/dashboards?filter=shared' }
      ]
    },
    {
      name: 'Data Sources',
      href: '/data-sources',
      icon: Database,
      current: location.pathname === '/data-sources'
    },
    {
      name: 'Templates',
      href: '/templates',
      icon: FileText,
      current: location.pathname === '/templates'
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      current: location.pathname === '/settings'
    }
  ];

  // Mock recent dashboards - in real app, this would come from API
  const recentDashboards = [
    { id: '1', name: 'Sales Overview', updatedAt: '2 hours ago' },
    { id: '2', name: 'Marketing Analytics', updatedAt: '1 day ago' },
    { id: '3', name: 'User Metrics', updatedAt: '3 days ago' }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Mobile close button */}
          <div className="flex items-center justify-between p-4 lg:hidden">
            <span className="text-lg font-semibold text-gray-900">Menu</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => (
              <div key={item.name}>
                {item.hasSubmenu ? (
                  <Collapsible open={dashboardsOpen} onOpenChange={setDashboardsOpen}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-between text-left font-normal",
                          item.current && "bg-blue-50 text-blue-700"
                        )}
                      >
                        <div className="flex items-center">
                          <item.icon className="mr-3 h-5 w-5" />
                          {item.name}
                        </div>
                        <ChevronDown className={cn(
                          "h-4 w-4 transition-transform",
                          dashboardsOpen && "transform rotate-180"
                        )} />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1 mt-1">
                      {item.submenu?.map((subItem) => (
                        <NavLink
                          key={subItem.name}
                          to={subItem.href}
                          className={({ isActive }) => cn(
                            "block px-4 py-2 ml-8 text-sm rounded-md transition-colors",
                            isActive 
                              ? "bg-blue-50 text-blue-700" 
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          )}
                        >
                          {subItem.name}
                        </NavLink>
                      ))}
                      
                      {/* Quick create button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start ml-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        New Dashboard
                      </Button>
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <NavLink
                    to={item.href}
                    className={({ isActive }) => cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      isActive 
                        ? "bg-blue-50 text-blue-700" 
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </NavLink>
                )}
              </div>
            ))}
          </nav>

          {/* Recent Dashboards */}
          <div className="px-4 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900">Recent</h3>
              <Folder className="h-4 w-4 text-gray-400" />
            </div>
            <div className="space-y-1">
              {recentDashboards.map((dashboard) => (
                <NavLink
                  key={dashboard.id}
                  to={`/dashboard/${dashboard.id}`}
                  className="block px-2 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md transition-colors"
                >
                  <div className="truncate font-medium">{dashboard.name}</div>
                  <div className="text-xs text-gray-400">{dashboard.updatedAt}</div>
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}