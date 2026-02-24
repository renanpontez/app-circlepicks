import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { ExperienceCard } from '@/components';
import { CachedImage } from '@/components/ui/CachedImage';
import { useUserProfile, useUserExperiences, useFollowStatus, useToggleFollow, useToggleBookmark } from '@/hooks';
import { useAuthStore } from '@/stores';
import { useTheme } from '@/providers/ThemeProvider';
import { colors } from '@/styles/colors';
import type { ExperienceFeedItem } from '@/domain/models';

export default function UserProfileScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { t } = useTranslation();
  const { user: currentUser } = useAuthStore();
  const { toggle: toggleBookmark } = useToggleBookmark();
  const { isDark } = useTheme();

  const [refreshing, setRefreshing] = useState(false);

  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useUserProfile(userId);
  const { data: experiences, isLoading: experiencesLoading, refetch: refetchExperiences } = useUserExperiences(userId);
  const { data: followStatus } = useFollowStatus(userId);
  const { toggle: toggleFollow, isLoading: followLoading } = useToggleFollow();

  const isOwnProfile = currentUser?.id === userId;

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchProfile(), refetchExperiences()]);
    setRefreshing(false);
  };

  const handleExperiencePress = (experience: ExperienceFeedItem) => {
    router.push(`/experience/${experience.experience_id}`);
  };

  const handleBookmarkToggle = async (experience: ExperienceFeedItem) => {
    await toggleBookmark(experience.experience_id, experience.isBookmarked ?? false, experience.bookmarkId);
  };

  const handleFollowToggle = async () => {
    if (followLoading || !userId) return;
    await toggleFollow(userId, followStatus?.isFollowing ?? false);
  };

  if (profileLoading && !profile) {
    return (
      <SafeAreaView className="flex-1 bg-surface dark:bg-secondary-900 items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-secondary-900 items-center justify-center px-6">
        <Ionicons name="person-outline" size={48} color={isDark ? colors.secondary[400] : colors['light-grey']} />
        <Text className="text-medium-grey dark:text-secondary-400 text-center mt-4">
          {t('userProfile.notFound', 'User not found')}
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-4 bg-primary px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">
            {t('common.goBack', 'Go Back')}
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface dark:bg-secondary-900" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-white dark:bg-secondary-900 border-b border-divider dark:border-secondary-700">
        <Pressable onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color={isDark ? colors.white : colors['dark-grey']} />
        </Pressable>
        <Text className="flex-1 text-lg font-bold text-dark-grey dark:text-white ml-2">
          @{profile.username}
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary.DEFAULT} />
        }
      >
        {/* Profile Info */}
        <View className="bg-white dark:bg-secondary-900 px-4 py-6 border-b border-divider dark:border-secondary-700">
          <View className="flex-row items-center mb-4">
            {/* Avatar */}
            <View className="w-20 h-20 rounded-full bg-surface dark:bg-secondary-800 overflow-hidden mr-4">
              {profile.avatar_url ? (
                <CachedImage source={profile.avatar_url} style={{ width: '100%', height: '100%' }} recyclingKey={userId} />
              ) : (
                <View className="w-full h-full items-center justify-center bg-primary-100 dark:bg-primary-900">
                  <Text className="text-primary text-2xl font-bold">
                    {profile.display_name?.charAt(0).toUpperCase() || '?'}
                  </Text>
                </View>
              )}
            </View>

            {/* Stats */}
            <View className="flex-1 flex-row justify-around">
              <StatItem
                value={profile.stats.experiences_count}
                label={t('profile.stats.experiences', 'Experiences')}
              />
              <StatItem
                value={profile.stats.followers_count}
                label={t('profile.stats.followers', 'Followers')}
              />
              <StatItem
                value={profile.stats.following_count}
                label={t('profile.stats.following', 'Following')}
              />
            </View>
          </View>

          {/* Name */}
          <Text className="text-lg font-bold text-dark-grey dark:text-white">
            {profile.display_name}
          </Text>
          {profile.bio && (
            <Text className="text-medium-grey dark:text-secondary-400 mt-1">{profile.bio}</Text>
          )}

          {/* Follow Button */}
          {!isOwnProfile && (
            <Pressable
              onPress={handleFollowToggle}
              disabled={followLoading}
              className={`mt-4 py-2.5 rounded-xl items-center ${
                followStatus?.isFollowing
                  ? 'border border-divider dark:border-secondary-700 active:bg-surface dark:active:bg-secondary-700'
                  : 'bg-primary active:bg-primary-600'
              }`}
            >
              {followLoading ? (
                <ActivityIndicator color={followStatus?.isFollowing ? (isDark ? colors.white : colors['dark-grey']) : colors.white} />
              ) : (
                <Text
                  className={`font-semibold ${
                    followStatus?.isFollowing ? 'text-dark-grey dark:text-white' : 'text-white'
                  }`}
                >
                  {followStatus?.isFollowing
                    ? t('userProfile.following', 'Following')
                    : t('userProfile.follow', 'Follow')}
                </Text>
              )}
            </Pressable>
          )}
        </View>

        {/* Experiences */}
        <View className="p-4">
          <Text className="text-lg font-bold text-dark-grey dark:text-white mb-4">
            {t('userProfile.experiences', 'Experiences')}
            {experiences && (
              <Text className="text-light-grey dark:text-secondary-500 font-normal"> ({experiences.length})</Text>
            )}
          </Text>

          {experiencesLoading ? (
            <View className="py-8 items-center">
              <ActivityIndicator color={colors.primary.DEFAULT} />
            </View>
          ) : experiences && experiences.length > 0 ? (
            experiences.map((experience) => (
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
              <Ionicons name="map-outline" size={48} color={isDark ? colors.secondary[500] : colors['light-grey']} />
              <Text className="text-medium-grey dark:text-secondary-400 mt-4 text-center">
                {t('userProfile.noExperiences', "This user hasn't added any experiences yet")}
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
      <Text className="text-xl font-bold text-dark-grey dark:text-white">{value}</Text>
      <Text className="text-medium-grey dark:text-secondary-400 text-sm">{label}</Text>
    </View>
  );
}
