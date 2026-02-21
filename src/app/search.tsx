import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import debounce from 'lodash.debounce';

import { getHttpClient } from '@/core/config';
import { API_ENDPOINTS } from '@/data/api/endpoints';
import type { ExperienceFeedItem, User, PlaceSearchResult } from '@/domain/models';

interface SearchResults {
  experiences: ExperienceFeedItem[];
  users: User[];
  places: PlaceSearchResult[];
}

export default function SearchScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const httpClient = getHttpClient();

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const debouncedSetQuery = useCallback(
    debounce((value: string) => {
      setDebouncedQuery(value);
    }, 300),
    []
  );

  const handleQueryChange = (value: string) => {
    setQuery(value);
    debouncedSetQuery(value);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: async () => {
      const response = await httpClient.get<SearchResults>(
        API_ENDPOINTS.search.global(debouncedQuery)
      );
      return response.data;
    },
    enabled: debouncedQuery.length >= 2,
  });

  const handleExperiencePress = (experience: ExperienceFeedItem) => {
    router.back();
    setTimeout(() => {
      router.push(`/experience/${experience.experience_id}`);
    }, 100);
  };

  const handleUserPress = (user: User) => {
    router.back();
    setTimeout(() => {
      router.push(`/user/${user.id}`);
    }, 100);
  };

  const handlePlacePress = (place: PlaceSearchResult) => {
    // For now, we don't have a dedicated place page
    // Could navigate to explore with place filter
    router.back();
  };

  const hasResults =
    data &&
    (data.experiences.length > 0 || data.users.length > 0 || data.places.length > 0);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header with Search Input */}
      <View className="flex-row items-center px-4 py-2 border-b border-divider">
        <Pressable onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="close" size={24} color="#111111" />
        </Pressable>
        <View className="flex-1 flex-row items-center bg-surface rounded-xl px-3 ml-2">
          <Ionicons name="search" size={20} color="#888888" />
          <TextInput
            className="flex-1 py-3 px-2 text-dark-grey"
            placeholder={t('search.placeholder', 'Search places, users...')}
            placeholderTextColor="#888888"
            value={query}
            onChangeText={handleQueryChange}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => handleQueryChange('')}>
              <Ionicons name="close-circle" size={20} color="#888888" />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        {isLoading ? (
          <View className="py-8 items-center">
            <ActivityIndicator color="#FD512E" />
          </View>
        ) : !debouncedQuery || debouncedQuery.length < 2 ? (
          <View className="items-center py-12 px-6">
            <Ionicons name="search" size={48} color="#E4E6EA" />
            <Text className="text-medium-grey text-center mt-4">
              {t('search.hint', 'Search for places, restaurants, or people')}
            </Text>
          </View>
        ) : !hasResults ? (
          <View className="items-center py-12 px-6">
            <Ionicons name="search-outline" size={48} color="#888888" />
            <Text className="text-dark-grey font-semibold mt-4">
              {t('search.noResults.title', 'No results found')}
            </Text>
            <Text className="text-medium-grey text-center mt-2">
              {t('search.noResults.description', 'Try a different search term')}
            </Text>
          </View>
        ) : (
          <View className="py-2">
            {/* Users Section */}
            {data.users.length > 0 && (
              <View className="mb-4">
                <Text className="text-light-grey text-sm font-medium px-4 py-2 bg-surface">
                  {t('search.sections.users', 'PEOPLE')}
                </Text>
                {data.users.map((user) => (
                  <Pressable
                    key={user.id}
                    onPress={() => handleUserPress(user)}
                    className="flex-row items-center px-4 py-3 active:bg-surface"
                  >
                    <View className="w-10 h-10 rounded-full bg-surface overflow-hidden mr-3">
                      {user.avatar_url ? (
                        <Image source={{ uri: user.avatar_url }} className="w-full h-full" />
                      ) : (
                        <View className="w-full h-full items-center justify-center bg-primary-100">
                          <Text className="text-primary font-semibold">
                            {user.display_name.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View className="flex-1">
                      <Text className="text-dark-grey font-medium">{user.display_name}</Text>
                      <Text className="text-medium-grey text-sm">@{user.username}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}

            {/* Places Section */}
            {data.places.length > 0 && (
              <View className="mb-4">
                <Text className="text-light-grey text-sm font-medium px-4 py-2 bg-surface">
                  {t('search.sections.places', 'PLACES')}
                </Text>
                {data.places.map((place, index) => (
                  <Pressable
                    key={`${place.id || place.google_place_id}-${index}`}
                    onPress={() => handlePlacePress(place)}
                    className="flex-row items-center px-4 py-3 active:bg-surface"
                  >
                    <View className="w-10 h-10 bg-primary-100 rounded-lg items-center justify-center mr-3">
                      <Ionicons name="location" size={20} color="#FD512E" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-dark-grey font-medium" numberOfLines={1}>
                        {place.name}
                      </Text>
                      <Text className="text-medium-grey text-sm" numberOfLines={1}>
                        {place.city}, {place.country}
                      </Text>
                    </View>
                    {place.recommendation_count && place.recommendation_count > 0 && (
                      <View className="bg-primary-100 px-2 py-1 rounded">
                        <Text className="text-primary text-xs font-medium">
                          {place.recommendation_count} recs
                        </Text>
                      </View>
                    )}
                  </Pressable>
                ))}
              </View>
            )}

            {/* Experiences Section */}
            {data.experiences.length > 0 && (
              <View>
                <Text className="text-light-grey text-sm font-medium px-4 py-2 bg-surface">
                  {t('search.sections.experiences', 'RECOMMENDATIONS')}
                </Text>
                {data.experiences.map((experience) => (
                  <Pressable
                    key={experience.id}
                    onPress={() => handleExperiencePress(experience)}
                    className="flex-row items-center px-4 py-3 active:bg-surface"
                  >
                    <View className="w-12 h-12 bg-surface rounded-lg overflow-hidden mr-3">
                      {experience.place.thumbnail_image_url ? (
                        <Image
                          source={{ uri: experience.place.thumbnail_image_url }}
                          className="w-full h-full"
                        />
                      ) : (
                        <View className="w-full h-full items-center justify-center">
                          <Ionicons name="image-outline" size={20} color="#888888" />
                        </View>
                      )}
                    </View>
                    <View className="flex-1">
                      <Text className="text-dark-grey font-medium" numberOfLines={1}>
                        {experience.place.name}
                      </Text>
                      <Text className="text-medium-grey text-sm" numberOfLines={1}>
                        by {experience.user.display_name}
                      </Text>
                    </View>
                    <Text className="text-primary font-semibold">
                      {experience.price_range}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
