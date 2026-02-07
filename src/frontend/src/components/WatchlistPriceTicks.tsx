import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Activity, AlertCircle } from 'lucide-react';
import WatchlistPriceTickRow from './WatchlistPriceTickRow';
import type { CryptoSymbol } from '../backend';

interface WatchlistPriceTicksProps {
  symbols: CryptoSymbol[];
}

export default function WatchlistPriceTicks({ symbols }: WatchlistPriceTicksProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Live Price Ticks
        </CardTitle>
        <CardDescription>Real-time price updates for selected cryptocurrencies</CardDescription>
      </CardHeader>
      <CardContent>
        {symbols.length === 0 ? (
          <Alert variant="default" className="border-muted">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              No cryptocurrencies selected for live tracking.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-0">
            {symbols.map((symbol) => (
              <WatchlistPriceTickRow key={symbol} symbol={symbol} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
