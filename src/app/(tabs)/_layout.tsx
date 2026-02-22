import React from 'react';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, Pressable } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const VISIBLE_TABS = new Set(['index', 'explore', 'profile']);

const TAB_BAR_HEIGHT = 85;

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const visibleRoutes = state.routes.filter((r) => VISIBLE_TABS.has(r.name));

  const addRoute = state.routes.find((r) => r.name === 'add');
  const navigateToAdd = () => {
    if (addRoute) {
      navigation.navigate(addRoute.name, addRoute.params);
    }
  };

  return (
    <>
      {/* FAB */}
      <Pressable
        onPress={navigateToAdd}
        style={({ pressed }) => ({
          position: 'absolute',
          bottom: TAB_BAR_HEIGHT + 10,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: pressed ? '#e5461f' : '#FD512E',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#FD512E',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
          zIndex: 10,
        })}
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </Pressable>

      {/* Tab Bar */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E4E6EA',
          borderTopWidth: 1,
          paddingBottom: 30,
          paddingTop: 8,
          height: TAB_BAR_HEIGHT,
          alignItems: 'flex-start',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        {visibleRoutes.map((route) => {
          const { options } = descriptors[route.key];
          const routeIndex = state.routes.indexOf(route);
          const isFocused = state.index === routeIndex;

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

          const color = isFocused ? '#FD512E' : '#888888';

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'flex-start',
              }}
            >
              <View
                style={{
                  height: 40,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {options.tabBarIcon?.({ color, focused: isFocused, size: 24 })}
              </View>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '500',
                  color,
                  marginTop: 2,
                }}
              >
                {options.title}
              </Text>
              {isFocused && (
                <View
                  style={{
                    width: 24,
                    height: 2.5,
                    backgroundColor: '#FD512E',
                    borderRadius: 2,
                    marginTop: 4,
                  }}
                />
              )}
            </Pressable>
          );
        })}
      </View>
    </>
  );
}

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
          href: null,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: t('tabs.explore', 'Explore'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'search' : 'search-outline'}
              size={24}
              color={color}
            />
          ),
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
