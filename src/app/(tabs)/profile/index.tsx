import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { ExperienceCard, ExperienceCardSkeleton, ShimmerBlock } from '@/components';
import { CachedImage } from '@/components/ui/CachedImage';
import { useMyProfile, useUserExperiences, useBookmarks, useAuth, useToggleBookmark } from '@/hooks';
import { useAuthStore } from '@/stores';
import { useTheme } from '@/providers/ThemeProvider';
import { TAB_BAR_BOTTOM_SPACING } from '@/constants/layout';
import type { ExperienceFeedItem } from '@/domain/models';

type TabType = 'experiences' | 'bookmarks';

export default function ProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { signOut } = useAuth();
  const { toggle: toggleBookmark } = useToggleBookmark();
  const { isDark } = useTheme();

  const [activeTab, setActiveTab] = useState<TabType>('experiences');
  const [refreshing, setRefreshing] = useState(false);

  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useMyProfile();
  const { data: experiences, isLoading: experiencesLoading, refetch: refetchExperiences } = useUserExperiences(user?.id || '');
  const { data: bookmarksData, isLoading: bookmarksLoading, refetch: refetchBookmarks } = useBookmarks();

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchProfile(), refetchExperiences(), refetchBookmarks()]);
    setRefreshing(false);
  };

  const handleExperiencePress = useCallback((experience: ExperienceFeedItem) => {
    router.push(`/experience/${experience.experience_id}`);
  }, [router]);

  const handleBookmarkToggle = useCallback(async (experience: ExperienceFeedItem) => {
    await toggleBookmark(experience.experience_id, experience.isBookmarked ?? false, experience.bookmarkId);
  }, [toggleBookmark]);

  const handleSettings = () => {
    router.push('/settings');
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const displayData = activeTab === 'experiences' ? experiences : bookmarksData;
  const isTabLoading = activeTab === 'experiences'
    ? (experiencesLoading && !experiences)
    : (bookmarksLoading && !bookmarksData);

  const renderItem = useCallback(({ item, index }: { item: ExperienceFeedItem; index: number }) => (
    <View className={`px-4 ${index === 0 ? 'pt-6' : ''}`}>
      <ExperienceCard
        experience={item}
        onPress={() => handleExperiencePress(item)}
        onBookmarkToggle={() => handleBookmarkToggle(item)}
        showUser={false}
      />
    </View>
  ), [handleExperiencePress, handleBookmarkToggle]);

  const ListHeader = (
    <>
      {/* Profile Info */}
      <View className="bg-white dark:bg-secondary-900 px-4 py-6 border-b border-divider dark:border-secondary-700">
        <View className="flex-row items-center mb-4">
          {/* Avatar */}
          <View className="w-20 h-20 rounded-full bg-surface dark:bg-secondary-800 overflow-hidden mr-4">
            {user?.avatar_url ? (
              <CachedImage source={user.avatar_url} style={{ width: '100%', height: '100%' }} recyclingKey={user.id} />
            ) : (
              <View className="w-full h-full items-center justify-center bg-primary-100 dark:bg-primary-900">
                <Text className="text-primary text-2xl font-bold">
                  {user?.display_name?.charAt(0).toUpperCase() || '?'}
                </Text>
              </View>
            )}
          </View>

          {/* Stats */}
          <View className="flex-1 flex-row justify-around">
            <StatItem
              value={profile?.stats.experiences_count || 0}
              label={t('profile.stats.experiences', 'Experiences')}
            />
            <StatItem
              value={profile?.stats.followers_count || 0}
              label={t('profile.stats.followers', 'Followers')}
            />
            <StatItem
              value={profile?.stats.following_count || 0}
              label={t('profile.stats.following', 'Following')}
            />
          </View>
        </View>

        {/* Name and Username */}
        <Text className="text-lg font-bold text-dark-grey dark:text-white">
          {user?.display_name}
        </Text>

        {/* Edit Profile Button */}
        <Pressable
          onPress={() => router.push('/profile/edit')}
          className="mt-4 border border-divider dark:border-secondary-700 rounded-full py-2.5 items-center active:bg-surface dark:active:bg-secondary-700"
        >
          <Text className="text-dark-grey dark:text-white font-medium">
            {t('profile.editProfile', 'Edit Profile')}
          </Text>
        </Pressable>
      </View>

      {/* Tabs */}
      <View className="flex-row bg-white dark:bg-secondary-900 border-b border-divider dark:border-secondary-700">
        <TabButton
          title={t('profile.tabs.experiences', 'My Experiences')}
          isActive={activeTab === 'experiences'}
          onPress={() => setActiveTab('experiences')}
        />
        <TabButton
          title={t('profile.tabs.bookmarks', 'Saved')}
          isActive={activeTab === 'bookmarks'}
          onPress={() => setActiveTab('bookmarks')}
        />
      </View>
    </>
  );

  const SkeletonList = (
    <View className="p-4 py-6">
      <ExperienceCardSkeleton showUser={false} />
      <ExperienceCardSkeleton showUser={false} />
      <ExperienceCardSkeleton showUser={false} />
    </View>
  );

  const EmptyState = (
    <View className="items-center py-12">
      <Ionicons
        name={activeTab === 'experiences' ? 'map-outline' : 'bookmark-outline'}
        size={48}
        color={isDark ? '#a3a3a3' : '#888888'}
      />
      <Text className="text-medium-grey dark:text-secondary-400 mt-4 text-center">
        {activeTab === 'experiences'
          ? t('profile.empty.experiences', "You haven't added any experiences yet")
          : t('profile.empty.bookmarks', "You haven't saved any experiences yet")}
      </Text>
    </View>
  );

  // Show skeleton loading or empty state as footer when no list data
  const isProfileLoading = profileLoading && !profile;
  const showList = !isProfileLoading && !isTabLoading && displayData && displayData.length > 0;

  const HeaderBar = (
    <View className="flex-row items-center justify-between px-4 py-3 bg-white dark:bg-secondary-900 border-b border-divider dark:border-secondary-700">
      <Text className="text-xl font-bold text-dark-grey dark:text-white">
        {t('profile.title', 'Profile')}
      </Text>
      <View className="flex-row gap-2">
        <Pressable
          onPress={handleSettings}
          className="p-2 active:bg-surface dark:active:bg-secondary-700 rounded-full"
        >
          <Ionicons name="settings-outline" size={24} color={isDark ? '#FFFFFF' : '#111111'} />
        </Pressable>
        <Pressable
          onPress={handleSignOut}
          className="p-2 active:bg-surface dark:active:bg-secondary-700 rounded-full"
        >
          <Ionicons name="log-out-outline" size={24} color={isDark ? '#FFFFFF' : '#111111'} />
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-surface dark:bg-secondary-900" edges={['top']}>
      {HeaderBar}

      {showList ? (
        <FlashList
          data={displayData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={{ paddingBottom: TAB_BAR_BOTTOM_SPACING }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FD512E" />
          }
        />
      ) : (
        <FlashList
          data={[]}
          renderItem={() => null}
          ListHeaderComponent={
            <>
              {isProfileLoading ? <ProfileHeaderSkeleton /> : ListHeader}
              {isProfileLoading || isTabLoading ? SkeletonList : EmptyState}
            </>
          }
          contentContainerStyle={{ paddingBottom: TAB_BAR_BOTTOM_SPACING }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FD512E" />
          }
        />
      )}
    </SafeAreaView>
  );
}

function ProfileHeaderSkeleton() {
  return (
    <>
      <View className="bg-white dark:bg-secondary-900 px-4 py-6 border-b border-divider dark:border-secondary-700">
        <View className="flex-row items-center mb-4">
          {/* Avatar */}
          <ShimmerBlock className="w-20 h-20 rounded-full mr-4" />
          {/* Stats */}
          <View className="flex-1 flex-row justify-around">
            {[1, 2, 3].map((i) => (
              <View key={i} className="items-center">
                <ShimmerBlock className="h-6 w-8 rounded mb-1" />
                <ShimmerBlock className="h-3.5 w-14 rounded" />
              </View>
            ))}
          </View>
        </View>
        {/* Name */}
        <ShimmerBlock className="h-5 w-32 rounded mb-4" />
        {/* Edit Profile Button */}
        <ShimmerBlock className="h-11 w-full rounded-full" />
      </View>
      {/* Tabs */}
      <View className="flex-row bg-white dark:bg-secondary-900 border-b border-divider dark:border-secondary-700">
        <View className="flex-1 py-3 items-center border-b-2 border-transparent">
          <ShimmerBlock className="h-4 w-24 rounded" />
        </View>
        <View className="flex-1 py-3 items-center border-b-2 border-transparent">
          <ShimmerBlock className="h-4 w-16 rounded" />
        </View>
      </View>
    </>
  );
}

function StatItem({ value, label }: { value: number; label: string }) {
  return (
    <View className="items-center">
      <Text className="text-xl font-bold text-dark-grey dark:text-white">{value}</Text>
      <Text className="text-medium-grey dark:text-secondary-400 text-sm">{label}</Text>
    </View>
  );
}

function TabButton({
  title,
  isActive,
  onPress,
}: {
  title: string;
  isActive: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-1 py-3 items-center border-b-2 ${
        isActive ? 'border-primary' : 'border-transparent'
      }`}
    >
      <Text
        className={`font-medium ${
          isActive ? 'text-primary' : 'text-medium-grey dark:text-secondary-400'
        }`}
      >
        {title}
      </Text>
    </Pressable>
  );
}
