import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
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
  const { t } = useTranslation();
  const { user, place, price_range, tags, time_ago, isBookmarked } = experience;

  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-divider mb-4 active:opacity-90"
    >
      {/* Image */}
      <View className="relative aspect-[16/10]">
        {place.thumbnail_image_url ? (
          <Image
            source={{ uri: place.thumbnail_image_url }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full bg-surface items-center justify-center">
            <Ionicons name="image-outline" size={48} color="#888888" />
          </View>
        )}

        {/* Bookmark Button */}
        {onBookmarkToggle && (
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onBookmarkToggle();
            }}
            className="absolute top-3 right-3 bg-white/90 rounded-full p-2 active:bg-white"
          >
            <Ionicons
              name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={isBookmarked ? '#FD512E' : '#111111'}
            />
          </Pressable>
        )}

        {/* Price Range Badge */}
        <View className="absolute bottom-3 left-3 bg-white/90 px-2 py-1 rounded-lg">
          <Text className="text-dark-grey font-semibold text-sm">
            {price_range}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View className="p-4">
        {/* Place Name and Location */}
        <Text className="text-lg font-bold text-dark-grey mb-1" numberOfLines={1}>
          {place.name}
        </Text>
        <Text className="text-medium-grey text-sm mb-2">
          {place.city_short}, {place.country}
          {place.recommendation_count && place.recommendation_count > 1 && (
            <Text className="text-light-grey">
              {' '}· {place.recommendation_count} {t('common.recs')}
            </Text>
          )}
        </Text>

        {/* Tags */}
        {tags.length > 0 && (
          <View className="flex-row flex-wrap gap-2 mb-3">
            {tags.slice(0, 3).map((tag) => (
              <View key={tag.slug} className="bg-chip px-2.5 py-1 rounded-full">
                <Text className="text-medium-grey text-xs font-medium">
                  {tag.display_name}
                </Text>
              </View>
            ))}
            {tags.length > 3 && (
              <View className="bg-chip px-2.5 py-1 rounded-full">
                <Text className="text-medium-grey text-xs font-medium">
                  +{tags.length - 3}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* User Info */}
        {showUser && (
          <View className="flex-row items-center pt-2 border-t border-divider">
            <View className="w-6 h-6 rounded-full bg-surface mr-2 overflow-hidden">
              {user.avatar_url ? (
                <Image
                  source={{ uri: user.avatar_url }}
                  className="w-full h-full"
                />
              ) : (
                <View className="w-full h-full items-center justify-center bg-primary-100">
                  <Text className="text-primary text-xs font-semibold">
                    {user.display_name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            <Text className="text-medium-grey text-sm flex-1" numberOfLines={1}>
              {user.display_name}
            </Text>
            <Text className="text-light-grey text-xs">{time_ago}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}
