import React from 'react';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '@/providers/ThemeProvider';
import { colors } from '@/styles/colors';
const ADD_BUTTON_SIZE = 58;
const ADD_RING_SIZE = ADD_BUTTON_SIZE + 12;
const VISIBLE_TABS = new Set(['index', 'add', 'profile']);

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const visibleRoutes = state.routes.filter((r) => VISIBLE_TABS.has(r.name));
  const { isDark } = useTheme();

  const bgColor = isDark ? colors.secondary[900] : colors.white;
  const borderColor = isDark ? colors.secondary[700] : colors.surface[300];
  const inactiveColor = isDark ? colors.secondary[500] : colors.secondary[400];

  return (
    <View style={[styles.container, { backgroundColor: bgColor, borderTopColor: borderColor }]}>
      {visibleRoutes.map((route) => {
        const { options } = descriptors[route.key];
        const routeIndex = state.routes.indexOf(route);
        const isFocused = state.index === routeIndex;
        const isAdd = route.name === 'add';

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        if (isAdd) {
          return (
            <View key={route.key} style={styles.addWrapper}>
              {/* White ring */}
              <View style={[styles.addRing, { backgroundColor: bgColor, outlineColor: bgColor }]}>
                <Pressable onPress={onPress}>
                  <View style={isFocused ? [styles.addButtonFocused, { backgroundColor: bgColor }] : styles.addButton}>
                    <Ionicons name="add" size={28} color={isFocused ? '#FD512E' : '#FFFFFF'} />
                  </View>
                </Pressable>
              </View>
            </View>
          );
        }

        const color = isFocused ? '#FD512E' : inactiveColor;

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={styles.tabItem}
          >
            <View style={styles.iconContainer}>
              {options.tabBarIcon?.({ color, focused: isFocused, size: 24 })}
            </View>
            <Text style={[styles.label, { color }]}>
              {options.title}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingBottom: 18,
    paddingTop: 18,
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'visible',
    zIndex: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  iconContainer: {
    width: 40,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
  },
  addWrapper: {
    flex: 1,
    alignItems: 'center',
    marginTop: -(ADD_RING_SIZE / 2 + 4),
  },
  addRing: {
    width: ADD_RING_SIZE,
    height: ADD_RING_SIZE,
    borderRadius: ADD_RING_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    outlineStyle: 'solid',
    outlineWidth: 8,
  },
  addButton: {
    width: ADD_BUTTON_SIZE,
    height: ADD_BUTTON_SIZE,
    borderRadius: ADD_BUTTON_SIZE / 2,
    backgroundColor: '#FD512E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FD512E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  addButtonFocused: {
    width: ADD_BUTTON_SIZE,
    height: ADD_BUTTON_SIZE,
    borderRadius: ADD_BUTTON_SIZE / 2,
    borderWidth: 2.5,
    borderColor: '#FD512E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FD512E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
});

export default function TabsLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.feed', 'Feed'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: t('tabs.add', 'Recommend'),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: t('tabs.explore', 'Explore'),
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile', 'Profile'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
