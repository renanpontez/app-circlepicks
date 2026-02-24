import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { Ionicons } from '@expo/vector-icons';
import { Logo } from '@/components';
import { CachedImage } from '@/components/ui/CachedImage';

export default function SignInScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { signInWithEmail, isLoading } = useAuth();
  const { signInWithGoogle } = useGoogleAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      setError(t('signin.error.required', 'Please fill in all fields'));
      return;
    }

    try {
      setError(null);
      await signInWithEmail({ email, password });
    } catch (err: any) {
      setError(err.message || t('signin.error.failed', 'Sign in failed. Please try again.'));
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      setIsGoogleLoading(true);
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || t('signin.error.googleFailed', 'Google sign in failed. Please try again.'));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const isAnyLoading = isLoading || isGoogleLoading;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        <View className="flex-1 px-6 py-4">
          {/* Header */}
          <View className="flex-row items-center mb-8">
            <Pressable
              onPress={() => router.back()}
              className="p-2 -ml-2 active:bg-surface rounded-full"
            >
              <Ionicons name="arrow-back" size={24} color="#111111" />
            </Pressable>
          </View>

          {/* Logo & Title */}
          <Logo size={48} style={{ marginBottom: 16 }} />
          <Text className="text-3xl font-bold text-dark-grey mb-2">
            {t('signin.title', 'Welcome back')}
          </Text>
          <Text className="text-medium-grey text-base mb-8">
            {t('signin.subtitle', 'Sign in to see recommendations from your circle')}
          </Text>

          {/* Google Sign In Button */}
          <Pressable
            onPress={handleGoogleSignIn}
            disabled={isAnyLoading}
            className={`flex-row items-center justify-center py-4 rounded-xl border border-divider mb-6 ${isAnyLoading ? 'opacity-50' : 'active:bg-surface'}`}
          >
            {isGoogleLoading ? (
              <ActivityIndicator color="#111111" />
            ) : (
              <>
                <CachedImage
                  source="https://www.google.com/favicon.ico"
                  style={{ width: 20, height: 20, marginRight: 12 }}
                />
                <Text className="text-dark-grey font-semibold text-base">
                  {t('signin.googleButton', 'Continue with Google')}
                </Text>
              </>
            )}
          </Pressable>

          {/* Divider */}
          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-px bg-divider" />
            <Text className="text-light-grey text-sm mx-4">
              {t('signin.orDivider', 'or')}
            </Text>
            <View className="flex-1 h-px bg-divider" />
          </View>

          {/* Form */}
          <View className="gap-4">
            <View>
              <Text className="text-dark-grey font-medium mb-2">
                {t('signin.email', 'Email')}
              </Text>
              <TextInput
                className="border border-divider rounded-xl px-4 py-3 text-dark-grey text-base"
                placeholder={t('signin.emailPlaceholder', 'your@email.com')}
                placeholderTextColor="#888888"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!isAnyLoading}
              />
            </View>

            <View>
              <Text className="text-dark-grey font-medium mb-2">
                {t('signin.password', 'Password')}
              </Text>
              <View className="relative">
                <TextInput
                  className="border border-divider rounded-xl px-4 py-3 text-dark-grey text-base pr-12"
                  placeholder={t('signin.passwordPlaceholder', 'Enter your password')}
                  placeholderTextColor="#888888"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!isAnyLoading}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5"
                >
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={22}
                    color="#888888"
                  />
                </Pressable>
              </View>
            </View>

            <Pressable onPress={() => router.push('/(auth)/forgot-password')}>
              <Text className="text-primary text-sm text-right">
                {t('signin.forgotPassword', 'Forgot your password?')}
              </Text>
            </Pressable>

            {error && (
              <View className="bg-red-50 p-3 rounded-xl">
                <Text className="text-red-600 text-sm">{error}</Text>
              </View>
            )}

            <Pressable
              className={`bg-primary py-4 rounded-xl items-center mt-2 ${isAnyLoading ? 'opacity-50' : 'active:bg-primary-600'}`}
              onPress={handleSignIn}
              disabled={isAnyLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-semibold text-lg">
                  {t('signin.button', 'Sign In')}
                </Text>
              )}
            </Pressable>
          </View>

          {/* Footer */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-medium-grey">
              {t('signin.noAccount', "Don't have an account? ")}
            </Text>
            <Pressable onPress={() => router.replace('/(auth)/signup')}>
              <Text className="text-primary font-semibold">
                {t('signin.signUp', 'Sign Up')}
              </Text>
            </Pressable>
          </View>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
