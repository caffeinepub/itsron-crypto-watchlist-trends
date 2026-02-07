import { useState } from 'react';
import { TrendingUp, TrendingDown, BarChart3, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useGetLiveMarketData } from '../hooks/useQueries';
import { parseCoinGeckoResponse, formatPrice, formatMarketCap } from '../utils/coinGeckoMarketData';
import CryptoDetailDialog from './CryptoDetailDialog';

interface CryptoCardProps {
  symbol: string;
}

function isCycleExhaustionError(error: unknown): boolean {
  if (!error) return false;
  const errorMessage = error instanceof Error ? error.message : String(error);
  return (
    errorMessage.includes('out of cycles') ||
    errorMessage.includes('IC0406') ||
    errorMessage.includes('IC0504') ||
    errorMessage.toLowerCase().includes('cycle')
  );
}

export default function CryptoCard({ symbol }: CryptoCardProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  
  const { data: rawResponse, isLoading, isError, error } = useGetLiveMarketData(symbol);

  // Parse the backend response
  const parsedResponse = rawResponse ? parseCoinGeckoResponse(rawResponse) : null;
  const marketData = parsedResponse?.success ? parsedResponse.data : null;

  const handleCardClick = () => {
    setDetailOpen(true);
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDetailOpen(true);
  };

  // Determine if this is a cycle exhaustion error
  const isCycleError = isError && isCycleExhaustionError(error);

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleCardClick}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl">{symbol}</CardTitle>
                {isLoading && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
              <CardDescription>Live market data from CoinGecko</CardDescription>
            </div>
            {marketData?.change24h !== undefined && (
              <Badge variant={marketData.change24h >= 0 ? 'default' : 'destructive'} className="gap-1">
                {marketData.change24h >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {Math.abs(marketData.change24h).toFixed(2)}%
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isCycleError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Backend Out of Cycles</AlertTitle>
              <AlertDescription className="text-sm">
                The backend canister has run out of cycles and cannot fetch live data. 
                Please contact an administrator to top up the canister cycles.
              </AlertDescription>
            </Alert>
          )}

          {isError && !isCycleError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Loading Data</AlertTitle>
              <AlertDescription className="text-sm">
                {error instanceof Error ? error.message : 'Failed to fetch live market data. Please try again later.'}
              </AlertDescription>
            </Alert>
          )}

          {!isError && parsedResponse && !parsedResponse.success && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Data Unavailable</AlertTitle>
              <AlertDescription className="text-sm">
                {parsedResponse.error}
              </AlertDescription>
            </Alert>
          )}

          {!isError && marketData && (
            <>
              <div>
                <p className="text-sm text-muted-foreground">Current Price</p>
                <p className="text-3xl font-bold">{formatPrice(marketData.price)}</p>
              </div>

              {marketData.marketCap !== undefined && (
                <div>
                  <p className="text-sm text-muted-foreground">Market Cap</p>
                  <p className="text-lg font-semibold">{formatMarketCap(marketData.marketCap)}</p>
                </div>
              )}
            </>
          )}

          {isLoading && (
            <div className="space-y-3">
              <div className="h-16 bg-muted animate-pulse rounded" />
              <div className="h-12 bg-muted animate-pulse rounded" />
            </div>
          )}

          <div className="pt-2 border-t">
            <Button className="w-full" variant="outline" onClick={handleButtonClick}>
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
