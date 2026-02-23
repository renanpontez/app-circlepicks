// API Endpoints for Circle Picks
// These match the indica-ai Next.js API routes

export const API_ENDPOINTS = {
  // Auth
  auth: {
    signIn: '/api/auth/signin',
    signUp: '/api/auth/signup',
    signOut: '/api/auth/signout',
    session: '/api/auth/session',
    refresh: '/api/auth/refresh',
  },

  // Feed
  feed: {
    list: '/api/feed',
    my: '/api/feed?section=my',
    friends: '/api/feed?section=friends',
    community: '/api/feed?section=community',
    nearby: (lat: number, lng: number) => `/api/feed?section=nearby&lat=${lat}&lng=${lng}`,
  },

  // Experiences
  experiences: {
    list: '/api/experiences',
    create: '/api/experiences',
    detail: (id: string) => `/api/experiences/${id}`,
    update: (id: string) => `/api/experiences/${id}`,
    delete: (id: string) => `/api/experiences/${id}`,
    byUser: (userId: string) => `/api/experiences?userId=${userId}`,
  },

  // Profile
  profile: {
    me: '/api/profile/me',
    byId: (userId: string) => `/api/profile/${userId}`,
    update: '/api/profile',
  },

  // Bookmarks
  bookmarks: {
    list: '/api/bookmarks',
    add: '/api/bookmarks',
    remove: (bookmarkId: string) => `/api/bookmarks/${bookmarkId}`,
  },

  // Follow
  follow: {
    status: (userId: string) => `/api/follow/${userId}`,
    follow: (userId: string) => `/api/follow/${userId}`,
    unfollow: (userId: string) => `/api/follow/${userId}`,
    followers: (userId: string) => `/api/follow/${userId}/followers`,
    following: (userId: string) => `/api/follow/${userId}/following`,
  },

  // Places
  places: {
    search: '/api/places/search',
    detail: (id: string) => `/api/places/${id}`,
    nearby: (lat: number, lng: number) => `/api/places/nearby?lat=${lat}&lng=${lng}`,
  },

  // Explore
  explore: {
    index: '/api/explore',
    byTag: (slug: string) => `/api/explore/tag/${slug}`,
    byCity: (city: string) => `/api/explore/city/${encodeURIComponent(city)}`,
  },

  // Tags
  tags: {
    list: '/api/tags',
    popular: '/api/tags/popular',
    search: (query: string) => `/api/tags/search?q=${encodeURIComponent(query)}`,
  },

  // Upload
  upload: {
    image: '/api/upload',
  },

  // Search
  search: {
    global: (query: string) => `/api/search?q=${encodeURIComponent(query)}`,
    places: (query: string) => `/api/search/places?q=${encodeURIComponent(query)}`,
    users: (query: string) => `/api/search/users?q=${encodeURIComponent(query)}`,
  },
} as const;

// Helper type for endpoint paths
export type ApiEndpoint =
  | (typeof API_ENDPOINTS.auth)[keyof typeof API_ENDPOINTS.auth]
  | (typeof API_ENDPOINTS.experiences)[keyof typeof API_ENDPOINTS.experiences]
  | string;
