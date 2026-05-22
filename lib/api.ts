import { ApiConfig } from '@/config/api.config';
import type { FuelPrice, ServiceCenter } from '@/types';
import type { VehicleSpec } from '@/config/vehicles.config';
import { SPEC_DATABASE } from '@/config/vehicles.config';
import { getStaticFuelPrice } from '@/utils/fuelPrices';

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
  const { rapidApi } = ApiConfig.vehicleRegistration;
  if (!rapidApi.key) return null;

  try {
    const res = await fetchWithTimeout(
      `${rapidApi.baseUrl}/vehicle-info?reg_no=${encodeURIComponent(plate)}`,
      {
        headers: {
          'x-rapidapi-host': rapidApi.host,
          'x-rapidapi-key': rapidApi.key,
        },
      },
      rapidApi.timeout,
    );
    if (!res.ok) return null;
    const data = await res.json();
    return {
      make: data.maker_desc ?? data.make ?? data.vehicle_manufacturer_name,
      model: data.model_desc ?? data.model ?? data.vehicle_model,
      year: data.manufactured_yr ?? data.manufacture_year ? parseInt(data.manufactured_yr ?? data.manufacture_year) : undefined,
      fuelType: (data.fuel_descr ?? data.fuel_type ?? '').toLowerCase() || undefined,
      registrationDate: data.reg_date ?? data.registration_date,
      insuranceExpiry: data.insurance_upto ?? data.insurance_validity,
      pucExpiry: data.pucc_upto ?? data.pollution_upto,
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

// Returns static prices instantly — no API key required.
// Prices sourced from PPAC/IOCL, updated periodically in utils/fuelPrices.ts.
export async function fetchFuelPrices(city: string): Promise<FuelPrice | null> {
  return getStaticFuelPrice(city);
}

// Uses OpenStreetMap Overpass API — completely free, no key required.
export async function fetchNearbyServiceCenters(
  lat: number,
  lng: number,
  vehicleMake: string,
): Promise<ServiceCenter[]> {
  const radius = 10000;
  const query = `
    [out:json][timeout:10];
    (
      node["amenity"="car_repair"](around:${radius},${lat},${lng});
      way["amenity"="car_repair"](around:${radius},${lat},${lng});
      node["shop"="car_repair"](around:${radius},${lat},${lng});
    );
    out center 15;
  `.trim();

  try {
    const res = await fetchWithTimeout(
      'https://overpass-api.de/api/interpreter',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`,
      },
      12000,
    );
    if (!res.ok) return [];
    const data = await res.json();
    const elements: Record<string, unknown>[] = data.elements ?? [];

    return elements.slice(0, 10).map((el, idx) => {
      const tags = (el.tags ?? {}) as Record<string, string>;
      const elLat = (el.lat ?? (el.center as { lat: number } | undefined)?.lat ?? lat) as number;
      const elLng = (el.lon ?? (el.center as { lon: number } | undefined)?.lon ?? lng) as number;
      return {
        id: String(el.id ?? idx),
        name: tags.name ?? tags['name:en'] ?? 'Car Repair',
        type: determineType(tags.name ?? '', vehicleMake),
        distanceKm: calcDistance(lat, lng, elLat, elLng),
        address: [tags['addr:housenumber'], tags['addr:street'], tags['addr:city']]
          .filter(Boolean)
          .join(', ') || undefined,
      };
    }).sort((a, b) => a.distanceKm - b.distanceKm);
  } catch {
    return [];
  }
}

function determineType(name: string, make: string): ServiceCenter['type'] {
  const lower = name.toLowerCase();
  if (lower.includes(make.toLowerCase()) || lower.includes('authoris') || lower.includes('authori')) return 'oem';
  if (lower.includes('multi') || lower.includes('car care') || lower.includes('motors')) return 'multibrand';
  return 'local';
}

function calcDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return parseFloat((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1));
}
