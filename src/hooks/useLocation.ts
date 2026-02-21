import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  country: string | null;
  isLoading: boolean;
  error: string | null;
  hasPermission: boolean | null;
}

export function useLocation() {
  const [state, setState] = useState<LocationState>({
    latitude: null,
    longitude: null,
    city: null,
    country: null,
    isLoading: false,
    error: null,
    hasPermission: null,
  });

  // Request permission
  const requestPermission = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const hasPermission = status === 'granted';
      setState((prev) => ({ ...prev, hasPermission }));
      return hasPermission;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setState((prev) => ({
        ...prev,
        hasPermission: false,
        error: 'Failed to request location permission',
      }));
      return false;
    }
  }, []);

  // Get current location
  const getCurrentLocation = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      // Check/request permission first
      let { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        const granted = await requestPermission();
        if (!granted) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: 'Location permission denied',
          }));
          return null;
        }
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;

      // Reverse geocode to get city/country
      const [address] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      setState({
        latitude,
        longitude,
        city: address?.city || address?.subregion || null,
        country: address?.country || null,
        isLoading: false,
        error: null,
        hasPermission: true,
      });

      return {
        latitude,
        longitude,
        city: address?.city || address?.subregion || null,
        country: address?.country || null,
      };
    } catch (error) {
      console.error('Error getting location:', error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Failed to get current location',
      }));
      return null;
    }
  }, [requestPermission]);

  // Check initial permission status
  useEffect(() => {
    const checkPermission = async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      setState((prev) => ({ ...prev, hasPermission: status === 'granted' }));
    };
    checkPermission();
  }, []);

  return {
    ...state,
    requestPermission,
    getCurrentLocation,
  };
}

// Hook for watching location changes
export function useWatchLocation(options?: { enabled?: boolean }) {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    if (options?.enabled === false) return;

    let subscription: Location.LocationSubscription | null = null;

    const startWatching = async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') return;

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 100, // Update every 100 meters
        },
        (newLocation) => {
          setLocation({
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
          });
        }
      );
    };

    startWatching();

    return () => {
      subscription?.remove();
    };
  }, [options?.enabled]);

  return location;
}
