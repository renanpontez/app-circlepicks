import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '@/stores';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const language = useAppStore((state) => state.language);
  const [loading, setLoading] = useState(true);

  const url = `https://www.circlepicks.app/${language}/auth/forgot-password`;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-4 py-3 border-b border-divider">
        <Pressable
          onPress={() => router.back()}
          className="p-2 -ml-2 active:bg-surface rounded-full"
        >
          <Ionicons name="close" size={24} color="#111111" />
        </Pressable>
        <Text className="text-lg font-semibold text-dark-grey ml-2">
          {t('signin.forgotPasswordTitle', 'Reset Password')}
        </Text>
      </View>

      <View className="flex-1">
        <WebView
          source={{ uri: url }}
          incognito
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
        />
        {loading && (
          <View className="absolute inset-0 items-center justify-center bg-white">
            <ActivityIndicator size="large" color="#E8655A" />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
