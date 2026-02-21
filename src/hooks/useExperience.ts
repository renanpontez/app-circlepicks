import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getHttpClient } from '@/core/config';
import { API_ENDPOINTS } from '@/data/api/endpoints';
import { supabase } from '@/data/supabase/client';
import type {
  ExperienceDetail,
  ExperienceFeedItem,
  PriceRange,
  ExperienceVisibility,
} from '@/domain/models';

interface CreateExperienceRequest {
  place_id?: string;
  place?: {
    google_place_id?: string;
    name: string;
    city: string;
    country: string;
    address?: string;
    lat?: number;
    lng?: number;
    instagram_handle?: string;
    google_maps_url?: string;
  };
  price_range: PriceRange;
  tags: string[];
  brief_description?: string;
  phone_number?: string;
  images?: string[];
  visit_date?: string;
  visibility: ExperienceVisibility;
}

interface UpdateExperienceRequest {
  price_range?: PriceRange;
  tags?: string[];
  brief_description?: string;
  phone_number?: string;
  images?: string[];
  visit_date?: string;
  visibility?: ExperienceVisibility;
}

// Hook for fetching a single experience
export function useExperience(id: string, options?: { enabled?: boolean }) {
  const httpClient = getHttpClient();

  return useQuery({
    queryKey: ['experience', id],
    queryFn: async () => {
      const response = await httpClient.get<ExperienceDetail>(
        API_ENDPOINTS.experiences.detail(id)
      );
      return response.data;
    },
    enabled: !!id && (options?.enabled ?? true),
  });
}

// Hook for fetching user's experiences (directly from Supabase)
export function useUserExperiences(userId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['experiences', 'user', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('experiences')
        .select(`
          id,
          price_range,
          tags,
          brief_description,
          images,
          created_at,
          user_id,
          place_id,
          visibility,
          users:user_id (
            id,
            display_name,
            avatar_url
          ),
          places:place_id (
            id,
            name,
            city,
            country,
            instagram_handle
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get tag display names
      const allSlugs = [...new Set((data || []).flatMap((e: any) => e.tags || []))];
      const tagNames = new Map<string, string>();
      if (allSlugs.length > 0) {
        const { data: tags } = await supabase.from('tags').select('slug, display_name').in('slug', allSlugs);
        for (const t of tags || []) {
          if (t.display_name) tagNames.set(t.slug, t.display_name);
        }
      }

      return (data || []).map((exp: any): ExperienceFeedItem => {
        const placeName = exp.places?.name || 'Unknown Place';
        const placeCity = exp.places?.city || '';
        const images = exp.images || [];

        return {
          id: exp.id,
          experience_id: exp.id,
          user: {
            id: exp.users?.id || exp.user_id,
            display_name: exp.users?.display_name || 'Unknown User',
            avatar_url: exp.users?.avatar_url || null,
          },
          place: {
            id: exp.places?.id || exp.place_id,
            name: placeName,
            city_short: placeCity,
            country: exp.places?.country || '',
            thumbnail_image_url: images.length > 0 ? images[0] : null,
            instagram: exp.places?.instagram_handle || null,
          },
          price_range: exp.price_range || '$$',
          tags: (exp.tags || []).map((slug: string) => ({
            slug,
            display_name: tagNames.get(slug) || slug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          })),
          time_ago: formatTimeAgo(exp.created_at),
          description: exp.brief_description,
          visibility: exp.visibility,
        };
      });
    },
    enabled: !!userId && (options?.enabled ?? true),
  });
}

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths}mo`;
}

// Hook for creating an experience
export function useCreateExperience() {
  const httpClient = getHttpClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateExperienceRequest) => {
      const response = await httpClient.post<ExperienceDetail>(
        API_ENDPOINTS.experiences.create,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate feed queries to show the new experience
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['feed-section'] });
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
    },
  });
}

// Hook for updating an experience
export function useUpdateExperience(id: string) {
  const httpClient = getHttpClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateExperienceRequest) => {
      const response = await httpClient.patch<ExperienceDetail>(
        API_ENDPOINTS.experiences.update(id),
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      // Update the cache with the new data
      queryClient.setQueryData(['experience', id], data);
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['feed-section'] });
    },
  });
}

// Hook for deleting an experience
export function useDeleteExperience() {
  const httpClient = getHttpClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await httpClient.delete(API_ENDPOINTS.experiences.delete(id));
      return id;
    },
    onSuccess: (id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ['experience', id] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['feed-section'] });
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
    },
  });
}
