import { useActor } from './useActor';
import { useState, useEffect } from 'react';
import { type backendInterface } from '../backend';
import { useInternetIdentity } from './useInternetIdentity';
import { getSecretParameter } from '../utils/urlParams';

export interface UseActorEnhancedReturn {
    actor: backendInterface | null;
    isFetching: boolean;
    isError: boolean;
    error: Error | null;
    retry: () => void;
    diagnostics: {
        isAuthenticated: boolean;
        hasIdentity: boolean;
        isAnonymous: boolean;
        adminInitAttempted: boolean;
        adminInitSucceeded: boolean;
        adminInitError: string | null;
        stage: 'idle' | 'creating-actor' | 'initializing-admin' | 'ready' | 'error';
    };
    retryAdminInit: () => Promise<void>;
}

export function useActorEnhanced(): UseActorEnhancedReturn {
    const { actor, isFetching } = useActor();
    const { identity, clear, login } = useInternetIdentity();
    const [error, setError] = useState<Error | null>(null);
    const [timeoutError, setTimeoutError] = useState(false);
    const [adminInitError] = useState<string | null>(null);
    
    // Determine if authenticated (identity exists AND is not anonymous)
    const hasIdentity = !!identity;
    const isAnonymous = identity ? identity.getPrincipal().isAnonymous() : true;
    const isAuthenticated = hasIdentity && !isAnonymous;

    // Check if admin initialization was attempted
    const adminToken = getSecretParameter('caffeineAdminToken');
    const adminInitAttempted = isAuthenticated && !!adminToken && adminToken.trim().length > 0;

    // Timeout detection
    useEffect(() => {
        if (!isFetching || actor) {
            setTimeoutError(false);
            return;
        }

        const timeout = setTimeout(() => {
            if (isFetching && !actor) {
                setTimeoutError(true);
                setError(new Error('Connection timeout: Backend initialization took too long'));
            }
        }, 45000); // 45 seconds

        return () => clearTimeout(timeout);
    }, [isFetching, actor]);

    // Determine current stage for diagnostics
    let stage: UseActorEnhancedReturn['diagnostics']['stage'] = 'idle';
    if (error || timeoutError) {
        stage = 'error';
    } else if (actor) {
        stage = 'ready';
    } else if (isFetching) {
        stage = adminInitAttempted ? 'initializing-admin' : 'creating-actor';
    }

    // Retry function
    const retry = async () => {
        console.log('🔄 Retrying connection...');
        setError(null);
        setTimeoutError(false);
        try {
            await clear();
            setTimeout(() => {
                login();
            }, 500);
        } catch (err) {
            console.error('❌ Retry failed:', err);
            setError(err instanceof Error ? err : new Error('Retry failed'));
        }
    };

    // Retry admin initialization
    const retryAdminInit = async () => {
        console.log('🔄 Retrying admin initialization...');
        setError(null);
        setTimeoutError(false);
        
        // Force a full re-authentication to retry admin init
        try {
            await clear();
            setTimeout(() => {
                login();
            }, 500);
        } catch (err) {
            console.error('❌ Admin init retry failed:', err);
            setError(err instanceof Error ? err : new Error('Admin initialization retry failed'));
        }
    };

    return {
        actor,
        isFetching,
        isError: !!error || timeoutError,
        error: error || null,
        retry,
        diagnostics: {
            isAuthenticated,
            hasIdentity,
            isAnonymous,
            adminInitAttempted,
            adminInitSucceeded: !!actor && isAuthenticated && adminInitAttempted && !adminInitError,
            adminInitError,
            stage,
        },
        retryAdminInit,
    };
}
