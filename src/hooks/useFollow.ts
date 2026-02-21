import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getHttpClient } from '@/core/config';
import { API_ENDPOINTS } from '@/data/api/endpoints';
import { useAuthStore } from '@/stores';
import type { User } from '@/domain/models';

interface FollowStatusResponse {
  isFollowing: boolean;
}

interface FollowListResponse {
  users: User[];
  total: number;
}

// Hook for checking follow status
export function useFollowStatus(userId: string) {
  const httpClient = getHttpClient();
  const { isAuthenticated, user } = useAuthStore();

  return useQuery({
    queryKey: ['follow-status', userId],
    queryFn: async () => {
      const response = await httpClient.get<FollowStatusResponse>(
        API_ENDPOINTS.follow.status(userId)
      );
      return response.data;
    },
    enabled: isAuthenticated && !!userId && user?.id !== userId,
  });
}

// Hook for getting followers list
export function useFollowers(userId: string, options?: { enabled?: boolean }) {
  const httpClient = getHttpClient();

  return useQuery({
    queryKey: ['followers', userId],
    queryFn: async () => {
      const response = await httpClient.get<FollowListResponse>(
        API_ENDPOINTS.follow.followers(userId)
      );
      return response.data;
    },
    enabled: !!userId && (options?.enabled ?? true),
  });
}

// Hook for getting following list
export function useFollowing(userId: string, options?: { enabled?: boolean }) {
  const httpClient = getHttpClient();

  return useQuery({
    queryKey: ['following', userId],
    queryFn: async () => {
      const response = await httpClient.get<FollowListResponse>(
        API_ENDPOINTS.follow.following(userId)
      );
      return response.data;
    },
    enabled: !!userId && (options?.enabled ?? true),
  });
}

// Hook for following a user
export function useFollowUser() {
  const httpClient = getHttpClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await httpClient.post(API_ENDPOINTS.follow.follow(userId));
      return response.data;
    },
    onSuccess: (_, userId) => {
      // Update follow status cache
      queryClient.setQueryData(['follow-status', userId], { isFollowing: true });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['followers', userId] });
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

// Hook for unfollowing a user
export function useUnfollowUser() {
  const httpClient = getHttpClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      await httpClient.delete(API_ENDPOINTS.follow.unfollow(userId));
      return userId;
    },
    onSuccess: (userId) => {
      // Update follow status cache
      queryClient.setQueryData(['follow-status', userId], { isFollowing: false });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['followers', userId] });
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

// Combined hook for toggling follow
export function useToggleFollow() {
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();

  const toggle = async (userId: string, isCurrentlyFollowing: boolean) => {
    if (isCurrentlyFollowing) {
      await unfollowUser.mutateAsync(userId);
    } else {
      await followUser.mutateAsync(userId);
    }
  };

  return {
    toggle,
    isLoading: followUser.isPending || unfollowUser.isPending,
  };
}
