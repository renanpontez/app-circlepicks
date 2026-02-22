import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { Ionicons } from '@expo/vector-icons';
import { Logo } from '@/components';

export default function SignUpScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { signUpWithEmail, isLoading } = useAuth();
  const { signInWithGoogle } = useGoogleAuth();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSignUp = async () => {
    if (!displayName || !email || !password) {
      setError(t('signup.error.required', 'Please fill in all fields'));
      return;
    }

    if (password.length < 6) {
      setError(t('signup.error.passwordLength', 'Password must be at least 6 characters'));
      return;
    }

    try {
      setError(null);
      await signUpWithEmail({
        email,
        password,
        display_name: displayName,
      });
    } catch (err: any) {
      setError(err.message || t('signup.error.failed', 'Sign up failed. Please try again.'));
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      setIsGoogleLoading(true);
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || t('signup.error.googleFailed', 'Google sign in failed. Please try again.'));
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
              {t('signup.title', 'Create account')}
            </Text>
            <Text className="text-medium-grey text-base mb-8">
              {t('signup.subtitle', 'Join Circle Picks and start sharing your favorite places')}
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
                  <Image
                    source={{ uri: 'https://www.google.com/favicon.ico' }}
                    className="w-5 h-5 mr-3"
                  />
                  <Text className="text-dark-grey font-semibold text-base">
                    {t('signup.googleButton', 'Continue with Google')}
                  </Text>
                </>
              )}
            </Pressable>

            {/* Divider */}
            <View className="flex-row items-center mb-6">
              <View className="flex-1 h-px bg-divider" />
              <Text className="text-light-grey text-sm mx-4">
                {t('signup.orDivider', 'or')}
              </Text>
              <View className="flex-1 h-px bg-divider" />
            </View>

            {/* Form */}
            <View className="gap-4">
              <View>
                <Text className="text-dark-grey font-medium mb-2">
                  {t('signup.displayName', 'Display Name')}
                </Text>
                <TextInput
                  className="border border-divider rounded-xl px-4 py-3 text-dark-grey text-base"
                  placeholder={t('signup.displayNamePlaceholder', 'Seu Nome')}
                  placeholderTextColor="#888888"
                  value={displayName}
                  onChangeText={setDisplayName}
                  autoCapitalize="words"
                  editable={!isAnyLoading}
                />
              </View>

              <View>
                <Text className="text-dark-grey font-medium mb-2">
                  {t('signup.email', 'Email')}
                </Text>
                <TextInput
                  className="border border-divider rounded-xl px-4 py-3 text-dark-grey text-base"
                  placeholder={t('signup.emailPlaceholder', 'seu@email.com')}
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
                  {t('signup.password', 'Password')}
                </Text>
                <View className="relative">
                  <TextInput
                    className="border border-divider rounded-xl px-4 py-3 text-dark-grey text-base pr-12"
                    placeholder={t('signup.passwordPlaceholder', 'Create a password')}
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
                <Text className="text-light-grey text-xs mt-1">
                  {t('signup.passwordHint', 'At least 6 characters')}
                </Text>
              </View>

              {error && (
                <View className="bg-red-50 p-3 rounded-xl">
                  <Text className="text-red-600 text-sm">{error}</Text>
                </View>
              )}

              <Pressable
                className={`bg-primary py-4 rounded-xl items-center mt-2 ${isAnyLoading ? 'opacity-50' : 'active:bg-primary-600'}`}
                onPress={handleSignUp}
                disabled={isAnyLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-semibold text-lg">
                    {t('signup.button', 'Create Account')}
                  </Text>
                )}
              </Pressable>

              <Text className="text-light-grey text-xs text-center mt-2">
                {t('signup.terms', 'By signing up, you agree to our Terms of Service and Privacy Policy')}
              </Text>
            </View>

            {/* Footer */}
            <View className="flex-row justify-center mt-6 mb-8">
              <Text className="text-medium-grey">
                {t('signup.hasAccount', 'Already have an account? ')}
              </Text>
              <Pressable onPress={() => router.replace('/(auth)/signin')}>
                <Text className="text-primary font-semibold">
                  {t('signup.signIn', 'Sign In')}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
