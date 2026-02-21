import React, { useState, useCallback } from 'react';
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
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import debounce from 'lodash.debounce';

import { usePlaceSearchWithLocation, useLocation, useCreateExperience } from '@/hooks';
import { TagInput } from '@/components';
import type { PlaceSearchResult, PriceRange, ExperienceVisibility } from '@/domain/models';

type Step = 'place' | 'details';

const PRICE_RANGES: PriceRange[] = ['$', '$$', '$$$', '$$$$'];

export default function AddExperienceScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [step, setStep] = useState<Step>('place');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<PlaceSearchResult | null>(null);
  const [priceRange, setPriceRange] = useState<PriceRange>('$$');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<ExperienceVisibility>('public');

  const debouncedSetQuery = useCallback(
    debounce((value: string) => setDebouncedQuery(value), 400),
    []
  );

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    debouncedSetQuery(value);
  };

  const { latitude, longitude, city, getCurrentLocation, isLoading: locationLoading } = useLocation();
  const { data: searchResults, isLoading: searchLoading } = usePlaceSearchWithLocation(
    debouncedQuery,
    latitude && longitude ? { lat: latitude, lng: longitude } : undefined,
    { enabled: debouncedQuery.length >= 2 }
  );
  const createExperience = useCreateExperience();

  // Get location on mount
  React.useEffect(() => {
    getCurrentLocation();
  }, []);

  const handlePlaceSelect = (place: PlaceSearchResult) => {
    setSelectedPlace(place);
    setStep('details');
  };

  const handleImagePick = async () => {
    if (images.length >= 5) {
      Alert.alert(t('add.images.maxReached', 'Maximum 5 images allowed'));
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

  const handleCameraCapture = async () => {
    if (images.length >= 5) {
      Alert.alert(t('add.images.maxReached', 'Maximum 5 images allowed'));
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('add.camera.permissionDenied', 'Camera permission required'));
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages((prev) => [...prev, result.assets[0].uri].slice(0, 5));
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!selectedPlace) return;

    try {
      await createExperience.mutateAsync({
        place_id: selectedPlace.id || undefined,
        place: !selectedPlace.id ? {
          google_place_id: selectedPlace.google_place_id || undefined,
          name: selectedPlace.name,
          city: selectedPlace.city,
          country: selectedPlace.country,
          address: selectedPlace.address || undefined,
          lat: selectedPlace.lat || undefined,
          lng: selectedPlace.lng || undefined,
          instagram_handle: selectedPlace.instagram_handle || undefined,
          google_maps_url: selectedPlace.google_maps_url || undefined,
        } : undefined,
        price_range: priceRange,
        tags: selectedTags,
        brief_description: description || undefined,
        images: images.length > 0 ? images : undefined,
        visibility,
      });

      // Reset form state (tabs don't unmount)
      setStep('place');
      setSearchQuery('');
      setDebouncedQuery('');
      setSelectedPlace(null);
      setPriceRange('$$');
      setSelectedTags([]);
      setDescription('');
      setImages([]);
      setVisibility('public');

      Alert.alert(
        t('add.success.title', 'Saved!'),
        t('add.success.message', 'Your experience has been added successfully.')
      );
      router.back();
    } catch (error: any) {
      console.error('Create experience error:', error?.message, error?.responseData);
      Alert.alert(
        t('add.error.title', 'Error'),
        error?.responseData?.details || error?.message || t('add.error.message', 'Failed to save experience. Please try again.')
      );
    }
  };

  const renderPlaceStep = () => (
    <View className="flex-1">
      {/* Location Info */}
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-divider">
        <Ionicons name="location" size={20} color="#FD512E" />
        <Text className="text-medium-grey ml-2 flex-1">
          {locationLoading
            ? t('add.location.loading', 'Getting location...')
            : city
            ? `${city}`
            : t('add.location.unknown', 'Location unavailable')}
        </Text>
        <Pressable onPress={getCurrentLocation} className="p-2">
          <Ionicons name="refresh" size={20} color="#888888" />
        </Pressable>
      </View>

      {/* Search Input */}
      <View className="p-4">
        <View className="flex-row items-center bg-surface border border-divider rounded-xl px-4">
          <Ionicons name="search" size={20} color="#888888" />
          <TextInput
            className="flex-1 py-3 px-2 text-dark-grey"
            placeholder={t('add.search.placeholder', 'Search for a place...')}
            placeholderTextColor="#888888"
            value={searchQuery}
            onChangeText={handleSearchChange}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => handleSearchChange('')}>
              <Ionicons name="close-circle" size={20} color="#888888" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Search Results */}
      <ScrollView className="flex-1 px-4">
        {searchLoading ? (
          <View className="py-8 items-center">
            <ActivityIndicator color="#FD512E" />
          </View>
        ) : searchResults && searchResults.length > 0 ? (
          searchResults.map((place, index) => (
            <Pressable
              key={`${place.google_place_id || place.id}-${index}`}
              onPress={() => handlePlaceSelect(place)}
              className="flex-row items-center py-3 border-b border-divider active:bg-surface"
            >
              <View className="w-10 h-10 bg-primary-100 rounded-lg items-center justify-center mr-3">
                <Ionicons name="location" size={20} color="#FD512E" />
              </View>
              <View className="flex-1">
                <Text className="text-dark-grey font-medium" numberOfLines={1}>
                  {place.name}
                </Text>
                <Text className="text-medium-grey text-sm" numberOfLines={1}>
                  {place.address || `${place.city}, ${place.country}`}
                </Text>
              </View>
              {place.source === 'local' && (
                <View className="bg-primary-100 px-2 py-1 rounded">
                  <Text className="text-primary text-xs font-medium">
                    {place.recommendation_count} recs
                  </Text>
                </View>
              )}
            </Pressable>
          ))
        ) : searchQuery.length >= 2 ? (
          <Text className="text-medium-grey text-center py-8">
            {t('add.search.noResults', 'No places found')}
          </Text>
        ) : (
          <Text className="text-medium-grey text-center py-8">
            {t('add.search.hint', 'Type at least 2 characters to search')}
          </Text>
        )}
      </ScrollView>
    </View>
  );

  const renderDetailsStep = () => (
    <ScrollView className="flex-1" keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 80 }}>
      {/* Selected Place */}
      <View className="bg-white p-4 border-b border-divider">
        <View className="flex-row items-center">
          <View className="w-12 h-12 bg-primary-100 rounded-xl items-center justify-center mr-3">
            <Ionicons name="location" size={24} color="#FD512E" />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold text-dark-grey">{selectedPlace?.name}</Text>
            <Text className="text-medium-grey">
              {selectedPlace?.city}, {selectedPlace?.country}
            </Text>
          </View>
          <Pressable onPress={() => setStep('place')} className="p-2">
            <Ionicons name="pencil" size={20} color="#888888" />
          </Pressable>
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
              <>
                <Pressable
                  onPress={handleImagePick}
                  className="w-20 h-20 bg-surface border border-dashed border-divider rounded-xl items-center justify-center"
                >
                  <Ionicons name="images-outline" size={24} color="#888888" />
                </Pressable>
                <Pressable
                  onPress={handleCameraCapture}
                  className="w-20 h-20 bg-surface border border-dashed border-divider rounded-xl items-center justify-center"
                >
                  <Ionicons name="camera-outline" size={24} color="#888888" />
                </Pressable>
              </>
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

      {/* Submit Button */}
      <View className="p-4">
        <Pressable
          onPress={handleSubmit}
          disabled={createExperience.isPending || selectedTags.length === 0}
          className={`py-4 rounded-xl items-center ${
            createExperience.isPending || selectedTags.length === 0
              ? 'bg-surface'
              : 'bg-primary active:bg-primary-600'
          }`}
        >
          {createExperience.isPending ? (
            <ActivityIndicator color="#FD512E" />
          ) : (
            <Text
              className={`font-semibold text-lg ${
                selectedTags.length === 0 ? 'text-light-grey' : 'text-white'
              }`}
            >
              {t('add.submit', 'Save Experience')}
            </Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-divider">
        <Pressable onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="close" size={24} color="#111111" />
        </Pressable>
        <Text className="text-lg font-bold text-dark-grey">
          {t('add.title', 'Add Experience')}
        </Text>
        <View className="w-10" />
      </View>

      {step === 'place' ? renderPlaceStep() : renderDetailsStep()}
    </SafeAreaView>
  );
}
