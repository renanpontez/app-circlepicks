import React from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { TabScrollView } from '@/components/ui/TabScrollView';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { ExperienceCard, Logo } from '@/components';
import { useExplore, useToggleBookmark } from '@/hooks';
import { useTheme } from '@/providers/ThemeProvider';
import type { ExperienceFeedItem, ExploreTag, ExploreCity } from '@/domain/models';

export default function ExploreScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const { data, isLoading, refetch } = useExplore();
  const { toggle: toggleBookmark } = useToggleBookmark();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleTagPress = (tag: ExploreTag) => {
    router.push(`/(tabs)/explore/tag/${tag.slug}`);
  };

  const handleCityPress = (city: ExploreCity) => {
    router.push(`/(tabs)/explore/city/${encodeURIComponent(city.city)}`);
  };

  const handleExperiencePress = (experience: ExperienceFeedItem) => {
    router.push(`/experience/${experience.experience_id}`);
  };

  const handleBookmarkToggle = async (experience: ExperienceFeedItem) => {
    await toggleBookmark(experience.experience_id, experience.isBookmarked ?? false, experience.bookmarkId);
  };

  if (isLoading && !data) {
    return (
      <SafeAreaView className="flex-1 bg-surface dark:bg-secondary-900 items-center justify-center">
        <ActivityIndicator size="large" color="#FD512E" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface dark:bg-secondary-900" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white dark:bg-secondary-900 border-b border-divider dark:border-secondary-700">
        <View className="flex-row items-center gap-2">
          <Logo size={28} />
          <Text className="text-xl font-bold text-dark-grey dark:text-white">
            {t('explore.title', 'Explore')}
          </Text>
        </View>
        <Pressable
          onPress={() => router.push('/search')}
          className="p-2 active:bg-surface dark:active:bg-secondary-700 rounded-full"
        >
          <Ionicons name="search" size={24} color={isDark ? '#FFFFFF' : '#111111'} />
        </Pressable>
      </View>

      <TabScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FD512E" />
        }
      >
        {/* Popular Tags */}
        {data?.popularTags && data.popularTags.length > 0 && (
          <View className="py-4">
            <Text className="text-lg font-bold text-dark-grey dark:text-white px-4 mb-3">
              {t('explore.popularTags', 'Popular Categories')}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="px-4 gap-2"
            >
              {data.popularTags.map((tag) => (
                <Pressable
                  key={tag.slug}
                  onPress={() => handleTagPress(tag)}
                  className="bg-white dark:bg-secondary-900 border border-divider dark:border-secondary-700 px-4 py-2.5 rounded-xl active:bg-surface dark:active:bg-secondary-700"
                >
                  <Text className="text-dark-grey dark:text-white font-medium">{tag.display_name}</Text>
                  <Text className="text-light-grey dark:text-secondary-500 text-xs">{tag.count} {t('common.places', 'experiences')}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Popular Cities */}
        {data?.popularCities && data.popularCities.length > 0 && (
          <View className="py-4">
            <Text className="text-lg font-bold text-dark-grey dark:text-white px-4 mb-3">
              {t('explore.popularCities', 'Popular Cities')}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="px-4 gap-2"
            >
              {data.popularCities.map((city) => (
                <Pressable
                  key={`${city.city}-${city.country}`}
                  onPress={() => handleCityPress(city)}
                  className="bg-white dark:bg-secondary-900 border border-divider dark:border-secondary-700 px-4 py-2.5 rounded-xl active:bg-surface dark:active:bg-secondary-700"
                >
                  <View className="flex-row items-center">
                    <Ionicons name="location" size={16} color="#FD512E" />
                    <Text className="text-dark-grey dark:text-white font-medium ml-1">{city.city}</Text>
                  </View>
                  <Text className="text-light-grey dark:text-secondary-500 text-xs">{city.count} {t('common.places', 'experiences')}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Recent Experiences */}
        {data?.recentExperiences && data.recentExperiences.length > 0 && (
          <View className="py-4 px-4">
            <Text className="text-lg font-bold text-dark-grey dark:text-white mb-3">
              {t('explore.recent', 'Recently Added')}
            </Text>
            {data.recentExperiences.map((experience) => (
              <ExperienceCard
                key={experience.id}
                experience={experience}
                onPress={() => handleExperiencePress(experience)}
                onBookmarkToggle={() => handleBookmarkToggle(experience)}
              />
            ))}
          </View>
        )}

        {/* Empty State */}
        {!data?.popularTags?.length &&
          !data?.popularCities?.length &&
          !data?.recentExperiences?.length && (
            <View className="items-center py-20 px-6">
              <View className="w-20 h-20 bg-primary-100 dark:bg-primary-900 rounded-full items-center justify-center mb-4">
                <Ionicons name="compass-outline" size={40} color="#FD512E" />
              </View>
              <Text className="text-xl font-bold text-dark-grey dark:text-white mb-2 text-center">
                {t('explore.empty.title', 'Nothing to explore yet')}
              </Text>
              <Text className="text-medium-grey dark:text-secondary-400 text-center">
                {t(
                  'explore.empty.description',
                  'Be the first to add experiences in your area!'
                )}
              </Text>
            </View>
          )}
      </TabScrollView>
    </SafeAreaView>
  );
}
