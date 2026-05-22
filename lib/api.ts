import { ApiConfig } from '@/config/api.config';
import type { FuelPrice, ServiceCenter, Vehicle } from '@/types';
import type { VehicleSpec } from '@/config/vehicles.config';
import { SPEC_DATABASE } from '@/config/vehicles.config';

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

export interface RegistrationData {
  make?: string;
  model?: string;
  year?: number;
  fuelType?: string;
  ownerNameMasked?: string;
  registrationDate?: string;
  chassisLast4?: string;
  engineLast4?: string;
  insuranceExpiry?: string;
  pucExpiry?: string;
  rcStatus?: string;
  ownerCount?: number;
  raw?: Record<string, unknown>;
}

export async function lookupRegistration(plate: string): Promise<RegistrationData | null> {
  if (!ApiConfig.vehicleRegistration.vehicleInfo.key) return null;

  try {
    const { baseUrl, key, timeout } = ApiConfig.vehicleRegistration.vehicleInfo;
    const res = await fetchWithTimeout(
      `${baseUrl}/rc-details?reg=${encodeURIComponent(plate)}`,
      { headers: { 'x-api-key': key } },
      timeout,
    );
    if (!res.ok) return null;
    const data = await res.json();
    return {
      make: data.maker_desc ?? data.make,
      model: data.model_desc ?? data.model,
      year: data.manufactured_yr ? parseInt(data.manufactured_yr) : undefined,
      fuelType: data.fuel_descr?.toLowerCase(),
      registrationDate: data.reg_date,
      insuranceExpiry: data.insurance_upto,
      pucExpiry: data.pucc_upto,
      rcStatus: data.status ?? data.rc_status,
      ownerCount: data.owner_count ? parseInt(data.owner_count) : undefined,
      raw: data,
    };
  } catch {
    return null;
  }
}

export function lookupSpecs(make: string, model: string, year: number): VehicleSpec | null {
  const key = `${make.toLowerCase().replace(/\s/g, '')}_${model.toLowerCase().replace(/\s/g, '_')}_${year}`;
  if (SPEC_DATABASE[key]) return SPEC_DATABASE[key];

  const fuzzyKey = Object.keys(SPEC_DATABASE).find((k) =>
    k.startsWith(`${make.toLowerCase().replace(/\s/g, '')}_${model.toLowerCase().replace(/\s/g, '_')}`),
  );
  return fuzzyKey ? SPEC_DATABASE[fuzzyKey] : null;
}

export async function fetchFuelPrices(city: string): Promise<FuelPrice | null> {
  if (!ApiConfig.fuelPrice.enabled) return null;
  if (!ApiConfig.fuelPrice.mypetrolprice.key) return null;

  try {
    const { baseUrl, key, timeout } = ApiConfig.fuelPrice.mypetrolprice;
    const res = await fetchWithTimeout(
      `${baseUrl}/fuel-price?city=${encodeURIComponent(city)}`,
      { headers: { 'x-api-key': key } },
      timeout,
    );
    if (!res.ok) return null;
    const data = await res.json();
    return {
      city,
      petrol: parseFloat(data.petrol),
      diesel: parseFloat(data.diesel),
      cng: data.cng ? parseFloat(data.cng) : undefined,
      date: new Date().toISOString().split('T')[0],
      source: 'mypetrolprice.com',
    };
  } catch {
    return null;
  }
}

export async function fetchNearbyServiceCenters(
  lat: number,
  lng: number,
  vehicleMake: string,
): Promise<ServiceCenter[]> {
  const cfg = ApiConfig.maps;
  const query = `${vehicleMake} service center`;

  try {
    if (cfg.provider === 'ola' && cfg.ola.key) {
      const { baseUrl, key, timeout } = cfg.ola;
      const res = await fetchWithTimeout(
        `${baseUrl}/nearbysearch/json?location=${lat},${lng}&radius=${cfg.serviceCenter.radiusMeters}&keyword=${encodeURIComponent(query)}&api_key=${key}`,
        {},
        timeout,
      );
      if (!res.ok) return [];
      const data = await res.json();
      return (data.results ?? []).slice(0, 10).map((p: Record<string, unknown>) => ({
        id: p.place_id as string,
        name: p.name as string,
        type: determineServiceCenterType(p.name as string, vehicleMake),
        distanceKm: calcDistance(lat, lng, (p.geometry as Record<string, { lat: number; lng: number }>).location.lat, (p.geometry as Record<string, { lat: number; lng: number }>).location.lng),
        rating: p.rating as number,
        isOpen: (p.opening_hours as { open_now?: boolean })?.open_now,
        address: (p.vicinity ?? p.formatted_address) as string,
      }));
    }
    return [];
  } catch {
    return [];
  }
}

function determineServiceCenterType(name: string, make: string): ServiceCenter['type'] {
  const lower = name.toLowerCase();
  const makeKey = make.toLowerCase();
  if (lower.includes(makeKey) || lower.includes('authorised') || lower.includes('authorized')) return 'oem';
  if (lower.includes('multi') || lower.includes('car care') || lower.includes('motors')) return 'multibrand';
  return 'local';
}

function calcDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return parseFloat((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1));
}
