import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { useAppleAuth } from '@/hooks/useAppleAuth';
import { Logo } from '@/components';

export default function WelcomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { signInWithGoogle } = useGoogleAuth();
  const { signInWithApple } = useAppleAuth();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const [isAppleAvailable, setIsAppleAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      AppleAuthentication.isAvailableAsync().then(setIsAppleAvailable);
    }
  }, []);

  const isAnyLoading = isGoogleLoading || isAppleLoading;

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      setIsGoogleLoading(true);
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google sign in failed');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setError(null);
      setIsAppleLoading(true);
      await signInWithApple();
    } catch (err: any) {
      setError(err.message || 'Apple sign in failed');
    } finally {
      setIsAppleLoading(false);
    }
  };

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

        {/* Error Message */}
        {error && (
          <View className="bg-red-50 p-3 rounded-xl mb-4">
            <Text className="text-red-600 text-sm text-center">{error}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View className="gap-3">
          {/* Google Sign In - Primary */}
          <Pressable
            className={`flex-row items-center justify-center bg-primary py-4 rounded-xl ${isAnyLoading ? 'opacity-70' : 'active:bg-primary-600'}`}
            onPress={handleGoogleSignIn}
            disabled={isAnyLoading}
          >
            {isGoogleLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Image source={require('@/../assets/google.png')} style={{ width: 20, height: 20, marginRight: 12 }} />
                <Text className="text-white font-semibold text-lg">
                  {t('welcome.continueWithGoogle', 'Continue with Google')}
                </Text>
              </>
            )}
          </Pressable>

          {/* Apple Sign In - iOS only */}
          {isAppleAvailable && (
            <Pressable
              className={`flex-row items-center justify-center bg-black py-4 rounded-xl ${isAnyLoading ? 'opacity-70' : 'active:opacity-80'}`}
              onPress={handleAppleSignIn}
              disabled={isAnyLoading}
            >
              {isAppleLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="logo-apple" size={20} color="#FFFFFF" style={{ marginRight: 12 }} />
                  <Text className="text-white font-semibold text-lg">
                    {t('welcome.continueWithApple', 'Continue with Apple')}
                  </Text>
                </>
              )}
            </Pressable>
          )}

          {/* Email Sign Up */}
          <Pressable
            className="py-4 rounded-xl items-center border border-divider active:bg-surface"
            onPress={() => router.push('/(auth)/signup')}
            disabled={isAnyLoading}
          >
            <Text className="text-dark-grey font-semibold text-lg">
              {t('welcome.signUpWithEmail', 'Sign up with email')}
            </Text>
          </Pressable>

          {/* Sign In Link */}
          <Pressable
            className="py-2 items-center"
            onPress={() => router.push('/(auth)/signin')}
            disabled={isAnyLoading}
          >
            <Text className="text-medium-grey">
              {t('welcome.hasAccount', 'Already have an account? ')}
              <Text className="text-primary font-semibold">
                {t('welcome.signIn', 'Sign In')}
              </Text>
            </Text>
          </Pressable>
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
