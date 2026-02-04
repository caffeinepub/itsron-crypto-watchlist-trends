import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useGetLiveMarketData } from '../hooks/useQueries';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Loader2, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { LiveMarketResponse } from '../backend';

interface ForecastChartProps {
  symbol: string;
  movingAveragePeriod?: number;
  forecastHorizon?: number;
}

interface ChartDataPoint {
  timestamp: number;
  date: string;
  actual?: number;
  predicted?: number;
  movingAverage?: number;
  exponentialSmoothing?: number;
  currentPrice?: number;
}

interface HistoricalDataPoint {
  timestamp: number;
  price: number;
}

export default function ForecastChart({ 
  symbol, 
  movingAveragePeriod = 7,
  forecastHorizon = 5 
}: ForecastChartProps) {
  const { data: liveData, isLoading: liveDataLoading } = useGetLiveMarketData(symbol);

  // Explicitly type the data to avoid inference issues
  const typedLiveData = liveData as LiveMarketResponse | null | undefined;

  // Generate mock historical data for demonstration
  const historicalData = useMemo(() => {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const basePrice = 50000; // Base price for demonstration
    const data: HistoricalDataPoint[] = [];
    
    for (let i = 30; i >= 0; i--) {
      const timestamp = now - i * dayMs;
      // Generate somewhat realistic price movement
      const randomWalk = Math.sin(i / 5) * 5000 + (Math.random() - 0.5) * 2000;
      const price = basePrice + randomWalk;
      data.push({
        timestamp,
        price,
      });
    }
    
    return data;
  }, []);

  const { chartData, stats } = useMemo(() => {
    if (!historicalData || historicalData.length === 0) {
      return { chartData: [], stats: null };
    }

    const prices = historicalData.map((point) => ({
      timestamp: point.timestamp,
      price: point.price,
    }));

    const n = prices.length;
    const timestamps = prices.map((_, i) => i);
    const priceValues = prices.map(p => p.price);

    // Calculate linear regression
    const sumX = timestamps.reduce((a, b) => a + b, 0);
    const sumY = priceValues.reduce((a, b) => a + b, 0);
    const sumXY = timestamps.reduce((sum, x, i) => sum + x * priceValues[i], 0);
    const sumXX = timestamps.reduce((sum, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate moving average with configurable period
    const movingAverages = priceValues.map((_, i) => {
      if (i < movingAveragePeriod - 1) return null;
      let sum = 0;
      for (let j = 0; j < movingAveragePeriod; j++) {
        sum += priceValues[i - j];
      }
      return sum / movingAveragePeriod;
    });

    // Calculate exponential smoothing (alpha = 0.3)
    const alpha = 0.3;
    const exponentialSmoothing: (number | null)[] = [priceValues[0]];
    for (let i = 1; i < priceValues.length; i++) {
      exponentialSmoothing[i] = alpha * priceValues[i] + (1 - alpha) * exponentialSmoothing[i - 1]!;
    }

    // Create chart data with actual values
    const data: ChartDataPoint[] = prices.map((entry, i) => ({
      timestamp: entry.timestamp,
      date: new Date(entry.timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      actual: entry.price,
      predicted: slope * i + intercept,
      movingAverage: movingAverages[i] || undefined,
      exponentialSmoothing: exponentialSmoothing[i] || undefined,
    }));

    // Add future predictions based on forecastHorizon
    const lastTimestamp = prices[prices.length - 1].timestamp;
    const avgTimeDiff = prices.length > 1
      ? (prices[prices.length - 1].timestamp - prices[0].timestamp) / (prices.length - 1)
      : 86400000; // Default to 1 day

    // Get last values for each method
    const lastMA = movingAverages[movingAverages.length - 1] || priceValues[priceValues.length - 1];
    const lastES = exponentialSmoothing[exponentialSmoothing.length - 1] || priceValues[priceValues.length - 1];

    for (let i = 1; i <= forecastHorizon; i++) {
      const futureTimestamp = lastTimestamp + avgTimeDiff * i;
      const futurePoint: ChartDataPoint = {
        timestamp: futureTimestamp,
        date: new Date(futureTimestamp).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        predicted: slope * (n - 1 + i) + intercept,
      };

      // For moving average, use the last calculated value (flat projection)
      futurePoint.movingAverage = lastMA;

      // For exponential smoothing, continue the smoothing with last actual price
      futurePoint.exponentialSmoothing = lastES;

      data.push(futurePoint);
    }

    // Add current live price as reference
    if (typedLiveData?.price && typedLiveData.price > 0) {
      data[data.length - 1].currentPrice = typedLiveData.price;
    }

    // Calculate statistics
    const lastActual = priceValues[priceValues.length - 1];
    const futurePredicted = slope * (n + forecastHorizon - 1) + intercept;
    const predictedChange = ((futurePredicted - lastActual) / lastActual) * 100;

    return {
      chartData: data,
      stats: {
        slope,
        intercept,
        lastActual,
        futurePredicted,
        predictedChange,
        r2: calculateR2(priceValues, timestamps.map(i => slope * i + intercept)),
        dataPoints: n,
      },
    };
  }, [historicalData, typedLiveData, movingAveragePeriod, forecastHorizon]);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: value < 1 ? 6 : 2,
    }).format(value);
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    // Find the first available price value
    const actualData = payload.find((p: any) => p.dataKey === 'actual');
    const predictedData = payload.find((p: any) => p.dataKey === 'predicted');
    const maData = payload.find((p: any) => p.dataKey === 'movingAverage');
    
    // Calculate percentage change from the first actual price in the dataset
    const firstActualPrice = chartData.find(d => d.actual)?.actual || 0;
    const currentPrice = actualData?.value || predictedData?.value || maData?.value || 0;
    const percentChange = firstActualPrice > 0 
      ? ((currentPrice - firstActualPrice) / firstActualPrice) * 100 
      : 0;

    return (
      <div className="rounded-lg border bg-popover p-3 shadow-lg">
        <p className="font-semibold text-sm mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            entry.value != null && (
              <div key={index} className="flex items-center justify-between gap-4 text-xs">
                <span style={{ color: entry.color }}>{entry.name}:</span>
                <span className="font-mono font-semibold">{formatPrice(entry.value)}</span>
              </div>
            )
          ))}
          <div className="pt-2 mt-2 border-t border-border">
            <div className="flex items-center justify-between gap-4 text-xs">
              <span className="text-muted-foreground">Predicted % Change:</span>
              <span className={`font-mono font-semibold ${percentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {percentChange >= 0 ? '+' : ''}{percentChange.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (liveDataLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Forecast Chart</CardTitle>
          <CardDescription>Loading data...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (historicalData.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Forecast Chart</CardTitle>
          <CardDescription>Need more data</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="default" className="border-amber-500/50 bg-amber-500/10">
            <Info className="h-4 w-4 text-amber-500" />
            <AlertTitle className="text-amber-700 dark:text-amber-400">Demo Data</AlertTitle>
            <AlertDescription className="text-sm">
              This chart displays demonstration data. Historical price data from CoinGecko API will be integrated in the backend.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CardTitle>Statistical Forecast</CardTitle>
              </div>
              <CardDescription>
                Linear regression analysis based on {stats!.dataPoints} days of demonstration data
              </CardDescription>
            </div>
            <Badge variant="outline">Linear Regression</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Current (Last Data Point)</p>
              <p className="text-2xl font-bold">{formatPrice(stats!.lastActual)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Predicted ({forecastHorizon} periods ahead)</p>
              <p className="text-2xl font-bold">{formatPrice(stats!.futurePredicted)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Predicted Change</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">{stats!.predictedChange.toFixed(2)}%</p>
                <Badge variant={stats!.predictedChange >= 0 ? 'default' : 'destructive'}>
                  {stats!.predictedChange >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                </Badge>
              </div>
            </div>
          </div>

          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.05} />
                <XAxis
                  dataKey="date"
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(value) => `$${value.toFixed(2)}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="oklch(0.75 0.25 145)"
                  strokeWidth={2}
                  dot={false}
                  name="Historical Price"
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="oklch(0.65 0.25 240)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Linear Regression"
                />
                <Line
                  type="monotone"
                  dataKey="movingAverage"
                  stroke="oklch(0.70 0.20 50)"
                  strokeWidth={2}
                  dot={false}
                  name={`Moving Average (${movingAveragePeriod})`}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="exponentialSmoothing"
                  stroke="hsl(var(--chart-4))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Exponential Smoothing"
                  connectNulls
                />
                {typedLiveData?.price && typedLiveData.price > 0 && (
                  <ReferenceLine
                    y={typedLiveData.price}
                    stroke="hsl(var(--chart-5))"
                    strokeDasharray="3 3"
                    label={{ value: 'Live Price', position: 'right', fill: 'hsl(var(--chart-5))' }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-muted/50 space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold text-sm">Analysis Details</h4>
            </div>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Forecast Method:</span>
                <span className="font-mono">Linear Regression</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Regression Slope:</span>
                <span className="font-mono">{stats!.slope.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">R² (Goodness of Fit):</span>
                <span className="font-mono">{stats!.r2.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Historical Data Points:</span>
                <span className="font-mono">{stats!.dataPoints} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Moving Average Period:</span>
                <span className="font-mono">{movingAveragePeriod} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Forecast Horizon:</span>
                <span className="font-mono">{forecastHorizon} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data Source:</span>
                <span className="font-mono text-xs">Demo (CoinGecko API pending)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function calculateR2(actual: number[], predicted: number[]): number {
  const mean = actual.reduce((a, b) => a + b, 0) / actual.length;
  const ssTotal = actual.reduce((sum, y) => sum + Math.pow(y - mean, 2), 0);
  const ssResidual = actual.reduce((sum, y, i) => sum + Math.pow(y - predicted[i], 2), 0);
  return 1 - ssResidual / ssTotal;
}
