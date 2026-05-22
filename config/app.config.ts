export const AppConfig = {
  name: 'MotoLog',
  version: '1.0.0',
  bundleId: 'in.motolog.app',

  features: {
    enableTrackSessions: true,
    enableFamilySharing: true,
    enableEnthusiastMode: true,
    enableFuelPriceAPI: true,
    enableVehicleRegistrationAPI: true,
    enableNearbyServiceCenters: true,
    enableDocumentUpload: true,
    enablePushNotifications: true,
    maintenanceMode: false,
  },

  onboarding: {
    baselineSteps: 6,
    registrationLookupTimeoutMs: 8000,
  },

  analytics: {
    efficiencyDecimalPlaces: 1,
    expensesDefaultPeriod: 'monthly' as 'monthly' | 'yearly',
  },

  india: {
    defaultCurrency: '₹',
    distanceUnit: 'km',
    fuelUnit: 'L',
    dateFormat: 'DD/MM/YYYY',
    registrationPattern: /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}$/,
    pucValidityMonths: 6,
    rcRenewalYears: 15,
  },
} as const;
