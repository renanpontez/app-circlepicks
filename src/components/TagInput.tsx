import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import debounce from 'lodash.debounce';
import slugify from 'slugify';

import { useTags, useTagSearch, useCreateTag } from '@/hooks';
import { useAuthStore } from '@/stores';
import type { Tag } from '@/domain/models';

interface TagInputProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  maxTags?: number;
}

export function TagInput({ selectedTags, onTagsChange, maxTags = 5 }: TagInputProps) {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const { data: allTags, isLoading: tagsLoading } = useTags();
  const { data: searchResults } = useTagSearch(debouncedQuery, {
    enabled: debouncedQuery.length >= 1,
  });
  const createTag = useCreateTag();

  const debouncedSetQuery = useCallback(
    debounce((value: string) => setDebouncedQuery(value), 400),
    []
  );

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    debouncedSetQuery(value);
  };

  const handleToggle = (slug: string) => {
    if (selectedTags.includes(slug)) {
      onTagsChange(selectedTags.filter((s) => s !== slug));
    } else if (selectedTags.length < maxTags) {
      onTagsChange([...selectedTags, slug]);
    }
  };

  const handleRemove = (slug: string) => {
    onTagsChange(selectedTags.filter((s) => s !== slug));
  };

  const handleCreate = async () => {
    if (!user || selectedTags.length >= maxTags) return;
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    try {
      const tag = await createTag.mutateAsync({
        displayName: trimmed,
        userId: user.id,
      });
      onTagsChange([...selectedTags, tag.slug]);
      setSearchQuery('');
      setDebouncedQuery('');
    } catch {
      // Silently fail — tag list will still show
    }
  };

  const displayedTags = debouncedQuery.length >= 1 ? searchResults : allTags;
  const isSearching = debouncedQuery.length >= 1;

  // Check if the typed query already exists as a tag slug
  const typedSlug = searchQuery.trim() ? slugify(searchQuery.trim(), { lower: true, strict: true }) : '';
  const exactMatchExists = displayedTags?.some((tag) => tag.slug === typedSlug);
  const showCreateOption = searchQuery.trim().length >= 2 && !exactMatchExists && selectedTags.length < maxTags;

  // Resolve display names for selected tags
  const getTagLabel = (slug: string): string => {
    const tag = allTags?.find((t) => t.slug === slug);
    return tag?.display_name || slug;
  };

  return (
    <View className="bg-white p-4 border-b border-divider">
      {/* Label */}
      <Text className="text-dark-grey font-semibold mb-3">
        {t('add.tags.title', 'Tags')}
        <Text className="text-primary"> *</Text>
        <Text className="text-light-grey font-normal"> ({selectedTags.length}/{maxTags})</Text>
      </Text>

      {/* Selected tags pills */}
      {selectedTags.length > 0 && (
        <View className="flex-row flex-wrap gap-2 mb-3">
          {selectedTags.map((slug) => (
            <View key={slug} className="flex-row items-center bg-primary rounded-full px-3 py-1.5">
              <Text className="text-white text-sm font-medium mr-1">{getTagLabel(slug)}</Text>
              <Pressable onPress={() => handleRemove(slug)} hitSlop={8}>
                <Ionicons name="close" size={14} color="#FFFFFF" />
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {/* Search input */}
      <View className="flex-row items-center bg-surface border border-divider rounded-xl px-3 mb-3">
        <Ionicons name="search" size={18} color="#888888" />
        <TextInput
          className="flex-1 py-2.5 px-2 text-dark-grey text-sm"
          placeholder={t('add.tags.searchPlaceholder', 'Search or add tags...')}
          placeholderTextColor="#888888"
          value={searchQuery}
          onChangeText={handleSearchChange}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => handleSearchChange('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color="#888888" />
          </Pressable>
        )}
      </View>

      {/* Section header */}
      {!isSearching && (
        <Text className="text-xs text-medium-grey font-semibold tracking-wider mb-2">
          {t('add.tags.popularTitle', 'POPULAR TAGS')}
        </Text>
      )}

      {/* Tag list */}
      {tagsLoading ? (
        <View className="py-4 items-center">
          <ActivityIndicator color="#FD512E" />
        </View>
      ) : (
        <ScrollView className="max-h-[240px]" nestedScrollEnabled keyboardShouldPersistTaps="handled">
          {displayedTags?.map((tag: Tag) => {
            const isSelected = selectedTags.includes(tag.slug);
            const isDisabled = !isSelected && selectedTags.length >= maxTags;

            return (
              <Pressable
                key={tag.slug}
                onPress={() => !isDisabled && handleToggle(tag.slug)}
                className={`flex-row items-center py-3 border-b border-divider ${
                  isDisabled ? 'opacity-40' : 'active:bg-surface'
                }`}
              >
                <Ionicons
                  name={isSelected ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={isSelected ? '#FD512E' : '#CCCCCC'}
                />
                <Text
                  className={`ml-3 text-sm ${
                    isSelected ? 'text-dark-grey font-medium' : 'text-dark-grey'
                  }`}
                >
                  {tag.display_name || tag.slug}
                </Text>
              </Pressable>
            );
          })}

          {/* Create custom tag option */}
          {showCreateOption && (
            <Pressable
              onPress={handleCreate}
              disabled={createTag.isPending}
              className="flex-row items-center py-3 active:bg-surface"
            >
              {createTag.isPending ? (
                <ActivityIndicator size="small" color="#FD512E" />
              ) : (
                <Ionicons name="add-circle-outline" size={22} color="#FD512E" />
              )}
              <Text className="ml-3 text-sm text-primary font-medium">
                {t('add.tags.createTag', 'Create "{{tag}}"', { tag: searchQuery.trim() })}
              </Text>
            </Pressable>
          )}

          {/* Empty state */}
          {isSearching && (!displayedTags || displayedTags.length === 0) && !showCreateOption && (
            <Text className="text-medium-grey text-sm text-center py-4">
              {t('add.tags.noResults', 'No tags found')}
            </Text>
          )}
        </ScrollView>
      )}
    </View>
  );
}
