import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getHttpClient } from '@/core/config';
import { API_ENDPOINTS } from '@/data/api/endpoints';
import { useAuthStore } from '@/stores';
import type { ExperienceFeedItem } from '@/domain/models';

interface BookmarksResponse {
  bookmarks: ExperienceFeedItem[];
  total: number;
}

// Hook for fetching user's bookmarks
export function useBookmarks() {
  const httpClient = getHttpClient();
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['bookmarks'],
    queryFn: async () => {
      const response = await httpClient.get<BookmarksResponse>(
        API_ENDPOINTS.bookmarks.list
      );
      return response.data;
    },
    enabled: isAuthenticated,
  });
}

// Hook for checking if an experience is bookmarked
export function useIsBookmarked(experienceId: string) {
  const httpClient = getHttpClient();
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['bookmark', experienceId],
    queryFn: async () => {
      const response = await httpClient.get<{ isBookmarked: boolean; bookmarkId?: string }>(
        API_ENDPOINTS.bookmarks.check(experienceId)
      );
      return response.data;
    },
    enabled: isAuthenticated && !!experienceId,
  });
}

// Hook for adding a bookmark
export function useAddBookmark() {
  const httpClient = getHttpClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (experienceId: string) => {
      const response = await httpClient.post<{ bookmarkId: string }>(
        API_ENDPOINTS.bookmarks.add,
        { experienceId }
      );
      return response.data;
    },
    onSuccess: (data, experienceId) => {
      // Update bookmark status cache
      queryClient.setQueryData(['bookmark', experienceId], {
        isBookmarked: true,
        bookmarkId: data.bookmarkId,
      });

      // Invalidate bookmarks list
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });
}

// Hook for removing a bookmark
export function useRemoveBookmark() {
  const httpClient = getHttpClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (experienceId: string) => {
      await httpClient.delete(API_ENDPOINTS.bookmarks.remove(experienceId));
      return experienceId;
    },
    onSuccess: (experienceId) => {
      // Update bookmark status cache
      queryClient.setQueryData(['bookmark', experienceId], {
        isBookmarked: false,
        bookmarkId: undefined,
      });

      // Invalidate bookmarks list
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });
}

// Combined hook for toggling bookmarks
export function useToggleBookmark() {
  const addBookmark = useAddBookmark();
  const removeBookmark = useRemoveBookmark();

  const toggle = async (experienceId: string, isCurrentlyBookmarked: boolean) => {
    if (isCurrentlyBookmarked) {
      await removeBookmark.mutateAsync(experienceId);
    } else {
      await addBookmark.mutateAsync(experienceId);
    }
  };

  return {
    toggle,
    isLoading: addBookmark.isPending || removeBookmark.isPending,
  };
}
