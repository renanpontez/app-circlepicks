import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { useAppStore } from '@/stores';
import type { Language, ThemeMode } from '@/stores/app.store';
import i18n from '@/i18n';

export default function SettingsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language, theme, setLanguage, setTheme } = useAppStore();

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  const handleThemeChange = (mode: ThemeMode) => {
    setTheme(mode);
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-divider">
        <Pressable onPress={() => router.back()} className="p-2 -ml-2 mr-2">
          <Ionicons name="arrow-back" size={24} color="#111111" />
        </Pressable>
        <Text className="text-xl font-bold text-dark-grey">
          {t('settings.title')}
        </Text>
      </View>

      <View className="px-4 pt-6">
        {/* Language Section */}
        <Text className="text-lg font-bold text-dark-grey mb-1">
          {t('settings.language')}
        </Text>
        <Text className="text-medium-grey text-sm mb-3">
          {t('settings.languageDescription')}
        </Text>
        <View className="flex-row gap-3 mb-8">
          <Pressable
            onPress={() => handleLanguageChange('pt-BR')}
            className={`flex-1 py-3 rounded-xl items-center border ${
              language === 'pt-BR'
                ? 'bg-primary border-primary'
                : 'bg-white border-divider'
            }`}
          >
            <Text
              className={`font-medium ${
                language === 'pt-BR' ? 'text-white' : 'text-dark-grey'
              }`}
            >
              {t('settings.portuguese')}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => handleLanguageChange('en-US')}
            className={`flex-1 py-3 rounded-xl items-center border ${
              language === 'en-US'
                ? 'bg-primary border-primary'
                : 'bg-white border-divider'
            }`}
          >
            <Text
              className={`font-medium ${
                language === 'en-US' ? 'text-white' : 'text-dark-grey'
              }`}
            >
              {t('settings.english')}
            </Text>
          </Pressable>
        </View>

        {/* Theme Section */}
        <Text className="text-lg font-bold text-dark-grey mb-1">
          {t('settings.theme')}
        </Text>
        <Text className="text-medium-grey text-sm mb-3">
          {t('settings.themeDescription')}
        </Text>
        <View className="flex-row gap-3">
          <Pressable
            onPress={() => handleThemeChange('light')}
            className={`flex-1 py-3 rounded-xl items-center border ${
              theme === 'light'
                ? 'bg-primary border-primary'
                : 'bg-white border-divider'
            }`}
          >
            <Text
              className={`font-medium ${
                theme === 'light' ? 'text-white' : 'text-dark-grey'
              }`}
            >
              {t('settings.light')}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => handleThemeChange('dark')}
            className={`flex-1 py-3 rounded-xl items-center border ${
              theme === 'dark'
                ? 'bg-primary border-primary'
                : 'bg-white border-divider'
            }`}
          >
            <Text
              className={`font-medium ${
                theme === 'dark' ? 'text-white' : 'text-dark-grey'
              }`}
            >
              {t('settings.dark')}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
