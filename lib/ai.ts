import { ApiConfig } from '@/config/api.config';
import { AiConfig } from '@/config/ai.config';
import { supabase } from './supabase';
import type { Vehicle, DiaryEntry, FuelLog, UserLevel } from '@/types';

interface AiResponse {
  text?: string;
  data?: Record<string, unknown>;
  error?: string;
}

async function callAI(payload: Record<string, unknown>): Promise<AiResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('ai-assistant', {
      body: payload,
    });
    if (error) throw error;
    return data as AiResponse;
  } catch (err) {
    return { error: String(err) };
  }
}

export async function inferActiveVehicle(
  vehicles: Vehicle[],
  date: string,
  dayOfWeek: string,
): Promise<{ vehicleId: string; confidence: number; reason: string } | null> {
  if (!AiConfig.features.enableVehicleInference || vehicles.length === 0) return null;
  if (vehicles.length === 1) return { vehicleId: vehicles[0].id, confidence: 0.9, reason: 'Only one vehicle in garage' };

  const context = vehicles.map((v) => ({
    id: v.id,
    name: `${v.make} ${v.model}`,
    role: v.usageRole,
    lastOdometer: v.currentOdometer,
  }));

  const prompt = AiConfig.prompts.vehicleInference
    .replace('{context}', JSON.stringify(context))
    .replace('{vehicles}', JSON.stringify(context))
    .replace('{dayOfWeek}', dayOfWeek)
    .replace('{date}', date);

  const res = await callAI({ type: 'vehicle_inference', prompt });
  if (res.error || !res.data) return null;

  try {
    const parsed = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
    return parsed as { vehicleId: string; confidence: number; reason: string };
  } catch {
    return null;
  }
}

export async function detectEfficiencyAnomaly(
  vehicle: Vehicle,
  recentLogs: FuelLog[],
  userLevel: UserLevel,
): Promise<{
  detected: boolean;
  dropPct: number;
  causes: string[];
  recommendation: string;
} | null> {
  if (!AiConfig.features.enableAnomalyDetection || recentLogs.length < 3) return null;

  const sorted = [...recentLogs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const allEff = sorted.filter((l) => l.efficiencyKmPerL).map((l) => l.efficiencyKmPerL!);
  if (allEff.length < 3) return null;

  const baselineAvg = allEff.slice(0, -2).reduce((a, b) => a + b, 0) / (allEff.length - 2);
  const recentAvg = allEff.slice(-2).reduce((a, b) => a + b, 0) / 2;
  const dropPct = ((baselineAvg - recentAvg) / baselineAvg) * 100;

  if (dropPct < AiConfig.anomaly.efficiencyDropThresholdPct) return null;

  const prompt = AiConfig.prompts.anomalyAnalysis
    .replace('{vehicle}', `${vehicle.make} ${vehicle.model}`)
    .replace('{recentAvg}', recentAvg.toFixed(1))
    .replace('{baselineAvg}', baselineAvg.toFixed(1))
    .replace('{dropPct}', dropPct.toFixed(1))
    .replace('{lastService}', 'unknown')
    .replace('{diaryNotes}', '')
    .replace('{userLevel}', String(userLevel));

  const res = await callAI({ type: 'anomaly_analysis', prompt });
  if (res.error) return null;

  return res.data as { detected: boolean; dropPct: number; causes: string[]; recommendation: string };
}

export async function checkDiaryPatterns(
  diaryEntries: DiaryEntry[],
): Promise<{ pattern: string | null; mentions: number; suggestion: string | null } | null> {
  if (!AiConfig.features.enableDiaryPatternWatch || diaryEntries.length < 3) return null;

  const { patternEscalationDays, patternEscalationMentions } = AiConfig.diary;
  const cutoff = Date.now() - patternEscalationDays * 24 * 60 * 60 * 1000;
  const recent = diaryEntries.filter((e) => new Date(e.date).getTime() >= cutoff);

  const notes = recent
    .filter((e) => e.driveFeelNote)
    .map((e) => `${e.date}: ${e.driveFeelNote}`)
    .join('\n');

  if (!notes) return null;

  const prompt = AiConfig.prompts.diaryInsight
    .replace('{days}', String(patternEscalationDays))
    .replace('{notes}', notes)
    .replace('{threshold}', String(patternEscalationMentions));

  const res = await callAI({ type: 'diary_pattern', prompt });
  if (res.error) return null;

  return res.data as { pattern: string | null; mentions: number; suggestion: string | null };
}
