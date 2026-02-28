import { useCallback } from 'react';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as AppleAuthentication from 'expo-apple-authentication';
import { supabase } from '@/data/supabase/client';
import { useAuthStore } from '@/stores';
import { getHttpClient } from '@/core/config';
import { API_ENDPOINTS } from '@/data/api/endpoints';
import i18n from '@/i18n';
import type { AuthUser } from '@/domain/models';

export function useAppleAuth() {
  const router = useRouter();
  const { setLoading, signIn: storeSignIn } = useAuthStore();

  const signInWithApple = useCallback(async () => {
    if (Platform.OS !== 'ios') return;

    try {
      setLoading(true);

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error(i18n.t('auth.error.appleNoToken', 'Failed to get Apple identity token'));
      }

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      });

      if (error) throw error;

      if (data.session) {
        const httpClient = getHttpClient();
        try {
          const profileResponse = await httpClient.get<{ user: AuthUser }>(
            API_ENDPOINTS.profile.me,
            {
              headers: {
                Authorization: `Bearer ${data.session.access_token}`,
              },
            }
          );
          httpClient.setAuthToken(data.session.access_token);
          storeSignIn(profileResponse.data.user, data.session.access_token);
        } catch (profileError: any) {
          if (profileError.status === 404 && data.user) {
            const fullName = credential.fullName;
            const displayName =
              fullName?.givenName && fullName?.familyName
                ? `${fullName.givenName} ${fullName.familyName}`
                : data.user.email?.split('@')[0] || 'User';
            const username = (data.user.email?.split('@')[0] || 'user')
              .toLowerCase()
              .replace(/[^a-z0-9_]/g, '');

            const createResponse = await httpClient.post<{ user: AuthUser }>(
              API_ENDPOINTS.auth.signUp,
              {
                email: data.user.email,
                display_name: displayName,
                username,
                avatar_url: null,
              },
              {
                headers: {
                  Authorization: `Bearer ${data.session.access_token}`,
                },
              }
            );
            httpClient.setAuthToken(data.session.access_token);
            storeSignIn(createResponse.data.user, data.session.access_token);
          } else {
            throw profileError;
          }
        }

        router.replace('/(tabs)');
      }
    } catch (error: any) {
      if (error?.code === 'ERR_REQUEST_CANCELED') {
        return;
      }
      console.error('Apple sign in failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [router, setLoading, storeSignIn]);

  return {
    signInWithApple,
  };
}
