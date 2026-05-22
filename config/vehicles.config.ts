export type FuelType = 'petrol' | 'diesel' | 'cng' | 'electric' | 'hybrid';
export type VehicleType = 'car' | 'bike' | 'scooter' | 'suv' | 'truck';
export type UsageRole = 'daily_commute' | 'weekend' | 'occasional' | 'track';

export interface VehicleSpec {
  displacement?: number;
  powerBhp?: number;
  powerRpm?: number;
  torqueNm?: number;
  torqueRpm?: number;
  kerbWeightKg?: number;
  tankCapacityL?: number;
  tyresFront?: string;
  tyresRear?: string;
  serviceIntervalKm?: number;
  serviceIntervalMonths?: number;
  oilGrade?: string;
  groundClearanceMm?: number;
  wheelbaseMm?: number;
  fuelType?: FuelType;
  source?: string;
}

export const VEHICLE_MAKES: Record<string, { label: string; type: VehicleType[] }> = {
  maruti: { label: 'Maruti Suzuki', type: ['car', 'suv'] },
  hyundai: { label: 'Hyundai', type: ['car', 'suv'] },
  tata: { label: 'Tata Motors', type: ['car', 'suv', 'truck'] },
  honda: { label: 'Honda', type: ['car', 'bike', 'scooter'] },
  toyota: { label: 'Toyota', type: ['car', 'suv'] },
  kia: { label: 'Kia', type: ['car', 'suv'] },
  mahindra: { label: 'Mahindra', type: ['car', 'suv'] },
  ford: { label: 'Ford', type: ['car', 'suv'] },
  volkswagen: { label: 'Volkswagen', type: ['car', 'suv'] },
  skoda: { label: 'Skoda', type: ['car', 'suv'] },
  renault: { label: 'Renault', type: ['car', 'suv'] },
  nissan: { label: 'Nissan', type: ['car', 'suv'] },
  hero: { label: 'Hero MotoCorp', type: ['bike', 'scooter'] },
  bajaj: { label: 'Bajaj', type: ['bike', 'scooter'] },
  tvs: { label: 'TVS Motor', type: ['bike', 'scooter'] },
  royalenfield: { label: 'Royal Enfield', type: ['bike'] },
  yamaha: { label: 'Yamaha', type: ['bike', 'scooter'] },
  suzuki: { label: 'Suzuki', type: ['bike', 'scooter'] },
  ktm: { label: 'KTM', type: ['bike'] },
  bmw: { label: 'BMW', type: ['car', 'suv', 'bike'] },
  mercedes: { label: 'Mercedes-Benz', type: ['car', 'suv'] },
  audi: { label: 'Audi', type: ['car', 'suv'] },
};

