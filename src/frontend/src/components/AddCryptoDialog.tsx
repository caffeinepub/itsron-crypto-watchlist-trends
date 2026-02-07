import { useState } from 'react';
import { Plus, AlertCircle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useGetValidSymbols, useAddCryptoToWatchlist } from '../hooks/useQueries';
import SymbolPicker from './SymbolPicker';
import type { CryptoSymbol } from '../backend';
import { toast } from 'sonner';

export default function AddCryptoDialog() {
  const [open, setOpen] = useState(false);
  
  const { data: validSymbols, isLoading: symbolsLoading, error: symbolsError } = useGetValidSymbols();
  const addMutation = useAddCryptoToWatchlist();

  const handleSelectSymbol = async (symbol: CryptoSymbol) => {
    try {
      await addMutation.mutateAsync(symbol);
      toast.success(`${symbol} added to watchlist`);
      setOpen(false);
    } catch (error: any) {
      // Check if it's a duplicate error
      if (error.message?.includes('already in watchlist')) {
        toast.info(`${symbol} is already in your watchlist`);
      } else {
        toast.error(error.message || 'Failed to add cryptocurrency');
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Crypto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Cryptocurrency</DialogTitle>
          <DialogDescription>
            Select a cryptocurrency to add to your watchlist
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {symbolsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-sm text-muted-foreground">Loading symbols...</span>
            </div>
          ) : symbolsError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Loading Symbols</AlertTitle>
              <AlertDescription className="text-sm">
                {symbolsError.message || 'Failed to load available cryptocurrencies. Please try again.'}
              </AlertDescription>
            </Alert>
          ) : validSymbols && validSymbols.length > 0 ? (
            <SymbolPicker
              symbols={validSymbols}
              onSelect={handleSelectSymbol}
              disabled={addMutation.isPending}
            />
          ) : (
            <Alert variant="default" className="border-muted">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                No cryptocurrencies available at this time.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
