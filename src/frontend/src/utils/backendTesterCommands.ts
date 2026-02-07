import { backendInterface } from '../backend';
import { UserRole } from '../backend';
import { parseCoinGeckoResponse, formatPrice, formatMarketCap } from './coinGeckoMarketData';

export interface CommandDefinition {
  id: string;
  label: string;
  category: 'phase1-market' | 'phase1-symbols' | 'phase1-registration' | 'phase2-watchlist' | 'phase2-forecast' | 'phase2-alerts' | 'phase3-admin' | 'phase3-diagnostics';
  adminOnly: boolean;
  description: string;
  mode: 'live' | 'demo';
  execute: (actor: backendInterface, identity?: any) => Promise<any>;
  parser?: (result: any) => string;
}

export const CATEGORY_LABELS: Record<string, string> = {
  'phase1-market': 'Phase 1: Market Data',
  'phase1-symbols': 'Phase 1: Symbol Management',
  'phase1-registration': 'Phase 1: User Registration',
  'phase2-watchlist': 'Phase 2: Watchlist',
  'phase2-forecast': 'Phase 2: Forecast Settings',
  'phase2-alerts': 'Phase 2: Alert Settings',
  'phase3-admin': 'Phase 3: Admin Functions',
  'phase3-diagnostics': 'Phase 3: Diagnostic Tools',
};

export const CATEGORY_COLORS: Record<string, string> = {
  'phase1-market': 'cyan',
  'phase1-symbols': 'blue',
  'phase1-registration': 'green',
  'phase2-watchlist': 'purple',
  'phase2-forecast': 'pink',
  'phase2-alerts': 'orange',
  'phase3-admin': 'red',
  'phase3-diagnostics': 'yellow',
};

export function getCommandsByCategory(category: string, hasAdminAccess: boolean): CommandDefinition[] {
  return BACKEND_COMMANDS.filter((cmd) => {
    if (cmd.category !== category) return false;
    // Show all commands, but admin-only commands will be disabled in the UI if no admin access
    return true;
  });
}

