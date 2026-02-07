import { useState, useEffect } from 'react';
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
  // Per-dialog-session forecast settings state
  const [movingAveragePeriod, setMovingAveragePeriod] = useState(7);
  const [forecastHorizon, setForecastHorizon] = useState(5);

  // Reset settings when dialog opens with a new symbol
  useEffect(() => {
    if (open) {
      setMovingAveragePeriod(7);
      setForecastHorizon(5);
    }
  }, [open, symbol]);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{symbol} Details</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="forecast" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="forecast">Analysis & Forecast</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="forecast" className="space-y-4 mt-4">
            <ForecastChart
              symbol={symbol}
              movingAveragePeriod={movingAveragePeriod}
              forecastHorizon={forecastHorizon}
            />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 mt-4">
            <ForecastSettingsPanel
              symbol={symbol}
              movingAveragePeriod={movingAveragePeriod}
              forecastHorizon={forecastHorizon}
              onMovingAveragePeriodChange={setMovingAveragePeriod}
              onForecastHorizonChange={setForecastHorizon}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
