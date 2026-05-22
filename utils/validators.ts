import { z } from 'zod';
import { AppConfig } from '@/config/app.config';

export const registrationNumberSchema = z
  .string()
  .transform((v) => v.toUpperCase().replace(/\s/g, ''))
  .pipe(
    z.string().regex(
      AppConfig.india.registrationPattern,
      'Enter a valid Indian registration (e.g. MH12AB1234)',
    ),
  );

export const phoneSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number');

export const odometerSchema = z
  .number()
  .int('Odometer must be a whole number')
  .min(0, 'Odometer cannot be negative')
  .max(9999999, 'That seems too high — double check the reading');

export const fuelVolumeSchema = z
  .number()
  .min(0.1, 'Volume must be at least 0.1 L')
  .max(200, 'Volume seems too high — double check');

export const costSchema = (field = 'Cost') =>
  z
    .number()
    .min(0, `${field} cannot be negative`)
    .max(10000000, `${field} seems too high`);

export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format')
  .refine((d) => !isNaN(Date.parse(d)), 'Enter a valid date');

export const vehicleYearSchema = z
  .number()
  .int()
  .min(1980, 'Year seems too old')
  .max(new Date().getFullYear() + 1, 'Year cannot be in the future');

export function sanitizeRegistration(raw: string): string {
  return raw.toUpperCase().replace(/[\s-]/g, '');
}