export const BACKEND_COMMANDS: CommandDefinition[] = [
  // ============================================================================
  // PHASE 1 - CORE FUNCTIONS: Market Data
  // ============================================================================
  {
    id: 'getLiveMarketData',
    label: 'Get Live Market Data (BTC)',
    category: 'phase1-market',
    adminOnly: false,
    mode: 'live',
    description: 'Fetch live market data for BTC from CoinGecko API (Live - calls backend canister)',
    execute: async (actor) => {
      const response = await actor.getLiveMarketData('BTC');
      return { rawResponse: response };
    },
    parser: (result) => {
      const parsed = parseCoinGeckoResponse(result.rawResponse);
      if (!parsed.success) {
        return `Error: ${parsed.error}`;
      }
      if (!parsed.data) {
        return 'No data available';
      }
      const lines = [
        'Symbol: BTC',
        `Price: ${formatPrice(parsed.data.price)}`,
      ];
      if (parsed.data.change24h !== undefined) {
        lines.push(`24h Change: ${parsed.data.change24h.toFixed(2)}%`);
      }
      if (parsed.data.marketCap !== undefined) {
        lines.push(`Market Cap: ${formatMarketCap(parsed.data.marketCap)}`);
      }
      return lines.join('\n');
    },
  },
  {
    id: 'getLiveMarketDataETH',
    label: 'Get Live Market Data (ETH)',
    category: 'phase1-market',
    adminOnly: false,
    mode: 'live',
    description: 'Fetch live market data for ETH from CoinGecko API (Live - calls backend canister)',
    execute: async (actor) => {
      const response = await actor.getLiveMarketData('ETH');
      return { rawResponse: response };
    },
    parser: (result) => {
      const parsed = parseCoinGeckoResponse(result.rawResponse);
      if (!parsed.success) {
        return `Error: ${parsed.error}`;
      }
      if (!parsed.data) {
        return 'No data available';
      }
      const lines = [
        'Symbol: ETH',
        `Price: ${formatPrice(parsed.data.price)}`,
      ];
      if (parsed.data.change24h !== undefined) {
        lines.push(`24h Change: ${parsed.data.change24h.toFixed(2)}%`);
      }
      if (parsed.data.marketCap !== undefined) {
        lines.push(`Market Cap: ${formatMarketCap(parsed.data.marketCap)}`);
      }
      return lines.join('\n');
    },
  },
  {
    id: 'getLiveMarketDataXRP',
    label: 'Get Live Market Data (XRP)',
    category: 'phase1-market',
    adminOnly: false,
    mode: 'live',
    description: 'Fetch live market data for XRP from CoinGecko API (Live - calls backend canister)',
    execute: async (actor) => {
      const response = await actor.getLiveMarketData('XRP');
      return { rawResponse: response };
    },
    parser: (result) => {
      const parsed = parseCoinGeckoResponse(result.rawResponse);
      if (!parsed.success) {
        return `Error: ${parsed.error}`;
      }
      if (!parsed.data) {
        return 'No data available';
      }
      const lines = [
        'Symbol: XRP',
        `Price: ${formatPrice(parsed.data.price)}`,
      ];
      if (parsed.data.change24h !== undefined) {
        lines.push(`24h Change: ${parsed.data.change24h.toFixed(2)}%`);
      }
      if (parsed.data.marketCap !== undefined) {
        lines.push(`Market Cap: ${formatMarketCap(parsed.data.marketCap)}`);
      }
      return lines.join('\n');
    },
  },
  {
    id: 'getHistoricalData',
    label: 'Get Historical Data',
    category: 'phase1-market',
    adminOnly: false,
    mode: 'demo',
    description: 'Fetch historical price data for analysis (Demo mode - uses simulated data)',
    execute: async () => {
      // Demo implementation - backend not yet implemented
      const dataPoints = 7;
      const data = Array.from({ length: dataPoints }, (_, i) => ({
        timestamp: new Date(Date.now() - (dataPoints - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        price: 44000 + Math.random() * 2000,
      }));
      return { symbol: 'BTC', dataPoints: data.length, data };
    },
    parser: (result) => `Symbol: ${result.symbol}\nData Points: ${result.dataPoints}\nLatest: ${result.data[result.data.length - 1].timestamp} - $${result.data[result.data.length - 1].price.toFixed(2)}`,
  },

  // ============================================================================
  // PHASE 1 - CORE FUNCTIONS: Symbol Management
  // ============================================================================
  {
    id: 'getValidSymbols',
    label: 'Get Valid Symbols',
    category: 'phase1-symbols',
    adminOnly: false,
    mode: 'demo',
    description: 'Retrieve list of valid cryptocurrency symbols (Demo mode - uses simulated data)',
    execute: async () => {
      // Demo implementation - backend not yet implemented
      return {
        count: 5,
        symbols: ['BTC', 'ETH', 'SOL', 'ATOM', 'MATIC'],
      };
    },
    parser: (result) => `Total Symbols: ${result.count}\nSymbols: ${result.symbols.join(', ')}`,
  },
  {
    id: 'loadValidCryptoSymbols',
    label: 'Load Crypto Symbols',
    category: 'phase1-symbols',
    adminOnly: true,
    mode: 'demo',
    description: 'Load and cache valid cryptocurrency symbols (Demo mode - uses simulated data)',
    execute: async () => {
      // Demo implementation - backend not yet implemented
      return {
        loaded: 150,
        cached: true,
        source: 'Simulated Exchange Data',
      };
    },
    parser: (result) => `Loaded: ${result.loaded} symbols\nCached: ${result.cached ? 'Yes' : 'No'}\nSource: ${result.source}`,
  },

  // ============================================================================
  // PHASE 1 - CORE FUNCTIONS: User Registration
  // ============================================================================
  {
    id: 'registerSelfAsUser',
    label: 'Register Self as User',
    category: 'phase1-registration',
    adminOnly: false,
    mode: 'demo',
    description: 'Register your principal as a user in the system (Demo mode - uses simulated data)',
    execute: async () => {
      // Demo implementation - backend not yet implemented
      return {
        success: true,
        role: 'user',
        message: 'User registration successful',
      };
    },
    parser: (result) => `${result.message}\nRole: ${result.role}`,
  },
  {
    id: 'getMyRole',
    label: 'Get My Role',
    category: 'phase1-registration',
    adminOnly: false,
    mode: 'live',
    description: 'Check your current role in the system (Live - calls backend canister)',
    execute: async (actor) => {
      const role = await actor.getCallerUserRole();
      return { role };
    },
    parser: (result) => `Your role: ${result.role}`,
  },
  {
    id: 'getMyProfile',
    label: 'Get My Profile',
    category: 'phase1-registration',
    adminOnly: false,
    mode: 'live',
    description: 'Retrieve your user profile (Live - calls backend canister)',
    execute: async (actor) => {
      const profile = await actor.getCallerUserProfile();
      return { profile };
    },
    parser: (result) => result.profile ? `Name: ${result.profile.name}` : 'No profile found',
  },
  {
    id: 'saveMyProfile',
    label: 'Save My Profile',
    category: 'phase1-registration',
    adminOnly: false,
    mode: 'live',
    description: 'Save or update your user profile (Live - calls backend canister with test name)',
    execute: async (actor) => {
      await actor.saveCallerUserProfile({ name: 'Test User' });
      return { success: true, name: 'Test User' };
    },
    parser: (result) => `Profile saved successfully\nName: ${result.name}`,
  },

  // ============================================================================
  // PHASE 2 - USER FEATURES: Watchlist
  // ============================================================================
  {
    id: 'getWatchlist',
    label: 'Get Watchlist',
    category: 'phase2-watchlist',
    adminOnly: false,
    mode: 'demo',
    description: 'Retrieve your personal watchlist (Demo mode - uses simulated data)',
    execute: async () => {
      // Demo implementation - backend not yet implemented
      return {
        count: 3,
        symbols: ['BTC', 'ETH', 'SOL'],
      };
    },
    parser: (result) => `Watchlist Count: ${result.count}\nSymbols: ${result.symbols.join(', ')}`,
  },
  {
    id: 'addToWatchlist',
    label: 'Add to Watchlist',
    category: 'phase2-watchlist',
    adminOnly: false,
    mode: 'demo',
    description: 'Add a cryptocurrency to your watchlist (Demo mode - uses simulated data)',
    execute: async () => {
      // Demo implementation - backend not yet implemented
      return {
        success: true,
        symbol: 'ATOM',
        message: 'Added to watchlist',
      };
    },
    parser: (result) => `${result.message}\nSymbol: ${result.symbol}`,
  },
  {
    id: 'removeFromWatchlist',
    label: 'Remove from Watchlist',
    category: 'phase2-watchlist',
    adminOnly: false,
    mode: 'demo',
    description: 'Remove a cryptocurrency from your watchlist (Demo mode - uses simulated data)',
    execute: async () => {
      // Demo implementation - backend not yet implemented
      return {
        success: true,
        symbol: 'ATOM',
        message: 'Removed from watchlist',
      };
    },
    parser: (result) => `${result.message}\nSymbol: ${result.symbol}`,
  },

  // ============================================================================
  // PHASE 2 - USER FEATURES: Forecast Settings
  // ============================================================================
  {
    id: 'getForecastSettings',
    label: 'Get Forecast Settings',
    category: 'phase2-forecast',
    adminOnly: false,
    mode: 'demo',
    description: 'Retrieve forecast settings for a symbol (Demo mode - uses simulated data)',
    execute: async () => {
      // Demo implementation - backend not yet implemented
      return {
        symbol: 'BTC',
        method: 'Linear Regression',
        period: 7,
        horizon: 14,
      };
    },
    parser: (result) => `Symbol: ${result.symbol}\nMethod: ${result.method}\nPeriod: ${result.period} days\nHorizon: ${result.horizon} days`,
  },
  {
    id: 'setForecastSettings',
    label: 'Set Forecast Settings',
    category: 'phase2-forecast',
    adminOnly: false,
    mode: 'demo',
    description: 'Update forecast settings for a symbol (Demo mode - uses simulated data)',
    execute: async () => {
      // Demo implementation - backend not yet implemented
      return {
        success: true,
        symbol: 'BTC',
        method: 'Moving Average',
        message: 'Forecast settings updated',
      };
    },
    parser: (result) => `${result.message}\nSymbol: ${result.symbol}\nMethod: ${result.method}`,
  },

  // ============================================================================
  // PHASE 2 - USER FEATURES: Alert Settings
  // ============================================================================
  {
    id: 'getAlertSettings',
    label: 'Get Alert Settings',
    category: 'phase2-alerts',
    adminOnly: false,
    mode: 'demo',
    description: 'Retrieve alert settings for a symbol (Demo mode - uses simulated data)',
    execute: async () => {
      // Demo implementation - backend not yet implemented
      return {
        symbol: 'BTC',
        priceAlertHigh: 50000,
        priceAlertLow: 40000,
        enabled: true,
      };
    },
    parser: (result) => `Symbol: ${result.symbol}\nHigh Alert: $${result.priceAlertHigh.toLocaleString()}\nLow Alert: $${result.priceAlertLow.toLocaleString()}\nEnabled: ${result.enabled ? 'Yes' : 'No'}`,
  },
  {
    id: 'setAlertSettings',
    label: 'Set Alert Settings',
    category: 'phase2-alerts',
    adminOnly: false,
    mode: 'demo',
    description: 'Update alert settings for a symbol (Demo mode - uses simulated data)',
    execute: async () => {
      // Demo implementation - backend not yet implemented
      return {
        success: true,
        symbol: 'BTC',
        message: 'Alert settings updated',
      };
    },
    parser: (result) => `${result.message}\nSymbol: ${result.symbol}`,
  },

  // ============================================================================
  // PHASE 3 - ADMIN/DEBUG: Admin Functions
  // ============================================================================
  {
    id: 'checkAdminStatus',
    label: 'Check Admin Status',
    category: 'phase3-admin',
    adminOnly: false,
    mode: 'live',
    description: 'Check if you have admin privileges (Live - calls backend canister)',
    execute: async (actor) => {
      const isAdmin = await actor.isCallerAdmin();
      return { isAdmin };
    },
    parser: (result) => `Admin Status: ${result.isAdmin ? 'Yes ✓' : 'No ✗'}`,
  },
  {
    id: 'assignUserRole',
    label: 'Assign User Role',
    category: 'phase3-admin',
    adminOnly: true,
    mode: 'live',
    description: 'Assign user role to your principal (Live - calls backend canister, Admin only)',
    execute: async (actor, identity) => {
      if (!identity) throw new Error('Identity not available');
      await actor.assignCallerUserRole(identity.getPrincipal(), UserRole.user);
      return { success: true };
    },
    parser: () => 'Success: User role assigned to your principal',
  },
  {
    id: 'assignAdminRole',
    label: 'Assign Admin Role',
    category: 'phase3-admin',
    adminOnly: true,
    mode: 'live',
    description: 'Assign admin role to your principal (Live - calls backend canister, Admin only)',
    execute: async (actor, identity) => {
      if (!identity) throw new Error('Identity not available');
      await actor.assignCallerUserRole(identity.getPrincipal(), UserRole.admin);
      return { success: true };
    },
    parser: () => 'Success: Admin role assigned to your principal',
  },

  // ============================================================================
  // PHASE 3 - ADMIN/DEBUG: Diagnostic Tools
  // ============================================================================
  {
    id: 'getCycleBalance',
    label: 'Get Cycle Balance',
    category: 'phase3-diagnostics',
    adminOnly: false,
    mode: 'live',
    description: 'Check current canister cycle balance (Live - calls backend canister)',
    execute: async (actor) => {
      const balance = await actor.getCycleBalance();
      return { balance };
    },
    parser: (result) => {
      const balance = Number(result.balance);
      const balanceInTrillions = (balance / 1_000_000_000_000).toFixed(2);
      const balanceInBillions = (balance / 1_000_000_000).toFixed(2);
      return `Current Cycle Balance:\n${balance.toLocaleString()} cycles\n(${balanceInTrillions}T or ${balanceInBillions}B cycles)`;
    },
  },
  {
    id: 'getOutcallCycleStatus',
    label: 'Get Outcall Cycle Status',
    category: 'phase3-diagnostics',
    adminOnly: false,
    mode: 'live',
    description: 'Check cycle status for HTTPS outcalls (Live - calls backend canister)',
    execute: async (actor) => {
      const status = await actor.getOutcallCycleStatus();
      return { status };
    },
    parser: (result) => {
      const { currentBalance, threshold, status } = result.status;
      const balanceNum = Number(currentBalance);
      const thresholdNum = Number(threshold);
      const balanceInBillions = (balanceNum / 1_000_000_000).toFixed(2);
      const thresholdInBillions = (thresholdNum / 1_000_000_000).toFixed(2);
      
      return [
        'Outcall Cycle Status:',
        `Status: ${status}`,
        '',
        `Current Balance: ${balanceNum.toLocaleString()} cycles (${balanceInBillions}B)`,
        `Threshold: ${thresholdNum.toLocaleString()} cycles (${thresholdInBillions}B)`,
        '',
        balanceNum > thresholdNum 
          ? '✅ Sufficient cycles for safe HTTPS outcalls'
          : '❌ Cycles below threshold - outcalls will fail',
      ].join('\n');
    },
  },
  {
    id: 'checkCyclesSafeForOutcall',
    label: 'Check Cycles Safe for Outcall',
    category: 'phase3-diagnostics',
    adminOnly: false,
    mode: 'live',
    description: 'Verify if cycles are sufficient for HTTPS outcalls (Live - calls backend canister)',
    execute: async (actor) => {
      const isSafe = await actor.checkCyclesSafeForOutcall();
      return { isSafe };
    },
    parser: (result) => result.isSafe 
      ? '✅ Cycles are sufficient for HTTPS outcalls' 
      : '❌ Cycles are below threshold - outcalls will fail',
  },
  {
    id: 'debugFetchCoinGeckoBTC',
    label: 'Debug Fetch CoinGecko (BTC)',
    category: 'phase3-diagnostics',
    adminOnly: true,
    mode: 'live',
    description: 'Fetch raw CoinGecko API response for BTC (Live - calls backend canister, Admin only)',
    execute: async (actor) => {
      const response = await actor.debugFetchCoinGecko('BTC');
      return { rawResponse: response };
    },
    parser: (result) => result.rawResponse,
  },
  {
    id: 'debugFetchCoinGeckoETH',
    label: 'Debug Fetch CoinGecko (ETH)',
    category: 'phase3-diagnostics',
    adminOnly: true,
    mode: 'live',
    description: 'Fetch raw CoinGecko API response for ETH (Live - calls backend canister, Admin only)',
    execute: async (actor) => {
      const response = await actor.debugFetchCoinGecko('ETH');
      return { rawResponse: response };
    },
    parser: (result) => result.rawResponse,
  },
  {
    id: 'debugFetchCoinGeckoXRP',
    label: 'Debug Fetch CoinGecko (XRP)',
    category: 'phase3-diagnostics',
    adminOnly: true,
    mode: 'live',
    description: 'Fetch raw CoinGecko API response for XRP (Live - calls backend canister, Admin only)',
    execute: async (actor) => {
      const response = await actor.debugFetchCoinGecko('XRP');
      return { rawResponse: response };
    },
    parser: (result) => result.rawResponse,
  },
  {
    id: 'symbolCount',
    label: 'Symbol Count',
    category: 'phase3-diagnostics',
    adminOnly: false,
    mode: 'demo',
    description: 'Get total count of valid symbols (Demo mode - uses simulated data)',
    execute: async () => {
      // Demo implementation - backend not yet implemented
      return { count: 150 };
    },
    parser: (result) => `Total Valid Symbols: ${result.count}`,
  },
  {
    id: 'parsePrice',
    label: 'Parse Price (BTC)',
    category: 'phase3-diagnostics',
    adminOnly: false,
    mode: 'demo',
    description: 'Test price parsing for BTC (Demo mode - uses simulated data)',
    execute: async () => {
      // Demo implementation - backend not yet implemented
      return {
        symbol: 'BTC',
        rawPrice: '45230.50',
        parsedPrice: 45230.50,
        currency: 'USD',
      };
    },
    parser: (result) => `Symbol: ${result.symbol}\nRaw: ${result.rawPrice}\nParsed: $${result.parsedPrice.toLocaleString()}\nCurrency: ${result.currency}`,
  },
];
