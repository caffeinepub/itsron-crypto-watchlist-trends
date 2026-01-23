import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { LiveMarketResponse, SymbolPair } from '../backend';

// Check Admin Status
export function useIsAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

// Symbol List Query
export function useGetValidSymbols() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Array<[string, SymbolPair]>>({
    queryKey: ['validSymbols'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getValidSymbols();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 60000,
  });
}

// Live Market Data Query
export function useGetLiveMarketData(symbol: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<LiveMarketResponse | null>({
    queryKey: ['liveMarketData', symbol],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getLiveMarketData(symbol);
    },
    enabled: !!actor && !actorFetching && !!symbol,
    refetchInterval: 30000,
  });
}

export function useLoadValidCryptoSymbols() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      await actor.loadValidCryptoSymbols();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['validSymbols'] });
    },
  });
}
