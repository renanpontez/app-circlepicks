import React, { useState } from 'react';
import { View, Text, Pressable, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { useAppStore, toast } from '@/stores';
import { useAuth } from '@/hooks';
import { useTheme } from '@/providers/ThemeProvider';
import type { Language, ThemeMode } from '@/stores/app.store';
import i18n from '@/i18n';

export default function SettingsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language, theme, setLanguage, setTheme } = useAppStore();
  const { deleteAccount } = useAuth();
  const { isDark } = useTheme();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  const handleThemeChange = (mode: ThemeMode) => {
    setTheme(mode);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('deleteAccount.confirmTitle', 'Delete your account?'),
      t('deleteAccount.confirmMessage', 'This will permanently delete your account and all your data, including your experiences, bookmarks, and followers. This action cannot be undone.'),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('deleteAccount.confirm', 'Delete my account'),
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deleteAccount();
            } catch {
              toast.error(t('deleteAccount.error', 'Failed to delete account. Please try again.'));
            } finally {
              setIsDeleting(false);
            }
          },
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
          {t('settings.title')}
        </Text>
      </View>

      <View className="px-4 pt-6">
        {/* Language Section */}
        <Text className="text-lg font-bold text-dark-grey dark:text-white mb-1">
          {t('settings.language')}
        </Text>
        <Text className="text-medium-grey dark:text-secondary-400 text-sm mb-3">
          {t('settings.languageDescription')}
        </Text>
        <View className="flex-row gap-3 mb-8">
          <Pressable
            onPress={() => handleLanguageChange('pt-BR')}
            className={`flex-1 py-3 rounded-full items-center border ${
              language === 'pt-BR'
                ? 'bg-primary border-primary'
                : 'bg-white dark:bg-secondary-800 border-divider dark:border-secondary-700'
            }`}
          >
            <Text
              className={`font-medium ${
                language === 'pt-BR' ? 'text-white' : 'text-dark-grey dark:text-white'
              }`}
            >
              {t('settings.portuguese')}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => handleLanguageChange('en-US')}
            className={`flex-1 py-3 rounded-full items-center border ${
              language === 'en-US'
                ? 'bg-primary border-primary'
                : 'bg-white dark:bg-secondary-800 border-divider dark:border-secondary-700'
            }`}
          >
            <Text
              className={`font-medium ${
                language === 'en-US' ? 'text-white' : 'text-dark-grey dark:text-white'
              }`}
            >
              {t('settings.english')}
            </Text>
          </Pressable>
        </View>

        {/* Theme Section */}
        <Text className="text-lg font-bold text-dark-grey dark:text-white mb-1">
          {t('settings.theme')}
        </Text>
        <Text className="text-medium-grey dark:text-secondary-400 text-sm mb-3">
          {t('settings.themeDescription')}
        </Text>
        <View className="flex-row gap-3">
          <Pressable
            onPress={() => handleThemeChange('light')}
            className={`flex-1 py-3 rounded-full items-center border ${
              theme === 'light'
                ? 'bg-primary border-primary'
                : 'bg-white dark:bg-secondary-800 border-divider dark:border-secondary-700'
            }`}
          >
            <Text
              className={`font-medium ${
                theme === 'light' ? 'text-white' : 'text-dark-grey dark:text-white'
              }`}
            >
              {t('settings.light')}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => handleThemeChange('dark')}
            className={`flex-1 py-3 rounded-full items-center border ${
              theme === 'dark'
                ? 'bg-primary border-primary'
                : 'bg-white dark:bg-secondary-800 border-divider dark:border-secondary-700'
            }`}
          >
            <Text
              className={`font-medium ${
                theme === 'dark' ? 'text-white' : 'text-dark-grey dark:text-white'
              }`}
            >
              {t('settings.dark')}
            </Text>
          </Pressable>
        </View>

        {/* Delete Account */}
        <View className="mt-8 pt-6 border-t border-divider dark:border-secondary-700">
          <Pressable
            onPress={handleDeleteAccount}
            disabled={isDeleting}
            className="flex-row items-center justify-center py-3"
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color="#EF4444" />
            ) : (
              <Text className="text-red-500 text-sm">
                {t('deleteAccount.title', 'Delete account')}
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
