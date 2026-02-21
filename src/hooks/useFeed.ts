import { useQuery } from '@tanstack/react-query';
import { getHttpClient } from '@/core/config';
import { API_ENDPOINTS } from '@/data/api/endpoints';
import type { ExperienceFeedItem } from '@/domain/models';

interface AllFeedResponse {
  mySuggestions: ExperienceFeedItem[];
  friendsSuggestions: ExperienceFeedItem[];
  communitySuggestions: ExperienceFeedItem[];
  nearbyPlaces: ExperienceFeedItem[];
  userCity: string | null;
}

// Hook for fetching all feed sections in one call
export function useAllFeedSections() {
  const httpClient = getHttpClient();

  const query = useQuery({
    queryKey: ['feed'],
    queryFn: async () => {
      const response = await httpClient.get<AllFeedResponse>(API_ENDPOINTS.feed.list);
      return response.data;
    },
  });

  return {
    my: { data: { experiences: query.data?.mySuggestions }, isLoading: query.isLoading },
    friends: { data: { experiences: query.data?.friendsSuggestions }, isLoading: query.isLoading },
    community: { data: { experiences: query.data?.communitySuggestions }, isLoading: query.isLoading },
    isLoading: query.isLoading,
    isError: query.isError,
    refetchAll: query.refetch,
  };
}
