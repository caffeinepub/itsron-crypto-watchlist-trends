import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface ForecastSettingsPanelProps {
  symbol: string;
}

export default function ForecastSettingsPanel({ symbol }: ForecastSettingsPanelProps) {
  const forecastMethods = [
    {
      name: 'Linear Regression',
      description: 'Fits a straight line through historical data points to predict future trends. Best for assets with steady, consistent price movements.',
      formula: 'y = mx + b',
      useCase: 'Long-term trend analysis',
    },
    {
      name: 'Moving Average',
      description: 'Smooths price data by averaging recent values to identify trends. Reduces noise and highlights the overall direction.',
      formula: 'MA = (P₁ + P₂ + ... + Pₙ) / n',
      useCase: 'Short to medium-term trends',
    },
    {
      name: 'Exponential Smoothing',
      description: 'Weights recent data more heavily to capture current market momentum. Responds quickly to price changes while maintaining smoothness.',
      formula: 'Sₜ = αPₜ + (1-α)Sₜ₋₁',
      useCase: 'Volatile markets, recent trends',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Forecast Methods</CardTitle>
        <CardDescription>
          Understanding the statistical methods used to analyze {symbol}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert variant="default" className="border-blue-500/50 bg-blue-500/10">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertTitle className="text-blue-700 dark:text-blue-400">Multiple Forecast Methods Available</AlertTitle>
          <AlertDescription className="text-sm">
            The forecast chart displays all three methods simultaneously, allowing you to compare different statistical approaches. Each method has strengths depending on market conditions and your analysis timeframe.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          {forecastMethods.map((method, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <Label className="text-base font-semibold">{method.name}</Label>
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-mono">
                    {method.formula}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{method.description}</p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs font-medium text-muted-foreground">Best for:</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-muted">{method.useCase}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>How to Use</AlertTitle>
          <AlertDescription className="text-sm space-y-1">
            <p>All forecast methods are displayed on the chart with different line styles:</p>
            <ul className="list-disc list-inside ml-2 space-y-0.5 mt-2">
              <li><strong>Solid line:</strong> Historical actual prices</li>
              <li><strong>Dashed lines:</strong> Forecast predictions from each method</li>
              <li><strong>Reference line:</strong> Current live price from Kraken</li>
            </ul>
            <p className="mt-2">Compare the methods to understand different perspectives on {symbol}'s potential price movement.</p>
          </AlertDescription>
        </Alert>

        <div className="pt-4 border-t">
          <h4 className="text-sm font-semibold mb-2">Data Requirements</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• <strong>Minimum data points:</strong> 2 days of historical data</p>
            <p>• <strong>Recommended:</strong> 30+ days for accurate trend analysis</p>
            <p>• <strong>Data source:</strong> Kraken OHLC endpoint (daily candles)</p>
            <p>• <strong>Update frequency:</strong> Real-time with 1-minute refresh</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
