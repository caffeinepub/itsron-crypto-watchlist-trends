import { useActor } from './useActor';
import { useState, useEffect } from 'react';
import { type backendInterface } from '../backend';
import { useInternetIdentity } from './useInternetIdentity';
import { getSecretParameter } from '../utils/urlParams';
import { normalizeActorError } from '../utils/connectionErrors';
import { useQueryClient } from '@tanstack/react-query';

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
        actorCreationAttempted: boolean;
        actorCreationFailed: boolean;
    };
    retryAdminInit: () => Promise<void>;
}

export function useActorEnhanced(): UseActorEnhancedReturn {
    const { actor, isFetching } = useActor();
    const { identity, clear, login } = useInternetIdentity();
    const queryClient = useQueryClient();
    const [timeoutError, setTimeoutError] = useState(false);
    const [timeoutErrorMessage, setTimeoutErrorMessage] = useState<string | null>(null);
    
    // Determine if authenticated (identity exists AND is not anonymous)
    const hasIdentity = !!identity;
    const isAnonymous = identity ? identity.getPrincipal().isAnonymous() : true;
    const isAuthenticated = hasIdentity && !isAnonymous;

    // Check if admin initialization was attempted
    const adminToken = getSecretParameter('caffeineAdminToken');
    const adminInitAttempted = isAuthenticated && !!adminToken && adminToken.trim().length > 0;

    // Timeout detection - trigger even when isFetching becomes false but actor is still null
    useEffect(() => {
        // Reset timeout when we have an actor
        if (actor) {
            setTimeoutError(false);
            setTimeoutErrorMessage(null);
            return;
        }

        // Start timeout if we're authenticated but don't have an actor yet
        if (isAuthenticated && !actor) {
            const timeout = setTimeout(() => {
                if (!actor) {
                    setTimeoutError(true);
                    setTimeoutErrorMessage(
                        'Connection timeout: Backend actor could not be created within 45 seconds. ' +
                        'This may occur after clearing site data. Please try re-authenticating or refreshing the page.'
                    );
                    console.error('⏱️ Actor creation timeout - authenticated but no actor after 45s');
                }
            }, 45000); // 45 seconds

            return () => clearTimeout(timeout);
        }
    }, [isAuthenticated, actor]);

    // Determine if actor creation was attempted and failed
    const actorCreationAttempted = isAuthenticated || hasIdentity;
    const actorCreationFailed = timeoutError;

    // Create error from timeout
    const combinedError = timeoutError ? new Error(timeoutErrorMessage || 'Connection timeout') : null;
    const normalizedError = combinedError ? new Error(normalizeActorError(combinedError)) : null;

    // Determine current stage for diagnostics
    let stage: UseActorEnhancedReturn['diagnostics']['stage'] = 'idle';
    
    if (actorCreationFailed) {
        stage = 'error';
    } else if (actor) {
        stage = 'ready';
    } else if (isFetching) {
        stage = adminInitAttempted ? 'initializing-admin' : 'creating-actor';
    } else if (isAuthenticated && !actor) {
        // Stuck in idle state after authentication - this is the problematic case
        stage = 'creating-actor'; // Show as creating to indicate we're waiting
    }

    // Retry function - triggers new actor creation attempt by invalidating and re-authenticating
    const retry = async () => {
        console.log('🔄 Retrying actor creation...');
        setTimeoutError(false);
        setTimeoutErrorMessage(null);
        
        try {
            // Invalidate the actor query to force a refetch
            queryClient.invalidateQueries({ queryKey: ['actor'] });
            
            // Wait a moment for invalidation to process
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // If still no actor after invalidation, try re-authentication
            if (!actor) {
                console.log('🔄 Invalidation did not resolve, attempting re-authentication...');
                await clear();
                setTimeout(() => {
                    login();
                }, 500);
            }
        } catch (err) {
            console.error('❌ Retry failed:', err);
        }
    };

    // Retry admin initialization (same as retry for now since admin init is automatic)
    const retryAdminInit = async () => {
        console.log('🔄 Retrying admin initialization...');
        await retry();
    };

    return {
        actor,
        isFetching,
        isError: actorCreationFailed,
        error: normalizedError,
        retry,
        diagnostics: {
            isAuthenticated,
            hasIdentity,
            isAnonymous,
            adminInitAttempted,
            adminInitSucceeded: !!actor && isAuthenticated && adminInitAttempted,
            adminInitError: null, // Admin init errors are now part of actor creation
            stage,
            actorCreationAttempted,
            actorCreationFailed,
        },
        retryAdminInit,
    };
}
