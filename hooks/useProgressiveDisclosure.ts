import { useMemo } from 'react';
import { AiConfig } from '@/config/ai.config';
import type { LogEntry, Vehicle } from '@/types';

export type DisclosureLevel = 'core' | 'fluid_specs' | 'enthusiast' | 'track';

export function useProgressiveDisclosure(
  vehicle: Vehicle | null,
  logs: LogEntry[],
): { level: DisclosureLevel; nextNudge: string | null } {
  return useMemo(() => {
    if (!vehicle) return { level: 'core', nextNudge: null };

    const pd = AiConfig.progressiveDisclosure;
    const serviceLogs = logs.filter((l) => l.logType === 'service');
    const modLogs = logs.filter((l) => l.logType === 'modification');
    const trackLogs = logs.filter((l) => l.logType === 'track_session');
    const hasPerformanceMod = modLogs.some((l) =>
      pd.enthusiastFieldsTriggers.some((t) => l.notes?.toLowerCase().includes(t)),
    );

    if (trackLogs.length > 0) {
      return { level: 'track', nextNudge: null };
    }

    if (hasPerformanceMod || modLogs.some((l) => l.logType === 'modification')) {
      return {
        level: 'enthusiast',
        nextNudge:
          trackLogs.length === 0
            ? "You've logged performance mods — want to record a track session?"
            : null,
      };
    }

    if (serviceLogs.length >= pd.fluidSpecsMinServiceLogs) {
      return {
        level: 'fluid_specs',
        nextNudge:
          modLogs.length === 0
            ? "You've built a solid service history. Log any modifications to unlock performance tracking."
            : null,
      };
    }

    const daysSinceJoined =
      (Date.now() - new Date(vehicle.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    const isEarlyUser = daysSinceJoined <= pd.coreOnlyDays && logs.length <= pd.coreOnlyMaxLogs;

    return {
      level: 'core',
      nextNudge: isEarlyUser
        ? null
        : serviceLogs.length > 0
        ? `Log ${pd.fluidSpecsMinServiceLogs - serviceLogs.length} more service entries to unlock fluid spec tracking.`
        : null,
    };
  }, [vehicle?.id, logs.length]);
}
