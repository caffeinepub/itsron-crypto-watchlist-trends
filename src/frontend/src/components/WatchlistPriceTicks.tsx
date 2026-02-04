import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, TrendingDown, AlertCircle, Activity } from 'lucide-react';
import { useGetWatchlist, useGetLiveMarketData } from '../hooks/useQueries';

function PriceTickRow({ symbol }: { symbol: string }) {
  const { data: marketData, isLoading, error } = useGetLiveMarketData(symbol);

  if (isLoading) {
    return (
      <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-8 w-24" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-between p-3 rounded-lg border bg-card border-destructive/50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <div className="font-semibold text-sm">{symbol}</div>
            <div className="text-xs text-destructive">Data unavailable</div>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">—</span>
      </div>
    );
  }

  if (!marketData) {
    return (
      <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
            <span className="text-xs font-bold text-muted-foreground">{symbol.slice(0, 2)}</span>
          </div>
          <div>
            <div className="font-semibold text-sm">{symbol}</div>
            <div className="text-xs text-muted-foreground">No data</div>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">—</span>
      </div>
    );
  }

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: value < 1 ? 6 : 2,
    }).format(value);
  };

  const isPositive = marketData.change24h >= 0;

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Activity className="h-5 w-5 text-primary" />
        </div>
        <div>
          <div className="font-semibold text-sm">{symbol}</div>
          <div className="text-xs text-muted-foreground">Live Price</div>
        </div>
      </div>
      <div className="text-right space-y-1">
        <div className="font-mono font-bold text-sm">{formatPrice(marketData.price)}</div>
        <Badge 
          variant={isPositive ? 'default' : 'destructive'}
          className="text-xs h-5"
        >
          {isPositive ? (
            <TrendingUp className="h-3 w-3 mr-1" />
          ) : (
            <TrendingDown className="h-3 w-3 mr-1" />
          )}
          {isPositive ? '+' : ''}{marketData.change24h.toFixed(2)}%
        </Badge>
      </div>
    </div>
  );
}

export default function WatchlistPriceTicks() {
  const { data: watchlist, isLoading, error } = useGetWatchlist();

  if (isLoading) {
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
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
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
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load watchlist. Please try again.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!watchlist || watchlist.length === 0) {
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
          <div className="text-center py-8">
            <Activity className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground text-sm">
              Add cryptocurrencies to your watchlist to see live price ticks here.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Live Price Ticks
        </CardTitle>
        <CardDescription>
          Real-time price updates • Auto-refreshes every minute
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {watchlist.map((symbol) => (
            <PriceTickRow key={symbol} symbol={symbol} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
