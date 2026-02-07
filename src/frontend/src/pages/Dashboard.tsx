import { TrendingUp, List } from 'lucide-react';
import CryptoCard from '../components/CryptoCard';
import WatchlistManager from '../components/WatchlistManager';
import WatchlistPriceTicks from '../components/WatchlistPriceTicks';
import BackendTesterEntryPoint from '../components/BackendTesterEntryPoint';
import { useGetWatchlist } from '../hooks/useQueries';

interface DashboardProps {
  onNavigateToTester?: () => void;
}

export default function Dashboard({ onNavigateToTester }: DashboardProps) {
  const popularCryptos = ['BTC', 'ETH', 'XRP', 'SOL', 'ADA', 'DOGE'];
  
  // Fetch watchlist from backend
  const { data: watchlist = [], isLoading: watchlistLoading } = useGetWatchlist();

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
          {onNavigateToTester && (
            <BackendTesterEntryPoint onNavigate={onNavigateToTester} variant="button" />
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <List className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">My Watchlist</h2>
          </div>
          <WatchlistManager />
        </div>

        <div className="space-y-6">
          <WatchlistPriceTicks symbols={watchlist} />
        </div>
      </div>

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
