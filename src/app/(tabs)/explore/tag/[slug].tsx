import React from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { ExperienceCard } from '@/components';
import { useExploreByTag, useToggleBookmark } from '@/hooks';
import type { ExperienceFeedItem } from '@/domain/models';

export default function TagExploreScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { t } = useTranslation();

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useExploreByTag(slug);

  const { toggle: toggleBookmark } = useToggleBookmark();

  const [refreshing, setRefreshing] = React.useState(false);

  const experiences = data?.pages.flatMap((page) => page.experiences) || [];
  const tagInfo = data?.pages[0]?.tag;

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleExperiencePress = (experience: ExperienceFeedItem) => {
    router.push(`/experience/${experience.experience_id}`);
  };

  const handleBookmarkToggle = async (experience: ExperienceFeedItem) => {
    await toggleBookmark(experience.experience_id, experience.isBookmarked ?? false);
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderItem = ({ item }: { item: ExperienceFeedItem }) => (
    <View className="px-4">
      <ExperienceCard
        experience={item}
        onPress={() => handleExperiencePress(item)}
        onBookmarkToggle={() => handleBookmarkToggle(item)}
      />
    </View>
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View className="py-4 items-center">
        <ActivityIndicator color="#FD512E" />
      </View>
    );
  };

  if (isLoading && !data) {
    return (
      <SafeAreaView className="flex-1 bg-surface items-center justify-center">
        <ActivityIndicator size="large" color="#FD512E" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-divider">
        <Pressable onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color="#111111" />
        </Pressable>
        <View className="flex-1 ml-2">
          <Text className="text-lg font-bold text-dark-grey">
            {tagInfo?.display_name || slug}
          </Text>
          {data?.pages[0]?.total && (
            <Text className="text-medium-grey text-sm">
              {data.pages[0].total} {t('explore.tag.places', 'places')}
            </Text>
          )}
        </View>
      </View>

      <FlatList
        data={experiences}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: 16 }}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <View className="items-center py-12 px-6">
            <Ionicons name="pricetag-outline" size={48} color="#888888" />
            <Text className="text-medium-grey text-center mt-4">
              {t('explore.tag.empty', 'No places found with this tag')}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
