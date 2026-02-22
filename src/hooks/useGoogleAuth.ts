import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { GoogleSignin, isSuccessResponse, statusCodes } from '@react-native-google-signin/google-signin';
import { supabase } from '@/data/supabase/client';
import { useAuthStore } from '@/stores';
import { getHttpClient } from '@/core/config';
import { API_ENDPOINTS } from '@/data/api/endpoints';
import i18n from '@/i18n';
import type { AuthUser } from '@/domain/models';

// Google OAuth Client ID (public, also in app.json iosUrlScheme)
const GOOGLE_CLIENT_ID = '581653005150-1ekf4f5v1tr0p0rhitb7d4kh94f2g8ro.apps.googleusercontent.com';

// Configure Google Sign-In
// webClientId: needed to get the ID token for Supabase
// iosClientId: needed for native iOS sign-in (no Firebase/GoogleService-Info.plist)
GoogleSignin.configure({
  webClientId: GOOGLE_CLIENT_ID,
  iosClientId: GOOGLE_CLIENT_ID,
});

export function useGoogleAuth() {
  const router = useRouter();
  const { setLoading, signIn: storeSignIn } = useAuthStore();

  const signInWithGoogle = useCallback(async () => {
    try {
      setLoading(true);

      // Check for Play Services (Android only, no-op on iOS)
      await GoogleSignin.hasPlayServices();

      // Trigger native Google Sign-In prompt
      const response = await GoogleSignin.signIn();

      if (!isSuccessResponse(response)) {
        throw new Error(i18n.t('auth.error.googleNotSuccessful'));
      }

      const idToken = response.data?.idToken;
      if (!idToken) {
        throw new Error(i18n.t('auth.error.noIdToken'));
      }

      // Exchange Google ID token for a Supabase session
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
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
          // User might not exist yet, create profile
          if (profileError.status === 404 && data.user) {
            const createResponse = await httpClient.post<{ user: AuthUser }>(
              API_ENDPOINTS.auth.signUp,
              {
                email: data.user.email,
                display_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
                username: data.user.email?.split('@')[0]?.toLowerCase().replace(/[^a-z0-9_]/g, ''),
                avatar_url: data.user.user_metadata?.avatar_url,
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
      // Don't throw if user cancelled
      if (error?.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled Google sign in');
        return;
      }
      if (error?.code === statusCodes.IN_PROGRESS) {
        console.log('Google sign in already in progress');
        return;
      }
      console.error('Google sign in failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [router, setLoading, storeSignIn]);

  return {
    signInWithGoogle,
  };
}
