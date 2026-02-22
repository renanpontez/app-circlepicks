# Circle Picks - Project Context

## Overview

Circle Picks is a location-based social app where users discover and recommend restaurants, cafes, and other places through their personal circles. Users share experiences with places they've visited, follow friends to see their recommendations, and explore new spots based on tags, cities, and community suggestions.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native with Expo SDK 54 |
| Language | TypeScript |
| Routing | Expo Router v6 (file-based) |
| Styling | NativeWind 4 (Tailwind CSS for RN) |
| Server State | TanStack React Query 5 |
| Client State | Zustand 5 (persisted via MMKV) |
| Forms | React Hook Form + Zod validation |
| Backend | Supabase (Auth + PostgreSQL) |
| API Layer | Next.js API routes on Vercel (staging) |
| HTTP Client | Axios with interceptors |
| Local Storage | react-native-mmkv |
| i18n | react-i18next |
| Auth | Supabase Auth + Google Sign-In |

## Architecture

```
src/
├── app/              # Expo Router screens (file-based routing)
│   ├── (auth)/       # Auth stack (welcome, signin, signup)
│   ├── (tabs)/       # Main tab navigator
│   │   ├── index.tsx        # Feed screen
│   │   ├── add.tsx          # Create experience
│   │   ├── explore/         # Explore (tags, cities, recent)
│   │   └── profile/         # User profile
│   ├── experience/   # Experience detail & edit
│   ├── user/         # Other user profiles
│   └── search.tsx    # Global search (modal)
├── components/       # Reusable UI components
├── core/config/      # Environment, bootstrap
├── data/
│   ├── api/          # HTTP client, endpoints
│   ├── storage/      # MMKV storage abstraction
│   └── supabase/     # Supabase client, DB types
├── domain/models/    # TypeScript domain models
├── hooks/            # Feature hooks (data fetching + mutations)
├── i18n/             # Localization (en-US, pt-BR)
└── stores/           # Zustand stores (auth, app)
```

**Key patterns:**
- Clean separation between data, domain, and presentation layers
- Factory pattern with interfaces for HTTP client and storage (swappable implementations)
- All data fetching through custom hooks wrapping React Query
- Zustand for auth/app state, React Query for server state
- Path aliases (`@/hooks`, `@/data`, `@/domain`, etc.)

## Database Schema

Six core tables in Supabase PostgreSQL:

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `users` | User profiles | id, display_name, username, avatar_url |
| `places` | Venues/locations | id, name, city, country, lat/lng, google_place_id |
| `experiences` | Place recommendations | id, user_id, place_id, price_range, tags, images, visibility |
| `bookmarks` | Saved experiences | id, user_id, experience_id |
| `follows` | Social graph | id, follower_id, following_id |
| `tags` | Tag taxonomy | id, slug, display_name, is_system |

## Features Implemented

### Authentication
- Email/password sign-up and sign-in
- Google OAuth via `@react-native-google-signin`
- Supabase session management with MMKV persistence
- Auth guard redirecting unauthenticated users to welcome screen
- Files: `useAuth.ts`, `useGoogleAuth.ts`, `(auth)/*.tsx`

### Feed
- Three-section feed: My suggestions, Friends' suggestions, Community suggestions
- Nearby feed section (location-based)
- Pull-to-refresh, loading and empty states
- Files: `useFeed.ts`, `(tabs)/index.tsx`

### Experience Sharing
- Two-step creation flow: place search → details form
- Place search integrates local DB + Google Places API with location context
- Price range ($-$$$$), tags (up to 5), photos (up to 5 via image picker)
- Brief description, visibility control (public / friends-only)
- Full CRUD: create, read, update, delete
- Files: `useExperience.ts`, `usePlaces.ts`, `(tabs)/add.tsx`, `experience/[id]/*`

### Bookmarks
- Toggle bookmark on experience cards
- Saved collection visible in profile tab
- Optimistic updates with React Query cache management
- Files: `useBookmarks.ts`

