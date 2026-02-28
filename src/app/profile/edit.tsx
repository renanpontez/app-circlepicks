import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { Input } from '@/components/ui/Input';
import { CachedImage } from '@/components/ui/CachedImage';
import { Button } from '@/components/ui/Button';
import { useMyProfile, useUpdateProfile } from '@/hooks';
import { useAuthStore, toast } from '@/stores';
import { useTheme } from '@/providers/ThemeProvider';
import { colors } from '@/styles/colors';
import { uploadImages } from '@/utils/uploadImages';

export default function EditProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { data: profile } = useMyProfile();
  const updateProfile = useUpdateProfile();
  const { isDark } = useTheme();

  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const currentAvatarUrl = avatarUri || user?.avatar_url;

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    const trimmedName = displayName.trim();
    const trimmedUsername = username.trim();

    if (!trimmedName || !trimmedUsername) return;

    setIsSaving(true);
    try {
      let avatar_url: string | undefined;

      if (avatarUri) {
        const [uploadedUrl] = await uploadImages([avatarUri]);
        avatar_url = uploadedUrl;
      }

      await updateProfile.mutateAsync({
        display_name: trimmedName,
        username: trimmedUsername,
        ...(avatar_url && { avatar_url }),
      });

      toast.success(t('editProfile.success', 'Profile updated'));
      router.dismiss();
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || '';
      if (message.toLowerCase().includes('username') || error?.response?.status === 400) {
        toast.error(t('editProfile.usernameTaken', 'Username is already taken'));
      } else {
        toast.error(t('editProfile.error', 'Could not update profile'));
      }
    } finally {
      setIsSaving(false);
    }
  };

  const canSave = displayName.trim().length > 0 && username.trim().length > 0;

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-secondary-900" edges={['top']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-divider dark:border-secondary-700">
          <Pressable onPress={() => router.dismiss()} className="p-2 -ml-2">
            <Ionicons name="close" size={24} color={isDark ? colors.white : colors['dark-grey']} />
          </Pressable>
          <Text className="text-lg font-bold text-dark-grey dark:text-white">
            {t('editProfile.title', 'Edit Profile')}
          </Text>
          <View className="w-10" />
        </View>

        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Avatar */}
          <View className="items-center py-6">
            <Pressable onPress={handlePickImage} className="items-center">
              <View className="w-24 h-24 rounded-full bg-surface dark:bg-secondary-800" style={{ overflow: 'hidden' }}>
                {currentAvatarUrl ? (
                  <CachedImage
                    source={currentAvatarUrl}
                    style={{ width: 96, height: 96, borderRadius: 48 }}
                    contentFit="cover"
                  />
                ) : (
                  <View className="w-full h-full items-center justify-center bg-primary-100 dark:bg-primary-900">
                    <Text className="text-primary text-3xl font-bold">
                      {user?.display_name?.charAt(0).toUpperCase() || '?'}
                    </Text>
                  </View>
                )}
              </View>
              <Text className="text-primary font-medium mt-2">
                {t('editProfile.changePhoto', 'Change Photo')}
              </Text>
            </Pressable>
          </View>

          {/* Form */}
          <View className="px-4">
            <Input
              label={t('editProfile.displayName', 'Display name')}
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
              autoCorrect={false}
            />
            <Input
              label={t('editProfile.username', 'Username')}
              value={username}
              onChangeText={(text) => setUsername(text.replace(/[^a-zA-Z0-9_]/g, ''))}
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon="at"
            />
          </View>

        </ScrollView>

        {/* Footer */}
        <View className="flex-row gap-3 px-4 py-4 border-t border-divider dark:border-secondary-700">
          <View className="flex-1">
            <Button
              title={t('common.cancel', 'Cancel')}
              variant="outline"
              onPress={() => router.dismiss()}
              fullWidth
            />
          </View>
          <View className="flex-1">
            <Button
              title={t('editProfile.save', 'Save Changes')}
              variant="primary"
              onPress={handleSave}
              loading={isSaving}
              disabled={!canSave}
              fullWidth
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
