import { useEffect, useState } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import ConnectionDetails from './ConnectionDetails';

interface ConnectionBootstrapperProps {
    isAuthenticated: boolean;
    actorFetching: boolean;
    actorError: Error | null;
    actorReady: boolean;
    isAdminLoading: boolean;
    onRetry: () => void;
    diagnostics: {
        isAuthenticated: boolean;
        hasIdentity: boolean;
        isAnonymous: boolean;
        adminInitAttempted: boolean;
        adminInitSucceeded: boolean;
        stage: 'idle' | 'creating-actor' | 'initializing-admin' | 'ready' | 'error';
        actorCreationAttempted?: boolean;
        actorCreationFailed?: boolean;
    };
    children?: React.ReactNode;
}

const CONNECTION_TIMEOUT_MS = 45000; // 45 seconds

export default function ConnectionBootstrapper({
    isAuthenticated,
    actorFetching,
    actorError,
    actorReady,
    isAdminLoading,
    onRetry,
    diagnostics,
    children,
}: ConnectionBootstrapperProps) {
    const { clear, login } = useInternetIdentity();
    const [timeoutReached, setTimeoutReached] = useState(false);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [connectionStartTime, setConnectionStartTime] = useState<number | null>(null);

    // Start tracking time when authenticated but not ready
    useEffect(() => {
        if (isAuthenticated && !actorReady && !actorError) {
            if (!connectionStartTime) {
                setConnectionStartTime(Date.now());
            }
        } else {
            setConnectionStartTime(null);
            setTimeoutReached(false);
            setElapsedSeconds(0);
        }
    }, [isAuthenticated, actorReady, actorError, connectionStartTime]);

    // Track elapsed time and trigger timeout even when actorFetching becomes false
    useEffect(() => {
        if (!connectionStartTime || actorReady || actorError) {
            return;
        }

        const interval = setInterval(() => {
            const elapsed = Date.now() - connectionStartTime;
            setElapsedSeconds(Math.floor(elapsed / 1000));

            // Trigger timeout if we've been waiting too long, regardless of actorFetching state
            if (elapsed >= CONNECTION_TIMEOUT_MS && !actorReady && !actorError) {
                setTimeoutReached(true);
                console.error('⏱️ Connection timeout: Actor not ready after 45 seconds');
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [connectionStartTime, actorReady, actorError]);

    // Handle re-authentication
    const handleReAuthenticate = async () => {
        try {
            console.log('🔄 Re-authenticating...');
            setTimeoutReached(false);
            setElapsedSeconds(0);
            setConnectionStartTime(null);
            await clear();
            setTimeout(() => {
                login();
            }, 500);
        } catch (error) {
            console.error('❌ Re-authentication failed:', error);
        }
    };

    // Handle page refresh
    const handleRefresh = () => {
        window.location.reload();
    };

    // Handle retry
    const handleRetry = () => {
        setTimeoutReached(false);
        setElapsedSeconds(0);
        setConnectionStartTime(null);
        onRetry();
    };

    // Show error state if there's an explicit error OR timeout reached
    const showError = actorError || timeoutReached || diagnostics.stage === 'error';

    if (showError) {
        const errorMessage = actorError
            ? actorError.message
            : timeoutReached
            ? 'Connection timeout: Backend actor could not be created within 45 seconds. This may occur after clearing site data.'
            : 'Failed to establish connection to backend';

        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-6 max-w-2xl px-4">
                    <div className="rounded-full bg-destructive/10 p-4">
                        <AlertTriangle className="h-12 w-12 text-destructive" />
                    </div>
                    
                    <div className="text-center">
                        <h2 className="text-2xl font-semibold text-foreground">
                            Connection Failed
                        </h2>
                        <p className="mt-2 text-sm text-muted-foreground max-w-md">
                            {errorMessage}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3 justify-center">
                        <Button onClick={handleRetry} variant="default" size="lg">
                            Retry Connection
                        </Button>
                        <Button onClick={handleReAuthenticate} variant="outline" size="lg">
                            Re-authenticate
                        </Button>
                        <Button onClick={handleRefresh} variant="outline" size="lg">
                            Refresh Page
                        </Button>
                    </div>

                    <ConnectionDetails
                        isAuthenticated={isAuthenticated}
                        actorFetching={actorFetching}
                        actorReady={actorReady}
                        isAdminLoading={isAdminLoading}
                        error={actorError}
                        diagnostics={diagnostics}
                        elapsedSeconds={elapsedSeconds}
                    />
                </div>
            </div>
        );
    }

    // Show loading state while connecting
    if (!actorReady || isAdminLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-6 max-w-2xl px-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    
                    <div className="text-center">
                        <h2 className="text-xl font-semibold text-foreground">
                            Connecting to backend...
                        </h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Establishing connection
                            {elapsedSeconds > 0 && ` (${elapsedSeconds}s)`}
                        </p>
                    </div>

                    <ConnectionDetails
                        isAuthenticated={isAuthenticated}
                        actorFetching={actorFetching}
                        actorReady={actorReady}
                        isAdminLoading={isAdminLoading}
                        error={null}
                        diagnostics={diagnostics}
                        elapsedSeconds={elapsedSeconds}
                    />
                </div>
            </div>
        );
    }

    // Connection ready, render children
    return <>{children}</>;
}
