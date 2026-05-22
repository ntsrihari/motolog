import type { Vehicle, LogEntry } from '@/types';
import { daysUntil } from './formatDate';

export interface ResaleScore {
  total: number;
  breakdown: { label: string; score: number; max: number; note?: string }[];
}

export function calcResaleScore(vehicle: Vehicle, logs: LogEntry[]): ResaleScore {
  const breakdown: ResaleScore['breakdown'] = [];

  const serviceLogs = logs.filter((l) => l.logType === 'service');
  const serviceScore = Math.min(serviceLogs.length * 10, 30);
  breakdown.push({
    label: 'Service history',
    score: serviceScore,
    max: 30,
    note: serviceLogs.length === 0 ? 'No service logs yet' : `${serviceLogs.length} service entries`,
  });

  const docs = vehicle.documents;
  let docScore = 0;
  const docNotes: string[] = [];

  if (docs?.insuranceExpiry) {
    const days = daysUntil(docs.insuranceExpiry);
    docScore += days > 0 ? 10 : 5;
    if (days <= 0) docNotes.push('Insurance expired');
  } else {
    docNotes.push('Insurance not logged');
  }

  if (docs?.pucExpiry) {
    const days = daysUntil(docs.pucExpiry);
    docScore += days > 0 ? 10 : 3;
    if (days <= 0) docNotes.push('PUC expired');
  } else {
    docNotes.push('PUC not logged');
  }

  breakdown.push({
    label: 'Documents',
    score: docScore,
    max: 20,
    note: docNotes.length > 0 ? docNotes.join(', ') : 'All documents in order',
  });

  const hasSpecs = vehicle.specs != null;
  const specScore = hasSpecs ? 10 : 0;
  breakdown.push({
    label: 'Vehicle specs',
    score: specScore,
    max: 10,
    note: hasSpecs ? 'Specs recorded' : 'Specs not recorded',
  });

  const hasBaseline = vehicle.baseline != null;
  breakdown.push({
    label: 'Starting point',
    score: hasBaseline ? 10 : 0,
    max: 10,
    note: hasBaseline ? 'Baseline snapshot set' : 'Set your baseline to improve score',
  });

  const modLogs = logs.filter((l) => l.logType === 'modification');
  const accidentLogs = logs.filter((l) => l.logType === 'accident');
  let histScore = 15;
  if (accidentLogs.length > 0) histScore -= accidentLogs.length * 3;
  if (modLogs.length > 0) histScore = Math.min(histScore + 5, 15);
  histScore = Math.max(histScore, 0);

  breakdown.push({
    label: 'Complete history',
    score: histScore,
    max: 15,
    note:
      accidentLogs.length > 0
        ? `${accidentLogs.length} accident(s) logged`
        : logs.length > 5
        ? 'Good log coverage'
        : 'Keep logging to improve',
  });

  const hasAttachments = logs.some(
    (l) => (l as { attachments?: string[] }).attachments?.length,
  );
  breakdown.push({
    label: 'Physical records',
    score: hasAttachments ? 15 : 0,
    max: 15,
    note: hasAttachments ? 'Bills and photos uploaded' : 'Upload bills and service records',
  });

  const total = breakdown.reduce((s, b) => s + b.score, 0);
  return { total, breakdown };
}

export function resaleScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Needs work';
}

export function resaleScoreColor(score: number): string {
  if (score >= 80) return '#2ECC71';
  if (score >= 60) return '#E8FF3A';
  if (score >= 40) return '#F59E0B';
  return '#FF4D4D';
}
