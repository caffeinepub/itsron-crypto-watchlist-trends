import { AlertCircle } from 'lucide-react';
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
        <Alert variant="default" className="border-amber-500/50 bg-amber-500/10">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-700 dark:text-amber-400">Demo Mode</AlertTitle>
          <AlertDescription className="text-sm">
            Backend crypto functionality is not yet implemented. Watchlist features will be available once the backend is updated.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
