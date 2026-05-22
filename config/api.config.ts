// Only EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are required.
// EXPO_PUBLIC_RAPIDAPI_KEY is optional — enables RC plate auto-fill on the lookup screen.
// All other features (fuel prices, maps, service centers) work without any API key.
export const ApiConfig = {
  supabase: {
    url: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  },

  vehicleRegistration: {
    // Uses RapidAPI "RTO Vehicle Information" endpoint. Optional — falls back to manual entry.
    rapidApi: {
      baseUrl: 'https://rto-vehicle-information-verification-india.p.rapidapi.com/api/v1/rc/vehicleinfo',
      key: process.env.EXPO_PUBLIC_RAPIDAPI_KEY ?? '',
      host: 'rto-vehicle-information-verification-india.p.rapidapi.com',
      timeout: 8000,
      retries: 2,
    },
    cacheTtlMs: 24 * 60 * 60 * 1000,
  },

  fuelPrice: {
    // Static prices from utils/fuelPrices.ts — no API key needed.
    cacheTtlMs: 24 * 60 * 60 * 1000,
  },

  maps: {
    // OpenStreetMap Overpass API — free, no key required.
    serviceCenter: {
      cacheTtlMs: 60 * 60 * 1000,
      radiusMeters: 10000,
    },
  },

  ai: {
    supabaseEdgeFunctionUrl: process.env.EXPO_PUBLIC_SUPABASE_URL
      ? `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/ai-assistant`
      : '',
    timeout: 30000,
  },
} as const;
