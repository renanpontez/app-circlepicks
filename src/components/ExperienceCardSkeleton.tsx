import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

function ShimmerBlock({ className }: { className?: string }) {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(withTiming(1, { duration: 1200 }), -1, true);
  }, [shimmer]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 1], [0.4, 0.8]),
  }));

  return (
    <Animated.View
      className={`bg-surface dark:bg-secondary-800 ${className ?? ''}`}
      style={animatedStyle}
    />
  );
}

export function ExperienceCardSkeleton({ showUser = true }: { showUser?: boolean }) {
  return (
    <View className="mb-8">
      {/* User Header */}
      {showUser && (
        <View className="flex-row items-center px-1 py-2.5">
          <ShimmerBlock className="w-8 h-8 rounded-full mr-3" />
          <View className="flex-1">
            <ShimmerBlock className="h-3.5 w-24 rounded" />
            <ShimmerBlock className="h-2.5 w-12 rounded mt-1.5" />
          </View>
        </View>
      )}

      {/* Image placeholder */}
      <ShimmerBlock className="w-full aspect-[4/3] rounded-lg" />

      {/* Title row */}
      <View className="flex-row items-center px-1 pt-2.5 pb-1">
        <ShimmerBlock className="h-4 w-40 rounded" />
      </View>

      {/* Location */}
      <View className="px-1 pb-3">
        <ShimmerBlock className="h-3 w-28 rounded mt-1" />

        {/* Tags */}
        <View className="flex-row gap-1.5 mt-2.5">
          <ShimmerBlock className="h-5 w-16 rounded-full" />
          <ShimmerBlock className="h-5 w-20 rounded-full" />
          <ShimmerBlock className="h-5 w-12 rounded-full" />
        </View>
      </View>
    </View>
  );
}
