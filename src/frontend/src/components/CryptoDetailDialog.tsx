import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ForecastChart from './ForecastChart';
import ForecastSettingsPanel from './ForecastSettingsPanel';

interface CryptoDetailDialogProps {
  symbol: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CryptoDetailDialog({ symbol, open, onOpenChange }: CryptoDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{symbol} Analysis</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="chart" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chart">Forecast Chart</TabsTrigger>
            <TabsTrigger value="settings">Forecast Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="chart" className="space-y-4">
            <ForecastChart symbol={symbol} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <ForecastSettingsPanel symbol={symbol} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
