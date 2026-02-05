import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Activity, AlertCircle } from 'lucide-react';

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
        <Alert variant="default" className="border-amber-500/50 bg-amber-500/10">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-700 dark:text-amber-400">Demo Mode</AlertTitle>
          <AlertDescription className="text-sm">
            Backend crypto functionality is not yet implemented. Live price ticks will be available once the backend is updated.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
