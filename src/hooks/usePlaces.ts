import { useQuery, useMutation } from '@tanstack/react-query';
import { getHttpClient } from '@/core/config';
import { API_ENDPOINTS } from '@/data/api/endpoints';
import type { PlaceSearchResult, Place } from '@/domain/models';

interface PlaceSearchResponse {
  places: PlaceSearchResult[];
}

// Hook for searching places
export function usePlaceSearch(query: string, options?: { enabled?: boolean }) {
  const httpClient = getHttpClient();

  return useQuery({
    queryKey: ['places', 'search', query],
    queryFn: async () => {
      const response = await httpClient.get<PlaceSearchResponse | PlaceSearchResult[]>(
        `${API_ENDPOINTS.places.search}?q=${encodeURIComponent(query)}`
      );
      const data = response.data;
      return Array.isArray(data) ? data : data.places ?? [];
    },
    enabled: !!query && query.length >= 2 && (options?.enabled ?? true),
  });
}

// Hook for searching places with location context
export function usePlaceSearchWithLocation(
  query: string,
  location?: { lat: number; lng: number },
  options?: { enabled?: boolean }
) {
  const httpClient = getHttpClient();

  return useQuery({
    queryKey: ['places', 'search', query, location?.lat, location?.lng],
    queryFn: async () => {
      let url = `${API_ENDPOINTS.places.search}?q=${encodeURIComponent(query)}`;
      if (location) {
        url += `&lat=${location.lat}&lng=${location.lng}`;
      }
      const response = await httpClient.get<PlaceSearchResponse | PlaceSearchResult[]>(url);
      const data = response.data;
      return Array.isArray(data) ? data : data.places ?? [];
    },
    enabled: !!query && query.length >= 2 && (options?.enabled ?? true),
  });
}

// Hook for getting nearby places
export function useNearbyPlaces(
  lat: number,
  lng: number,
  options?: { enabled?: boolean }
) {
  const httpClient = getHttpClient();

  return useQuery({
    queryKey: ['places', 'nearby', lat, lng],
    queryFn: async () => {
      const response = await httpClient.get<PlaceSearchResponse>(
        API_ENDPOINTS.places.nearby(lat, lng)
      );
      return response.data.places;
    },
    enabled: !!lat && !!lng && (options?.enabled ?? true),
  });
}

// Hook for getting place details
export function usePlaceDetail(placeId: string, options?: { enabled?: boolean }) {
  const httpClient = getHttpClient();

  return useQuery({
    queryKey: ['place', placeId],
    queryFn: async () => {
      const response = await httpClient.get<Place>(
        API_ENDPOINTS.places.detail(placeId)
      );
      return response.data;
    },
    enabled: !!placeId && (options?.enabled ?? true),
  });
}
