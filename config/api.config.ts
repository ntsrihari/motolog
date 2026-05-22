export const ApiConfig = {
  supabase: {
    url: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  },

  vehicleRegistration: {
    provider: 'vehicleinfo' as 'vehicleinfo' | 'rapidapi',
    vehicleInfo: {
      baseUrl: 'https://api.vehicleinfo.in/v1',
      key: process.env.EXPO_PUBLIC_VEHICLE_INFO_KEY ?? '',
      timeout: 8000,
      retries: 2,
    },
    rapidApi: {
      baseUrl: 'https://vehicle-registration-india.p.rapidapi.com',
      key: process.env.EXPO_PUBLIC_RAPIDAPI_KEY ?? '',
      host: 'vehicle-registration-india.p.rapidapi.com',
      timeout: 8000,
      retries: 2,
    },
    cacheTtlMs: 24 * 60 * 60 * 1000,
  },

  fuelPrice: {
    enabled: true,
    provider: 'mypetrolprice' as 'mypetrolprice' | 'rapidapi',
    mypetrolprice: {
      baseUrl: 'https://www.mypetrolprice.com/api',
      key: process.env.EXPO_PUBLIC_FUEL_PRICE_KEY ?? '',
      timeout: 5000,
    },
    cacheTtlMs: 24 * 60 * 60 * 1000,
  },

  maps: {
    provider: 'ola' as 'ola' | 'google',
    ola: {
      baseUrl: 'https://api.olamaps.io/places/v1',
      key: process.env.EXPO_PUBLIC_OLA_MAPS_KEY ?? '',
      timeout: 6000,
    },
    google: {
      baseUrl: 'https://maps.googleapis.com/maps/api',
      key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY ?? '',
      timeout: 6000,
    },
    serviceCenter: {
      cacheTtlMs: 60 * 60 * 1000,
      radiusMeters: 10000,
    },
  },

  tyres: {
    enabled: false,
    baseUrl: 'https://api.tyreplex.com/v1',
    key: process.env.EXPO_PUBLIC_TYREPLEX_KEY ?? '',
    cacheTtlMs: 48 * 60 * 60 * 1000,
  },

  ai: {
    supabaseEdgeFunctionUrl: process.env.EXPO_PUBLIC_SUPABASE_URL
      ? `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/ai-assistant`
      : '',
    timeout: 30000,
  },
} as const;
