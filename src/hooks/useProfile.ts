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

// Transform nested API response { user, experiences, stats } into flat UserProfile
function transformProfileResponse(data: any): UserProfile {
  return {
    id: data.user.id,
    display_name: data.user.display_name,
    username: data.user.username,
    avatar_url: data.user.avatar_url,
    bio: data.user.bio ?? null,
    created_at: data.user.created_at ?? '',
    stats: {
      experiences_count: data.stats?.suggestions ?? 0,
      followers_count: data.stats?.followers ?? 0,
      following_count: data.stats?.following ?? 0,
    },
  } as UserProfile;
}

// Hook for fetching current user's profile
export function useMyProfile() {
  const httpClient = getHttpClient();
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['profile', 'me'],
    queryFn: async () => {
      const response = await httpClient.get<any>(API_ENDPOINTS.profile.me);
      return transformProfileResponse(response.data);
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
      const response = await httpClient.get<any>(
        API_ENDPOINTS.profile.byId(userId)
      );
      return transformProfileResponse(response.data);
    },
    enabled: !!userId && (options?.enabled ?? true),
  });
}

interface UpdateProfileResponse {
  id: string;
  display_name: string;
  username: string;
  avatar_url: string | null;
}

// Hook for updating profile
export function useUpdateProfile() {
  const httpClient = getHttpClient();
  const queryClient = useQueryClient();
  const { updateUser } = useAuthStore();

  return useMutation({
    mutationFn: async (data: UpdateProfileRequest) => {
      const response = await httpClient.patch<UpdateProfileResponse>(
        API_ENDPOINTS.profile.update,
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate profile cache (response is partial, not full UserProfile)
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });

      // Update auth store user immediately
      updateUser({
        display_name: data.display_name,
        username: data.username,
        avatar_url: data.avatar_url,
      });
    },
  });
}
