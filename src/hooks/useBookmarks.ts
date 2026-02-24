import { useQuery, useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { getHttpClient } from '@/core/config';
import { API_ENDPOINTS } from '@/data/api/endpoints';
import { useAuthStore } from '@/stores';
import { toast } from '@/stores';
import { useTranslation } from 'react-i18next';
import type { ExperienceFeedItem } from '@/domain/models';

// Hook for fetching user's bookmarks
export function useBookmarks() {
  const httpClient = getHttpClient();
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['bookmarks'],
    queryFn: async () => {
      const response = await httpClient.get<ExperienceFeedItem[]>(
        API_ENDPOINTS.bookmarks.list
      );
      return response.data;
    },
    enabled: isAuthenticated,
  });
}

// Hook for adding a bookmark
export function useAddBookmark() {
  const httpClient = getHttpClient();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (experienceId: string) => {
      const response = await httpClient.post<{ id: string }>(
        API_ENDPOINTS.bookmarks.add,
        { experience_id: experienceId }
      );
      return { bookmarkId: response.data.id };
    },
    onMutate: async (experienceId) => {
      await queryClient.cancelQueries({ queryKey: ['feed'] });
      await queryClient.cancelQueries({ queryKey: ['explore'] });
      await queryClient.cancelQueries({ queryKey: ['bookmarks'] });
      await queryClient.cancelQueries({ queryKey: ['experiences', 'user'] });
      await queryClient.cancelQueries({ queryKey: ['experiences', 'place'] });

      const previousState = snapshotCaches(queryClient, experienceId);

      // Optimistic: mark as bookmarked with a temp ID
      updateCaches(queryClient, experienceId, true, 'optimistic-temp');

      return previousState;
    },
    onSuccess: (data, experienceId) => {
      // Replace temp ID with real bookmarkId from server
      updateCaches(queryClient, experienceId, true, data.bookmarkId);
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      toast.success(
        t('bookmark.saved.title', 'Experience saved'),
        t('bookmark.saved.message', 'Added to your saved experiences'),
      );
    },
    onError: (_error, _experienceId, context) => {
      if (context) restoreCaches(queryClient, context);
      toast.error(
        t('bookmark.errorSaving.title', 'Could not save'),
        t('bookmark.errorSaving.message', 'Something went wrong. Please try again.'),
      );
    },
  });
}

// Hook for removing a bookmark
export function useRemoveBookmark() {
  const httpClient = getHttpClient();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({ bookmarkId }: { bookmarkId: string; experienceId: string }) => {
      await httpClient.delete(API_ENDPOINTS.bookmarks.remove(bookmarkId));
    },
    onMutate: async ({ experienceId }) => {
      await queryClient.cancelQueries({ queryKey: ['feed'] });
      await queryClient.cancelQueries({ queryKey: ['explore'] });
      await queryClient.cancelQueries({ queryKey: ['bookmarks'] });
      await queryClient.cancelQueries({ queryKey: ['experiences', 'user'] });
      await queryClient.cancelQueries({ queryKey: ['experiences', 'place'] });

      const previousState = snapshotCaches(queryClient, experienceId);

      // Optimistic: mark as not bookmarked
      updateCaches(queryClient, experienceId, false, undefined);

      return previousState;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      toast.success(
        t('bookmark.removed.title', 'Removed'),
        t('bookmark.removed.message', 'Removed from your saved experiences'),
      );
    },
    onError: (_error, _variables, context) => {
      if (context) restoreCaches(queryClient, context);
      toast.error(
        t('bookmark.errorRemoving.title', 'Could not remove'),
        t('bookmark.errorRemoving.message', 'Something went wrong. Please try again.'),
      );
    },
  });
}

// Combined hook for toggling bookmarks
export function useToggleBookmark() {
  const addBookmark = useAddBookmark();
  const removeBookmark = useRemoveBookmark();
  const queryClient = useQueryClient();

  const toggle = async (experienceId: string, isCurrentlyBookmarked: boolean, bookmarkId?: string) => {
    try {
      if (isCurrentlyBookmarked) {
        // Resolve bookmarkId from caches if not provided
        const resolvedId = bookmarkId ?? findBookmarkId(queryClient, experienceId);
        if (!resolvedId) return;
        await removeBookmark.mutateAsync({ bookmarkId: resolvedId, experienceId });
      } else {
        await addBookmark.mutateAsync(experienceId);
      }
    } catch {
      // Error already handled by onError (toast + rollback)
    }
  };

  return {
    toggle,
    isLoading: addBookmark.isPending || removeBookmark.isPending,
  };
}

