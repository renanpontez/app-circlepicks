import React, { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  SlideInRight,
  SlideOutRight,
  FadeIn,
  Layout,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { useToastStore, type ToastItem as ToastItemType, type ToastType } from '@/stores/toast.store';
import { useTheme } from '@/providers/ThemeProvider';

const DEFAULT_DURATION = 4000;

const TOAST_CONFIG: Record<ToastType, {
  icon: keyof typeof Ionicons.glyphMap;
  accentColor: string;
  iconColor: string;
}> = {
  success: {
    icon: 'checkmark-circle',
    accentColor: '#22c55e',
    iconColor: '#22c55e',
  },
  error: {
    icon: 'close-circle',
    accentColor: '#ef4444',
    iconColor: '#ef4444',
  },
  warning: {
    icon: 'warning',
    accentColor: '#f59e0b',
    iconColor: '#f59e0b',
  },
  info: {
    icon: 'information-circle',
    accentColor: '#3b82f6',
    iconColor: '#3b82f6',
  },
};

interface ToastItemProps extends ToastItemType {}

export function ToastItem({ id, type, title, message, duration }: ToastItemProps) {
  const removeToast = useToastStore((s) => s.removeToast);
  const { isDark } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const config = TOAST_CONFIG[type];

  const toastWidth = Math.min(320, screenWidth - 32);
  const bgColor = isDark ? '#1e293b' : '#ffffff';
  const titleColor = isDark ? '#f1f5f9' : '#0f172a';
  const messageColor = isDark ? '#94a3b8' : '#64748b';

  // Auto-dismiss timer
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      removeToast(id);
    }, duration ?? DEFAULT_DURATION);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [id, duration, removeToast]);

  // Swipe-to-dismiss
  const translateX = useSharedValue(0);

  const dismiss = (toastId: string) => {
    removeToast(toastId);
  };

  const panGesture = Gesture.Pan()
    .activeOffsetX(10)
    .onUpdate((e) => {
      // Only allow swiping to the right
      translateX.value = Math.max(0, e.translationX);
    })
    .onEnd((e) => {
      if (e.translationX > 80) {
        translateX.value = withSpring(300, { damping: 20, stiffness: 300 });
        runOnJS(dismiss)(id);
      } else {
        translateX.value = withSpring(0, { damping: 20, stiffness: 300 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: interpolate(translateX.value, [0, 150], [1, 0], 'clamp'),
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        entering={SlideInRight.springify().damping(20).stiffness(300).withInitialValues({ transform: [{ translateX: 350 }] })}
        exiting={SlideOutRight.duration(250)}
        layout={Layout.springify().damping(20).stiffness(300)}
        style={[styles.toast, { width: toastWidth, backgroundColor: bgColor }, animatedStyle]}
        accessibilityRole="alert"
      >
        {/* Accent bar */}
        <Animated.View
          entering={FadeIn.delay(150).duration(200)}
          style={[styles.accentBar, { backgroundColor: config.accentColor }]}
        />

        {/* Icon */}
        <Ionicons
          name={config.icon}
          size={22}
          color={config.iconColor}
          style={styles.icon}
        />

        {/* Content */}
        <Animated.View style={styles.content}>
          <Animated.Text style={[styles.title, { color: titleColor }]} numberOfLines={2}>
            {title}
          </Animated.Text>
          {message ? (
            <Animated.Text style={[styles.message, { color: messageColor }]} numberOfLines={2}>
              {message}
            </Animated.Text>
          ) : null}
        </Animated.View>

        {/* Close button */}
        <Pressable
          onPress={() => removeToast(id)}
          hitSlop={8}
          style={styles.closeButton}
          accessibilityLabel="Dismiss notification"
        >
          <Ionicons name="close" size={18} color={isDark ? '#64748b' : '#94a3b8'} />
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  accentBar: {
    width: 4,
    alignSelf: 'stretch',
  },
  icon: {
    marginLeft: 12,
  },
  content: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
    paddingVertical: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  message: {
    fontSize: 12,
    marginTop: 2,
  },
  closeButton: {
    padding: 10,
    marginRight: 2,
  },
});
