import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetHistoricalPriceData } from '../hooks/useQueries';
import { parseCoinGeckoHistoricalResponse, type HistoricalDataPoint } from '../utils/coinGeckoHistoricalData';

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
}

export default function ForecastChart({ 
  symbol, 
  movingAveragePeriod = 7,
  forecastHorizon = 5 
}: ForecastChartProps) {
  // Fetch historical data from backend (30 days)
  const { data: historicalResponseText, isLoading, error, isFetched } = useGetHistoricalPriceData(symbol, 30);

  // Parse the historical data response
  const parsedHistoricalData = useMemo(() => {
    if (!historicalResponseText) return null;
    return parseCoinGeckoHistoricalResponse(historicalResponseText);
  }, [historicalResponseText]);

  const { chartData, stats } = useMemo(() => {
    if (!parsedHistoricalData?.success || !parsedHistoricalData.data || parsedHistoricalData.data.length === 0) {
      return { chartData: [], stats: null };
    }

    const historicalData = parsedHistoricalData.data;
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
    }));

    // Add future predictions based on forecastHorizon
    const lastTimestamp = prices[prices.length - 1].timestamp;
    const avgTimeDiff = prices.length > 1
      ? (prices[prices.length - 1].timestamp - prices[0].timestamp) / (prices.length - 1)
      : 86400000; // Default to 1 day

    // Get last values for each method
    const lastMA = movingAverages[movingAverages.length - 1] || priceValues[priceValues.length - 1];

    for (let i = 1; i <= forecastHorizon; i++) {
      const futureTimestamp = lastTimestamp + avgTimeDiff * i;
      const futurePoint: ChartDataPoint = {
        timestamp: futureTimestamp,
        date: new Date(futureTimestamp).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        predicted: slope * (n - 1 + i) + intercept,
        movingAverage: lastMA,
      };

      data.push(futurePoint);
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
  }, [parsedHistoricalData, movingAveragePeriod, forecastHorizon]);

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
              <span className="text-muted-foreground">% Change:</span>
              <span className={`font-mono font-semibold ${percentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {percentChange >= 0 ? '+' : ''}{percentChange.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <CardTitle>Loading {symbol} Analysis</CardTitle>
            </div>
            <CardDescription>
              Fetching historical price data from CoinGecko...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-[400px] w-full" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error || (isFetched && !parsedHistoricalData?.success)) {
    const errorMessage = parsedHistoricalData?.error || (error as Error)?.message || 'Failed to load historical data';
    
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Unable to Load Historical Data</AlertTitle>
          <AlertDescription className="text-sm">
            {errorMessage}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // No data state
  if (!chartData || chartData.length === 0) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Data Available</AlertTitle>
          <AlertDescription className="text-sm">
            Historical price data for {symbol} could not be retrieved.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{symbol} Analysis</CardTitle>
              <CardDescription>
                Price trends and forecast based on 30-day historical data
              </CardDescription>
            </div>
            {stats && (
              <Badge variant={stats.predictedChange >= 0 ? 'default' : 'destructive'} className="gap-1">
                {stats.predictedChange >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {Math.abs(stats.predictedChange).toFixed(2)}%
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="line"
                />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="oklch(0.75 0.20 145)" 
                  name="Price"
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
                <Line 
                  type="monotone" 
                  dataKey="predicted" 
                  stroke="oklch(0.70 0.25 240)" 
                  name="Regression"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  connectNulls
                />
                <Line 
                  type="monotone" 
                  dataKey="movingAverage" 
                  stroke="oklch(0.72 0.22 50)" 
                  name="Moving Average"
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {stats && (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
              <div>
                <p className="text-xs text-muted-foreground">Current Price</p>
                <p className="text-lg font-semibold">{formatPrice(stats.lastActual)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Forecast ({forecastHorizon}d)</p>
                <p className="text-lg font-semibold">{formatPrice(stats.futurePredicted)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Predicted Change</p>
                <p className={`text-lg font-semibold ${stats.predictedChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {stats.predictedChange >= 0 ? '+' : ''}{stats.predictedChange.toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Model Fit (R²)</p>
                <p className="text-lg font-semibold">{stats.r2.toFixed(3)}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function calculateR2(actual: number[], predicted: number[]): number {
  const mean = actual.reduce((a, b) => a + b, 0) / actual.length;
  const ssTotal = actual.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0);
  const ssResidual = actual.reduce((sum, val, i) => sum + Math.pow(val - predicted[i], 2), 0);
  return 1 - (ssResidual / ssTotal);
}
