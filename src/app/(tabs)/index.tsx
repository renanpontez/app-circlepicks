import React, { useCallback } from 'react';
import { View, Text, RefreshControl, Pressable, ActivityIndicator } from 'react-native';
import { TabScrollView } from '@/components/ui/TabScrollView';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { ExperienceCard, Logo } from '@/components';
import { useAllFeedSections, useToggleBookmark } from '@/hooks';
import { useTheme } from '@/providers/ThemeProvider';
import type { ExperienceFeedItem } from '@/domain/models';

export default function FeedScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const { my, friends, community, isLoading, refetchAll } = useAllFeedSections();
  const { toggle: toggleBookmark } = useToggleBookmark();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetchAll();
    setRefreshing(false);
  }, [refetchAll]);

  const handleExperiencePress = (experience: ExperienceFeedItem) => {
    router.push(`/experience/${experience.experience_id}`);
  };

  const handleBookmarkToggle = async (experience: ExperienceFeedItem) => {
    await toggleBookmark(experience.experience_id, experience.isBookmarked ?? false, experience.bookmarkId);
  };

  // Build ordered sections: circle (friends) → community → my
  const sections: { title: string; data: ExperienceFeedItem[] }[] = [];

  if (friends.data?.experiences?.length) {
    sections.push({
      title: t('feed.sections.friends', "My Circle's Suggestions"),
      data: friends.data.experiences,
    });
  }
  if (community.data?.experiences?.length) {
    sections.push({
      title: t('feed.sections.community', "Community's Suggestions"),
      data: community.data.experiences,
    });
  }
  if (my.data?.experiences?.length) {
    sections.push({
      title: t('feed.sections.my', 'My Own Suggestions'),
      data: my.data.experiences,
    });
  }

  return (
    <SafeAreaView className="flex-1 bg-surface dark:bg-secondary-900" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white dark:bg-secondary-900 border-b border-divider dark:border-secondary-700">
        <View className="flex-row items-center gap-2">
          <Logo size={28} />
          <Text className="text-xl font-bold text-dark-grey dark:text-white">{t('common.appName')}</Text>
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
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FD512E"
          />
        }
      >
        {isLoading && !refreshing ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#FD512E" />
            <Text className="text-medium-grey dark:text-secondary-400 mt-4">
              {t('feed.loading', 'Loading your feed...')}
            </Text>
          </View>
        ) : sections.length > 0 ? (
          <View className="px-4 pt-4">
            {sections.map((section) => (
              <View key={section.title} className="mb-6">
                <Text className="text-lg font-bold text-dark-grey dark:text-white mb-3">
                  {section.title}
                  <Text className="text-light-grey dark:text-secondary-500 font-normal"> ({section.data.length})</Text>
                </Text>
                {section.data.map((experience) => (
                  <ExperienceCard
                    key={experience.id}
                    experience={experience}
                    onPress={() => handleExperiencePress(experience)}
                    onBookmarkToggle={() => handleBookmarkToggle(experience)}
                  />
                ))}
              </View>
            ))}
          </View>
        ) : (
          <View className="items-center py-20 px-6">
            <View className="w-20 h-20 bg-primary-100 dark:bg-primary-900 rounded-full items-center justify-center mb-4">
              <Ionicons name="compass-outline" size={40} color="#FD512E" />
            </View>
            <Text className="text-xl font-bold text-dark-grey dark:text-white mb-2 text-center">
              {t('feed.empty.title', 'Your feed is empty')}
            </Text>
            <Text className="text-medium-grey dark:text-secondary-400 text-center mb-6">
              {t(
                'feed.empty.description',
                'Start by adding your favorite experiences or follow friends to see their recommendations'
              )}
            </Text>
            <Pressable
              onPress={() => router.push('/(tabs)/add')}
              className="bg-primary px-6 py-3 rounded-xl active:bg-primary-600"
            >
              <Text className="text-white font-semibold">
                {t('feed.empty.action', 'Add Your First Experience')}
              </Text>
            </Pressable>
          </View>
        )}
      </TabScrollView>
    </SafeAreaView>
  );
}
