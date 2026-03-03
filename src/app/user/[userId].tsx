import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { ExperienceCard } from '@/components';
import { CachedImage } from '@/components/ui/CachedImage';
import { DropdownMenu, type MenuItem } from '@/components/ui/DropdownMenu';
import { useUserProfile, useUserExperiences, useFollowStatus, useToggleFollow, useToggleBookmark } from '@/hooks';
import { useBlockUser, useUnblockUser, useBlockStatus } from '@/hooks/useBlock';
import { useReportContent } from '@/hooks/useReport';
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
  const { data: blockStatus } = useBlockStatus(userId);
  const { mutate: blockUser } = useBlockUser();
  const { mutate: unblockUser } = useUnblockUser();
  const isBlocked = blockStatus?.isBlocked ?? false;
  const { mutate: reportUser } = useReportContent({
    onSuccess: () => {
      Alert.alert(
        t('block.title', 'Block user'),
        t('block.afterReportMessage', 'Would you also like to block this user?'),
        [
          {
            text: t('common.no', 'No'),
            style: 'cancel',
            onPress: () => router.replace('/(tabs)'),
          },
          {
            text: t('block.confirm', 'Block'),
            style: 'destructive',
            onPress: () => {
              blockUser(userId);
              router.replace('/(tabs)');
            },
          },
        ],
      );
    },
  });

  const isOwnProfile = currentUser?.id === userId;

  const handleReportUser = (reason: 'spam' | 'inappropriate' | 'other') => {
    reportUser({ user_id: userId, reason });
  };

  const profileMenuItems: MenuItem[] = isBlocked
    ? [
        {
          icon: 'ban-outline',
          label: t('unblock.title', 'Unblock user'),
          onPress: () => unblockUser(userId),
        },
      ]
    : [
        {
          icon: 'flag-outline',
          label: t('report.title', 'Report'),
          onPress: () => {
            Alert.alert(
              t('report.title', 'Report'),
              t('report.userMessage', 'Why are you reporting this user?'),
              [
                { text: t('common.cancel', 'Cancel'), style: 'cancel' },
                {
                  text: t('report.reasons.spam', 'Spam'),
                  onPress: () => handleReportUser('spam'),
                },
                {
                  text: t('report.reasons.inappropriate', 'Inappropriate'),
                  onPress: () => handleReportUser('inappropriate'),
                },
                {
                  text: t('report.reasons.other', 'Other'),
                  onPress: () => handleReportUser('other'),
                },
              ],
            );
          },
        },
        {
          icon: 'ban-outline',
          label: t('block.title', 'Block user'),
          onPress: handleBlock,
          destructive: true,
        },
      ];

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

    if (followStatus?.isFollowing) {
      Alert.alert(
        t('unfollow.confirmTitle', 'Unfollow user?'),
        t('unfollow.confirmMessage', 'You will no longer see their experiences in your feed.'),
        [
          { text: t('common.cancel', 'Cancel'), style: 'cancel' },
          {
            text: t('unfollow.confirm', 'Unfollow'),
            style: 'destructive',
            onPress: () => toggleFollow(userId, true),
          },
        ],
      );
      return;
    }

    await toggleFollow(userId, false);
  };

  const handleBlock = () => {
    Alert.alert(
      t('block.title', 'Block user'),
      t('block.confirmMessage', 'You will no longer see content from this user. Are you sure?'),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('block.confirm', 'Block'),
          style: 'destructive',
          onPress: () => {
            blockUser(userId);
            router.replace('/(tabs)');
          },
        },
      ]
    );
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
        <View className="flex-1 ml-2" />
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary.DEFAULT} />
        }
      >
        {/* Profile Info */}
        <View className="bg-white dark:bg-secondary-900 px-4 py-6 border-b border-divider dark:border-secondary-700">
          <View className="flex-row items-center mb-3">
            {/* Avatar */}
            <View className="w-20 h-20 rounded-full bg-surface dark:bg-secondary-800 overflow-hidden mr-5">
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

            {/* Name + Stats */}
            <View className="flex-1">
              <Text className="text-xl font-bold text-dark-grey dark:text-white">
                {profile.display_name}
              </Text>
              <Text className="text-medium-grey dark:text-secondary-400 text-base mt-1">
                <Text className="font-bold text-dark-grey dark:text-white">{profile.stats.experiences_count}</Text> {t('profile.stats.experiences', 'Experiences')}{'  '}
                <Text className="font-bold text-dark-grey dark:text-white">{profile.stats.followers_count}</Text> {t('profile.stats.followers', 'Followers')}
              </Text>
            </View>
          </View>

          {/* Bio */}
          {profile.bio && (
            <Text className="text-medium-grey dark:text-secondary-400 mb-1">{profile.bio}</Text>
          )}

          {/* Follow Button + Menu */}
          {!isOwnProfile && (
            <View className="flex-row mt-4 gap-2">
              {isBlocked ? (
                <View className="flex-1 py-2.5 rounded-xl items-center bg-red-100 dark:bg-red-900/30">
                  <Text className="font-semibold text-red-500">
                    {t('userProfile.blocked', 'Blocked')}
                  </Text>
                </View>
              ) : (
                <Pressable
                  onPress={handleFollowToggle}
                  disabled={followLoading}
                  className={`flex-1 py-2.5 rounded-xl items-center ${
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
              <DropdownMenu
                items={profileMenuItems}
                offsetTop={280}
                offsetRight={16}
                renderTrigger={(onPress) => (
                  <Pressable
                    onPress={onPress}
                    className="py-2.5 px-4 rounded-xl items-center justify-center border border-divider dark:border-secondary-700 active:bg-surface dark:active:bg-secondary-700"
                  >
                    <Ionicons name="ellipsis-horizontal" size={20} color={isDark ? colors.white : colors['dark-grey']} />
                  </Pressable>
                )}
              />
            </View>
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

