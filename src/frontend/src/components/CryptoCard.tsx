import { useState } from 'react';
import { TrendingUp, TrendingDown, BarChart3, AlertCircle, Loader2, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useGetLiveMarketData } from '../hooks/useQueries';
import CryptoDetailDialog from './CryptoDetailDialog';

interface CryptoCardProps {
  symbol: string;
}

export default function CryptoCard({ symbol }: CryptoCardProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const { data: liveData, isLoading: liveDataLoading, error: liveDataError } = useGetLiveMarketData(symbol);

  const currentPrice = liveData?.price;
  const priceChange24h = liveData?.change24h;
  const marketCap = liveData?.marketCap;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: price < 1 ? 6 : 2,
    }).format(price);
  };

  const formatMarketCap = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toFixed(0)}`;
  };

  // Check if data is null (backend integration pending)
  const isDataUnavailable = !liveDataLoading && !liveDataError && liveData === null;

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setDetailOpen(true)}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl">{symbol}</CardTitle>
                {liveDataLoading && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
              <CardDescription>Live market data from CoinGecko API</CardDescription>
            </div>
            {liveDataLoading ? (
              <Skeleton className="h-6 w-16" />
            ) : priceChange24h !== undefined && (
              <Badge variant={priceChange24h >= 0 ? 'default' : 'destructive'} className="gap-1">
                {priceChange24h >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {Math.abs(priceChange24h).toFixed(2)}%
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isDataUnavailable ? (
            <Alert variant="default" className="border-amber-500/50 bg-amber-500/10">
              <Info className="h-4 w-4 text-amber-500" />
              <AlertTitle className="text-amber-700 dark:text-amber-400">Backend CoinGecko Integration Required</AlertTitle>
              <AlertDescription className="text-sm">
                <div className="space-y-1">
                  <p>Live data for <strong>{symbol}</strong> requires backend implementation.</p>
                  <p className="text-xs text-muted-foreground">
                    Backend needs HTTP outcalls to CoinGecko's simple/price endpoint with JSON parsing to extract:
                  </p>
                  <ul className="text-xs text-muted-foreground list-disc list-inside ml-2 space-y-0.5">
                    <li><strong>Price:</strong> Parse current price from API response</li>
                    <li><strong>24h Change:</strong> Extract from price change percentage field</li>
                    <li><strong>Market Cap:</strong> Get from market cap data field</li>
                  </ul>
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-2">
                    Example: CoinGecko GET /api/v3/simple/price endpoint
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          ) : liveDataError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {liveDataError.message || 'Failed to load market data'}
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div>
                <p className="text-sm text-muted-foreground">Current Price</p>
                {liveDataLoading ? (
                  <Skeleton className="h-10 w-32 mt-1" />
                ) : currentPrice ? (
                  <p className="text-3xl font-bold">{formatPrice(currentPrice)}</p>
                ) : (
                  <p className="text-3xl font-bold text-muted-foreground">N/A</p>
                )}
              </div>

              {liveDataLoading ? (
                <div>
                  <p className="text-sm text-muted-foreground">Market Cap</p>
                  <Skeleton className="h-7 w-24 mt-1" />
                </div>
              ) : marketCap && marketCap > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">Market Cap</p>
                  <p className="text-lg font-semibold">{formatMarketCap(marketCap)}</p>
                </div>
              )}
            </>
          )}

          <div className="pt-2 border-t">
            <Button className="w-full" variant="outline" onClick={(e) => {
              e.stopPropagation();
              setDetailOpen(true);
            }}>
              <BarChart3 className="mr-2 h-4 w-4" />
              View Analysis & Forecast
            </Button>
          </div>
        </CardContent>
      </Card>

      <CryptoDetailDialog
        symbol={symbol}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </>
  );
}
