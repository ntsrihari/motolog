import { create } from 'zustand';
import type { DiaryEntry } from '@/types';

interface DiaryState {
  entries: Record<string, DiaryEntry[]>;
  todayEntry: DiaryEntry | null;
  inferredVehicleId: string | null;
  inferredReason: string | null;
  isLoading: boolean;

  setEntries: (vehicleId: string, entries: DiaryEntry[]) => void;
  addEntry: (entry: DiaryEntry) => void;
  updateEntry: (id: string, updates: Partial<DiaryEntry>) => void;
  setTodayEntry: (entry: DiaryEntry | null) => void;
  setInferredVehicle: (id: string | null, reason: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useDiaryStore = create<DiaryState>((set) => ({
  entries: {},
  todayEntry: null,
  inferredVehicleId: null,
  inferredReason: null,
  isLoading: false,

  setEntries: (vehicleId, entries) =>
    set((s) => ({ entries: { ...s.entries, [vehicleId]: entries } })),
  addEntry: (entry) =>
    set((s) => ({
      entries: {
        ...s.entries,
        [entry.vehicleId]: [entry, ...(s.entries[entry.vehicleId] ?? [])],
      },
    })),
  updateEntry: (id, updates) =>
    set((s) => {
      const newEntries = { ...s.entries };
      for (const vehicleId in newEntries) {
        newEntries[vehicleId] = newEntries[vehicleId].map((e) =>
          e.id === id ? { ...e, ...updates } : e,
        );
      }
      return { entries: newEntries };
    }),
  setTodayEntry: (entry) => set({ todayEntry: entry }),
  setInferredVehicle: (id, reason) =>
    set({ inferredVehicleId: id, inferredReason: reason }),
  setLoading: (isLoading) => set({ isLoading }),
}));