export const SPEC_DATABASE: Record<string, VehicleSpec> = {
  'maruti_swift_2024': {
    displacement: 1197, powerBhp: 89.7, powerRpm: 6000, torqueNm: 113, torqueRpm: 4400,
    kerbWeightKg: 902, tankCapacityL: 37, tyresFront: '185/65 R15', tyresRear: '185/65 R15',
    serviceIntervalKm: 10000, serviceIntervalMonths: 12, oilGrade: '5W-30',
    groundClearanceMm: 163, wheelbaseMm: 2450, fuelType: 'petrol', source: 'Maruti Suzuki India',
  },
  'maruti_baleno_2024': {
    displacement: 1197, powerBhp: 89.7, powerRpm: 6000, torqueNm: 113, torqueRpm: 4400,
    kerbWeightKg: 939, tankCapacityL: 37, tyresFront: '185/65 R15', tyresRear: '185/65 R15',
    serviceIntervalKm: 10000, serviceIntervalMonths: 12, oilGrade: '5W-30',
    groundClearanceMm: 170, wheelbaseMm: 2520, fuelType: 'petrol', source: 'Maruti Suzuki India',
  },
  'hyundai_creta_2024': {
    displacement: 1497, powerBhp: 113.4, powerRpm: 6300, torqueNm: 144, torqueRpm: 4500,
    kerbWeightKg: 1310, tankCapacityL: 50, tyresFront: '215/60 R17', tyresRear: '215/60 R17',
    serviceIntervalKm: 10000, serviceIntervalMonths: 12, oilGrade: '5W-30',
    groundClearanceMm: 190, wheelbaseMm: 2610, fuelType: 'petrol', source: 'Hyundai India',
  },
  'hyundai_i20_2024': {
    displacement: 1197, powerBhp: 82.9, powerRpm: 6000, torqueNm: 113.8, torqueRpm: 4200,
    kerbWeightKg: 1065, tankCapacityL: 40, tyresFront: '195/55 R16', tyresRear: '195/55 R16',
    serviceIntervalKm: 10000, serviceIntervalMonths: 12, oilGrade: '5W-30',
    groundClearanceMm: 161, wheelbaseMm: 2580, fuelType: 'petrol', source: 'Hyundai India',
  },
  'tata_nexon_2024': {
    displacement: 1199, powerBhp: 118.4, powerRpm: 5500, torqueNm: 170, torqueRpm: 1750,
    kerbWeightKg: 1272, tankCapacityL: 44, tyresFront: '215/60 R16', tyresRear: '215/60 R16',
    serviceIntervalKm: 10000, serviceIntervalMonths: 12, oilGrade: '5W-40',
    groundClearanceMm: 209, wheelbaseMm: 2498, fuelType: 'petrol', source: 'Tata Motors',
  },
  'honda_city_2024': {
    displacement: 1498, powerBhp: 119.1, powerRpm: 6600, torqueNm: 145, torqueRpm: 4600,
    kerbWeightKg: 1169, tankCapacityL: 40, tyresFront: '185/55 R16', tyresRear: '185/55 R16',
    serviceIntervalKm: 10000, serviceIntervalMonths: 12, oilGrade: '0W-20',
    groundClearanceMm: 165, wheelbaseMm: 2589, fuelType: 'petrol', source: 'Honda India',
  },
  'royalenfield_classic350_2024': {
    displacement: 349, powerBhp: 20.2, powerRpm: 6100, torqueNm: 27, torqueRpm: 4000,
    kerbWeightKg: 195, tankCapacityL: 13, tyresFront: '100/90-19', tyresRear: '120/80-18',
    serviceIntervalKm: 5000, serviceIntervalMonths: 6, oilGrade: '15W-50',
    groundClearanceMm: 170, wheelbaseMm: 1390, fuelType: 'petrol', source: 'Royal Enfield',
  },
  'royalenfield_himalayan_2024': {
    displacement: 411, powerBhp: 24.3, powerRpm: 6500, torqueNm: 32, torqueRpm: 4000,
    kerbWeightKg: 196, tankCapacityL: 15, tyresFront: '90/90-21', tyresRear: '120/90-17',
    serviceIntervalKm: 5000, serviceIntervalMonths: 6, oilGrade: '15W-50',
    groundClearanceMm: 220, wheelbaseMm: 1465, fuelType: 'petrol', source: 'Royal Enfield',
  },
  'honda_activa_2024': {
    displacement: 109.51, powerBhp: 7.68, powerRpm: 8000, torqueNm: 9.09, torqueRpm: 5500,
    kerbWeightKg: 107, tankCapacityL: 5.3,
    serviceIntervalKm: 3000, serviceIntervalMonths: 3, oilGrade: '10W-30',
    groundClearanceMm: 155, wheelbaseMm: 1261, fuelType: 'petrol', source: 'Honda India',
  },
  'hero_splendor_2024': {
    displacement: 97.2, powerBhp: 8.36, powerRpm: 8000, torqueNm: 8.05, torqueRpm: 5000,
    kerbWeightKg: 112, tankCapacityL: 9.8,
    serviceIntervalKm: 3000, serviceIntervalMonths: 3, oilGrade: '10W-30',
    groundClearanceMm: 165, wheelbaseMm: 1235, fuelType: 'petrol', source: 'Hero MotoCorp',
  },
};

export const MODIFICATION_CATEGORIES = [
  { id: 'engine', label: 'Engine' },
  { id: 'exhaust', label: 'Exhaust' },
  { id: 'intake', label: 'Intake / Air Filter' },
  { id: 'suspension', label: 'Suspension' },
  { id: 'brakes', label: 'Brakes' },
  { id: 'wheels_tyres', label: 'Wheels & Tyres' },
  { id: 'aero', label: 'Aero / Body' },
  { id: 'interior', label: 'Interior' },
  { id: 'ecu_tune', label: 'ECU / Tune' },
  { id: 'electrical', label: 'Electrical' },
  { id: 'other', label: 'Other' },
] as const;

export const SERVICE_TYPES = [
  { id: 'oil_change', label: 'Oil Change' },
  { id: 'full_service', label: 'Full Service' },
  { id: 'air_filter', label: 'Air Filter' },
  { id: 'fuel_filter', label: 'Fuel Filter' },
  { id: 'spark_plugs', label: 'Spark Plugs' },
  { id: 'brakes', label: 'Brakes' },
  { id: 'tyres', label: 'Tyres' },
  { id: 'battery', label: 'Battery' },
  { id: 'coolant_flush', label: 'Coolant Flush' },
  { id: 'transmission', label: 'Transmission Service' },
  { id: 'ac_service', label: 'AC Service' },
  { id: 'wheel_alignment', label: 'Wheel Alignment' },
  { id: 'wheel_balancing', label: 'Wheel Balancing' },
  { id: 'timing_belt', label: 'Timing Belt / Chain' },
  { id: 'other', label: 'Other' },
] as const;

export const FUEL_TYPES_DISPLAY: Record<FuelType, string> = {
  petrol: 'Petrol',
  diesel: 'Diesel',
  cng: 'CNG',
  electric: 'Electric',
  hybrid: 'Hybrid',
};
