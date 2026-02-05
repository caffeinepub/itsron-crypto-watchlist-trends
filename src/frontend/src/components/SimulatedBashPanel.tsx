import { useState, useEffect, useRef } from 'react';
import { X, Terminal, RefreshCw, CheckCircle2, XCircle, Lock, Minimize2, Maximize2, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsAdmin } from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';
import { toast } from 'sonner';
import { BACKEND_COMMANDS, CATEGORY_LABELS, CATEGORY_COLORS, getCommandsByCategory } from '../utils/backendTesterCommands';

interface CommandOutput {
  command: string;
  output: string;
  status: 'success' | 'error' | 'running';
  timestamp: string;
}

interface SimulatedBashPanelProps {
  onClose: () => void;
  isLimitedMode?: boolean;
}

type WindowState = 'normal' | 'minimized' | 'maximized';

export default function SimulatedBashPanel({ onClose, isLimitedMode = false }: SimulatedBashPanelProps) {
  const { identity } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const { data: isAdmin, isLoading: isAdminLoading, refetch: refetchAdminStatus } = useIsAdmin();
  const [outputs, setOutputs] = useState<CommandOutput[]>([]);
  const [reconnecting, setReconnecting] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [hasShownReconnectToast, setHasShownReconnectToast] = useState(false);
  const [windowState, setWindowState] = useState<WindowState>('normal');
  const outputContainerRef = useRef<HTMLDivElement>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);

  const isAuthenticated = !!identity;
  const isActorReady = !!actor && !isFetching;
  const isError = !actor && !isFetching && isAuthenticated;
  
  // Admin access is true ONLY when backend confirms admin AND we're not in limited mode
  const hasAdminAccess = isAdmin === true && !isLimitedMode;

  // Monitor for connection errors and trigger controlled reconnection with exponential backoff
  useEffect(() => {
    if (isError && !reconnecting && reconnectAttempts < 3) {
      setReconnecting(true);
      const currentAttempt = reconnectAttempts;
      setReconnectAttempts((prev) => prev + 1);

      // Exponential backoff: 2s, 4s, 8s
      const delay = Math.min(2000 * Math.pow(2, currentAttempt), 8000);

      addOutput(
        'System',
        `Connection lost — retrying… (Attempt ${currentAttempt + 1}/3, waiting ${delay / 1000}s)`,
        'running'
      );

      const timer = setTimeout(() => {
        setReconnecting(false);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [isError, reconnecting, reconnectAttempts]);

  // Reset reconnect attempts when connection is restored
  useEffect(() => {
    if (isActorReady && reconnectAttempts > 0) {
      setReconnectAttempts(0);
      setReconnecting(false);
      addOutput('System', '✓ Backend connection restored successfully', 'success');
      toast.success('Backend connection restored', {
        description: 'All commands are now available',
        duration: 2000,
      });
      // Recheck admin status after reconnection
      refetchAdminStatus();
    }
  }, [isActorReady, reconnectAttempts]);

  // Show reconnection toast only once per reconnection cycle
  useEffect(() => {
    if (reconnecting && !hasShownReconnectToast) {
      toast.info('Reinitializing backend connection…', {
        description: 'Detected connection issue, attempting recovery',
        duration: 3000,
      });
      setHasShownReconnectToast(true);
    } else if (!reconnecting && hasShownReconnectToast) {
      setHasShownReconnectToast(false);
    }
  }, [reconnecting, hasShownReconnectToast]);

  // Auto-scroll to bottom when new output is added (only if user is not manually scrolling)
  useEffect(() => {
    if (outputContainerRef.current && !isUserScrolling) {
      outputContainerRef.current.scrollTop = outputContainerRef.current.scrollHeight;
    }
  }, [outputs, isUserScrolling]);

  // Detect when user scrolls manually
  useEffect(() => {
    const container = outputContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 10;
      setIsUserScrolling(!isAtBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const addOutput = (command: string, output: string, status: 'success' | 'error' | 'running') => {
    const timestamp = new Date().toLocaleTimeString();
    setOutputs((prev) => [...prev, { command, output, status, timestamp }]);
  };

  const executeCommand = async (commandId: string) => {
    const command = BACKEND_COMMANDS.find((cmd) => cmd.id === commandId);
    if (!command) {
      addOutput(commandId, 'Error: Command not found', 'error');
      return;
    }

    if (!isActorReady || !actor) {
      addOutput(command.label, 'Error: Actor not available - waiting for connection...', 'error');
      return;
    }

    // Check admin permission
    if (command.adminOnly && !hasAdminAccess) {
      addOutput(
        command.label,
        'Error: This command requires admin privileges. You are currently in limited mode. Contact an administrator to request elevated permissions.',
        'error'
      );
      return;
    }

    addOutput(command.label, 'Running...', 'running');
    try {
      const result = await command.execute(actor, identity);
      const output = command.parser ? command.parser(result) : JSON.stringify(result, null, 2);
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

      // Refetch admin status after any command execution to catch state changes
      await refetchAdminStatus();
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error';

      setOutputs((prev) => {
        const newOutputs = [...prev];
        const lastIndex = newOutputs.length - 1;
        newOutputs[lastIndex] = {
          ...newOutputs[lastIndex],
          output: `Error: ${errorMessage}`,
          status: 'error',
        };
        return newOutputs;
      });
    }
  };

  const toggleMinimize = () => {
    setWindowState((prev) => (prev === 'minimized' ? 'normal' : 'minimized'));
  };

  const toggleMaximize = () => {
    setWindowState((prev) => (prev === 'maximized' ? 'normal' : 'maximized'));
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

  // Determine connection status
  const connectionStatus = isActorReady
    ? 'connected'
    : reconnecting
    ? 'reconnecting'
    : isError
    ? 'error'
    : 'connecting';

  const categories = [
    'phase1-market',
    'phase1-symbols',
    'phase1-registration',
    'phase2-watchlist',
    'phase2-forecast',
    'phase2-alerts',
    'phase3-admin',
    'phase3-diagnostics',
  ] as const;

  // Minimized state
  if (windowState === 'minimized') {
    return (
      <div className="fixed bottom-4 right-4 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-50 px-4 py-2 flex items-center gap-3">
        <Terminal className="w-4 h-4 text-green-400" />
        <span className="text-white text-sm font-semibold">Backend Tester</span>
        {!isAdminLoading && (
          <span
            className={`text-xs px-2 py-0.5 rounded ${
              hasAdminAccess ? 'bg-green-900 text-green-300' : 'bg-orange-900 text-orange-300'
            }`}
          >
            {hasAdminAccess ? 'Admin' : 'Limited'}
          </span>
        )}
        {connectionStatus === 'connected' && (
          <CheckCircle2 className="w-3 h-3 text-green-400" />
        )}
        <div className="flex items-center gap-1 ml-auto">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={toggleMinimize}>
            <Maximize2 className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>
    );
  }

  // Normal and Maximized states
  const containerClasses = windowState === 'maximized'
    ? 'fixed inset-4 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-50 flex flex-col'
    : 'fixed bottom-4 right-4 w-full max-w-6xl h-[90vh] bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-50 flex flex-col';

  return (
    <TooltipProvider>
      <div className={containerClasses}>
        <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Backend Tester</h3>
            {!isAdminLoading && (
              <span
                className={`text-xs px-2 py-1 rounded ${
                  hasAdminAccess ? 'bg-green-900 text-green-300' : 'bg-orange-900 text-orange-300'
                }`}
              >
                {hasAdminAccess ? 'Admin' : 'Limited'}
              </span>
            )}
            {connectionStatus === 'connected' && (
              <span className="text-xs px-2 py-1 rounded bg-green-900 text-green-300 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Connected
              </span>
            )}
            {connectionStatus === 'reconnecting' && (
              <span className="text-xs px-2 py-1 rounded bg-yellow-900 text-yellow-300 flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Reconnecting...
              </span>
            )}
            {connectionStatus === 'connecting' && (
              <span className="text-xs px-2 py-1 rounded bg-blue-900 text-blue-300 flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Connecting...
              </span>
            )}
            {connectionStatus === 'error' && reconnectAttempts >= 3 && (
              <span className="text-xs px-2 py-1 rounded bg-red-900 text-red-300 flex items-center gap-1">
                <XCircle className="w-3 h-3" />
                Connection Failed
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={toggleMinimize}>
                  <Minus className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Minimize</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={toggleMaximize}>
                  {windowState === 'maximized' ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{windowState === 'maximized' ? 'Restore' : 'Maximize'}</TooltipContent>
            </Tooltip>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 min-h-0 flex flex-col p-4 gap-4">
          {/* Commands Section - Scrollable */}
          <div className="flex-shrink-0 overflow-y-auto space-y-4" style={{ maxHeight: '45%' }}>
            {/* Connection Status Alert */}
            {connectionStatus !== 'connected' && (
              <div
                className={`border rounded p-3 ${
                  connectionStatus === 'reconnecting'
                    ? 'bg-yellow-900/20 border-yellow-700/50'
                    : connectionStatus === 'connecting'
                    ? 'bg-blue-900/20 border-blue-700/50'
                    : 'bg-red-900/20 border-red-700/50'
                }`}
              >
                <p
                  className={`text-xs ${
                    connectionStatus === 'reconnecting'
                      ? 'text-yellow-400'
                      : connectionStatus === 'connecting'
                      ? 'text-blue-400'
                      : 'text-red-400'
                  }`}
                >
                  <strong>Connection Status:</strong>{' '}
                  {connectionStatus === 'reconnecting'
                    ? `Automatic reconnection in progress (Attempt ${reconnectAttempts}/3). Please wait...`
                    : connectionStatus === 'connecting'
                    ? 'Connecting to backend... Please wait.'
                    : reconnectAttempts >= 3
                    ? 'Connection failed after 3 attempts. Please close and reopen the tester or refresh the page.'
                    : 'Connection error detected. Automatic recovery will be attempted.'}
                </p>
              </div>
            )}

            {/* Command Categories */}
            {categories.map((category) => {
              const commands = getCommandsByCategory(category, hasAdminAccess);
              if (commands.length === 0) return null;

              const color = CATEGORY_COLORS[category];
              const label = CATEGORY_LABELS[category];

              return (
                <div key={category}>
                  <h4 className={`text-sm font-semibold mb-2 flex items-center gap-2`} style={{ color: `var(--${color}-400, #22d3ee)` }}>
                    <span className={`w-2 h-2 rounded-full`} style={{ backgroundColor: `var(--${color}-400, #22d3ee)` }}></span>
                    {label}
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {commands.map((cmd) => {
                      const isDisabled = !isActorReady || (cmd.adminOnly && !hasAdminAccess);
                      const needsAdminPermission = cmd.adminOnly && !hasAdminAccess;

                      return (
                        <Tooltip key={cmd.id}>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => executeCommand(cmd.id)}
                              disabled={isDisabled}
                              className="justify-start font-mono text-xs"
                            >
                              {needsAdminPermission && <Lock className="w-3 h-3 mr-1 text-orange-400" />}
                              ▶ {cmd.label}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="font-semibold">{cmd.description}</p>
                            {needsAdminPermission && (
                              <p className="text-orange-400 text-xs mt-1">
                                🔒 Admin privileges required. Contact an administrator to request access.
                              </p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Info Panels */}
            <div className="bg-blue-900/20 border border-blue-700/50 rounded p-3">
              <p className="text-xs text-blue-400">
                <strong>Note:</strong> Some commands call live backend methods (user profile, role management, admin checks). 
                Crypto-related commands use demo data as the backend crypto functionality is not yet fully implemented.
              </p>
            </div>

            {isLimitedMode && (
              <div className="bg-orange-900/20 border border-orange-700/50 rounded p-3">
                <p className="text-xs text-orange-400">
                  <strong>Limited Mode Active:</strong> You are accessing the Backend Tester in limited mode. 
                  Admin-only commands are visible but disabled and marked with a lock icon 🔒. Only non-admin commands are executable. 
                  Contact an administrator to request elevated permissions if needed.
                </p>
              </div>
            )}

            {hasAdminAccess && (
              <div className="bg-emerald-900/20 border border-emerald-700/50 rounded p-3">
                <p className="text-xs text-emerald-400">
                  <strong>Admin Access Granted:</strong> You have full access to all diagnostic and test commands,
                  including admin role management for comprehensive validation.
                </p>
              </div>
            )}
          </div>

          {/* Output Section - Scrollable */}
          <div 
            ref={outputContainerRef}
            className="flex-1 min-h-0 bg-black rounded overflow-y-auto overscroll-contain touch-pan-y"
            style={{ 
              scrollbarWidth: 'thin',
              scrollbarColor: '#4B5563 #1F2937',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <div className="p-4 font-mono text-sm space-y-4">
              {outputs.length === 0 ? (
                <p className="text-gray-500">
                  {isActorReady
                    ? isLimitedMode 
                      ? 'Limited mode active. Click a non-admin command above to test backend methods. Admin commands are visible but locked.'
                      : 'No commands executed yet. Click a button above to test backend methods.'
                    : 'Waiting for backend connection... Commands will be available once connected.'}
                </p>
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
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
