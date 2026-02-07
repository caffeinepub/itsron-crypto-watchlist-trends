import { Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import AddCryptoDialog from './AddCryptoDialog';

export default function WatchlistManager() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>My Watchlist</CardTitle>
            <CardDescription>Manage your cryptocurrency watchlist</CardDescription>
          </div>
          <AddCryptoDialog />
        </div>
      </CardHeader>
      <CardContent>
        <Alert variant="default" className="border-blue-500/50 bg-blue-500/10">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertTitle className="text-blue-700 dark:text-blue-400">Coming Soon</AlertTitle>
          <AlertDescription className="text-sm">
            Watchlist functionality is not yet available. This feature will allow you to track your favorite cryptocurrencies.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