### Follow System
- Follow/unfollow users
- Real-time follow status checking
- Followers/following lists
- Files: `useFollow.ts`

### User Profiles
- Own profile with stats (experiences, followers, following)
- Two tabs: My Places (experiences) and Saved (bookmarks)
- Other user profiles with follow button and experience list
- Files: `useProfile.ts`, `(tabs)/profile/index.tsx`, `user/[userId].tsx`

### Explore
- Popular tags with recommendation counts
- Popular cities
- Recent experiences
- Tag drill-down view with filtered experiences
- Files: `useExplore.ts`, `(tabs)/explore/*`

### Global Search
- Unified search across experiences, users, and places
- Debounced input (300ms)
- Three result sections: People, Places, Recommendations
- Files: `search.tsx`

### Location Services
- Current location and watch mode via Expo Location
- Reverse geocoding
- Location-aware place search
- Files: `useLocation.ts`

### Tags
- System and user-created tags
- Tag search with auto-completion
- Files: `useTags.ts`, `TagInput.tsx`

### Internationalization
- English (en-US) and Portuguese (pt-BR)
- All UI strings translated
- Language preference persisted in app store
- Files: `i18n/locales/*`

### UI & Design
- Custom floating tab bar with highlighted "Add" button
- Brand color: `#FD512E` (orange-red)
- ExperienceCard component used across feed, profile, explore
- Dark/light theme support via NativeWind
- Safe area handling, keyboard avoiding views

## What's Missing / TODO

| Feature | Status | Notes |
|---------|--------|-------|
| Profile editing screen | Hook ready (`useUpdateProfile`), UI missing | Button exists with TODO comment |
| Settings screen | i18n keys defined, no screen built | Theme and language selection |
| City exploration page | Route referenced in explore, not implemented | Missing `explore/city/[city].tsx` |
| Place detail page | Commented as not available in search | No dedicated place page |
| 401 token refresh | TODO in axios interceptor | Auto-refresh on expired tokens |
| Notifications | Not started | No push notification setup |
| Onboarding flow | Store key exists (`ONBOARDING_COMPLETED`) | No onboarding screens |

## API Endpoints

All endpoints are defined in `src/data/api/endpoints.ts` and point to the Next.js backend:

- **Auth**: `/api/auth/{signin,signup,signout,session,refresh}`
- **Feed**: `/api/feed`, `/api/feed/{my,friends,community}`, `/api/feed/nearby`
- **Experiences**: `/api/experiences` (CRUD), `/api/experiences/user/:id`
- **Profile**: `/api/profile/me`, `/api/profile/:id`, `/api/profile/update`
- **Bookmarks**: `/api/bookmarks` (CRUD), `/api/bookmarks/check/:id`
- **Follow**: `/api/follow/:id`, `/api/follow/status`, `/api/follow/followers`, `/api/follow/following`
- **Places**: `/api/places/search`, `/api/places/nearby`, `/api/places/:id`
- **Explore**: `/api/explore`, `/api/explore/tag/:slug`, `/api/explore/city/:city`
- **Tags**: `/api/tags`, `/api/tags/popular`, `/api/tags/search`
- **Search**: `/api/search`, `/api/search/places`, `/api/search/users`
- **Upload**: `/api/upload`

## Environment

Required environment variables (see `.env.example`):

- `EXPO_PUBLIC_API_URL` - Backend API URL
- `EXPO_PUBLIC_SUPABASE_URL` - Supabase project URL
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` - Supabase anon key
- `EXPO_PUBLIC_GOOGLE_CLIENT_ID` - Google OAuth client ID

## Estimated Progress

**~85% of core features implemented.** The app has a complete data layer, working auth, full CRUD for experiences, social features (follow/bookmarks), explore/search, and i18n. Remaining work is primarily UI screens (profile edit, settings, city explore) and polish (token refresh, onboarding, notifications).
