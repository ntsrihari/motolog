@AGENTS.md

# MotoLog

India-first vehicle ownership app. React Native + Expo SDK 56.

## Stack
- Expo SDK 56 + React Native 0.85
- Expo Router (file-based navigation)
- NativeWind v4 (Tailwind for RN)
- Zustand (state), TanStack Query v5 (async state)
- Supabase (backend, auth, realtime)
- React Hook Form + Zod (forms)
- React Native Reanimated v3

## Commands
```
npm start          # Start Expo dev server
npm run android    # Android  
npm run ios        # iOS
```

## Design
Dark-first glassmorphism. Accent: #E8FF3A. Background: #0D0D0D.
Full spec in product doc.

## Key paths
- /app — Expo Router screens
- /components/ui — Design primitives (GlassCard, NeuButton, etc.)
- /components/features — Feature components
- /config — All config files (theme, api, ai, vehicles, notifications)
- /store — Zustand stores
- /hooks — Custom hooks
- /lib — Supabase client, API wrappers, AI calls
- /utils — formatINR, formatDate, formatOdometer, validators
- /types — TypeScript types
- /supabase — DB migrations + Edge Functions

## Rules
- All INR in Indian format: ₹1,23,456
- Dates: DD/MM/YYYY
- Colors always from useTheme(), never hardcoded
- No inline styles — StyleSheet.create only
- User level (1=casual, 2=engaged, 3=enthusiast) inferred silently, never asked
