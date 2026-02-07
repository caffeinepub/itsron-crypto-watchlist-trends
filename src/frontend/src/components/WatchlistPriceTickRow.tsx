import { useGetLiveMarketData } from '@/hooks/useQueries';
import { parseCoinGeckoResponse, formatPrice } from '@/utils/coinGeckoMarketData';
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import type { CryptoSymbol } from '../backend';

interface WatchlistPriceTickRowProps {
  symbol: CryptoSymbol;
}

export default function WatchlistPriceTickRow({ symbol }: WatchlistPriceTickRowProps) {
  const { data, isLoading, error } = useGetLiveMarketData(symbol);

  // Parse the response
  const parsed = data ? parseCoinGeckoResponse(data) : null;

  // Determine if this is a cycle exhaustion error
  const isCycleError = error?.message?.toLowerCase().includes('cycles') ||
                       error?.message?.includes('IC0406') ||
                       error?.message?.includes('IC0504') ||
                       parsed?.error?.toLowerCase().includes('cycles');

  return (
    <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <span className="text-sm font-bold text-primary">{symbol}</span>
        </div>
        <div>
          <div className="font-semibold">{symbol}</div>
          <div className="text-xs text-muted-foreground">
            {symbol === 'BTC' && 'Bitcoin'}
            {symbol === 'ETH' && 'Ethereum'}
            {symbol === 'XRP' && 'Ripple'}
          </div>
        </div>
      </div>

      <div className="text-right">
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading...</span>
          </div>
        ) : error || !parsed?.success ? (
          <div className="text-xs text-destructive">
            {isCycleError ? 'Service unavailable' : 'Error loading'}
          </div>
        ) : parsed.data ? (
          <div className="space-y-1">
            <div className="text-lg font-bold">
              {formatPrice(parsed.data.price)}
            </div>
            {parsed.data.change24h !== undefined && (
              <div className={`flex items-center gap-1 text-xs ${
                parsed.data.change24h >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {parsed.data.change24h >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>{Math.abs(parsed.data.change24h).toFixed(2)}%</span>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
