import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface CreateDashboardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
}

export function CreateDashboardDialog({ open, onOpenChange, onSubmit }: CreateDashboardDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: false,
    template: 'blank'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const dashboardData = {
        name: formData.name,
        description: formData.description,
        isPublic: formData.isPublic,
        layoutConfig: getDefaultLayoutConfig(),
        themeConfig: getDefaultThemeConfig()
      };
      
      await onSubmit(dashboardData);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        isPublic: false,
        template: 'blank'
      });
    } catch (error) {
      console.error('Failed to create dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultLayoutConfig = () => {
    return {
      cols: 12,
      rowHeight: 60,
      margin: [16, 16],
      containerPadding: [16, 16],
      breakpoints: {
        lg: 1200,
        md: 996,
        sm: 768,
        xs: 480,
        xxs: 0
      },
      layouts: {
        lg: [],
        md: [],
        sm: [],
        xs: [],
        xxs: []
      }
    };
  };

  const getDefaultThemeConfig = () => {
    return {
      primaryColor: '#2563EB',
      secondaryColor: '#F59E0B',
      backgroundColor: '#FFFFFF',
      textColor: '#1F2937',
      borderColor: '#E5E7EB',
      borderRadius: 8,
      spacing: 16,
      fontFamily: 'Inter',
      fontSize: {
        small: '0.875rem',
        medium: '1rem',
        large: '1.125rem',
        xlarge: '1.25rem'
      }
    };
  };

  const templates = [
    {
      id: 'blank',
      name: 'Blank Dashboard',
      description: 'Start with an empty canvas'
    },
    {
      id: 'sales',
      name: 'Sales Dashboard',
      description: 'Pre-built sales analytics layout'
    },
    {
      id: 'marketing',
      name: 'Marketing Dashboard',
      description: 'Marketing metrics and KPIs'
    },
    {
      id: 'analytics',
      name: 'Web Analytics',
      description: 'Website traffic and user behavior'
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Dashboard</DialogTitle>
          <DialogDescription>
            Set up your new dashboard with a name, description, and template.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Dashboard Name</Label>
              <Input
                id="name"
                placeholder="Enter dashboard name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe what this dashboard will show"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="template">Template</Label>
              <Select
                value={formData.template}
                onValueChange={(value) => setFormData(prev => ({ ...prev, template: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-sm text-gray-500">{template.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="public">Make Public</Label>
                <div className="text-sm text-gray-500">
                  Allow others to view this dashboard
                </div>
              </div>
              <Switch
                id="public"
                checked={formData.isPublic}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.name.trim()}>
              {loading ? 'Creating...' : 'Create Dashboard'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}