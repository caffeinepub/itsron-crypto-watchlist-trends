import { useState } from 'react';
import { X, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsAdmin } from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';
import { useLoadValidCryptoSymbols } from '../hooks/useQueries';

interface CommandOutput {
  command: string;
  output: string;
  status: 'success' | 'error' | 'running';
  timestamp: string;
}

export default function SimulatedBashPanel({ onClose }: { onClose: () => void }) {
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  const [outputs, setOutputs] = useState<CommandOutput[]>([]);

  const loadSymbols = useLoadValidCryptoSymbols();

  const isAuthenticated = !!identity;

  const addOutput = (command: string, output: string, status: 'success' | 'error' | 'running') => {
    const timestamp = new Date().toLocaleTimeString();
    setOutputs((prev) => [...prev, { command, output, status, timestamp }]);
  };

  const executeCommand = async (
    commandName: string,
    mutationFn: () => Promise<any>,
    parser?: (result: any) => string
  ) => {
    addOutput(commandName, 'Running...', 'running');
    try {
      const result = await mutationFn();
      const output = parser ? parser(result) : JSON.stringify(result, null, 2);
      setOutputs((prev) => {
        const newOutputs = [...prev];
        const lastIndex = newOutputs.length - 1;
        newOutputs[lastIndex] = {
          ...newOutputs[lastIndex],
          output,
          status: 'success',
        };
        return newOutputs;
      });
    } catch (error: any) {
      setOutputs((prev) => {
        const newOutputs = [...prev];
        const lastIndex = newOutputs.length - 1;
        newOutputs[lastIndex] = {
          ...newOutputs[lastIndex],
          output: `Error: ${error.message}`,
          status: 'error',
        };
        return newOutputs;
      });
    }
  };

  // Connectivity Commands
  const handleDebugTestCoinGecko = async () => {
    if (!actor || !isAdmin) {
      addOutput('debugTestCoinGecko()', 'Error: Admin privileges required', 'error');
      return;
    }
    executeCommand('debugTestCoinGecko()', async () => {
      const result = await actor.debugTestCoinGecko();
      return result;
    });
  };

  const handleDebugFetchRawTicker = async () => {
    if (!actor || !isAdmin) {
      addOutput('debugFetchRawTicker()', 'Error: Admin privileges required', 'error');
      return;
    }
    executeCommand('debugFetchRawTicker()', async () => {
      const result = await actor.debugFetchRawTicker();
      return result;
    });
  };

  const handleLoadSymbols = () => {
    if (!isAdmin) {
      addOutput('loadValidCryptoSymbols()', 'Error: Admin privileges required', 'error');
      return;
    }
    executeCommand('loadValidCryptoSymbols()', () => loadSymbols.mutateAsync());
  };

  const handleFetchCoinGeckoData = async (symbol: string) => {
    if (!actor || !isAdmin) {
      addOutput(`fetchCoinGeckoData("${symbol}")`, 'Error: Admin privileges required', 'error');
      return;
    }
    executeCommand(`fetchCoinGeckoData("${symbol}")`, async () => {
      const result = await actor.fetchCoinGeckoData(symbol);
      return result || 'No data returned';
    });
  };

  // Diagnostics Commands
  const handleDebugSymbolCount = async () => {
    if (!actor || !isAdmin) {
      addOutput('debugSymbolCount()', 'Error: Admin privileges required', 'error');
      return;
    }
    executeCommand('debugSymbolCount()', async () => {
      const count = await actor.debugSymbolCount();
      return { totalSymbols: Number(count) };
    });
  };

  const handleDebugValidSymbols = async () => {
    if (!actor || !isAdmin) {
      addOutput('debugValidSymbols()', 'Error: Admin privileges required', 'error');
      return;
    }
    executeCommand('debugValidSymbols()', async () => {
      const symbols = await actor.debugValidSymbols();
      return {
        count: symbols.length,
        mappings: symbols.map(([display, coinGeckoId]) => `${display} → ${coinGeckoId}`),
      };
    });
  };

  const handleDebugCheckSymbol = async () => {
    if (!actor || !isAdmin) {
      addOutput('debugCheckSymbol("BTC")', 'Error: Admin privileges required', 'error');
      return;
    }
    executeCommand('debugCheckSymbol("BTC")', async () => {
      const result = await actor.debugCheckSymbol('BTC');
      return result;
    });
  };

  const handleDebugParseTicker = async () => {
    if (!actor || !isAdmin) {
      addOutput('debugParseTicker("BTC")', 'Error: Admin privileges required', 'error');
      return;
    }
    executeCommand('debugParseTicker("BTC")', async () => {
      const result = await actor.debugParseTicker('BTC');
      return result;
    });
  };

  // Live Market Data Commands
  const handleGetBTCPrice = async () => {
    if (!actor) {
      addOutput('getLiveMarketData("BTC")', 'Error: Actor not available', 'error');
      return;
    }
    executeCommand('getLiveMarketData("BTC")', async () => {
      const data = await actor.getLiveMarketData('BTC');
      return data;
    });
  };

  const handleGetETHPrice = async () => {
    if (!actor) {
      addOutput('getLiveMarketData("ETH")', 'Error: Actor not available', 'error');
      return;
    }
    executeCommand('getLiveMarketData("ETH")', async () => {
      const data = await actor.getLiveMarketData('ETH');
      return data;
    });
  };

  const handleGetSOLPrice = async () => {
    if (!actor) {
      addOutput('getLiveMarketData("SOL")', 'Error: Actor not available', 'error');
      return;
    }
    executeCommand('getLiveMarketData("SOL")', async () => {
      const data = await actor.getLiveMarketData('SOL');
      return data;
    });
  };

  // Admin Commands
  const handleDebugGetAdminList = async () => {
    if (!actor || !isAdmin) {
      addOutput('debugGetAdminList()', 'Error: Admin privileges required', 'error');
      return;
    }
    executeCommand('debugGetAdminList()', async () => {
      const admins = await actor.debugGetAdminList();
      return {
        count: admins.length,
        admins: admins.map((p) => p.toString()),
      };
    });
  };

  const handleDebugResetSystem = async () => {
    if (!actor || !isAdmin) {
      addOutput('debugResetSystem()', 'Error: Admin privileges required', 'error');
      return;
    }
    executeCommand('debugResetSystem()', async () => {
      const result = await actor.debugResetSystem();
      return result;
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed bottom-4 right-4 w-full max-w-3xl bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-50">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Backend Tester</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="p-6 text-center">
          <p className="text-yellow-400">Please log in to access the Backend Tester</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-full max-w-4xl bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-50 max-h-[85vh] flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-semibold text-white">Backend Tester</h3>
          {!isAdminLoading && (
            <span className={`text-xs px-2 py-1 rounded ${isAdmin ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-300'}`}>
              {isAdmin ? 'Admin' : 'User'}
            </span>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="p-4 space-y-4 flex-1 overflow-hidden flex flex-col">
        <div className="space-y-4 overflow-y-auto max-h-[35vh]">
          {/* Connectivity Commands */}
          <div>
            <h4 className="text-sm font-semibold text-cyan-400 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
              CONNECTIVITY
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDebugTestCoinGecko}
                disabled={!isAdmin}
                className="justify-start font-mono text-xs"
              >
                ▶ CoinGecko Connection
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoadSymbols}
                disabled={!isAdmin}
                className="justify-start font-mono text-xs"
              >
                ▶ Load Symbols
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDebugFetchRawTicker}
                disabled={!isAdmin}
                className="justify-start font-mono text-xs"
              >
                ▶ Raw Ticker Response
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFetchCoinGeckoData('BTC')}
                disabled={!isAdmin}
                className="justify-start font-mono text-xs"
              >
                ▶ Fetch BTC Data (Debug)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFetchCoinGeckoData('ETH')}
                disabled={!isAdmin}
                className="justify-start font-mono text-xs"
              >
                ▶ Fetch ETH Data (Debug)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFetchCoinGeckoData('SOL')}
                disabled={!isAdmin}
                className="justify-start font-mono text-xs"
              >
                ▶ Fetch SOL Data (Debug)
              </Button>
            </div>
          </div>

          {/* Diagnostics Commands */}
          <div>
            <h4 className="text-sm font-semibold text-yellow-400 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
              DIAGNOSTICS
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDebugSymbolCount}
                disabled={!isAdmin}
                className="justify-start font-mono text-xs"
              >
                ▶ Symbol Count
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDebugValidSymbols}
                disabled={!isAdmin}
                className="justify-start font-mono text-xs"
              >
                ▶ Valid Symbols Array
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDebugCheckSymbol}
                disabled={!isAdmin}
                className="justify-start font-mono text-xs"
              >
                ▶ Check BTC Symbol
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDebugParseTicker}
                disabled={!isAdmin}
                className="justify-start font-mono text-xs"
              >
                ▶ Parse Price (BTC)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGetBTCPrice}
                className="justify-start font-mono text-xs"
              >
                ▶ Get BTC Price
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGetETHPrice}
                className="justify-start font-mono text-xs"
              >
                ▶ Get ETH Price
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGetSOLPrice}
                className="justify-start font-mono text-xs"
              >
                ▶ Get SOL Price
              </Button>
            </div>
          </div>

          {/* Admin Commands */}
          <div>
            <h4 className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-400 rounded-full"></span>
              ADMIN
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDebugGetAdminList}
                disabled={!isAdmin}
                className="justify-start font-mono text-xs"
              >
                ▶ Get Admin List
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDebugResetSystem}
                disabled={!isAdmin}
                className="justify-start font-mono text-xs"
              >
                ▶ Log Reset Actions
              </Button>
            </div>
          </div>

          {!isAdmin && (
            <div className="bg-yellow-900/20 border border-yellow-700/50 rounded p-3">
              <p className="text-xs text-yellow-400">
                <strong>Note:</strong> Some commands require admin privileges. Admin-only commands are disabled for regular users.
              </p>
            </div>
          )}

          <div className="bg-blue-900/20 border border-blue-700/50 rounded p-3">
            <p className="text-xs text-blue-400">
              <strong>Debug-Enhanced CoinGecko Testing:</strong> The "Fetch [Symbol] Data (Debug)" buttons call the 
              debug-enhanced fetchCoinGeckoData function which logs detailed information including the symbol, built URL, 
              and raw API response. Check the backend logs for detailed debug output with 🔍, 📡, and 📥 emojis.
            </p>
          </div>
        </div>

        <ScrollArea className="flex-1 bg-black rounded p-4 font-mono text-sm">
          <div className="space-y-4">
            {outputs.length === 0 ? (
              <p className="text-gray-500">No commands executed yet. Click a button above to test backend methods.</p>
            ) : (
              outputs.map((output, index) => (
                <div key={index} className="space-y-1">
                  <div className="text-blue-400">$ {output.command}</div>
                  <div
                    className={
                      output.status === 'success'
                        ? 'text-green-400'
                        : output.status === 'error'
                        ? 'text-red-400'
                        : 'text-yellow-400'
                    }
                  >
                    <pre className="whitespace-pre-wrap break-words">{output.output}</pre>
                  </div>
                  <div className="text-gray-600 text-xs">[{output.timestamp}]</div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
