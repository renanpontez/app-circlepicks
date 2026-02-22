// Domain Models - Mirror backend contracts exactly

// Tag model for database-backed tags
export interface Tag {
  id: string;
  slug: string;
  display_name: string | null;
  is_system: boolean;
  created_by: string | null;
  created_at: string;
}

// Lightweight tag info returned with experiences
export interface TagInfo {
  slug: string;
  display_name: string;
}

// For UI display - combines tag with resolved label
export interface TagWithLabel extends Tag {
  label: string;
}

export interface User {
  id: string;
  display_name: string;
  username: string;
  avatar_url: string | null;
}

export interface Place {
  id: string;
  google_place_id: string | null;
  name: string;
  city: string;
  country: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  instagram_handle: string | null;
  google_maps_url: string | null;
  custom: boolean;
  recommendation_count?: number;
}

// Place statistics for recommendation counts and popular tags
export interface PlaceStats {
  recommendation_count: number;
  top_tags: string[];
}

// Place search result that may or may not exist in the database yet
export interface PlaceSearchResult {
  id: string | null;
  google_place_id: string | null;
  name: string;
  city: string;
  country: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  instagram_handle: string | null;
  google_maps_url: string | null;
  custom: boolean;
  source: 'local' | 'google';
  recommendation_count?: number;
}

export type PriceRange = '$' | '$$' | '$$$' | '$$$$';
export type ExperienceVisibility = 'public' | 'friends_only';

export interface Experience {
  id: string;
  user_id: string;
  place_id: string;
  price_range: PriceRange;
  tags: TagInfo[];
  brief_description: string | null;
  phone_number: string | null;
  images: string[] | null;
  visit_date: string | null;
  visibility: ExperienceVisibility;
  created_at: string;
}

// User who also recommended the same place publicly
export interface OtherRecommender {
  id: string;
  display_name: string;
  avatar_url: string | null;
  username: string | null;
  experience_id: string;
}

// Detailed experience returned from API with nested user and place data
export interface ExperienceDetail {
  id: string;
  experience_id: string;
  slug: string;
  user: {
    id: string;
    display_name: string;
    avatar_url: string | null;
    username: string | null;
  };
  place: {
    id: string;
    name: string;
    city: string;
    country: string;
    address: string | null;
    lat: number | null;
    lng: number | null;
    instagram_handle: string | null;
    google_maps_url: string | null;
    recommendation_count?: number;
  };
  price_range: PriceRange;
  tags: TagInfo[];
  brief_description: string | null;
  phone_number: string | null;
  images: string[];
  visit_date: string | null;
  visibility: ExperienceVisibility;
  time_ago: string;
  created_at: string | null;
  other_recommenders?: OtherRecommender[];
}

export interface ExperienceFeedItem {
  id: string;
  experience_id: string;
  slug?: string;
  user: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  };
  place: {
    id: string;
    name: string;
    city_short: string;
    country: string;
    thumbnail_image_url: string | null;
    instagram?: string | null;
    recommendation_count?: number;
  };
  price_range: PriceRange;
  tags: TagInfo[];
  time_ago: string;
  description?: string | null;
  visibility?: ExperienceVisibility;
  isBookmarked?: boolean;
  bookmarkId?: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  experience_id: string;
  created_at: string;
}

// Follow/Follower Models
export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface FollowWithUser extends Follow {
  follower?: User;
  following?: User;
}

// View Models for UI
export type QuickAddStep = 'location_search' | 'select_place' | 'enrich' | 'review';

export interface QuickAddFormState {
  step: QuickAddStep;
  place: Place | null;
  price_range: PriceRange | null;
  tags: string[];
  instagram_handle: string;
  brief_description: string;
  phone_number: string;
  images: string[];
  visit_date: string | null;
  visibility: ExperienceVisibility;
}

export interface ExperienceCardProps {
  experience: ExperienceFeedItem;
  onPress: () => void;
  onBookmarkToggle?: () => void;
}

// API Response Types
export interface ApiError {
  message: string;
  status: number;
}

// Auth Models
export interface AuthUser {
  id: string;
  email: string;
  display_name: string;
  username: string;
  avatar_url: string | null;
  provider: 'google' | 'email';
  created_at: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
  display_name: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: AuthUser;
  access_token: string;
}

export interface Session {
  user: AuthUser;
  expires: string;
}

// Profile Models
export interface UserProfile {
  id: string;
  display_name: string;
  username: string;
  avatar_url: string | null;
  bio?: string | null;
  created_at: string;
  stats: {
    experiences_count: number;
    followers_count: number;
    following_count: number;
  };
  is_following?: boolean;
}

// Feed Section Types
export type FeedSection = 'my' | 'friends' | 'community' | 'nearby';

export interface FeedResponse {
  section: FeedSection;
  experiences: ExperienceFeedItem[];
  total: number;
  hasMore: boolean;
}

// Explore Types
export interface ExploreTag {
  slug: string;
  display_name: string;
  count: number;
}

export interface ExploreCity {
  city: string;
  country: string;
  count: number;
}

export interface ExploreResponse {
  popularTags: ExploreTag[];
  popularCities: ExploreCity[];
  recentExperiences: ExperienceFeedItem[];
}
