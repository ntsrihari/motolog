import { create } from 'zustand';
import type { Vehicle, LogEntry, Alert } from '@/types';

interface GarageState {
  vehicles: Vehicle[];
  activeVehicleId: string | null;
  logs: Record<string, LogEntry[]>;
  alerts: Alert[];
  isLoading: boolean;
  error: string | null;

  setVehicles: (vehicles: Vehicle[]) => void;
  addVehicle: (vehicle: Vehicle) => void;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  removeVehicle: (id: string) => void;
  setActiveVehicle: (id: string | null) => void;
  setLogs: (vehicleId: string, logs: LogEntry[]) => void;
  addLog: (vehicleId: string, log: LogEntry) => void;
  removeLog: (vehicleId: string, logId: string) => void;
  setAlerts: (alerts: Alert[]) => void;
  markAlertRead: (alertId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useGarageStore = create<GarageState>((set) => ({
  vehicles: [],
  activeVehicleId: null,
  logs: {},
  alerts: [],
  isLoading: false,
  error: null,

  setVehicles: (vehicles) => set({ vehicles }),
  addVehicle: (vehicle) => set((s) => ({ vehicles: [...s.vehicles, vehicle] })),
  updateVehicle: (id, updates) =>
    set((s) => ({
      vehicles: s.vehicles.map((v) => (v.id === id ? { ...v, ...updates } : v)),
    })),
  removeVehicle: (id) =>
    set((s) => ({ vehicles: s.vehicles.filter((v) => v.id !== id) })),
  setActiveVehicle: (id) => set({ activeVehicleId: id }),
  setLogs: (vehicleId, logs) =>
    set((s) => ({ logs: { ...s.logs, [vehicleId]: logs } })),
  addLog: (vehicleId, log) =>
    set((s) => ({
      logs: {
        ...s.logs,
        [vehicleId]: [log, ...(s.logs[vehicleId] ?? [])],
      },
    })),
  removeLog: (vehicleId, logId) =>
    set((s) => ({
      logs: {
        ...s.logs,
        [vehicleId]: (s.logs[vehicleId] ?? []).filter((l) => l.id !== logId),
      },
    })),
  setAlerts: (alerts) => set({ alerts }),
  markAlertRead: (alertId) =>
    set((s) => ({
      alerts: s.alerts.map((a) => (a.id === alertId ? { ...a, isRead: true } : a)),
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
