import type { UserLevel, LogEntry, Vehicle } from '@/types';

const LEVEL_3_TERMS = [
  'bhp', 'nm', 'torque', 'stage 2', 'stage2', 'ecu', 'remap', 'tune', 'dyno',
  'camber', 'toe', 'caster', 'boost', 'intercooler', 'turbo', 'injector',
  'maf', 'lambda', 'map', 'traction', 'lsd', 'diff', 'suspension', 'damper',
  'coilover', 'anti-roll', 'track', 'lap time', 'et ', 'trap speed',
];

const LEVEL_2_TERMS = [
  'oil change', 'air filter', 'km/l', 'fuel filter', 'brake fluid', 'coolant',
  'spark plug', 'timing belt', 'clutch', 'tyre pressure', 'alignment',
  'service', 'wheel', 'battery', 'transmission',
];

export function detectUserLevel(
  logs: LogEntry[],
  notes: string[] = [],
): UserLevel {
  const allText = [
    ...logs.map((l) => ((l as { notes?: string }).notes ?? '').toLowerCase()),
    ...notes.map((n) => n.toLowerCase()),
  ].join(' ');

  const hasTrackSession = logs.some((l) => l.logType === 'track_session');
  const hasPerformanceMod = logs.some(
    (l) =>
      l.logType === 'modification' &&
      LEVEL_3_TERMS.some((t) => allText.includes(t)),
  );

  if (hasTrackSession || hasPerformanceMod || LEVEL_3_TERMS.some((t) => allText.includes(t))) {
    return 3;
  }

  const hasManyServices = logs.filter((l) => l.logType === 'service').length >= 3;
  if (hasManyServices || LEVEL_2_TERMS.some((t) => allText.includes(t))) {
    return 2;
  }

  return 1;
}

export function userLevelLabel(level: UserLevel): string {
  return ['', 'Family / Casual', 'Engaged Owner', 'Enthusiast'][level];
}
