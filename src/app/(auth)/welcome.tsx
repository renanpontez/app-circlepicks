import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Logo } from '@/components';

export default function WelcomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 justify-between py-8">
        {/* Logo and Tagline */}
        <View className="flex-1 justify-center items-center">
          <Logo size={96} style={{ marginBottom: 24 }} />
          <Text className="text-3xl font-bold text-dark-grey text-center mb-4">
            Circle Picks
          </Text>
          <Text className="text-lg text-medium-grey text-center px-4">
            {t('welcome.tagline', 'Stop trusting strangers. Discover experiences from people you actually know.')}
          </Text>
        </View>

        {/* Features List */}
        <View className="mb-8">
          <FeatureItem
            emoji="📍"
            title={t('welcome.feature1.title', 'Share Your Favorites')}
            description={t('welcome.feature1.description', 'Recommend restaurants, cafes, and spots you love')}
          />
          <FeatureItem
            emoji="👥"
            title={t('welcome.feature2.title', 'Trust Your Circle')}
            description={t('welcome.feature2.description', 'See recommendations from friends, not strangers')}
          />
          <FeatureItem
            emoji="🔖"
            title={t('welcome.feature3.title', 'Save for Later')}
            description={t('welcome.feature3.description', 'Bookmark experiences to try when you visit')}
          />
        </View>

        {/* Action Buttons */}
        <View className="gap-3">
          {/* Create Account - Primary */}
          <Pressable
            className="bg-primary py-4 rounded-xl items-center active:bg-primary-600"
            onPress={() => router.push('/(auth)/signup')}
          >
            <Text className="text-white font-semibold text-lg">
              {t('welcome.createAccount', 'Create new account')}
            </Text>
          </Pressable>

          {/* Sign In - Secondary */}
          <Pressable
            className="py-4 rounded-xl items-center border border-divider active:bg-surface"
            onPress={() => router.push('/(auth)/signin')}
          >
            <Text className="text-dark-grey font-semibold text-lg">
              {t('welcome.signIn', 'Sign in')}
            </Text>
          </Pressable>

          {/* Terms notice */}
          <Text className="text-light-grey text-xs text-center mt-1">
            {t('welcome.termsNotice', 'By signing up, you agree to our ')}
            <Text
              className="text-primary underline"
              onPress={() => router.push('/(auth)/terms' as any)}
            >
              {t('welcome.termsLink', 'Terms of Use')}
            </Text>
            {t('welcome.termsAnd', ' and ')}
            <Text
              className="text-primary underline"
              onPress={() => router.push('/(auth)/terms' as any)}
            >
              {t('welcome.privacyLink', 'Privacy Policy')}
            </Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

function FeatureItem({
  emoji,
  title,
  description,
}: {
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <View className="flex-row items-start mb-4">
      <Text className="text-2xl mr-4">{emoji}</Text>
      <View className="flex-1">
        <Text className="text-dark-grey font-semibold text-base mb-1">
          {title}
        </Text>
        <Text className="text-medium-grey text-sm">{description}</Text>
      </View>
    </View>
  );
}
