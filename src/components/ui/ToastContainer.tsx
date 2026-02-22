import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useToastStore } from '@/stores/toast.store';
import { ToastItem } from './ToastItem';

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const insets = useSafeAreaInsets();

  if (toasts.length === 0) return null;

  return (
    <View
      style={[styles.container, { top: insets.top + 8 }]}
      pointerEvents="box-none"
      accessibilityLiveRegion="polite"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} {...t} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 12,
    zIndex: 9999,
    alignItems: 'flex-end',
  },
});
