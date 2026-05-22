import type { FuelType, UsageRole, VehicleType } from '@/config/vehicles.config';

export type { FuelType, UsageRole, VehicleType };

export type UserLevel = 1 | 2 | 3;

export type AlertSeverity = 'info' | 'warning' | 'urgent';

export interface User {
  id: string;
  phone?: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  createdAt: string;
  level: UserLevel;
}

export interface Vehicle {
  id: string;
  ownerId: string;
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  fuelType: FuelType;
  vehicleType: VehicleType;
  nickname?: string;
  colorHex?: string;
  avatarUrl?: string;
  purchaseDate?: string;
  purchasePriceInr?: number;
  currentOdometer: number;
  usageRole: UsageRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  baseline?: VehicleBaseline;
  specs?: VehicleSpecOverride;
  documents?: VehicleDocuments;
}

export interface VehicleBaseline {
  vehicleId: string;
  odometerKm: number;
  lastServiceDate?: string;
  lastServiceItems: string[];
  hasMajorMods: boolean;
  primaryUsage: UsageRole;
  insuranceConfirmed: boolean;
  pucConfirmed: boolean;
  createdAt: string;
  isEstimated: boolean;
}

export interface VehicleSpecOverride {
  vehicleId: string;
  displacement?: number;
  powerBhp?: number;
  torqueNm?: number;
  kerbWeightKg?: number;
  tankCapacityL?: number;
  tyresFront?: string;
  tyresRear?: string;
  serviceIntervalKm?: number;
  serviceIntervalMonths?: number;
  oilGrade?: string;
  source?: string;
  userOverridden: boolean;
}

export interface VehicleDocuments {
  vehicleId: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  insuranceExpiry?: string;
  insurancePremiumInr?: number;
  pucExpiry?: string;
  rcExpiry?: string;
  warrantyExpiry?: string;
  extendedWarrantyExpiry?: string;
}

export type LogType =
  | 'service'
  | 'fuel'
  | 'accident'
  | 'modification'
  | 'document'
  | 'expense'
  | 'track_session';

export interface LogEntry {
  id: string;
  vehicleId: string;
  userId: string;
  logType: LogType;
  date: string;
  odometerKm?: number;
  notes?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ServiceLog extends LogEntry {
  logType: 'service';
  serviceType: string;
  itemsServiced: string[];
  serviceCenterName?: string;
  costInr: number;
  oilGrade?: string;
  coolantType?: string;
  brakeFluidDot?: string;
  transmissionFluid?: string;
  partNumbers?: Record<string, string>;
  nextServiceKm?: number;
  nextServiceDate?: string;
}

export interface FuelLog extends LogEntry {
  logType: 'fuel';
  volumeLitres: number;
  costPerLitre: number;
  totalCostInr: number;
  fuelStation?: string;
  fuelGradeRon?: number;
  efficiencyKmPerL?: number;
  isBrimFull?: boolean;
  performanceNote?: string;
}

export interface AccidentLog extends LogEntry {
  logType: 'accident';
  description: string;
  severity: 'minor' | 'moderate' | 'major';
  repairStatus: 'pending' | 'in_progress' | 'completed';
  insuranceClaimNumber?: string;
  repairCostInr?: number;
}

export interface ModificationLog extends LogEntry {
  logType: 'modification';
  modName: string;
  brand?: string;
  category: string;
  costInr: number;
  installerName?: string;
  powerBhpBefore?: number;
  powerBhpAfter?: number;
  torqueNmBefore?: number;
  torqueNmAfter?: number;
  performanceDeltaSource?: 'dyno' | 'manufacturer' | 'estimated';
  setupLog?: SetupSnapshot;
}

export interface SetupSnapshot {
  tyrePressFrontPsi?: number;
  tyrePressRearPsi?: number;
  camberFront?: number;
  camberRear?: number;
  toeFront?: string;
  damperFront?: string;
  damperRear?: string;
  context: 'street' | 'track' | 'daily';
  notes?: string;
}

export interface DocumentLog extends LogEntry {
  logType: 'document';
  docType: 'insurance' | 'puc' | 'rc' | 'road_tax' | 'warranty' | 'extended_warranty' | 'other';
  provider?: string;
  policyNumber?: string;
  startDate?: string;
  endDate?: string;
  premiumInr?: number;
}

export interface ExpenseLog extends LogEntry {
  logType: 'expense';
  category: 'repairs' | 'parts' | 'fines' | 'parking' | 'tolls' | 'miscellaneous';
  amountInr: number;
}

export interface TrackSession extends LogEntry {
  logType: 'track_session';
  venue: string;
  sessionType: 'practice' | 'time_attack' | 'autocross' | 'drag';
  lapTimes?: number[];
  bestLapMs?: number;
  etSeconds?: number;
  trapSpeedKmh?: number;
  setupSnapshot?: SetupSnapshot;
  fuelLoadL?: number;
  ambientTempC?: number;
  weather?: string;
  driverNotes?: string;
}

export interface DiaryEntry {
  id: string;
  vehicleId: string;
  userId: string;
  date: string;
  odometerStart?: number;
  odometerEnd?: number;
  odometerCurrent?: number;
  fuelLitres?: number;
  fuelCostPerLitre?: number;
  fuelTotalInr?: number;
  driveFeelNote?: string;
  hasWarningLight?: boolean;
  warningLightDesc?: string;
  conditionTags?: string[];
  isPromotedToLog?: boolean;
  promotedLogId?: string;
  createdAt: string;
}

export interface Alert {
  id: string;
  vehicleId: string;
  type: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  actionLabel?: string;
  isRead: boolean;
  createdAt: string;
}

export interface FamilyMember {
  userId: string;
  vehicleId: string;
  permission: 'view' | 'edit';
  invitedAt: string;
  acceptedAt?: string;
}

export interface FuelPrice {
  city: string;
  petrol?: number;
  diesel?: number;
  cng?: number;
  ev?: number;
  date: string;
  source: string;
}

export interface ServiceCenter {
  id: string;
  name: string;
  type: 'oem' | 'multibrand' | 'local';
  distanceKm: number;
  rating?: number;
  isOpen?: boolean;
  phone?: string;
  address?: string;
  directionsUrl?: string;
}

export type Theme = 'dark' | 'light';
