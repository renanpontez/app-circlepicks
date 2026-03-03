import React from 'react';
import { View, Text, Pressable, FlatList, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { CachedImage } from '@/components/ui/CachedImage';
import { useBlockedUsers, useUnblockUser } from '@/hooks/useBlock';
import { useTheme } from '@/providers/ThemeProvider';
import { colors } from '@/styles/colors';

export default function BlockedUsersScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const { data: blockedUsers, isLoading } = useBlockedUsers();
  const { mutate: unblockUser } = useUnblockUser();

  const handleUnblock = (userId: string, displayName: string) => {
    Alert.alert(
      t('unblock.title', 'Unblock user'),
      t('unblock.confirmMessage', 'Are you sure you want to unblock {{name}}?', { name: displayName }),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('unblock.confirm', 'Unblock'),
          onPress: () => unblockUser(userId),
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-surface dark:bg-secondary-900" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-white dark:bg-secondary-900 border-b border-divider dark:border-secondary-700">
        <Pressable onPress={() => router.back()} className="p-2 -ml-2 mr-2">
          <Ionicons name="arrow-back" size={24} color={isDark ? '#FFFFFF' : '#111111'} />
        </Pressable>
        <Text className="text-xl font-bold text-dark-grey dark:text-white">
          {t('settings.blockedUsers', 'Blocked users')}
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
        </View>
      ) : !blockedUsers || blockedUsers.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="ban-outline" size={48} color={isDark ? colors.secondary[500] : colors['light-grey']} />
          <Text className="text-medium-grey dark:text-secondary-400 text-center mt-4">
            {t('settings.noBlockedUsers', "You haven't blocked anyone")}
          </Text>
        </View>
      ) : (
        <FlatList
          data={blockedUsers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 8 }}
          renderItem={({ item }) => (
            <View className="flex-row items-center px-4 py-3">
              <View className="w-12 h-12 rounded-full bg-surface dark:bg-secondary-800 overflow-hidden mr-3">
                {item.avatar_url ? (
                  <CachedImage
                    source={item.avatar_url}
                    style={{ width: '100%', height: '100%' }}
                    recyclingKey={item.id}
                  />
                ) : (
                  <View className="w-full h-full items-center justify-center bg-primary-100 dark:bg-primary-900">
                    <Text className="text-primary font-semibold">
                      {item.display_name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
              <View className="flex-1">
                <Text className="text-dark-grey dark:text-white font-medium">
                  {item.display_name}
                </Text>
                <Text className="text-medium-grey dark:text-secondary-400 text-sm">
                  @{item.username}
                </Text>
              </View>
              <Pressable
                onPress={() => handleUnblock(item.id, item.display_name)}
                className="px-4 py-2 rounded-lg border border-divider dark:border-secondary-700 active:bg-surface dark:active:bg-secondary-700"
              >
                <Text className="text-dark-grey dark:text-white text-sm font-medium">
                  {t('unblock.confirm', 'Unblock')}
                </Text>
              </Pressable>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
