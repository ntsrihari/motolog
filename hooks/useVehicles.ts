import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useGarageStore } from '@/store/garage';
import { useUserStore } from '@/store/user';
import type { Vehicle, LogEntry } from '@/types';

export function useVehicles() {
  const { user } = useUserStore();
  const { setVehicles, setLoading, setError } = useGarageStore();

  return useQuery({
    queryKey: ['vehicles', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');
      setLoading(true);
      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          *,
          vehicle_baselines(*),
          vehicle_specs(*),
          vehicle_documents(*)
        `)
        .eq('owner_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) {
        setError(error.message);
        throw error;
      }

      const vehicles = (data ?? []).map(mapDbVehicle);
      setVehicles(vehicles);
      setLoading(false);
      return vehicles;
    },
    enabled: !!user?.id,
  });
}

export function useVehicleLogs(vehicleId: string) {
  const { setLogs } = useGarageStore();

  return useQuery({
    queryKey: ['logs', vehicleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('logs')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('date', { ascending: false })
        .limit(100);

      if (error) throw error;
      const logs = (data ?? []).map(mapDbLog);
      setLogs(vehicleId, logs);
      return logs;
    },
    enabled: !!vehicleId,
  });
}

export function useAddVehicle() {
  const qc = useQueryClient();
  const { user } = useUserStore();
  const { addVehicle } = useGarageStore();

  return useMutation({
    mutationFn: async (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('vehicles')
        .insert({
          owner_id: user.id,
          registration_number: vehicle.registrationNumber,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          fuel_type: vehicle.fuelType,
          vehicle_type: vehicle.vehicleType,
          nickname: vehicle.nickname,
          current_odometer: vehicle.currentOdometer,
          usage_role: vehicle.usageRole,
        })
        .select()
        .single();

      if (error) throw error;
      return mapDbVehicle(data);
    },
    onSuccess: (vehicle) => {
      addVehicle(vehicle);
      qc.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}

export function useAddLog() {
  const qc = useQueryClient();
  const { addLog } = useGarageStore();

  return useMutation({
    mutationFn: async (log: Omit<LogEntry, 'id' | 'createdAt' | 'updatedAt'> & { vehicleId: string }) => {
      const { vehicleId, ...rest } = log;
      const { data, error } = await supabase
        .from('logs')
        .insert({
          vehicle_id: vehicleId,
          user_id: rest.userId,
          log_type: rest.logType,
          date: rest.date,
          odometer_km: rest.odometerKm,
          notes: rest.notes,
          cost_inr: (rest as { costInr?: number }).costInr,
          data: rest,
        })
        .select()
        .single();

      if (error) throw error;
      return mapDbLog(data);
    },
    onSuccess: (log) => {
      addLog(log.vehicleId, log);
      qc.invalidateQueries({ queryKey: ['logs', log.vehicleId] });
    },
  });
}

function mapDbVehicle(row: Record<string, unknown>): Vehicle {
  return {
    id: row.id as string,
    ownerId: row.owner_id as string,
    registrationNumber: row.registration_number as string,
    make: row.make as string,
    model: row.model as string,
    year: row.year as number,
    fuelType: row.fuel_type as Vehicle['fuelType'],
    vehicleType: row.vehicle_type as Vehicle['vehicleType'],
    nickname: row.nickname as string | undefined,
    colorHex: row.color_hex as string | undefined,
    avatarUrl: row.avatar_url as string | undefined,
    purchaseDate: row.purchase_date as string | undefined,
    purchasePriceInr: row.purchase_price_inr as number | undefined,
    currentOdometer: (row.current_odometer as number) ?? 0,
    usageRole: (row.usage_role as Vehicle['usageRole']) ?? 'daily_commute',
    isActive: (row.is_active as boolean) ?? true,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    baseline: row.vehicle_baselines ? mapDbBaseline(row.vehicle_baselines as Record<string, unknown>) : undefined,
    specs: row.vehicle_specs ? mapDbSpecs(row.vehicle_specs as Record<string, unknown>) : undefined,
    documents: row.vehicle_documents ? mapDbDocs(row.vehicle_documents as Record<string, unknown>) : undefined,
  };
}

function mapDbBaseline(row: Record<string, unknown>) {
  return {
    vehicleId: row.vehicle_id as string,
    odometerKm: row.odometer_km as number,
    lastServiceDate: row.last_service_date as string | undefined,
    lastServiceItems: (row.last_service_items as string[]) ?? [],
    hasMajorMods: (row.has_major_mods as boolean) ?? false,
    primaryUsage: row.primary_usage as import('@/types').UsageRole,
    insuranceConfirmed: (row.insurance_confirmed as boolean) ?? false,
    pucConfirmed: (row.puc_confirmed as boolean) ?? false,
    createdAt: row.created_at as string,
    isEstimated: (row.is_estimated as boolean) ?? true,
  };
}

function mapDbSpecs(row: Record<string, unknown>) {
  return {
    vehicleId: row.vehicle_id as string,
    displacement: row.displacement as number | undefined,
    powerBhp: row.power_bhp as number | undefined,
    torqueNm: row.torque_nm as number | undefined,
    kerbWeightKg: row.kerb_weight_kg as number | undefined,
    tankCapacityL: row.tank_capacity_l as number | undefined,
    tyresFront: row.tyres_front as string | undefined,
    tyresRear: row.tyres_rear as string | undefined,
    serviceIntervalKm: row.service_interval_km as number | undefined,
    serviceIntervalMonths: row.service_interval_months as number | undefined,
    oilGrade: row.oil_grade as string | undefined,
    source: row.source as string | undefined,
    userOverridden: (row.user_overridden as boolean) ?? false,
  };
}

function mapDbDocs(row: Record<string, unknown>) {
  return {
    vehicleId: row.vehicle_id as string,
    insuranceProvider: row.insurance_provider as string | undefined,
    insurancePolicyNumber: row.insurance_policy_number as string | undefined,
    insuranceExpiry: row.insurance_expiry as string | undefined,
    insurancePremiumInr: row.insurance_premium_inr as number | undefined,
    pucExpiry: row.puc_expiry as string | undefined,
    rcExpiry: row.rc_expiry as string | undefined,
    warrantyExpiry: row.warranty_expiry as string | undefined,
    extendedWarrantyExpiry: row.extended_warranty_expiry as string | undefined,
  };
}

function mapDbLog(row: Record<string, unknown>): LogEntry {
  const data = (row.data as Record<string, unknown>) ?? {};
  return {
    id: row.id as string,
    vehicleId: row.vehicle_id as string,
    userId: row.user_id as string,
    logType: row.log_type as LogEntry['logType'],
    date: row.date as string,
    odometerKm: row.odometer_km as number | undefined,
    notes: row.notes as string | undefined,
    attachments: (row.attachments as string[]) ?? [],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    ...data,
  } as LogEntry;
}
