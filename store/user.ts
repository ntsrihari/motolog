import { create } from 'zustand';
import type { User, UserLevel, Theme, FuelPrice } from '@/types';

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  theme: Theme;
  city: string;
  fuelPrices: FuelPrice | null;
  fuelPricesLastFetched: string | null;
  detectedUserLevel: UserLevel;

  setUser: (user: User | null) => void;
  setAuthenticated: (auth: boolean) => void;
  setOnboarded: (onboarded: boolean) => void;
  setTheme: (theme: Theme) => void;
  setCity: (city: string) => void;
  setFuelPrices: (prices: FuelPrice) => void;
  updateUserLevel: (level: UserLevel) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isAuthenticated: false,
  isOnboarded: false,
  theme: 'dark',
  city: 'Mumbai',
  fuelPrices: null,
  fuelPricesLastFetched: null,
  detectedUserLevel: 1,

  setUser: (user) => set({ user }),
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setOnboarded: (isOnboarded) => set({ isOnboarded }),
  setTheme: (theme) => set({ theme }),
  setCity: (city) => set({ city }),
  setFuelPrices: (fuelPrices) =>
    set({ fuelPrices, fuelPricesLastFetched: new Date().toISOString() }),
  updateUserLevel: (detectedUserLevel) => set({ detectedUserLevel }),
}));
