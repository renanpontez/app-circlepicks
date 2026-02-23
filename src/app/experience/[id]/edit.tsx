import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { useExperience, useUpdateExperience, useDeleteExperience } from '@/hooks';
import { TagInput } from '@/components';
import { useAuthStore, toast } from '@/stores';
import { uploadImages } from '@/utils/uploadImages';
import type { PriceRange, ExperienceVisibility } from '@/domain/models';

const PRICE_RANGES: PriceRange[] = ['$', '$$', '$$$', '$$$$'];

export default function EditExperienceScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { user: currentUser } = useAuthStore();

  const { data: experience, isLoading } = useExperience(id);
  const updateExperience = useUpdateExperience(id);
  const deleteExperience = useDeleteExperience();
  const [priceRange, setPriceRange] = useState<PriceRange>('$$');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<ExperienceVisibility>('public');
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form with existing data
  useEffect(() => {
    if (experience) {
      setPriceRange(experience.price_range);
      setSelectedTags(experience.tags.map((t) => t.slug));
      setDescription(experience.brief_description || '');
      setImages(experience.images || []);
      setVisibility(experience.visibility);
    }
  }, [experience]);

  // Check ownership
  useEffect(() => {
    if (experience && currentUser && experience.user.id !== currentUser.id) {
      Alert.alert(
        t('common.error', 'Error'),
        t('experience.edit.notOwner', 'You can only edit your own experiences'),
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }
  }, [experience, currentUser]);

  const handleImagePick = async () => {
    if (images.length >= 5) {
      toast.warning(t('add.images.maxReached', 'Maximum 5 images allowed'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 5 - images.length,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newImages = result.assets.map((asset) => asset.uri);
      setImages((prev) => [...prev, ...newImages].slice(0, 5));
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Upload any new local images to Supabase Storage
      const imageUrls = images.length > 0 ? await uploadImages(images) : undefined;

      await updateExperience.mutateAsync({
        price_range: priceRange,
        tags: selectedTags,
        brief_description: description || undefined,
        images: imageUrls,
        visibility,
      });

      router.back();
    } catch (error) {
      toast.error(
        t('common.error', 'Error'),
        t('experience.edit.saveFailed', 'Failed to save changes. Please try again.')
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      t('experience.edit.deleteTitle', 'Delete Experience'),
      t('experience.edit.deleteMessage', 'Are you sure you want to delete this experience? This action cannot be undone.'),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('common.delete', 'Delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteExperience.mutateAsync(id);
              router.replace('/(tabs)');
            } catch (error) {
              toast.error(
                t('common.error', 'Error'),
                t('experience.edit.deleteFailed', 'Failed to delete. Please try again.')
              );
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#FD512E" />
      </SafeAreaView>
    );
  }

  if (!experience) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
        <Ionicons name="alert-circle-outline" size={48} color="#888888" />
        <Text className="text-medium-grey text-center mt-4">
          {t('experience.error', 'Failed to load experience')}
        </Text>
        <Pressable onPress={() => router.back()} className="mt-4 bg-primary px-6 py-3 rounded-xl">
          <Text className="text-white font-semibold">{t('common.goBack', 'Go Back')}</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-divider">
        <Pressable onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="close" size={24} color="#111111" />
        </Pressable>
        <Text className="text-lg font-bold text-dark-grey">
          {t('experience.edit.title', 'Edit Experience')}
        </Text>
        <Pressable onPress={handleDelete} className="p-2 -mr-2">
          <Ionicons name="trash-outline" size={22} color="#EF4444" />
        </Pressable>
      </View>

      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Place Info (read-only) */}
        <View className="bg-surface p-4 border-b border-divider">
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-primary-100 rounded-xl items-center justify-center mr-3">
              <Ionicons name="location" size={24} color="#FD512E" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-dark-grey">{experience.place.name}</Text>
              <Text className="text-medium-grey">
                {experience.place.city}, {experience.place.country}
              </Text>
            </View>
          </View>
        </View>

        {/* Price Range */}
        <View className="bg-white p-4 border-b border-divider">
          <Text className="text-dark-grey font-semibold mb-3">
            {t('add.priceRange.title', 'Price Range')}
          </Text>
          <View className="flex-row gap-2">
            {PRICE_RANGES.map((price) => (
              <Pressable
                key={price}
                onPress={() => setPriceRange(price)}
                className={`flex-1 py-3 rounded-xl items-center ${
                  priceRange === price ? 'bg-primary' : 'bg-surface border border-divider'
                }`}
              >
                <Text
                  className={`font-semibold ${
                    priceRange === price ? 'text-white' : 'text-dark-grey'
                  }`}
                >
                  {price}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Tags */}
        <TagInput
          selectedTags={selectedTags}
          onTagsChange={setSelectedTags}
          maxTags={5}
        />

        {/* Images */}
        <View className="bg-white p-4 border-b border-divider">
          <Text className="text-dark-grey font-semibold mb-3">
            {t('add.images.title', 'Photos')}
            <Text className="text-light-grey font-normal"> ({images.length}/5)</Text>
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {images.map((uri, index) => (
                <View key={index} className="relative">
                  <Image source={{ uri }} className="w-20 h-20 rounded-xl" />
                  <Pressable
                    onPress={() => handleRemoveImage(index)}
                    className="absolute -top-2 -right-2 bg-dark-grey rounded-full p-1"
                  >
                    <Ionicons name="close" size={14} color="#FFFFFF" />
                  </Pressable>
                </View>
              ))}
              {images.length < 5 && (
                <Pressable
                  onPress={handleImagePick}
                  className="w-20 h-20 bg-surface border border-dashed border-divider rounded-xl items-center justify-center"
                >
                  <Ionicons name="add" size={24} color="#888888" />
                </Pressable>
              )}
            </View>
          </ScrollView>
        </View>

        {/* Description */}
        <View className="bg-white p-4 border-b border-divider">
          <Text className="text-dark-grey font-semibold mb-3">
            {t('add.description.title', 'Note (optional)')}
          </Text>
          <TextInput
            className="bg-surface border border-divider rounded-xl px-4 py-3 text-dark-grey min-h-[80px]"
            placeholder={t('add.description.placeholder', 'Share what makes this place special...')}
            placeholderTextColor="#888888"
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Visibility */}
        <View className="bg-white p-4 border-b border-divider">
          <Text className="text-dark-grey font-semibold mb-3">
            {t('add.visibility.title', 'Who can see this?')}
          </Text>
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => setVisibility('public')}
              className={`flex-1 flex-row items-center justify-center py-3 rounded-xl ${
                visibility === 'public' ? 'bg-primary' : 'bg-surface border border-divider'
              }`}
            >
              <Ionicons
                name="globe-outline"
                size={18}
                color={visibility === 'public' ? '#FFFFFF' : '#111111'}
              />
              <Text
                className={`ml-2 font-medium ${
                  visibility === 'public' ? 'text-white' : 'text-dark-grey'
                }`}
              >
                {t('add.visibility.public', 'Public')}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setVisibility('friends_only')}
              className={`flex-1 flex-row items-center justify-center py-3 rounded-xl ${
                visibility === 'friends_only' ? 'bg-primary' : 'bg-surface border border-divider'
              }`}
            >
              <Ionicons
                name="people-outline"
                size={18}
                color={visibility === 'friends_only' ? '#FFFFFF' : '#111111'}
              />
              <Text
                className={`ml-2 font-medium ${
                  visibility === 'friends_only' ? 'text-white' : 'text-dark-grey'
                }`}
              >
                {t('add.visibility.friends', 'Friends')}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Save Button */}
        <View className="p-4">
          <Pressable
            onPress={handleSave}
            disabled={isSaving || selectedTags.length === 0}
            className={`py-4 rounded-xl items-center ${
              isSaving || selectedTags.length === 0
                ? 'bg-surface'
                : 'bg-primary active:bg-primary-600'
            }`}
          >
            {isSaving ? (
              <ActivityIndicator color="#FD512E" />
            ) : (
              <Text
                className={`font-semibold text-lg ${
                  selectedTags.length === 0 ? 'text-light-grey' : 'text-white'
                }`}
              >
                {t('common.save', 'Save Changes')}
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
