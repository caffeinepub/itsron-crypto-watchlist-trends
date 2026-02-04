import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useGetValidSymbols, useAddCryptoToWatchlist } from '../hooks/useQueries';
import { toast } from 'sonner';

export default function AddCryptoDialog() {
  const [open, setOpen] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('');

  const { data: validSymbols, isLoading: symbolsLoading } = useGetValidSymbols();
  const addMutation = useAddCryptoToWatchlist();

  const handleAdd = async () => {
    if (!selectedSymbol) {
      toast.error('Please select a cryptocurrency');
      return;
    }

    try {
      await addMutation.mutateAsync(selectedSymbol);
      toast.success(`${selectedSymbol} added to your watchlist`);
      setSelectedSymbol('');
      setOpen(false);
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to add cryptocurrency';
      toast.error(errorMessage);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSelectedSymbol('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Crypto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Cryptocurrency</DialogTitle>
          <DialogDescription>
            Select a cryptocurrency to add to your watchlist
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="crypto-select">Cryptocurrency</Label>
            {symbolsLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading symbols...
              </div>
            ) : (
              <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                <SelectTrigger id="crypto-select">
                  <SelectValue placeholder="Select a cryptocurrency" />
                </SelectTrigger>
                <SelectContent>
                  {validSymbols?.map(([displaySymbol, symbolPair]) => (
                    <SelectItem key={displaySymbol} value={displaySymbol}>
                      {displaySymbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={addMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleAdd}
            disabled={!selectedSymbol || addMutation.isPending || symbolsLoading}
          >
            {addMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              'Add to Watchlist'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
