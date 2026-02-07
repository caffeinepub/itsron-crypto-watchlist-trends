import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Activity, Info } from 'lucide-react';

export default function WatchlistPriceTicks() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Live Price Ticks
        </CardTitle>
        <CardDescription>Real-time price updates for your watchlist</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert variant="default" className="border-blue-500/50 bg-blue-500/10">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertTitle className="text-blue-700 dark:text-blue-400">Coming Soon</AlertTitle>
          <AlertDescription className="text-sm">
            Real-time price tracking is not yet available. This feature will display live price updates for cryptocurrencies in your watchlist.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
