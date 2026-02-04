import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Principal } from '@icp-sdk/core/principal';
import type {
  UserProfile,
  LiveMarketResponse,
  SymbolPair,
  DisplaySymbol,
  CryptoSymbol,
  ForecastMethod,
  AlertSettings,
  UserRole
} from '../backend';

// ============================================================================
// USER PROFILE QUERIES
// ============================================================================

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
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

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Actor not ready');
      }
      return actor.isCallerAdmin();
    },
    enabled: !!actor,
    retry: 2,
    retryDelay: 1000,
  });
}

export function useGetCallerUserRole() {
  const { actor } = useActor();

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
    enabled: !!actor,
    retry: 1,
    retryDelay: 500,
  });
}

export function useRegisterSelfAsUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) {
        throw new Error('Actor not ready');
      }
      return actor.registerSelfAsUser();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['callerUserRole'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['liveMarketData'] });
    },
  });
}

export function useGrantUserPermission() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) {
        throw new Error('Actor not ready');
      }
      return actor.grantUserPermission(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['callerUserRole'] });
    },
  });
}

export function useLoadValidCryptoSymbols() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) {
        throw new Error('Actor not ready');
      }
      return actor.loadValidCryptoSymbols();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['validSymbols'] });
    },
  });
}

// ============================================================================
// WATCHLIST QUERIES
// ============================================================================

export function useGetWatchlist() {
  const { actor } = useActor();

  return useQuery<CryptoSymbol[]>({
    queryKey: ['watchlist'],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Actor not ready');
      }
      return actor.getWatchlist();
    },
    enabled: !!actor,
  });
}

export function useAddCryptoToWatchlist() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (symbol: CryptoSymbol) => {
      if (!actor) {
        throw new Error('Actor not ready');
      }
      return actor.addCryptoToWatchlist(symbol);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });
}

export function useRemoveCryptoFromWatchlist() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (symbol: CryptoSymbol) => {
      if (!actor) {
        throw new Error('Actor not ready');
      }
      return actor.removeCryptoFromWatchlist(symbol);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });
}

// ============================================================================
// MARKET DATA QUERIES
// ============================================================================

export function useGetLiveMarketData(symbol: CryptoSymbol) {
  const { actor } = useActor();

  return useQuery<LiveMarketResponse | null>({
    queryKey: ['liveMarketData', symbol],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Actor not ready');
      }
      try {
        const result = await actor.getLiveMarketData(symbol);
        return result;
      } catch (error: any) {
        // Surface backend errors clearly
        if (error.message?.includes('Unauthorized') || error.message?.includes('Only users')) {
          throw new Error('Unauthorized: Only registered users can access market data');
        }
        throw new Error(error.message || 'Failed to fetch market data');
      }
    },
    enabled: !!actor && !!symbol,
    staleTime: 60000,
    refetchInterval: 60000,
    retry: (failureCount, error: any) => {
      // Don't retry on authorization errors
      if (error.message?.includes('Unauthorized')) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function useGetValidSymbols() {
  const { actor } = useActor();

  return useQuery<[DisplaySymbol, SymbolPair][]>({
    queryKey: ['validSymbols'],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Actor not ready');
      }
      return actor.getValidSymbols();
    },
    enabled: !!actor,
  });
}

// ============================================================================
// FORECAST AND ALERT QUERIES
// ============================================================================

export function useGetForecastMethod(symbol: CryptoSymbol) {
  const { actor } = useActor();

  return useQuery<ForecastMethod | null>({
    queryKey: ['forecastMethod', symbol],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Actor not ready');
      }
      return actor.getForecastMethod(symbol);
    },
    enabled: !!actor && !!symbol,
  });
}

export function useSetForecastMethod() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ symbol, method }: { symbol: CryptoSymbol; method: ForecastMethod }) => {
      if (!actor) {
        throw new Error('Actor not ready');
      }
      return actor.setForecastMethod(symbol, method);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['forecastMethod', variables.symbol] });
    },
  });
}

export function useGetAlertSettings(symbol: CryptoSymbol) {
  const { actor } = useActor();

  return useQuery<AlertSettings | null>({
    queryKey: ['alertSettings', symbol],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Actor not ready');
      }
      return actor.getAlertSettings(symbol);
    },
    enabled: !!actor && !!symbol,
  });
}

export function useSetAlertSettings() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ symbol, settings }: { symbol: CryptoSymbol; settings: AlertSettings }) => {
      if (!actor) {
        throw new Error('Actor not ready');
      }
      return actor.setAlertSettings(symbol, settings);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['alertSettings', variables.symbol] });
    },
  });
}
