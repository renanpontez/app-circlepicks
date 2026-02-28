import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getHttpClient } from '@/core/config';
import { API_ENDPOINTS } from '@/data/api/endpoints';
import { toast } from '@/stores/toast.store';
import i18n from '@/i18n';

export function useBlockUser() {
  const httpClient = getHttpClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (blockedUserId: string) =>
      httpClient.post(API_ENDPOINTS.blocks.create, { blocked_id: blockedUserId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['explore'] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['explore'] });
    },
  });
}
