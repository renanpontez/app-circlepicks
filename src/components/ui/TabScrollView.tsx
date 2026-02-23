import React, { forwardRef } from 'react';
import { ScrollView, ScrollViewProps, StyleSheet } from 'react-native';
import { TAB_BAR_BOTTOM_SPACING } from '@/constants/layout';

/**
 * ScrollView wrapper that adds bottom padding to clear the absolute-positioned tab bar.
 * Use this in any tab screen where content needs to scroll under the nav bar.
 */
export const TabScrollView = forwardRef<ScrollView, ScrollViewProps>(
  ({ contentContainerStyle, ...props }, ref) => {
    return (
      <ScrollView
        ref={ref}
        contentContainerStyle={[styles.container, contentContainerStyle]}
        {...props}
      />
    );
  }
);

TabScrollView.displayName = 'TabScrollView';

const styles = StyleSheet.create({
  container: {
    paddingBottom: TAB_BAR_BOTTOM_SPACING,
  },
});
