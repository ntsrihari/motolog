import { create } from 'zustand';

type BottomSheetType = 'fuel_log' | 'service_log' | 'expense' | 'diary' | 'vehicle_inference' | null;

interface UIState {
  activeBottomSheet: BottomSheetType;
  bottomSheetVehicleId: string | null;
  toastMessage: string | null;
  toastSeverity: 'info' | 'success' | 'warning' | 'error';
  isRefreshing: boolean;

  openBottomSheet: (type: NonNullable<BottomSheetType>, vehicleId?: string) => void;
  closeBottomSheet: () => void;
  showToast: (message: string, severity?: UIState['toastSeverity']) => void;
  clearToast: () => void;
  setRefreshing: (refreshing: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeBottomSheet: null,
  bottomSheetVehicleId: null,
  toastMessage: null,
  toastSeverity: 'info',
  isRefreshing: false,

  openBottomSheet: (type, vehicleId) =>
    set({ activeBottomSheet: type, bottomSheetVehicleId: vehicleId ?? null }),
  closeBottomSheet: () =>
    set({ activeBottomSheet: null, bottomSheetVehicleId: null }),
  showToast: (message, severity = 'info') =>
    set({ toastMessage: message, toastSeverity: severity }),
  clearToast: () => set({ toastMessage: null }),
  setRefreshing: (isRefreshing) => set({ isRefreshing }),
}));
