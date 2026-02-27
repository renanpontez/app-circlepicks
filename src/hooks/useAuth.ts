import { useCallback, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores';
import { supabase } from '@/data/supabase/client';
import { getHttpClient } from '@/core/config';
import { API_ENDPOINTS } from '@/data/api/endpoints';
import type { AuthUser, SignInRequest, SignUpRequest } from '@/domain/models';

export function useAuth() {
  const router = useRouter();
  const {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    isInitialized,
    setLoading,
    setInitialized,
    signIn: storeSignIn,
    signOut: storeSignOut,
    updateUser,
  } = useAuthStore();

  const httpClient = getHttpClient();

  // Listen for token refreshes and update the HTTP client
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'TOKEN_REFRESHED' && session) {
        httpClient.setAuthToken(session.access_token);
      } else if (event === 'SIGNED_OUT') {
        httpClient.setAuthToken(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [httpClient]);

  // Initialize auth state on app start
  const initializeAuth = useCallback(async () => {
    try {
      setLoading(true);

      // Check for existing Supabase session
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // Fetch user profile from our API
        const response = await httpClient.get<{ user: AuthUser }>(
          API_ENDPOINTS.profile.me,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        httpClient.setAuthToken(session.access_token);
        storeSignIn(response.data.user, session.access_token);
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      httpClient.setAuthToken(null);
      storeSignOut();
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [httpClient, setLoading, setInitialized, storeSignIn, storeSignOut]);

  // Sign in with email/password
  const signInWithEmail = useCallback(async (credentials: SignInRequest) => {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;

      console.log('Supabase auth success, session:', !!data.session);

      if (data.session) {
        console.log('Fetching profile from:', API_ENDPOINTS.profile.me);
        console.log('Token (first 20 chars):', data.session.access_token.substring(0, 20));

        const response = await httpClient.get<{ user: AuthUser }>(
          API_ENDPOINTS.profile.me,
          {
            headers: {
              Authorization: `Bearer ${data.session.access_token}`,
            },
          }
        );

        console.log('Profile response:', JSON.stringify(response.data));
        httpClient.setAuthToken(data.session.access_token);
        storeSignIn(response.data.user, data.session.access_token);
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      console.error('Sign in failed:', error?.message || error);
      console.error('Error status:', error?.status);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [httpClient, router, setLoading, storeSignIn]);

  // Sign up with email/password
  const signUpWithEmail = useCallback(async (request: SignUpRequest) => {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email: request.email,
        password: request.password,
        options: {
          data: {
            display_name: request.display_name,
            username: request.username,
          },
        },
      });

      if (error) throw error;

      if (data.session) {
        // Fetch user profile from our API (profile is auto-created by DB trigger)
        const response = await httpClient.get<{ user: AuthUser }>(
          API_ENDPOINTS.profile.me,
          {
            headers: {
              Authorization: `Bearer ${data.session.access_token}`,
            },
          }
        );

        httpClient.setAuthToken(data.session.access_token);
        storeSignIn(response.data.user, data.session.access_token);
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Sign up failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [httpClient, router, setLoading, storeSignIn]);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      httpClient.setAuthToken(null);
      storeSignOut();
      router.replace('/(auth)/welcome');
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [router, setLoading, storeSignOut]);

  // Delete account
  const deleteAccount = useCallback(async () => {
    try {
      setLoading(true);
      await httpClient.delete(API_ENDPOINTS.auth.delete);
      await supabase.auth.signOut();
      httpClient.setAuthToken(null);
      storeSignOut();
      router.replace('/(auth)/welcome');
    } catch (error) {
      console.error('Delete account failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [httpClient, router, setLoading, storeSignOut]);

  return {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    isInitialized,
    initializeAuth,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    deleteAccount,
    updateUser,
  };
}
