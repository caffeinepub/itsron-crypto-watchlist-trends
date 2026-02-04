import { Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useGetWatchlist, useRemoveCryptoFromWatchlist } from '../hooks/useQueries';
import AddCryptoDialog from './AddCryptoDialog';
import { useState } from 'react';
import { toast } from 'sonner';

export default function WatchlistManager() {
  const { data: watchlist, isLoading, error } = useGetWatchlist();
  const removeMutation = useRemoveCryptoFromWatchlist();
  const [symbolToRemove, setSymbolToRemove] = useState<string | null>(null);

  const handleRemove = async () => {
    if (!symbolToRemove) return;

    try {
      await removeMutation.mutateAsync(symbolToRemove);
      toast.success(`${symbolToRemove} removed from watchlist`);
      setSymbolToRemove(null);
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to remove cryptocurrency';
      toast.error(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Watchlist</CardTitle>
          <CardDescription>Manage your cryptocurrency watchlist</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Watchlist</CardTitle>
          <CardDescription>Manage your cryptocurrency watchlist</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error.message || 'Failed to load watchlist'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
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
          {!watchlist || watchlist.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Your watchlist is empty. Add cryptocurrencies to get started.
              </p>
              <AddCryptoDialog />
            </div>
          ) : (
            <div className="space-y-2">
              {watchlist.map((symbol) => (
                <div
                  key={symbol}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="font-semibold text-lg">{symbol}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSymbolToRemove(symbol)}
                    disabled={removeMutation.isPending}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!symbolToRemove} onOpenChange={(open) => !open && setSymbolToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from Watchlist</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {symbolToRemove} from your watchlist?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removeMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              disabled={removeMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {removeMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                'Remove'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
