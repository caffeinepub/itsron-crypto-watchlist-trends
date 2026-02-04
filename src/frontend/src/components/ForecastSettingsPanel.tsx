import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface ForecastSettingsPanelProps {
  symbol: string;
  movingAveragePeriod: number;
  forecastHorizon: number;
  onMovingAveragePeriodChange: (value: number) => void;
  onForecastHorizonChange: (value: number) => void;
}

const MA_PERIODS = [3, 7, 21, 50];

export default function ForecastSettingsPanel({ 
  symbol,
  movingAveragePeriod,
  forecastHorizon,
  onMovingAveragePeriodChange,
  onForecastHorizonChange
}: ForecastSettingsPanelProps) {
  // Map MA period to slider index
  const maIndex = MA_PERIODS.indexOf(movingAveragePeriod);
  const currentMaIndex = maIndex >= 0 ? maIndex : 1; // Default to 7 if not found

  return (
    <Card>
      <CardHeader>
        <CardTitle>Forecast Settings</CardTitle>
        <CardDescription>
          Adjust forecast parameters for {symbol} analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="ma-period" className="text-base font-semibold">
                Moving Average Period
              </Label>
              <span className="text-sm font-mono px-3 py-1 rounded-full bg-primary/10 text-primary">
                {movingAveragePeriod} days
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Select the number of days to calculate the moving average. Shorter periods respond faster to price changes, while longer periods smooth out volatility.
            </p>
          </div>
          
          <div className="space-y-3">
            <Slider
              id="ma-period"
              min={0}
              max={3}
              step={1}
              value={[currentMaIndex]}
              onValueChange={(value) => {
                onMovingAveragePeriodChange(MA_PERIODS[value[0]]);
              }}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground px-1">
              {MA_PERIODS.map((period) => (
                <span 
                  key={period}
                  className={movingAveragePeriod === period ? 'font-bold text-primary' : ''}
                >
                  {period}d
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="forecast-horizon" className="text-base font-semibold">
                Forecast Horizon
              </Label>
              <span className="text-sm font-mono px-3 py-1 rounded-full bg-secondary/10 text-secondary">
                {forecastHorizon} days
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Choose how many days ahead the Linear Regression should predict. Shorter horizons are more reliable, while longer horizons show extended trends.
            </p>
          </div>
          
          <div className="space-y-3">
            <Slider
              id="forecast-horizon"
              min={3}
              max={21}
              step={1}
              value={[forecastHorizon]}
              onValueChange={(value) => {
                onForecastHorizonChange(value[0]);
              }}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground px-1">
              <span>3 days</span>
              <span className="text-center">12 days</span>
              <span>21 days</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t space-y-3">
          <h4 className="text-sm font-semibold">Quick Presets</h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onMovingAveragePeriodChange(7);
                onForecastHorizonChange(5);
              }}
              className="px-3 py-2 text-sm rounded-lg border bg-card hover:bg-accent transition-colors text-left"
            >
              <div className="font-semibold">Short-term</div>
              <div className="text-xs text-muted-foreground">7d MA, 5d forecast</div>
            </button>
            <button
              onClick={() => {
                onMovingAveragePeriodChange(21);
                onForecastHorizonChange(14);
              }}
              className="px-3 py-2 text-sm rounded-lg border bg-card hover:bg-accent transition-colors text-left"
            >
              <div className="font-semibold">Long-term</div>
              <div className="text-xs text-muted-foreground">21d MA, 14d forecast</div>
            </button>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-muted/50 space-y-2">
          <h4 className="text-sm font-semibold">Current Settings Summary</h4>
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Symbol:</span>
              <span className="font-mono font-semibold">{symbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Moving Average:</span>
              <span className="font-mono">{movingAveragePeriod}-day period</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Forecast Range:</span>
              <span className="font-mono">{forecastHorizon} days ahead</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Auto-Update:</span>
              <span className="font-mono text-green-600 dark:text-green-400">Enabled ✓</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
