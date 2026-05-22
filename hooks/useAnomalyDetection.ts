import { useMemo } from 'react';
import { AiConfig } from '@/config/ai.config';
import { NotificationsConfig } from '@/config/notifications.config';
import type { Vehicle, FuelLog, Alert, AlertSeverity } from '@/types';
import { daysUntil } from '@/utils/formatDate';

export function useAnomalyDetection(vehicle: Vehicle | null, fuelLogs: FuelLog[]) {
  const alerts = useMemo<Alert[]>(() => {
    if (!vehicle) return [];
    const result: Alert[] = [];
    const now = new Date().toISOString();

    const effs = fuelLogs
      .filter((l) => l.efficiencyKmPerL && l.efficiencyKmPerL > 0)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((l) => l.efficiencyKmPerL!);

    if (effs.length >= 5) {
      const baseline = effs.slice(0, -2).reduce((a, b) => a + b, 0) / (effs.length - 2);
      const recent = effs.slice(-2).reduce((a, b) => a + b, 0) / 2;
      const dropPct = ((baseline - recent) / baseline) * 100;
      if (dropPct >= AiConfig.anomaly.efficiencyDropThresholdPct) {
        result.push({
          id: `eff_${vehicle.id}`,
          vehicleId: vehicle.id,
          type: 'efficiency_drop',
          severity: dropPct >= 25 ? 'urgent' : 'warning',
          title: 'Fuel efficiency drop detected',
          message: `Efficiency has dropped ~${dropPct.toFixed(0)}% vs your baseline. Could be tyre pressure, air filter, or fuel system.`,
          actionLabel: 'View details',
          isRead: false,
          createdAt: now,
        });
      }
    }

    const docs = vehicle.documents;
    if (docs) {
      const docChecks: Array<{ key: keyof typeof docs; label: string; thresholds: number[] }> = [
        { key: 'insuranceExpiry', label: 'Insurance', thresholds: NotificationsConfig.thresholds.insurance.daysWarning ? [NotificationsConfig.thresholds.insurance.daysWarning, NotificationsConfig.thresholds.insurance.daysCritical] : [] },
        { key: 'pucExpiry', label: 'PUC', thresholds: [NotificationsConfig.thresholds.puc.daysWarning, NotificationsConfig.thresholds.puc.daysCritical] },
      ];

      for (const check of docChecks) {
        const expiry = docs[check.key] as string | undefined;
        if (!expiry) continue;
        const days = daysUntil(expiry);
        if (days <= 0) {
          result.push(makeDocAlert(vehicle.id, check.key, check.label, days, 'urgent', now));
        } else if (days <= check.thresholds[1]) {
          result.push(makeDocAlert(vehicle.id, check.key, check.label, days, 'warning', now));
        } else if (days <= check.thresholds[0]) {
          result.push(makeDocAlert(vehicle.id, check.key, check.label, days, 'info', now));
        }
      }
    }

    return result;
  }, [vehicle?.id, fuelLogs.length]);

  return alerts;
}

function makeDocAlert(
  vehicleId: string,
  key: string,
  label: string,
  days: number,
  severity: AlertSeverity,
  now: string,
): Alert {
  const msg =
    days <= 0
      ? `${label} has expired. Get it renewed immediately.`
      : days === 1
      ? `${label} expires tomorrow.`
      : `${label} expires in ${days} days.`;

  return {
    id: `doc_${vehicleId}_${key}`,
    vehicleId,
    type: `doc_expiry_${key}`,
    severity,
    title: `${label} ${days <= 0 ? 'expired' : 'expiring soon'}`,
    message: msg,
    actionLabel: 'Update document',
    isRead: false,
    createdAt: now,
  };
}
