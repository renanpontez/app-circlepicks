import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  Linking,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { useExperience, useIsBookmarked, useToggleBookmark } from '@/hooks';
import { useAuthStore } from '@/stores';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ExperienceDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { user: currentUser } = useAuthStore();

  const { data: experience, isLoading, error } = useExperience(id);
  const { data: bookmarkStatus } = useIsBookmarked(id);
  const { toggle: toggleBookmark, isLoading: bookmarkLoading } = useToggleBookmark();

  const [activeImageIndex, setActiveImageIndex] = React.useState(0);

  const handleBookmarkToggle = async () => {
    if (bookmarkLoading) return;
    await toggleBookmark(id, bookmarkStatus?.isBookmarked ?? false);
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
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#FD512E" />
      </SafeAreaView>
    );
  }

  if (error || !experience) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
        <Ionicons name="alert-circle-outline" size={48} color="#888888" />
        <Text className="text-medium-grey text-center mt-4">
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
      </SafeAreaView>
    );
  }

  const isOwner = experience.user.id === currentUser?.id;
  const images = experience.images || [];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="absolute top-12 left-0 right-0 z-10 flex-row items-center justify-between px-4">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 bg-white/90 rounded-full items-center justify-center shadow-sm"
        >
          <Ionicons name="arrow-back" size={22} color="#111111" />
        </Pressable>
        <View className="flex-row gap-2">
          {isOwner && (
            <Pressable
              onPress={handleEdit}
              className="w-10 h-10 bg-white/90 rounded-full items-center justify-center shadow-sm"
            >
              <Ionicons name="pencil" size={20} color="#111111" />
            </Pressable>
          )}
          <Pressable
            onPress={handleBookmarkToggle}
            disabled={bookmarkLoading}
            className="w-10 h-10 bg-white/90 rounded-full items-center justify-center shadow-sm"
          >
            <Ionicons
              name={bookmarkStatus?.isBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={22}
              color={bookmarkStatus?.isBookmarked ? '#FD512E' : '#111111'}
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
                  <Image
                    key={index}
                    source={{ uri }}
                    className="w-screen aspect-[4/3]"
                    resizeMode="cover"
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
            <View className="w-full aspect-[4/3] bg-surface items-center justify-center">
              <Ionicons name="image-outline" size={64} color="#888888" />
            </View>
          )}
        </View>

        {/* Content */}
        <View className="px-4 py-5">
          {/* Place Info */}
          <Text className="text-2xl font-bold text-dark-grey mb-1">
            {experience.place.name}
          </Text>
          <View className="flex-row items-center mb-4">
            <Text className="text-medium-grey">
              {experience.place.city}, {experience.place.country}
            </Text>
            <Text className="text-light-grey mx-2">·</Text>
            <Text className="text-primary font-semibold">{experience.price_range}</Text>
            {experience.place.recommendation_count && experience.place.recommendation_count > 1 && (
              <>
                <Text className="text-light-grey mx-2">·</Text>
                <Text className="text-light-grey">
                  {experience.place.recommendation_count} recs
                </Text>
              </>
            )}
          </View>

          {/* Tags */}
          {experience.tags.length > 0 && (
            <View className="flex-row flex-wrap gap-2 mb-5">
              {experience.tags.map((tag) => (
                <View key={tag.slug} className="bg-chip px-3 py-1.5 rounded-full">
                  <Text className="text-medium-grey text-sm font-medium">
                    {tag.display_name}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* User Info */}
          <Pressable
            onPress={() => handleUserPress(experience.user.id)}
            className="flex-row items-center py-4 border-t border-b border-divider mb-5"
          >
            <View className="w-10 h-10 rounded-full bg-surface overflow-hidden mr-3">
              {experience.user.avatar_url ? (
                <Image
                  source={{ uri: experience.user.avatar_url }}
                  className="w-full h-full"
                />
              ) : (
                <View className="w-full h-full items-center justify-center bg-primary-100">
                  <Text className="text-primary font-semibold">
                    {experience.user.display_name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            <View className="flex-1">
              <Text className="text-dark-grey font-medium">
                {experience.user.display_name}
              </Text>
              <Text className="text-light-grey text-sm">{experience.time_ago}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#888888" />
          </Pressable>

          {/* Description */}
          {experience.brief_description && (
            <View className="mb-5">
              <Text className="text-dark-grey leading-6">
                "{experience.brief_description}"
              </Text>
            </View>
          )}

          {/* Open in Maps */}
          {(experience.place.lat || experience.place.google_maps_url) && (
            <Pressable
              onPress={handleOpenMaps}
              className="flex-row items-center bg-surface py-4 px-4 rounded-xl mb-5"
            >
              <View className="w-10 h-10 bg-white rounded-full items-center justify-center mr-3">
                <Ionicons name="map" size={20} color="#FD512E" />
              </View>
              <View className="flex-1">
                <Text className="text-dark-grey font-medium">
                  {t('experience.openMaps', 'Open in Maps')}
                </Text>
                {experience.place.address && (
                  <Text className="text-medium-grey text-sm" numberOfLines={1}>
                    {experience.place.address}
                  </Text>
                )}
              </View>
              <Ionicons name="open-outline" size={20} color="#888888" />
            </Pressable>
          )}

          {/* Other Recommenders */}
          {experience.other_recommenders && experience.other_recommenders.length > 0 && (
            <View className="mt-2">
              <Text className="text-dark-grey font-semibold mb-3">
                {t('experience.alsoRecommended', 'Also recommended by')}
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {experience.other_recommenders.map((recommender) => (
                  <Pressable
                    key={recommender.id}
                    onPress={() => handleUserPress(recommender.id)}
                    className="flex-row items-center bg-surface px-3 py-2 rounded-full"
                  >
                    <View className="w-6 h-6 rounded-full bg-primary-100 mr-2 overflow-hidden">
                      {recommender.avatar_url ? (
                        <Image
                          source={{ uri: recommender.avatar_url }}
                          className="w-full h-full"
                        />
                      ) : (
                        <View className="w-full h-full items-center justify-center">
                          <Text className="text-primary text-xs font-semibold">
                            {recommender.display_name.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-dark-grey text-sm font-medium">
                      {recommender.display_name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
