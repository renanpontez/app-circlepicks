import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { CachedImage } from '@/components/ui/CachedImage';
import type { ExperienceFeedItem } from '@/domain/models';

interface ExperienceCardProps {
  experience: ExperienceFeedItem;
  onPress: () => void;
  onBookmarkToggle?: () => void;
  showUser?: boolean;
}

export function ExperienceCard({
  experience,
  onPress,
  onBookmarkToggle,
  showUser = true,
}: ExperienceCardProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, place, price_range, tags, isBookmarked, description } = experience;

  return (
    <Pressable
      onPress={onPress}
      className="mb-6 active:opacity-90"
    >
      {/* User Header */}
      {showUser && (
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            router.push(`/user/${user.id}`);
          }}
          className="flex-row items-center px-1 py-2.5 active:opacity-70"
        >
          <View className="w-8 h-8 rounded-full bg-surface dark:bg-secondary-800 mr-3 overflow-hidden">
            {user.avatar_url ? (
              <CachedImage
                source={user.avatar_url}
                style={{ width: '100%', height: '100%' }}
                recyclingKey={user.id}
              />
            ) : (
              <View className="w-full h-full items-center justify-center bg-primary-100 dark:bg-primary-900">
                <Text className="text-primary text-xs font-semibold">
                  {user.display_name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <View className="flex-1">
            <Text className="text-dark-grey dark:text-white text-sm font-semibold" numberOfLines={1}>
              {user.display_name}
            </Text>
            <Text className="text-medium-grey dark:text-secondary-400 text-sm mt-0.5">
              {place.city_short}, {place.country}
            </Text>
          </View>
        </Pressable>
      )}

      {/* Image */}
      <View className="relative aspect-[4/3]">
        {place.thumbnail_image_url ? (
          <CachedImage
            source={place.thumbnail_image_url}
            style={{ width: '100%', height: '100%', borderRadius: 8 }}
            contentFit="cover"
            recyclingKey={experience.experience_id}
          />
        ) : (
          <View className="w-full h-full bg-surface dark:bg-secondary-800 items-center justify-center rounded-lg">
            <Image
              source={require('@/../assets/icon.png')}
              className="w-16 h-16 opacity-20 rounded-lg"
              resizeMode="contain"
            />
            <Text className="text-light-grey dark:text-secondary-500 text-xs mt-2">{t('common.noImage', 'No image')}</Text>
          </View>
        )}

        {/* Bookmark overlay */}
        {onBookmarkToggle && (
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onBookmarkToggle();
            }}
            className="absolute top-2 right-2 w-9 h-9 bg-black/40 rounded-full items-center justify-center active:opacity-70"
          >
            <Ionicons
              name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={18}
              color={isBookmarked ? '#FD512E' : '#FFFFFF'}
            />
          </Pressable>
        )}

        {/* Recommendation count overlay */}
        {place.recommendation_count != null && place.recommendation_count > 1 && (
          <View className="absolute bottom-2 right-2 flex-row items-center bg-black/40 rounded-full px-2.5 py-1 gap-1">
            <Ionicons name="repeat" size={14} color="#FFFFFF" />
            <Text className="text-white text-xs font-semibold">{place.recommendation_count}</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View className="px-1 pt-2.5 pb-1">
        <Text className="text-lg font-bold text-dark-grey dark:text-white" numberOfLines={1}>
          {place.name}
        </Text>

        {/* Tags */}
        {tags.length > 0 && (
          <View className="flex-row flex-wrap gap-1.5 mt-2 mb-2">
            {tags.slice(0, 3).map((tag) => (
              <View key={tag.slug} className="bg-chip dark:bg-secondary-700 px-2 py-0.5 rounded-full">
                <Text className="text-medium-grey dark:text-secondary-400 text-xs font-medium">
                  {tag.display_name}
                </Text>
              </View>
            ))}
            {tags.length > 3 && (
              <View className="bg-chip dark:bg-secondary-700 px-2 py-0.5 rounded-full">
                <Text className="text-medium-grey dark:text-secondary-400 text-xs font-medium">
                  +{tags.length - 3}
                </Text>
              </View>
            )}

            <Text className="bg-chip dark:bg-secondary-700 px-2 py-0.5 rounded-full text-medium-grey dark:text-secondary-400 text-xs font-medium">{price_range}</Text>
          </View>
        )}
      </View>

      {/* Description */}
      {description && (
        <View className="px-1 pb-3">
          <Text className="text-dark-grey dark:text-secondary-200 mt-1">
            {description}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
