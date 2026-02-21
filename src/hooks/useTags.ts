import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import slugify from 'slugify';
import { supabase } from '@/data/supabase/client';
import type { Tag } from '@/domain/models';

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('is_system', { ascending: false })
        .order('display_name', { ascending: true });
      if (error) throw error;
      return (data ?? []) as Tag[];
    },
  });
}

export function useTagSearch(query: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['tags', 'search', query],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .ilike('display_name', `%${query}%`)
        .order('is_system', { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as Tag[];
    },
    enabled: !!query && query.length >= 1 && (options?.enabled ?? true),
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ displayName, userId }: { displayName: string; userId: string }) => {
      const slug = slugify(displayName, { lower: true, strict: true });

      const { data: existing } = await supabase
        .from('tags')
        .select('*')
        .eq('slug', slug)
        .single();

      if (existing) return existing as Tag;

      const { data, error } = await supabase
        .from('tags')
        .insert({
          slug,
          display_name: displayName.trim(),
          is_system: false,
          created_by: userId,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Tag;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
}
