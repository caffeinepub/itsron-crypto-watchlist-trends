import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { Principal } from '@icp-sdk/core/principal';
import type {
  UserProfile,
  UserRole
} from '../backend';

// Temporary types for crypto functionality (backend not yet implemented)
type CryptoSymbol = string;
type DisplaySymbol = string;
type SymbolPair = string;
type LiveMarketResponse = {
  price: number;
  change24h: number;
  marketCap: number;
} | null;

// ============================================================================
// USER PROFILE QUERIES
// ============================================================================

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { isInitializing } = useInternetIdentity();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    // Wait for both actor and identity initialization to complete
    enabled: !!actor && !actorFetching && !isInitializing,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading || isInitializing,
    isFetched: !!actor && !isInitializing && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) {
        throw new Error('Actor not ready');
      }
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ============================================================================
// ADMIN AND REGISTRATION QUERIES
// ============================================================================

export function useIsAdmin() {
  const { actor } = useActor();
  const { isInitializing } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Actor not ready');
      }
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isInitializing,
    retry: 2,
    retryDelay: 1000,
  });
}

export function useGetCallerUserRole() {
  const { actor } = useActor();
  const { isInitializing } = useInternetIdentity();

  return useQuery<UserRole>({
    queryKey: ['callerUserRole'],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Actor not ready');
      }
      try {
        return await actor.getCallerUserRole();
      } catch (error: any) {
        throw new Error(error.message || 'Failed to fetch user role');
      }
    },
    enabled: !!actor && !isInitializing,
    retry: 1,
    retryDelay: 500,
  });
}

// ============================================================================
// CRYPTO FUNCTIONALITY STUBS (Backend not yet implemented)
// ============================================================================

export function useRegisterSelfAsUser() {
  return useMutation({
    mutationFn: async () => {
      throw new Error('Backend functionality not yet implemented');
    },
  });
}

export function useGetLiveMarketData(_symbol: CryptoSymbol) {
  return useQuery<LiveMarketResponse>({
    queryKey: ['liveMarketData', _symbol],
    queryFn: async () => null,
    enabled: false,
  });
}

export function useGetWatchlist() {
  return useQuery<CryptoSymbol[]>({
    queryKey: ['watchlist'],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useAddCryptoToWatchlist() {
  return useMutation({
    mutationFn: async (_symbol: CryptoSymbol) => {
      throw new Error('Backend functionality not yet implemented');
    },
  });
}

export function useRemoveCryptoFromWatchlist() {
  return useMutation({
    mutationFn: async (_symbol: CryptoSymbol) => {
      throw new Error('Backend functionality not yet implemented');
    },
  });
}

export function useGetValidSymbols() {
  return useQuery<Array<[DisplaySymbol, SymbolPair]>>({
    queryKey: ['validSymbols'],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useGetForecastMethod(_symbol: CryptoSymbol) {
  return useQuery({
    queryKey: ['forecastMethod', _symbol],
    queryFn: async () => null,
    enabled: false,
  });
}

export function useSetForecastMethod() {
  return useMutation({
    mutationFn: async (_params: { symbol: CryptoSymbol; method: any }) => {
      throw new Error('Backend functionality not yet implemented');
    },
  });
}

export function useGetAlertSettings(_symbol: CryptoSymbol) {
  return useQuery({
    queryKey: ['alertSettings', _symbol],
    queryFn: async () => null,
    enabled: false,
  });
}

export function useSetAlertSettings() {
  return useMutation({
    mutationFn: async (_params: { symbol: CryptoSymbol; settings: any }) => {
      throw new Error('Backend functionality not yet implemented');
    },
  });
}
