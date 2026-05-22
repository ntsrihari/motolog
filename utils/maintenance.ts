import type { Vehicle, ServiceLog, LogEntry } from '@/types';
import { daysUntil, formatDateShort } from './formatDate';
import { NotificationsConfig } from '@/config/notifications.config';

export interface MaintenancePrediction {
  label: string;
  dueDateISO?: string;
  dueOdometer?: number;
  kmRemaining?: number;
  daysRemaining?: number;
  severity: 'ok' | 'info' | 'warning' | 'urgent';
  message: string;
}

export function predictNextService(
  vehicle: Vehicle,
  logs: LogEntry[],
): MaintenancePrediction | null {
  const specs = vehicle.specs;
  if (!specs?.serviceIntervalKm && !specs?.serviceIntervalMonths) return null;

  const serviceLogs = logs
    .filter((l): l is ServiceLog => l.logType === 'service')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const lastService = serviceLogs[0];
  const baseline = vehicle.baseline;

  const lastOdometer =
    lastService?.odometerKm ?? baseline?.odometerKm ?? vehicle.currentOdometer;
  const lastDate =
    lastService?.date ?? baseline?.lastServiceDate;

  const intervalKm = specs.serviceIntervalKm;
  const intervalMonths = specs.serviceIntervalMonths;

  const dueOdometer = intervalKm ? lastOdometer + intervalKm : undefined;
  const dueDate =
    lastDate && intervalMonths
      ? new Date(new Date(lastDate).setMonth(new Date(lastDate).getMonth() + intervalMonths))
          .toISOString()
          .split('T')[0]
      : undefined;

  const kmRemaining = dueOdometer ? dueOdometer - vehicle.currentOdometer : undefined;
  const daysRemaining = dueDate ? daysUntil(dueDate) : undefined;

  const thresholds = NotificationsConfig.thresholds.service;
  let severity: MaintenancePrediction['severity'] = 'ok';

  if (
    (kmRemaining !== undefined && kmRemaining <= 0) ||
    (daysRemaining !== undefined && daysRemaining <= 0)
  ) {
    severity = 'urgent';
  } else if (
    (kmRemaining !== undefined && kmRemaining <= thresholds.kmUrgent) ||
    (daysRemaining !== undefined && daysRemaining <= thresholds.daysUrgent)
  ) {
    severity = 'urgent';
  } else if (
    (kmRemaining !== undefined && kmRemaining <= thresholds.kmWarning) ||
    (daysRemaining !== undefined && daysRemaining <= thresholds.daysWarning)
  ) {
    severity = 'warning';
  } else if (
    (kmRemaining !== undefined && kmRemaining <= (thresholds.kmWarning ?? 0) * 3) ||
    (daysRemaining !== undefined && daysRemaining <= 30)
  ) {
    severity = 'info';
  }

  let message = '';
  if (severity === 'urgent') {
    message = `Service overdue for your ${vehicle.make} ${vehicle.model}.`;
  } else if (kmRemaining !== undefined && daysRemaining !== undefined) {
    message = `Next service in ~${daysRemaining} days or ${kmRemaining.toLocaleString('en-IN')} km.`;
  } else if (kmRemaining !== undefined) {
    message = `Next service in ~${kmRemaining.toLocaleString('en-IN')} km.`;
  } else if (daysRemaining !== undefined) {
    message = `Next service in ~${daysRemaining} days.`;
  }

  return {
    label: 'Next service',
    dueDateISO: dueDate,
    dueOdometer,
    kmRemaining,
    daysRemaining,
    severity,
    message,
  };
}
