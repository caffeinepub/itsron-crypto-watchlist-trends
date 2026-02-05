import { backendInterface } from '../backend';
import { UserRole } from '../backend';

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

export const BACKEND_COMMANDS: CommandDefinition[] = [
  // ============================================================================
  // PHASE 1 - CORE FUNCTIONS: Market Data
  // ============================================================================
  {
    id: 'getLiveMarketData',
    label: 'Get Live Market Data',
    category: 'phase1-market',
    adminOnly: false,
    mode: 'demo',
    description: 'Fetch live market data for a cryptocurrency (Demo mode - uses simulated data)',
    execute: async () => {
      // Demo implementation - backend not yet implemented
      return {
        symbol: 'BTC',
        price: 45230.50,
        change24h: 2.34,
        volume: 28500000000,
        marketCap: 885000000000,
      };
    },
    parser: (result) => `Symbol: ${result.symbol}\nPrice: $${result.price.toLocaleString()}\n24h Change: ${result.change24h}%\nVolume: $${result.volume.toLocaleString()}\nMarket Cap: $${result.marketCap.toLocaleString()}`,
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
  {
    id: 'validSymbolsArray',
    label: 'Valid Symbols Array',
    category: 'phase3-diagnostics',
    adminOnly: false,
    mode: 'demo',
    description: 'Get array of all valid symbols (Demo mode - uses simulated data)',
    execute: async () => {
      // Demo implementation - backend not yet implemented
      const symbols = ['BTC', 'ETH', 'SOL', 'ATOM', 'MATIC', 'AVAX', 'DOT', 'LINK', 'UNI', 'AAVE'];
      return {
        count: symbols.length,
        symbols: symbols.slice(0, 5),
        hasMore: true,
      };
    },
    parser: (result) => `Count: ${result.count}\nSample: ${result.symbols.join(', ')}${result.hasMore ? '...' : ''}`,
  },
  {
    id: 'checkBTCSymbol',
    label: 'Check BTC Symbol',
    category: 'phase3-diagnostics',
    adminOnly: false,
    mode: 'demo',
    description: 'Verify BTC symbol validity (Demo mode - uses simulated data)',
    execute: async () => {
      // Demo implementation - backend not yet implemented
      return {
        symbol: 'BTC',
        valid: true,
        displayName: 'Bitcoin',
        pair: 'XXBTZUSD',
      };
    },
    parser: (result) => `Symbol: ${result.symbol}\nValid: ${result.valid ? 'Yes ✓' : 'No ✗'}\nDisplay: ${result.displayName}\nPair: ${result.pair}`,
  },
  {
    id: 'getBTCPrice',
    label: 'Get BTC Price',
    category: 'phase3-diagnostics',
    adminOnly: false,
    mode: 'demo',
    description: 'Fetch current BTC price (Demo mode - uses simulated data)',
    execute: async () => {
      // Demo implementation - backend not yet implemented
      return {
        symbol: 'BTC',
        price: 45230.50,
        timestamp: new Date().toISOString(),
      };
    },
    parser: (result) => `Symbol: ${result.symbol}\nPrice: $${result.price.toLocaleString()}\nTimestamp: ${result.timestamp}`,
  },
  {
    id: 'getETHPrice',
    label: 'Get ETH Price',
    category: 'phase3-diagnostics',
    adminOnly: false,
    mode: 'demo',
    description: 'Fetch current ETH price (Demo mode - uses simulated data)',
    execute: async () => {
      // Demo implementation - backend not yet implemented
      return {
        symbol: 'ETH',
        price: 2345.75,
        timestamp: new Date().toISOString(),
      };
    },
    parser: (result) => `Symbol: ${result.symbol}\nPrice: $${result.price.toLocaleString()}\nTimestamp: ${result.timestamp}`,
  },
  {
    id: 'getSOLPrice',
    label: 'Get SOL Price',
    category: 'phase3-diagnostics',
    adminOnly: false,
    mode: 'demo',
    description: 'Fetch current SOL price (Demo mode - uses simulated data)',
    execute: async () => {
      // Demo implementation - backend not yet implemented
      return {
        symbol: 'SOL',
        price: 98.45,
        timestamp: new Date().toISOString(),
      };
    },
    parser: (result) => `Symbol: ${result.symbol}\nPrice: $${result.price.toLocaleString()}\nTimestamp: ${result.timestamp}`,
  },
  {
    id: 'connectionTest',
    label: 'Connection Test',
    category: 'phase3-diagnostics',
    adminOnly: false,
    mode: 'live',
    description: 'Test backend connectivity (Live - calls backend canister)',
    execute: async (actor) => {
      const start = Date.now();
      await actor.getCallerUserProfile();
      const latency = Date.now() - start;
      return { latency, status: 'connected' };
    },
    parser: (result) => `Backend responding ✓\nLatency: ${result.latency}ms\nStatus: ${result.status}`,
  },
  {
    id: 'fetchETHData',
    label: 'Fetch ETH Data (Debug)',
    category: 'phase3-diagnostics',
    adminOnly: false,
    mode: 'demo',
    description: 'Fetch ETH market data with debug info (Demo mode - uses simulated data)',
    execute: async () => {
      // Demo implementation - backend not yet implemented
      return {
        symbol: 'ETH',
        price: 2345.75,
        volume: 15000000000,
        source: 'Simulated Exchange Data',
        responseTime: 234,
      };
    },
    parser: (result) => `Symbol: ${result.symbol}\nPrice: $${result.price.toLocaleString()}\nVolume: $${result.volume.toLocaleString()}\nSource: ${result.source}\nResponse Time: ${result.responseTime}ms`,
  },
  {
    id: 'fetchSOLData',
    label: 'Fetch SOL Data (Debug)',
    category: 'phase3-diagnostics',
    adminOnly: false,
    mode: 'demo',
    description: 'Fetch SOL market data with debug info (Demo mode - uses simulated data)',
    execute: async () => {
      // Demo implementation - backend not yet implemented
      return {
        symbol: 'SOL',
        price: 98.45,
        volume: 2500000000,
        source: 'Simulated Exchange Data',
        responseTime: 198,
      };
    },
    parser: (result) => `Symbol: ${result.symbol}\nPrice: $${result.price.toLocaleString()}\nVolume: $${result.volume.toLocaleString()}\nSource: ${result.source}\nResponse Time: ${result.responseTime}ms`,
  },
  {
    id: 'runFlickerResponse',
    label: 'Run Flicker Response',
    category: 'phase3-diagnostics',
    adminOnly: true,
    mode: 'demo',
    description: 'Test rapid response handling (Demo mode - Admin only)',
    execute: async () => {
      // Demo implementation - backend not yet implemented
      interface ResponseData {
        iteration: number;
        timestamp: number;
        latency: number;
      }
      
      const responses: ResponseData[] = [];
      for (let i = 0; i < 5; i++) {
        responses.push({
          iteration: i + 1,
          timestamp: Date.now(),
          latency: Math.floor(Math.random() * 100) + 50,
        });
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      return {
        totalTests: responses.length,
        avgLatency: responses.reduce((sum, r) => sum + r.latency, 0) / responses.length,
        results: responses,
      };
    },
    parser: (result) => `Total Tests: ${result.totalTests}\nAvg Latency: ${result.avgLatency.toFixed(2)}ms\nAll tests completed successfully`,
  },
];

export const CATEGORY_LABELS = {
  'phase1-market': 'PHASE 1: Market Data',
  'phase1-symbols': 'PHASE 1: Symbol Management',
  'phase1-registration': 'PHASE 1: User Registration',
  'phase2-watchlist': 'PHASE 2: Watchlist',
  'phase2-forecast': 'PHASE 2: Forecast Settings',
  'phase2-alerts': 'PHASE 2: Alert Settings',
  'phase3-admin': 'PHASE 3: Admin Functions',
  'phase3-diagnostics': 'PHASE 3: Diagnostic Tools',
};

export const CATEGORY_COLORS = {
  'phase1-market': 'cyan',
  'phase1-symbols': 'cyan',
  'phase1-registration': 'cyan',
  'phase2-watchlist': 'emerald',
  'phase2-forecast': 'emerald',
  'phase2-alerts': 'emerald',
  'phase3-admin': 'red',
  'phase3-diagnostics': 'purple',
};

// Always return all commands, regardless of admin status
export function getCommandsByCategory(category: string, _isAdmin: boolean) {
  return BACKEND_COMMANDS.filter((cmd) => cmd.category === category);
}

export function getAllCommands(_isAdmin: boolean) {
  return BACKEND_COMMANDS;
}
