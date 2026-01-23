import { useState } from 'react';
import { Settings, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CryptoCard from '../components/CryptoCard';
import SimulatedBashPanel from '../components/SimulatedBashPanel';

export default function Dashboard() {
  const [testerOpen, setTesterOpen] = useState(false);

  // Hardcoded list of popular cryptocurrencies to display
  const popularCryptos = ['BTC', 'ETH', 'XRP', 'SOL', 'ADA', 'DOGE'];

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            ItsRon's Trend Analysis Platform
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time cryptocurrency market data and trend analysis
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTesterOpen(!testerOpen)}
            className="shadow-sm"
          >
            <Settings className="mr-2 h-4 w-4" />
            Backend Tester
          </Button>
        </div>
      </div>

      {/* Backend Tester Panel */}
      {testerOpen && <SimulatedBashPanel onClose={() => setTesterOpen(false)} />}

      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Popular Cryptocurrencies</h2>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {popularCryptos.map((symbol) => (
            <CryptoCard key={symbol} symbol={symbol} />
          ))}
        </div>
      </div>
    </div>
  );
}
