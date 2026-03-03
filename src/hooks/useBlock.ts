import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getHttpClient } from '@/core/config';
import { API_ENDPOINTS } from '@/data/api/endpoints';
import { toast } from '@/stores/toast.store';
import i18n from '@/i18n';
import { useAuthStore } from '@/stores';

interface BlockStatusResponse {
  isBlocked: boolean;
}

interface BlockedUser {
  id: string;
  display_name: string;
  username: string;
  avatar_url: string | null;
  blocked_at: string;
}

interface BlockedUsersResponse {
  users: BlockedUser[];
}

export function useBlockedUsers() {
  const httpClient = getHttpClient();
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['blocked-users'],
    queryFn: async () => {
      const response = await httpClient.get<BlockedUsersResponse>(
        API_ENDPOINTS.blocks.list
      );
      return response.data.users;
    },
    enabled: isAuthenticated,
  });
}

export function useBlockStatus(userId: string) {
  const httpClient = getHttpClient();
  const { isAuthenticated, user } = useAuthStore();

  return useQuery({
    queryKey: ['block-status', userId],
    queryFn: async () => {
      const response = await httpClient.get<BlockStatusResponse>(
        API_ENDPOINTS.blocks.status(userId)
      );
      return response.data;
    },
    enabled: isAuthenticated && !!userId && user?.id !== userId,
  });
}

export function useBlockUser() {
  const httpClient = getHttpClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (blockedUserId: string) =>
      httpClient.post(API_ENDPOINTS.blocks.create, { blocked_id: blockedUserId }),
    onSuccess: (_, blockedUserId) => {
      // Update block status cache
      queryClient.setQueryData(['block-status', blockedUserId], { isBlocked: true });
      // Unfollow: update follow status cache
      queryClient.setQueryData(['follow-status', blockedUserId], { isFollowing: false });
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['explore'] });
      queryClient.invalidateQueries({ queryKey: ['followers'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
      queryClient.invalidateQueries({ queryKey: ['profile', blockedUserId] });
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['blocked-users'] });
      toast.success(
        i18n.t('block.success', 'User blocked'),
        i18n.t('block.successMessage', 'You will no longer see content from this user.')
      );
    },
    onError: () => {
      toast.error(
        i18n.t('block.error', 'Failed to block user'),
        i18n.t('block.errorMessage', 'Please try again later.')
      );
    },
  });
}

export function useUnblockUser() {
  const httpClient = getHttpClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) =>
      httpClient.delete(API_ENDPOINTS.blocks.remove(userId)),
    onSuccess: (_, userId) => {
      // Update block status cache
      queryClient.setQueryData(['block-status', userId], { isBlocked: false });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['explore'] });
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
      queryClient.invalidateQueries({ queryKey: ['blocked-users'] });
      toast.success(
        i18n.t('unblock.success', 'User unblocked'),
        i18n.t('unblock.successMessage', 'You can now see content from this user again.')
      );
    },
  });
}
