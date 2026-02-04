import { backendInterface } from '../backend';
import { UserRole, ForecastMethod } from '../backend';

export interface CommandDefinition {
  id: string;
  label: string;
  category: 'registration' | 'connectivity' | 'diagnostics' | 'test-suite' | 'admin' | 'watchlist' | 'forecast' | 'alerts';
  adminOnly: boolean;
  description: string;
  execute: (actor: backendInterface, identity?: any) => Promise<any>;
  parser?: (result: any) => string;
}

export const BACKEND_COMMANDS: CommandDefinition[] = [
  // User Registration Commands
  {
    id: 'registerSelfAsUser',
    label: 'Register Self as User',
    category: 'registration',
    adminOnly: false,
    description: 'Register your principal as a user to access user-restricted functions',
    execute: async (actor) => {
      await actor.registerSelfAsUser();
      return { success: true };
    },
    parser: () => 'Success: You are now registered as a user.',
  },
  {
    id: 'grantUserPermission',
    label: 'Grant User Permission',
    category: 'registration',
    adminOnly: true,
    description: 'Grant user permission to your principal (admin only)',
    execute: async (actor, identity) => {
      if (!identity) throw new Error('Identity not available');
      await actor.grantUserPermission(identity.getPrincipal());
      return { success: true };
    },
    parser: () => 'Success: User permission granted to your principal.',
  },
  {
    id: 'checkAndInitializeUser',
    label: 'Check & Init User',
    category: 'registration',
    adminOnly: false,
    description: 'Check if user is initialized and initialize if needed',
    execute: async (actor) => {
      const result = await actor.checkAndInitializeUser();
      return { isAdmin: result };
    },
    parser: (result) => `User initialized. Admin status: ${result.isAdmin}`,
  },
  {
    id: 'getRole',
    label: 'Get My Role',
    category: 'registration',
    adminOnly: false,
    description: 'Get your current role in the system',
    execute: async (actor) => {
      const role = await actor.getRole();
      return { role };
    },
    parser: (result) => `Your role: ${result.role}`,
  },
  {
    id: 'getCallerUserProfile',
    label: 'Get My Profile',
    category: 'registration',
    adminOnly: false,
    description: 'Get your user profile',
    execute: async (actor) => {
      const profile = await actor.getCallerUserProfile();
      return profile;
    },
    parser: (result) => {
      if (!result) return 'No profile found';
      return `Name: ${result.name}\nLast Active: ${new Date(Number(result.lastActive) / 1000000).toLocaleString()}`;
    },
  },

  // Connectivity Commands
  {
    id: 'loadValidCryptoSymbols',
    label: 'Load Symbols',
    category: 'connectivity',
    adminOnly: true,
    description: 'Load the valid cryptocurrency symbols list',
    execute: async (actor) => {
      await actor.loadValidCryptoSymbols();
      return { success: true };
    },
    parser: () => 'Success: Cryptocurrency symbols loaded',
  },
  {
    id: 'getValidSymbols',
    label: 'Get Valid Symbols',
    category: 'connectivity',
    adminOnly: false,
    description: 'Get the list of all valid cryptocurrency symbols',
    execute: async (actor) => {
      const symbols = await actor.getValidSymbols();
      return { count: symbols.length, symbols: symbols.slice(0, 10) };
    },
    parser: (result) => `Found ${result.count} symbols. First 10: ${result.symbols.map((s: any) => s[0]).join(', ')}`,
  },

  // Diagnostics Commands
  {
    id: 'debugSymbolCount',
    label: 'Symbol Count',
    category: 'diagnostics',
    adminOnly: true,
    description: 'Get the total number of loaded symbols',
    execute: async (actor) => {
      const count = await actor.debugSymbolCount();
      return { totalSymbols: Number(count) };
    },
    parser: (result) => `Total symbols loaded: ${result.totalSymbols}`,
  },
  {
    id: 'debugValidSymbols',
    label: 'Valid Symbols Array',
    category: 'diagnostics',
    adminOnly: true,
    description: 'Get the complete list of valid symbols with mappings',
    execute: async (actor) => {
      const symbols = await actor.debugValidSymbols();
      return {
        count: symbols.length,
        mappings: symbols.map(([display, coinGeckoId]) => `${display} → ${coinGeckoId}`),
      };
    },
    parser: (result) => `${result.count} symbols:\n${result.mappings.join('\n')}`,
  },
  {
    id: 'debugCheckSymbol',
    label: 'Check BTC Symbol',
    category: 'diagnostics',
    adminOnly: true,
    description: 'Check if BTC symbol is valid',
    execute: async (actor) => {
      const result = await actor.debugCheckSymbol('BTC');
      return { valid: result };
    },
    parser: (result) => `BTC symbol is ${result.valid ? 'valid ✓' : 'invalid ✗'}`,
  },
  {
    id: 'getLiveMarketDataBTC',
    label: 'Get BTC Price',
    category: 'diagnostics',
    adminOnly: false,
    description: 'Get live market data for Bitcoin',
    execute: async (actor) => {
      const data = await actor.getLiveMarketData('BTC');
      return data;
    },
    parser: (result) => {
      if (result === null) {
        return '❌ API Error: Unable to fetch live data for BTC. This may be due to API rate limits or the backend returning null.';
      }
      if (typeof result === 'object' && result.price !== undefined) {
        const price = result.price ? `$${result.price.toFixed(2)}` : 'N/A';
        const change = result.change24h !== undefined ? `${result.change24h.toFixed(2)}%` : 'N/A';
        const marketCap = result.marketCap ? `$${(result.marketCap / 1e9).toFixed(2)}B` : 'N/A';
        return `✅ BTC Live Data:\n  Price: ${price}\n  24h Change: ${change}\n  Market Cap: ${marketCap}`;
      }
      return `⚠️ Unexpected response format: ${JSON.stringify(result)}`;
    },
  },
  {
    id: 'getLiveMarketDataETH',
    label: 'Get ETH Price',
    category: 'diagnostics',
    adminOnly: false,
    description: 'Get live market data for Ethereum',
    execute: async (actor) => {
      const data = await actor.getLiveMarketData('ETH');
      return data;
    },
    parser: (result) => {
      if (result === null) {
        return '❌ API Error: Unable to fetch live data for ETH. This may be due to API rate limits or the backend returning null.';
      }
      if (typeof result === 'object' && result.price !== undefined) {
        const price = result.price ? `$${result.price.toFixed(2)}` : 'N/A';
        const change = result.change24h !== undefined ? `${result.change24h.toFixed(2)}%` : 'N/A';
        const marketCap = result.marketCap ? `$${(result.marketCap / 1e9).toFixed(2)}B` : 'N/A';
        return `✅ ETH Live Data:\n  Price: ${price}\n  24h Change: ${change}\n  Market Cap: ${marketCap}`;
      }
      return `⚠️ Unexpected response format: ${JSON.stringify(result)}`;
    },
  },
  {
    id: 'getLiveMarketDataSOL',
    label: 'Get SOL Price',
    category: 'diagnostics',
    adminOnly: false,
    description: 'Get live market data for Solana',
    execute: async (actor) => {
      const data = await actor.getLiveMarketData('SOL');
      return data;
    },
    parser: (result) => {
      if (result === null) {
        return '❌ API Error: Unable to fetch live data for SOL. This may be due to API rate limits or the backend returning null.';
      }
      if (typeof result === 'object' && result.price !== undefined) {
        const price = result.price ? `$${result.price.toFixed(2)}` : 'N/A';
        const change = result.change24h !== undefined ? `${result.change24h.toFixed(2)}%` : 'N/A';
        const marketCap = result.marketCap ? `$${(result.marketCap / 1e9).toFixed(2)}B` : 'N/A';
        return `✅ SOL Live Data:\n  Price: ${price}\n  24h Change: ${change}\n  Market Cap: ${marketCap}`;
      }
      return `⚠️ Unexpected response format: ${JSON.stringify(result)}`;
    },
  },
  {
    id: 'fetchCoinGeckoData',
    label: 'Fetch CoinGecko (XRP)',
    category: 'diagnostics',
    adminOnly: false,
    description: 'Fetch CoinGecko data for XRP',
    execute: async (actor) => {
      const data = await actor.fetchCoinGeckoData('XRP');
      return data;
    },
    parser: (result) => {
      if (result === null) return '❌ No data returned';
      return `Price: $${result.price.toFixed(2)}, Change: ${result.change24h.toFixed(2)}%`;
    },
  },

  // Watchlist Commands
  {
    id: 'getWatchlist',
    label: 'Get My Watchlist',
    category: 'watchlist',
    adminOnly: false,
    description: 'Get your cryptocurrency watchlist',
    execute: async (actor) => {
      const watchlist = await actor.getWatchlist();
      return { symbols: watchlist };
    },
    parser: (result) => {
      if (result.symbols.length === 0) return 'Watchlist is empty';
      return `Watchlist (${result.symbols.length}): ${result.symbols.join(', ')}`;
    },
  },
  {
    id: 'addCryptoToWatchlist',
    label: 'Add BTC to Watchlist',
    category: 'watchlist',
    adminOnly: false,
    description: 'Add Bitcoin to your watchlist',
    execute: async (actor) => {
      await actor.addCryptoToWatchlist('BTC');
      return { success: true };
    },
    parser: () => 'Success: BTC added to watchlist',
  },
  {
    id: 'removeCryptoFromWatchlist',
    label: 'Remove BTC from Watchlist',
    category: 'watchlist',
    adminOnly: false,
    description: 'Remove Bitcoin from your watchlist',
    execute: async (actor) => {
      await actor.removeCryptoFromWatchlist('BTC');
      return { success: true };
    },
    parser: () => 'Success: BTC removed from watchlist',
  },

  // Forecast Commands
  {
    id: 'getForecastMethod',
    label: 'Get Forecast (BTC)',
    category: 'forecast',
    adminOnly: false,
    description: 'Get forecast method for Bitcoin',
    execute: async (actor) => {
      const method = await actor.getForecastMethod('BTC');
      return { method };
    },
    parser: (result) => {
      if (!result.method) return 'No forecast method set for BTC';
      return `BTC forecast method: ${result.method}`;
    },
  },
  {
    id: 'setForecastMethod',
    label: 'Set Forecast (ETH)',
    category: 'forecast',
    adminOnly: false,
    description: 'Set linear regression forecast for Ethereum',
    execute: async (actor) => {
      await actor.setForecastMethod('ETH', { linearRegression: null } as any);
      return { success: true };
    },
    parser: () => 'Success: Forecast method set to linear regression for ETH',
  },

  // Alert Commands
  {
    id: 'getAlertSettings',
    label: 'Get Alerts (BTC)',
    category: 'alerts',
    adminOnly: false,
    description: 'Get alert settings for Bitcoin',
    execute: async (actor) => {
      const settings = await actor.getAlertSettings('BTC');
      return settings;
    },
    parser: (result) => {
      if (!result) return 'No alert settings for BTC';
      return `BTC alerts: ${result.enabled ? 'Enabled' : 'Disabled'}, Threshold: ${result.thresholdPercent}%`;
    },
  },
  {
    id: 'setAlertSettings',
    label: 'Set Alerts (SOL)',
    category: 'alerts',
    adminOnly: false,
    description: 'Set alert settings for Solana (5% threshold)',
    execute: async (actor) => {
      await actor.setAlertSettings('SOL', { enabled: true, thresholdPercent: 5.0 });
      return { success: true };
    },
    parser: () => 'Success: Alert settings updated for SOL (5% threshold, enabled)',
  },

  // Backend Test Suite Commands
  {
    id: 'testHistoricalDataFetch',
    label: 'Test Historical (BTC)',
    category: 'test-suite',
    adminOnly: true,
    description: 'Test historical data fetch for BTC',
    execute: async (actor) => {
      const result = await actor.testHistoricalDataFetch('BTC');
      return { success: result, message: 'Historical data fetch test completed' };
    },
    parser: (result) => `Test ${result.success ? 'passed ✓' : 'failed ✗'}: ${result.message}`,
  },
  {
    id: 'testAlertSettings',
    label: 'Test Alert (ETH)',
    category: 'test-suite',
    adminOnly: true,
    description: 'Test alert settings with 5% threshold for ETH',
    execute: async (actor) => {
      const result = await actor.testAlertSettings('ETH', 5.0);
      return { success: result, message: 'Alert settings test completed with threshold 5.0%' };
    },
    parser: (result) => `Test ${result.success ? 'passed ✓' : 'failed ✗'}: ${result.message}`,
  },
  {
    id: 'testForecastMethod',
    label: 'Test Forecast (SOL)',
    category: 'test-suite',
    adminOnly: true,
    description: 'Test forecast method (linear regression) for SOL',
    execute: async (actor) => {
      const result = await actor.testForecastMethod('SOL', 'linear');
      return { success: result, message: 'Forecast method test completed for linear regression' };
    },
    parser: (result) => `Test ${result.success ? 'passed ✓' : 'failed ✗'}: ${result.message}`,
  },
  {
    id: 'testWatchlistAdd',
    label: 'Test Watchlist Add (XRP)',
    category: 'test-suite',
    adminOnly: true,
    description: 'Test watchlist add operation for XRP',
    execute: async (actor) => {
      const result = await actor.testWatchlistAdd('XRP');
      return { success: result, message: 'Watchlist add operation test completed' };
    },
    parser: (result) => `Test ${result.success ? 'passed ✓' : 'failed ✗'}: ${result.message}`,
  },
  {
    id: 'testWatchlistRemove',
    label: 'Test Watchlist Remove (USDT)',
    category: 'test-suite',
    adminOnly: true,
    description: 'Test watchlist remove operation for USDT',
    execute: async (actor) => {
      const result = await actor.testWatchlistRemove('USDT');
      return { success: result, message: 'Watchlist remove operation test completed' };
    },
    parser: (result) => `Test ${result.success ? 'passed ✓' : 'failed ✗'}: ${result.message}`,
  },
  {
    id: 'testAllNineSymbols',
    label: 'Test All 9 Symbols',
    category: 'test-suite',
    adminOnly: true,
    description: 'Comprehensive test for all 9 core symbols',
    execute: async (actor) => {
      const result = await actor.testAllNineSymbols();
      return {
        success: result,
        message: 'Comprehensive test completed for all 9 symbols: BTC, ETH, XRP, USDT, USDC, DOGE, ADA, SOL, MATIC',
        symbols: ['BTC', 'ETH', 'XRP', 'USDT', 'USDC', 'DOGE', 'ADA', 'SOL', 'MATIC'],
      };
    },
    parser: (result) => `Test ${result.success ? 'passed ✓' : 'failed ✗'}: ${result.message}\nSymbols: ${result.symbols.join(', ')}`,
  },
  {
    id: 'testSymbolDataIntegrity',
    label: 'Test Data Integrity (DOGE)',
    category: 'test-suite',
    adminOnly: true,
    description: 'Test symbol data integrity validation for DOGE',
    execute: async (actor) => {
      const result = await actor.testSymbolDataIntegrity('DOGE');
      return { success: result, message: 'Symbol data integrity validation completed' };
    },
    parser: (result) => `Test ${result.success ? 'passed ✓' : 'failed ✗'}: ${result.message}`,
  },
  {
    id: 'testBulkSymbolValidation',
    label: 'Test Bulk Validation',
    category: 'test-suite',
    adminOnly: true,
    description: 'Test bulk symbol validation for all symbols',
    execute: async (actor) => {
      const result = await actor.testBulkSymbolValidation();
      return { success: result, message: 'Bulk symbol validation completed for all symbols in validSymbols map' };
    },
    parser: (result) => `Test ${result.success ? 'passed ✓' : 'failed ✗'}: ${result.message}`,
  },
  {
    id: 'testAPIResponseFormat',
    label: 'Test API Format (ADA)',
    category: 'test-suite',
    adminOnly: true,
    description: 'Test API response format validation for ADA',
    execute: async (actor) => {
      const result = await actor.testAPIResponseFormat('ADA');
      return { success: result, message: 'API response format validation completed - JSON structure verified' };
    },
    parser: (result) => `Test ${result.success ? 'passed ✓' : 'failed ✗'}: ${result.message}`,
  },

  // Admin Commands
  {
    id: 'initializePermanentAdmin',
    label: 'Bind Permanent Admin',
    category: 'admin',
    adminOnly: false,
    description: 'Set your current Principal ID as the permanent operator admin (one-time only)',
    execute: async (actor, identity) => {
      if (!identity) throw new Error('Identity not available');
      const result = await actor.initializePermanentAdmin();
      return result;
    },
    parser: (result) => {
      if (result.permanentAdminSet) {
        return `✅ Success: Permanent admin bound to Principal:\n${result.verifiedCaller.toString()}\n\nThis Principal is now the permanent operator admin and will retain admin privileges across all upgrades.`;
      } else {
        return `ℹ️ Already bound: Permanent admin is already set to:\n${result.verifiedCaller.toString()}\n\nNo changes were made.`;
      }
    },
  },
  {
    id: 'debugGetAdminList',
    label: 'Get Admin List',
    category: 'admin',
    adminOnly: true,
    description: 'Get the list of all admin principals',
    execute: async (actor) => {
      const admins = await actor.debugGetAdminList();
      return {
        count: admins.length,
        admins: admins.map((p) => p.toString()),
      };
    },
    parser: (result) => `Admin count: ${result.count}\n${result.admins.join('\n')}`,
  },
  {
    id: 'getAdminInitializationErrorMessage',
    label: 'Get Admin Init Error',
    category: 'admin',
    adminOnly: true,
    description: 'Get admin initialization error message if any',
    execute: async (actor) => {
      const error = await actor.getAdminInitializationErrorMessage();
      return { error };
    },
    parser: (result) => result.error || 'No admin initialization errors',
  },
  {
    id: 'isCallerAdmin',
    label: 'Am I Admin?',
    category: 'admin',
    adminOnly: true,
    description: 'Check if you have admin privileges',
    execute: async (actor) => {
      const isAdmin = await actor.isCallerAdmin();
      return { isAdmin };
    },
    parser: (result) => `Admin status: ${result.isAdmin ? 'Yes ✓' : 'No ✗'}`,
  },
];

export const CATEGORY_LABELS = {
  registration: 'USER REGISTRATION',
  connectivity: 'CONNECTIVITY',
  diagnostics: 'DIAGNOSTICS',
  watchlist: 'WATCHLIST',
  forecast: 'FORECAST',
  alerts: 'ALERTS',
  'test-suite': 'BACKEND TEST SUITE',
  admin: 'ADMIN',
};

export const CATEGORY_COLORS = {
  registration: 'emerald',
  connectivity: 'cyan',
  diagnostics: 'yellow',
  watchlist: 'blue',
  forecast: 'purple',
  alerts: 'pink',
  'test-suite': 'orange',
  admin: 'red',
};

// Updated to always return all commands, regardless of admin status
export function getCommandsByCategory(category: string, _isAdmin: boolean) {
  return BACKEND_COMMANDS.filter((cmd) => cmd.category === category);
}

export function getAllCommands(_isAdmin: boolean) {
  return BACKEND_COMMANDS;
}