// Look up bookmarkId from any available cache
function findBookmarkId(queryClient: QueryClient, experienceId: string): string | undefined {
  // Check bookmarks list cache
  const bookmarksEntries = queryClient.getQueriesData<ExperienceFeedItem[]>({ queryKey: ['bookmarks'] });
  for (const [, list] of bookmarksEntries) {
    const match = list?.find((exp) => exp.experience_id === experienceId);
    if (match?.bookmarkId) return match.bookmarkId;
  }

  // Check feed cache
  const feedEntries = queryClient.getQueriesData<FeedData>({ queryKey: ['feed'] });
  for (const [, feed] of feedEntries) {
    if (!feed) continue;
    const allExps = [
      ...feed.mySuggestions,
      ...feed.friendsSuggestions,
      ...feed.communitySuggestions,
      ...feed.nearbyPlaces,
    ];
    const match = allExps.find((exp) => exp.experience_id === experienceId);
    if (match?.bookmarkId) return match.bookmarkId;
  }

  // Check explore cache
  const exploreEntries = queryClient.getQueriesData<{ recentExperiences?: ExperienceFeedItem[] }>({ queryKey: ['explore'] });
  for (const [, data] of exploreEntries) {
    const match = data?.recentExperiences?.find((exp) => exp.experience_id === experienceId);
    if (match?.bookmarkId) return match.bookmarkId;
  }

  // Check experience detail cache
  const detail = queryClient.getQueryData<{ bookmarkId?: string }>(['experience', experienceId]);
  if (detail?.bookmarkId) return detail.bookmarkId;

  return undefined;
}

// --- Cache helpers ---

interface FeedData {
  mySuggestions: ExperienceFeedItem[];
  friendsSuggestions: ExperienceFeedItem[];
  communitySuggestions: ExperienceFeedItem[];
  nearbyPlaces: ExperienceFeedItem[];
  userCity: string | null;
}

interface CacheSnapshot {
  feed: [readonly unknown[], FeedData | undefined][];
  explore: [readonly unknown[], unknown][];
  experience: [readonly unknown[], unknown][];
  bookmarks: [readonly unknown[], ExperienceFeedItem[] | undefined][];
  userExperiences: [readonly unknown[], ExperienceFeedItem[] | undefined][];
  placeExperiences: [readonly unknown[], ExperienceFeedItem[] | undefined][];
}

function snapshotCaches(queryClient: QueryClient, experienceId: string): CacheSnapshot {
  return {
    feed: queryClient.getQueriesData<FeedData>({ queryKey: ['feed'] }),
    explore: queryClient.getQueriesData({ queryKey: ['explore'] }),
    experience: queryClient.getQueriesData({ queryKey: ['experience', experienceId] }),
    bookmarks: queryClient.getQueriesData<ExperienceFeedItem[]>({ queryKey: ['bookmarks'] }),
    userExperiences: queryClient.getQueriesData<ExperienceFeedItem[]>({ queryKey: ['experiences', 'user'] }),
    placeExperiences: queryClient.getQueriesData<ExperienceFeedItem[]>({ queryKey: ['experiences', 'place'] }),
  };
}

function restoreCaches(queryClient: QueryClient, snapshot: CacheSnapshot) {
  for (const [key, data] of snapshot.feed) {
    queryClient.setQueryData(key, data);
  }
  for (const [key, data] of snapshot.explore) {
    queryClient.setQueryData(key, data);
  }
  for (const [key, data] of snapshot.experience) {
    queryClient.setQueryData(key, data);
  }
  for (const [key, data] of snapshot.bookmarks) {
    queryClient.setQueryData(key, data);
  }
  for (const [key, data] of snapshot.userExperiences) {
    queryClient.setQueryData(key, data);
  }
  for (const [key, data] of snapshot.placeExperiences) {
    queryClient.setQueryData(key, data);
  }
}

function updateCaches(
  queryClient: QueryClient,
  experienceId: string,
  isBookmarked: boolean,
  bookmarkId: string | undefined,
) {
  const updateExp = (exp: ExperienceFeedItem): ExperienceFeedItem => {
    if (exp.experience_id === experienceId) {
      return { ...exp, isBookmarked, bookmarkId };
    }
    return exp;
  };

  // Update feed cache
  queryClient.setQueriesData<FeedData>({ queryKey: ['feed'] }, (old) => {
    if (!old) return old;
    return {
      ...old,
      mySuggestions: old.mySuggestions.map(updateExp),
      friendsSuggestions: old.friendsSuggestions.map(updateExp),
      communitySuggestions: old.communitySuggestions.map(updateExp),
      nearbyPlaces: old.nearbyPlaces.map(updateExp),
    };
  });

  // Update explore cache
  queryClient.setQueriesData<{ recentExperiences?: ExperienceFeedItem[]; [key: string]: unknown }>(
    { queryKey: ['explore'] },
    (old) => {
      if (!old?.recentExperiences) return old;
      return { ...old, recentExperiences: old.recentExperiences.map(updateExp) };
    },
  );

  // Update experience detail cache
  queryClient.setQueriesData<{ isBookmarked?: boolean; bookmarkId?: string }>(
    { queryKey: ['experience', experienceId] },
    (old) => {
      if (!old) return old;
      return { ...old, isBookmarked, bookmarkId };
    },
  );

  // Update bookmarks list cache
  queryClient.setQueriesData<ExperienceFeedItem[]>({ queryKey: ['bookmarks'] }, (old) => {
    if (!old) return old;
    if (isBookmarked) {
      return old;
    }
    return old.filter((exp) => exp.experience_id !== experienceId);
  });

  // Update user experiences cache (profile "My Places" tab)
  queryClient.setQueriesData<ExperienceFeedItem[]>({ queryKey: ['experiences', 'user'] }, (old) => {
    if (!old) return old;
    return old.map(updateExp);
  });

  // Update place experiences cache (experience detail "Also recommended" section)
  queryClient.setQueriesData<ExperienceFeedItem[]>({ queryKey: ['experiences', 'place'] }, (old) => {
    if (!old) return old;
    return old.map(updateExp);
  });
}
