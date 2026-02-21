import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getHttpClient } from '@/core/config';
import { API_ENDPOINTS } from '@/data/api/endpoints';
import { useAuthStore } from '@/stores';
import type { UserProfile, AuthUser } from '@/domain/models';

interface UpdateProfileRequest {
  display_name?: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
}

// Hook for fetching current user's profile
export function useMyProfile() {
  const httpClient = getHttpClient();
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['profile', 'me'],
    queryFn: async () => {
      const response = await httpClient.get<UserProfile>(API_ENDPOINTS.profile.me);
      return response.data;
    },
    enabled: isAuthenticated,
  });
}

// Hook for fetching any user's profile
export function useUserProfile(userId: string, options?: { enabled?: boolean }) {
  const httpClient = getHttpClient();

  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const response = await httpClient.get<UserProfile>(
        API_ENDPOINTS.profile.byId(userId)
      );
      return response.data;
    },
    enabled: !!userId && (options?.enabled ?? true),
  });
}

// Hook for updating profile
export function useUpdateProfile() {
  const httpClient = getHttpClient();
  const queryClient = useQueryClient();
  const { updateUser } = useAuthStore();

  return useMutation({
    mutationFn: async (data: UpdateProfileRequest) => {
      const response = await httpClient.patch<UserProfile>(
        API_ENDPOINTS.profile.update,
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      // Update local profile cache
      queryClient.setQueryData(['profile', 'me'], data);

      // Update auth store user
      updateUser({
        display_name: data.display_name,
        username: data.username,
        avatar_url: data.avatar_url,
      });
    },
  });
}
