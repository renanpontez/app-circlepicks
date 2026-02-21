import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { getHttpClient } from '@/core/config';
import { API_ENDPOINTS } from '@/data/api/endpoints';
import type { ExploreResponse, ExperienceFeedItem, Tag } from '@/domain/models';

interface ExploreByTagResponse {
  tag: Tag;
  experiences: ExperienceFeedItem[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}

interface ExploreByCityResponse {
  city: string;
  country: string;
  experiences: ExperienceFeedItem[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}

// Hook for fetching explore page data
export function useExplore() {
  const httpClient = getHttpClient();

  return useQuery({
    queryKey: ['explore'],
    queryFn: async () => {
      const response = await httpClient.get<ExploreResponse>(
        API_ENDPOINTS.explore.index
      );
      return response.data;
    },
  });
}

// Hook for fetching experiences by tag
export function useExploreByTag(slug: string, options?: { enabled?: boolean }) {
  const httpClient = getHttpClient();

  return useInfiniteQuery({
    queryKey: ['explore', 'tag', slug],
    queryFn: async ({ pageParam }) => {
      let url = API_ENDPOINTS.explore.byTag(slug);
      if (pageParam) {
        url += `?cursor=${pageParam}`;
      }
      const response = await httpClient.get<ExploreByTagResponse>(url);
      return response.data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    enabled: !!slug && (options?.enabled ?? true),
  });
}

// Hook for fetching experiences by city
export function useExploreByCity(city: string, options?: { enabled?: boolean }) {
  const httpClient = getHttpClient();

  return useInfiniteQuery({
    queryKey: ['explore', 'city', city],
    queryFn: async ({ pageParam }) => {
      let url = API_ENDPOINTS.explore.byCity(city);
      if (pageParam) {
        url += `?cursor=${pageParam}`;
      }
      const response = await httpClient.get<ExploreByCityResponse>(url);
      return response.data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    enabled: !!city && (options?.enabled ?? true),
  });
}
