import { useState } from 'react';
import { TrendingUp, TrendingDown, BarChart3, AlertCircle, Loader2, Info, UserPlus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useGetLiveMarketData, useRegisterSelfAsUser } from '../hooks/useQueries';
import CryptoDetailDialog from './CryptoDetailDialog';
import type { LiveMarketResponse } from '../backend';
import { toast } from 'sonner';

interface CryptoCardProps {
  symbol: string;
}

export default function CryptoCard({ symbol }: CryptoCardProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  
  const { data: liveData, isLoading: liveDataLoading, error: liveDataError, refetch } = useGetLiveMarketData(symbol);
  const registerMutation = useRegisterSelfAsUser();

  const typedLiveData = liveData as LiveMarketResponse | null | undefined;

  const currentPrice = typedLiveData?.price;
  const priceChange24h = typedLiveData?.change24h;
  const marketCap = typedLiveData?.marketCap;

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

  // Check if error is authorization-related
  const isUnauthorizedError = liveDataError && 
    (liveDataError.message?.includes('Unauthorized') || 
     liveDataError.message?.includes('Only users can access market data'));

  // Check if data is null (API failure or rate limit)
  const isApiFailure = !liveDataLoading && !liveDataError && liveData === null;

  const handleCardClick = () => {
    setDetailOpen(true);
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDetailOpen(true);
  };

  const handleRegisterFromCard = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await registerMutation.mutateAsync();
      toast.success('Successfully registered! Refreshing market data...');
      await refetch();
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to register';
      toast.error(`Registration failed: ${errorMessage}`);
    }
  };

  const handleRetry = async (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.info('Retrying...');
    await refetch();
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleCardClick}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl">{symbol}</CardTitle>
                {liveDataLoading && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
              <CardDescription>Live market data</CardDescription>
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
          {isUnauthorizedError ? (
            <Alert variant="default" className="border-amber-500/50 bg-amber-500/10">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <AlertTitle className="text-amber-700 dark:text-amber-400">Registration Required</AlertTitle>
              <AlertDescription className="text-sm space-y-3">
                <p>You must register as a user to access market data for {symbol}.</p>
                <Button
                  onClick={handleRegisterFromCard}
                  disabled={registerMutation.isPending}
                  size="sm"
                  variant="default"
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                >
                  {registerMutation.isPending ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Registering...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Register Now
                    </>
                  )}
                </Button>
              </AlertDescription>
            </Alert>
          ) : isApiFailure ? (
            <Alert variant="default" className="border-red-500/50 bg-red-500/10">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertTitle className="text-red-700 dark:text-red-400">API Error</AlertTitle>
              <AlertDescription className="text-sm space-y-3">
                <p>Unable to fetch live data for {symbol}. This may be due to API rate limits or network issues.</p>
                <Button
                  onClick={handleRetry}
                  size="sm"
                  variant="outline"
                  className="w-full"
                >
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          ) : liveDataError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription className="text-sm space-y-3">
                <p>{liveDataError.message || 'Failed to load market data'}</p>
                <Button
                  onClick={handleRetry}
                  size="sm"
                  variant="outline"
                  className="w-full"
                >
                  Retry
                </Button>
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

          {!isUnauthorizedError && (
            <div className="pt-2 border-t">
              <Button className="w-full" variant="outline" onClick={handleButtonClick}>
                <BarChart3 className="mr-2 h-4 w-4" />
                View Analysis & Forecast
              </Button>
            </div>
          )}
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
