import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Linking,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { useExperience, useToggleBookmark, usePlaceExperiences } from '@/hooks';
import { useAuthStore } from '@/stores';
import { useTheme } from '@/providers/ThemeProvider';
import { ExperienceCard } from '@/components/ExperienceCard';
import { CachedImage } from '@/components/ui/CachedImage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ExperienceDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { user: currentUser } = useAuthStore();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const { data: experience, isLoading, error } = useExperience(id);
  const { toggle: toggleBookmark, isLoading: bookmarkLoading } = useToggleBookmark();

  const { data: placeExperiences } = usePlaceExperiences(
    experience?.place.id ?? '',
    id,
    { enabled: !!experience }
  );

  const [activeImageIndex, setActiveImageIndex] = React.useState(0);

  const handleBookmarkToggle = async () => {
    if (bookmarkLoading || !experience) return;
    await toggleBookmark(id, experience.isBookmarked ?? false, experience.bookmarkId);
  };

  const handleOpenMaps = () => {
    if (!experience?.place.lat || !experience?.place.lng) return;

    const url = experience.place.google_maps_url ||
      `https://maps.google.com/?q=${experience.place.lat},${experience.place.lng}`;
    Linking.openURL(url);
  };

  const handleUserPress = (userId: string) => {
    if (userId === currentUser?.id) {
      router.push('/(tabs)/profile');
    } else {
      router.push(`/user/${userId}`);
    }
  };

  const handleEdit = () => {
    router.push(`/experience/${id}/edit`);
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-white dark:bg-secondary-900 items-center justify-center">
        <ActivityIndicator size="large" color="#FD512E" />
      </View>
    );
  }

  if (error || !experience) {
    return (
      <View className="flex-1 bg-white dark:bg-secondary-900 items-center justify-center px-6">
        <Ionicons name="alert-circle-outline" size={48} color={isDark ? '#a3a3a3' : '#888888'} />
        <Text className="text-medium-grey dark:text-secondary-400 text-center mt-4">
          {t('experience.error', 'Failed to load experience')}
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-4 bg-primary px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">
            {t('common.goBack', 'Go Back')}
          </Text>
        </Pressable>
      </View>
    );
  }

  const isOwner = experience.user.id === currentUser?.id;
  const images = experience.images || [];

  return (
    <View className="flex-1 bg-white dark:bg-secondary-900">
      {/* Header */}
      <View className="absolute left-0 right-0 z-10 flex-row items-center justify-between px-4" style={{ top: insets.top + 8 }}>
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 bg-black/40 rounded-full items-center justify-center"
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </Pressable>
        <View className="flex-row gap-2">
          {isOwner && (
            <Pressable
              onPress={handleEdit}
              className="w-10 h-10 bg-black/40 rounded-full items-center justify-center"
            >
              <Ionicons name="pencil" size={20} color="#FFFFFF" />
            </Pressable>
          )}
          <Pressable
            onPress={handleBookmarkToggle}
            disabled={bookmarkLoading}
            className="w-10 h-10 bg-black/40 rounded-full items-center justify-center"
          >
            <Ionicons
              name={experience?.isBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={22}
              color={experience?.isBookmarked ? '#FD512E' : '#FFFFFF'}
            />
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1" bounces={false}>
        {/* Image Gallery */}
        <View className="relative">
          {images.length > 0 ? (
            <>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={(e) => {
                  const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                  setActiveImageIndex(index);
                }}
                scrollEventThrottle={16}
              >
                {images.map((uri, index) => (
                  <CachedImage
                    key={index}
                    source={uri}
                    style={{ width: SCREEN_WIDTH, aspectRatio: 4 / 3 }}
                    contentFit="cover"
                  />
                ))}
              </ScrollView>
              {images.length > 1 && (
                <View className="absolute bottom-4 left-0 right-0 flex-row justify-center gap-1.5">
                  {images.map((_, index) => (
                    <View
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === activeImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </View>
              )}
            </>
          ) : (
            <View className="w-full aspect-[4/3] bg-surface dark:bg-secondary-800 items-center justify-center">
              <Ionicons name="image-outline" size={64} color={isDark ? '#a3a3a3' : '#888888'} />
            </View>
          )}
        </View>

        {/* Content */}
        <View className="px-4 py-5">
          {/* Place Info */}
          <Text className="text-2xl font-bold text-dark-grey dark:text-white mb-1">
            {experience.place.name}
          </Text>
          <View className="flex-row items-center mb-4">
            <Text className="text-medium-grey dark:text-secondary-400">
              {experience.place.city}, {experience.place.country}
            </Text>
            <Text className="text-light-grey dark:text-secondary-500 mx-2">·</Text>
            <Text className="text-primary font-semibold">{experience.price_range}</Text>
            {experience.place.recommendation_count && experience.place.recommendation_count > 1 && (
              <>
                <Text className="text-light-grey dark:text-secondary-500 mx-2">·</Text>
                <Text className="text-light-grey dark:text-secondary-500">
                  {experience.place.recommendation_count} {t('common.recs')}
                </Text>
              </>
            )}
          </View>

          {/* Tags */}
          {experience.tags.length > 0 && (
            <View className="flex-row flex-wrap gap-2 mb-5">
              {experience.tags.map((tag) => (
                <View key={tag.slug} className="bg-chip dark:bg-secondary-700 px-3 py-1.5 rounded-full">
                  <Text className="text-medium-grey dark:text-secondary-400 text-sm font-medium">
                    {tag.display_name}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* User Info */}
          <Pressable
            onPress={() => handleUserPress(experience.user.id)}
            className="flex-row items-center py-4 border-t border-b border-divider dark:border-secondary-700 mb-5"
          >
            <View className="w-10 h-10 rounded-full bg-surface dark:bg-secondary-800 overflow-hidden mr-3">
              {experience.user.avatar_url ? (
                <CachedImage
                  source={experience.user.avatar_url}
                  style={{ width: '100%', height: '100%' }}
                  recyclingKey={experience.user.id}
                />
              ) : (
                <View className="w-full h-full items-center justify-center bg-primary-100 dark:bg-primary-900">
                  <Text className="text-primary font-semibold">
                    {experience.user.display_name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            <View className="flex-1">
              <Text className="text-dark-grey dark:text-white font-medium">
                {experience.user.display_name}
              </Text>
              <Text className="text-light-grey dark:text-secondary-500 text-sm">{experience.time_ago}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={isDark ? '#a3a3a3' : '#888888'} />
          </Pressable>

          {/* Description */}
          {experience.brief_description && (
            <View className="mb-5">
              <Text className="text-dark-grey dark:text-white text-base leading-6">
                {experience.brief_description}
              </Text>
            </View>
          )}

          {/* Open in Maps */}
          {(experience.place.lat || experience.place.google_maps_url) && (
            <Pressable
              onPress={handleOpenMaps}
              className="flex-row items-center bg-surface dark:bg-secondary-800 py-4 px-4 rounded-xl mb-5 "
            >
              <View className="w-10 h-10 bg-white dark:bg-secondary-700 rounded-full items-center justify-center mr-3">
                <Ionicons name="map" size={20} color="#FD512E" />
              </View>
              <View className="flex-1">
                <Text className="text-dark-grey dark:text-white font-medium">
                  {t('experience.openMaps', 'Open in Maps')}
                </Text>
                {experience.place.address && (
                  <Text className="text-medium-grey dark:text-secondary-400 text-sm" numberOfLines={1}>
                    {experience.place.address}
                  </Text>
                )}
              </View>
              <Ionicons name="open-outline" size={20} color={isDark ? '#a3a3a3' : '#888888'} />
            </Pressable>
          )}

          {/* Other recommendations for this place */}
          {placeExperiences && placeExperiences.length > 0 && (
            <View className="mt-2 border-t border-b border-divider pt-5">
              <Text className="text-dark-grey dark:text-white font-semibold mb-3">
                {t('experience.alsoRecommended', 'Also recommended by')}
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 16 }}
                style={{ marginHorizontal: -16 }}
              >
                {placeExperiences.map((item, index) => (
                  <View
                    key={item.id}
                    style={{ width: SCREEN_WIDTH * 0.42, marginLeft: index === 0 ? 16 : 0, marginRight: 12 }}
                  >
                    <ExperienceCard
                      experience={item}
                      showUser
                      onPress={() => router.push(`/experience/${item.id}`)}
                      onBookmarkToggle={() =>
                        toggleBookmark(item.id, item.isBookmarked ?? false, item.bookmarkId)
                      }
                    />
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
