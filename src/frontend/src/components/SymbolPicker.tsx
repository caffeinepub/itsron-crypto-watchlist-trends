import { useState, useMemo } from 'react';
import { Search, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import type { CryptoSymbol } from '../backend';

interface SymbolPickerProps {
  symbols: CryptoSymbol[];
  onSelect: (symbol: CryptoSymbol) => void;
  disabled?: boolean;
}

export default function SymbolPicker({ symbols, onSelect, disabled = false }: SymbolPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter symbols based on search query (case-insensitive substring match)
  const filteredSymbols = useMemo(() => {
    if (!searchQuery.trim()) {
      return symbols;
    }
    const query = searchQuery.toLowerCase();
    return symbols.filter((symbol) => symbol.toLowerCase().includes(query));
  }, [symbols, searchQuery]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search symbols..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
          disabled={disabled}
        />
      </div>

      <ScrollArea className="h-[300px] rounded-md border">
        {filteredSymbols.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              No matching symbols found.
            </p>
            {searchQuery && (
              <p className="text-xs text-muted-foreground mt-1">
                Try a different search term.
              </p>
            )}
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredSymbols.map((symbol) => (
              <Button
                key={symbol}
                variant="ghost"
                className="w-full justify-start font-mono text-sm hover:bg-accent"
                onClick={() => onSelect(symbol)}
                disabled={disabled}
              >
                <TrendingUp className="h-4 w-4 mr-2 text-primary" />
                {symbol}
              </Button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
