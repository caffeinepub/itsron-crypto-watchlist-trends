import { useState } from 'react';
import { TrendingUp, TrendingDown, BarChart3, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useGetLiveMarketData } from '../hooks/useQueries';
import CryptoDetailDialog from './CryptoDetailDialog';

interface CryptoCardProps {
  symbol: string;
}

export default function CryptoCard({ symbol }: CryptoCardProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  
  const { data: liveData, isLoading: liveDataLoading } = useGetLiveMarketData(symbol);

  // Mock data for demonstration since backend is not yet implemented
  const mockPrice = 50000 + Math.random() * 10000;
  const mockChange = (Math.random() - 0.5) * 10;
  const mockMarketCap = 1000000000000 + Math.random() * 500000000000;

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

  const handleCardClick = () => {
    setDetailOpen(true);
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDetailOpen(true);
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
              <CardDescription>Demo data (backend pending)</CardDescription>
            </div>
            <Badge variant={mockChange >= 0 ? 'default' : 'destructive'} className="gap-1">
              {mockChange >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {Math.abs(mockChange).toFixed(2)}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="default" className="border-amber-500/50 bg-amber-500/10">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <AlertTitle className="text-amber-700 dark:text-amber-400">Demo Mode</AlertTitle>
            <AlertDescription className="text-sm">
              Backend crypto functionality is not yet implemented. Displaying mock data for demonstration.
            </AlertDescription>
          </Alert>

          <div>
            <p className="text-sm text-muted-foreground">Current Price</p>
            <p className="text-3xl font-bold">{formatPrice(mockPrice)}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Market Cap</p>
            <p className="text-lg font-semibold">{formatMarketCap(mockMarketCap)}</p>
          </div>

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
