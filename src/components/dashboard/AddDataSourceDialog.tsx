import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Globe, FileText, Database, TrendingUp, Upload } from 'lucide-react';
import { dashboardAPI, dataAPI } from '../../blink/client';
import { useToast } from '../../hooks/use-toast';
import { DataUploadDialog } from './DataUploadDialog';

interface AddDataSourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDataSourceAdded: () => void;
}

const COMMODITY_OPTIONS = [
  { value: 'gold', label: 'Gold Futures', description: 'Gold commodity prices' },
  { value: 'platinum', label: 'Platinum', description: 'Platinum commodity prices' },
  { value: 'lean_hogs', label: 'Lean Hogs Futures', description: 'Lean hogs commodity prices' },
  { value: 'oat', label: 'Oat Futures', description: 'Oat commodity prices' },
  { value: 'aluminum', label: 'Aluminum Futures', description: 'Aluminum commodity prices' },
  { value: 'soybean_meal', label: 'Soybean Meal Futures', description: 'Soybean meal commodity prices' },
  { value: 'lumber', label: 'Lumber Futures', description: 'Lumber commodity prices' },
  { value: 'feeder_cattle', label: 'Feeder Cattle Futures', description: 'Feeder cattle commodity prices' },
  { value: 'rough_rice', label: 'Rough Rice Futures', description: 'Rough rice commodity prices' },
  { value: 'palladium', label: 'Palladium', description: 'Palladium commodity prices' }
];

