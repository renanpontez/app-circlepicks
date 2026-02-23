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
      className="mb-2 active:opacity-90"
    >
      {/* User Header */}
      {showUser && (
        <View className="flex-row items-center px-3 py-2.5">
          <View className="w-8 h-8 rounded-full bg-surface mr-3 overflow-hidden">
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
          <View className="flex-1">
            <Text className="text-dark-grey text-sm font-semibold" numberOfLines={1}>
              {user.display_name}
            </Text>
            <Text className="text-light-grey text-xs">{time_ago}</Text>
          </View>
        </View>
      )}

      {/* Image */}
      <View className="relative aspect-[4/3]">
        {place.thumbnail_image_url ? (
          <Image
            source={{ uri: place.thumbnail_image_url }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full bg-surface items-center justify-center">
            <Image
              source={require('@/../assets/icon.png')}
              className="w-16 h-16 opacity-20 rounded-lg"
              resizeMode="contain"
            />
            <Text className="text-light-grey text-xs mt-2">{t('common.noImage', 'No image')}</Text>
          </View>
        )}
      </View>

      {/* Action Row */}
      <View className="flex-row items-center px-3 pt-2.5 pb-1">
        <Text className="text-dark-grey font-semibold text-sm">{price_range}</Text>
        <View className="flex-1" />
        {onBookmarkToggle && (
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onBookmarkToggle();
            }}
            className="p-1 active:opacity-60"
          >
            <Ionicons
              name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={22}
              color={isBookmarked ? '#FD512E' : '#111111'}
            />
          </Pressable>
        )}
      </View>

      {/* Content */}
      <View className="px-3 pb-3">
        <Text className="text-base font-bold text-dark-grey" numberOfLines={1}>
          {place.name}
        </Text>
        <Text className="text-medium-grey text-sm mt-0.5">
          {place.city_short}, {place.country}
          {place.recommendation_count && place.recommendation_count > 1 && (
            <Text className="text-light-grey">
              {' '}· {place.recommendation_count} {t('common.recs')}
            </Text>
          )}
        </Text>

        {/* Tags */}
        {tags.length > 0 && (
          <View className="flex-row flex-wrap gap-1.5 mt-2">
            {tags.slice(0, 3).map((tag) => (
              <View key={tag.slug} className="bg-chip px-2 py-0.5 rounded-full">
                <Text className="text-medium-grey text-xs font-medium">
                  {tag.display_name}
                </Text>
              </View>
            ))}
            {tags.length > 3 && (
              <View className="bg-chip px-2 py-0.5 rounded-full">
                <Text className="text-medium-grey text-xs font-medium">
                  +{tags.length - 3}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
}
