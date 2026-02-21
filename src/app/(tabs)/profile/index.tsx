import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Image, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { ExperienceCard } from '@/components';
import { useMyProfile, useUserExperiences, useBookmarks, useAuth, useToggleBookmark } from '@/hooks';
import { useAuthStore } from '@/stores';
import type { ExperienceFeedItem } from '@/domain/models';

type TabType = 'experiences' | 'bookmarks';

export default function ProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { signOut } = useAuth();
  const { toggle: toggleBookmark } = useToggleBookmark();

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

  const handleExperiencePress = (experience: ExperienceFeedItem) => {
    router.push(`/experience/${experience.experience_id}`);
  };

  const handleBookmarkToggle = async (experience: ExperienceFeedItem) => {
    await toggleBookmark(experience.experience_id, experience.isBookmarked ?? false);
  };

  const handleSettings = () => {
    // TODO: Navigate to settings
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (profileLoading && !profile) {
    return (
      <SafeAreaView className="flex-1 bg-surface items-center justify-center">
        <ActivityIndicator size="large" color="#FD512E" />
      </SafeAreaView>
    );
  }

  const displayData = activeTab === 'experiences' ? experiences : bookmarksData?.bookmarks;
  const isTabLoading = activeTab === 'experiences' ? experiencesLoading : bookmarksLoading;

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-divider">
        <Text className="text-xl font-bold text-dark-grey">
          {t('profile.title', 'Profile')}
        </Text>
        <View className="flex-row gap-2">
          <Pressable
            onPress={handleSettings}
            className="p-2 active:bg-surface rounded-full"
          >
            <Ionicons name="settings-outline" size={24} color="#111111" />
          </Pressable>
          <Pressable
            onPress={handleSignOut}
            className="p-2 active:bg-surface rounded-full"
          >
            <Ionicons name="log-out-outline" size={24} color="#111111" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FD512E" />
        }
      >
        {/* Profile Info */}
        <View className="bg-white px-4 py-6 border-b border-divider">
          <View className="flex-row items-center mb-4">
            {/* Avatar */}
            <View className="w-20 h-20 rounded-full bg-surface overflow-hidden mr-4">
              {user?.avatar_url ? (
                <Image source={{ uri: user.avatar_url }} className="w-full h-full" />
              ) : (
                <View className="w-full h-full items-center justify-center bg-primary-100">
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
                label={t('profile.stats.experiences', 'Places')}
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
          <Text className="text-lg font-bold text-dark-grey">
            {user?.display_name}
          </Text>
          <Text className="text-medium-grey">@{user?.username}</Text>

          {/* Edit Profile Button */}
          <Pressable
            onPress={() => {/* TODO: Edit profile */}}
            className="mt-4 border border-divider rounded-xl py-2.5 items-center active:bg-surface"
          >
            <Text className="text-dark-grey font-medium">
              {t('profile.editProfile', 'Edit Profile')}
            </Text>
          </Pressable>
        </View>

        {/* Tabs */}
        <View className="flex-row bg-white border-b border-divider">
          <TabButton
            title={t('profile.tabs.experiences', 'My Places')}
            isActive={activeTab === 'experiences'}
            onPress={() => setActiveTab('experiences')}
          />
          <TabButton
            title={t('profile.tabs.bookmarks', 'Saved')}
            isActive={activeTab === 'bookmarks'}
            onPress={() => setActiveTab('bookmarks')}
          />
        </View>

        {/* Content */}
        <View className="p-4">
          {isTabLoading ? (
            <View className="py-8 items-center">
              <ActivityIndicator color="#FD512E" />
            </View>
          ) : displayData && displayData.length > 0 ? (
            displayData.map((experience) => (
              <ExperienceCard
                key={experience.id}
                experience={experience}
                onPress={() => handleExperiencePress(experience)}
                onBookmarkToggle={() => handleBookmarkToggle(experience)}
                showUser={false}
              />
            ))
          ) : (
            <View className="items-center py-12">
              <Ionicons
                name={activeTab === 'experiences' ? 'map-outline' : 'bookmark-outline'}
                size={48}
                color="#888888"
              />
              <Text className="text-medium-grey mt-4 text-center">
                {activeTab === 'experiences'
                  ? t('profile.empty.experiences', "You haven't added any places yet")
                  : t('profile.empty.bookmarks', "You haven't saved any places yet")}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatItem({ value, label }: { value: number; label: string }) {
  return (
    <View className="items-center">
      <Text className="text-xl font-bold text-dark-grey">{value}</Text>
      <Text className="text-medium-grey text-sm">{label}</Text>
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
          isActive ? 'text-primary' : 'text-medium-grey'
        }`}
      >
        {title}
      </Text>
    </Pressable>
  );
}