export function AddDataSourceDialog({ open, onOpenChange, onDataSourceAdded }: AddDataSourceDialogProps) {
  const [step, setStep] = useState<'type' | 'config' | 'preview'>('type');
  const [dataSourceType, setDataSourceType] = useState<string>('');
  const [name, setName] = useState('');
  const [selectedCommodity, setSelectedCommodity] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const { toast } = useToast();

  const resetDialog = () => {
    setStep('type');
    setDataSourceType('');
    setName('');
    setSelectedCommodity('');
    setPreviewData(null);
  };

  const handleTypeSelect = (type: string) => {
    setDataSourceType(type);
    if (type === 'commodity_api') {
      setName('Commodity Prices');
    }
    setStep('config');
  };

  const handlePreview = async () => {
    if (!selectedCommodity) {
      toast({
        title: "Error",
        description: "Please select a commodity",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const config = {
        type: 'api',
        url: `https://api.api-ninjas.com/v1/commodityprice?name=${selectedCommodity}`,
        method: 'GET',
        headers: {
          'X-Api-Key': '{{API_KEY}}'
        }
      };

      const response = await dataAPI.previewData(config, 1);
      if (response.data) {
        setPreviewData(response.data);
        setStep('preview');
      } else {
        throw new Error('No data received');
      }
    } catch (error) {
      console.error('Preview error:', error);
      toast({
        title: "Preview Failed",
        description: "Could not fetch commodity data. Please check your API key and try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      const commodityInfo = COMMODITY_OPTIONS.find(c => c.value === selectedCommodity);
      
      const dataSource = {
        name: `${commodityInfo?.label || selectedCommodity} - ${name}`,
        type: 'api',
        connectionConfig: {
          url: `https://api.api-ninjas.com/v1/commodityprice?name=${selectedCommodity}`,
          method: 'GET',
          headers: {
            'X-Api-Key': '{{API_KEY}}'
          },
          refreshInterval: 60, // 1 hour
          dataType: 'commodity'
        },
        schemaConfig: {
          columns: [
            { name: 'exchange', type: 'string', nullable: false, description: 'Exchange where commodity is traded' },
            { name: 'name', type: 'string', nullable: false, description: 'Commodity name' },
            { name: 'price', type: 'number', nullable: false, description: 'Current price in USD' },
            { name: 'updated', type: 'number', nullable: false, description: 'Unix timestamp of last update' }
          ]
        },
        isActive: true
      };

      const response = await dashboardAPI.createDataSource(dataSource);
      if (response.data) {
        toast({
          title: "Success",
          description: "Data source created successfully!"
        });
        onDataSourceAdded();
        onOpenChange(false);
        resetDialog();
      } else {
        throw new Error('Failed to create data source');
      }
    } catch (error) {
      console.error('Create error:', error);
      toast({
        title: "Error",
        description: "Failed to create data source. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderTypeSelection = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-200"
          onClick={() => handleTypeSelect('commodity_api')}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Commodity Price API</CardTitle>
                <CardDescription>Real-time commodity prices from API Ninjas</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Real-time</Badge>
              <Badge variant="secondary">Gold</Badge>
              <Badge variant="secondary">Platinum</Badge>
              <Badge variant="secondary">+8 more</Badge>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-green-200"
          onClick={() => {
            setShowUploadDialog(true);
            onOpenChange(false);
          }}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Upload className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg">CSV Upload</CardTitle>
                <CardDescription>Upload CSV files from your computer</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Spreadsheet Data</Badge>
              <Badge variant="secondary">Custom Schema</Badge>
              <Badge variant="secondary">Instant Import</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="opacity-50 cursor-not-allowed">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Globe className="h-5 w-5 text-gray-400" />
              </div>
              <div>
                <CardTitle className="text-lg text-gray-500">Custom API</CardTitle>
                <CardDescription>Connect to any REST API (Coming Soon)</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="opacity-50 cursor-not-allowed">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Database className="h-5 w-5 text-gray-400" />
              </div>
              <div>
                <CardTitle className="text-lg text-gray-500">Database</CardTitle>
                <CardDescription>Connect to SQL databases (Coming Soon)</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  );

  const renderConfiguration = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Data Source Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter a name for this data source"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="commodity">Select Commodity</Label>
        <Select value={selectedCommodity} onValueChange={setSelectedCommodity}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a commodity to track" />
          </SelectTrigger>
          <SelectContent>
            {COMMODITY_OPTIONS.map((commodity) => (
              <SelectItem key={commodity.value} value={commodity.value}>
                <div className="flex flex-col">
                  <span className="font-medium">{commodity.label}</span>
                  <span className="text-sm text-gray-500">{commodity.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">What you'll get:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Real-time commodity prices in USD</li>
          <li>• Exchange information (NYMEX, etc.)</li>
          <li>• Last updated timestamps</li>
          <li>• Automatic data refresh every hour</li>
        </ul>
      </div>
    </div>
  );

  const renderPreview = () => (
    <div className="space-y-6">
      <div className="bg-green-50 p-4 rounded-lg">
        <h4 className="font-medium text-green-900 mb-2">✅ Connection Successful!</h4>
        <p className="text-sm text-green-800">
          Successfully connected to the Commodity Price API. Here's a preview of your data:
        </p>
      </div>

      {previewData && previewData.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b">
            <h4 className="font-medium">Data Preview</h4>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Exchange</Label>
                <p className="text-lg font-semibold">{previewData[0].exchange}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Commodity</Label>
                <p className="text-lg font-semibold">{previewData[0].name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Current Price</Label>
                <p className="text-lg font-semibold text-green-600">${previewData[0].price}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Last Updated</Label>
                <p className="text-lg font-semibold">
                  {new Date(previewData[0].updated * 1000).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Ready to create charts!</h4>
        <p className="text-sm text-blue-800">
          Once created, you can use this data source to build price tracking charts, 
          trend analysis widgets, and real-time price displays.
        </p>
      </div>
    </div>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) resetDialog();
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {step === 'type' && 'Add Data Source'}
              {step === 'config' && 'Configure Commodity API'}
              {step === 'preview' && 'Preview & Create'}
            </DialogTitle>
            <DialogDescription>
              {step === 'type' && 'Choose the type of data source you want to connect'}
              {step === 'config' && 'Configure your commodity price data source'}
              {step === 'preview' && 'Review your data source configuration'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {step === 'type' && renderTypeSelection()}
            {step === 'config' && renderConfiguration()}
            {step === 'preview' && renderPreview()}
          </div>

          <DialogFooter>
            {step === 'config' && (
              <>
                <Button variant="outline" onClick={() => setStep('type')}>
                  Back
                </Button>
                <Button 
                  onClick={handlePreview} 
                  disabled={!selectedCommodity || !name || loading}
                >
                  {loading ? 'Testing Connection...' : 'Test & Preview'}
                </Button>
              </>
            )}
            {step === 'preview' && (
              <>
                <Button variant="outline" onClick={() => setStep('config')}>
                  Back
                </Button>
                <Button onClick={handleCreate} disabled={loading}>
                  {loading ? 'Creating...' : 'Create Data Source'}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DataUploadDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        onDataSourceCreated={() => {
          setShowUploadDialog(false);
          onDataSourceAdded();
        }}
      />
    </>
  );
}