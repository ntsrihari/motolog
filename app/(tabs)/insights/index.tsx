import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGarageStore } from '@/store/garage';
import { useTheme } from '@/hooks/useTheme';
import { formatINR } from '@/utils/formatINR';
import { formatOdometer } from '@/utils/formatOdometer';
import { daysUntil, formatDateShort } from '@/utils/formatDate';
import type { Vehicle, LogEntry, FuelLog, ServiceLog, ExpenseLog } from '@/types';

function calcTotalSpend(logs: LogEntry[]): number {
  return logs.reduce((sum, entry) => {
    const e = entry as unknown as Record<string, unknown>;
    if ('totalCostInr' in e && typeof e.totalCostInr === 'number') return sum + e.totalCostInr;
    if ('costInr' in e && typeof e.costInr === 'number') return sum + e.costInr;
    if ('amountInr' in e && typeof e.amountInr === 'number') return sum + e.amountInr;
    return sum;
  }, 0);
}

function calcAvgEfficiency(logs: LogEntry[]): number | null {
  const fuelLogs = logs.filter((l): l is FuelLog => l.logType === 'fuel');
  const withEff = fuelLogs.filter((l) => l.efficiencyKmPerL != null);
  if (withEff.length === 0) return null;
  const total = withEff.reduce((sum, l) => sum + (l.efficiencyKmPerL ?? 0), 0);
  return total / withEff.length;
}

function calcExpenseBreakdown(logs: LogEntry[]): { label: string; amount: number; color: string }[] {
  const buckets: Record<string, { label: string; amount: number; color: string }> = {
    fuel: { label: 'Fuel', amount: 0, color: '#3A8DFF' },
    service: { label: 'Service', amount: 0, color: '#E8FF3A' },
    expense: { label: 'Misc', amount: 0, color: '#F59E0B' },
    modification: { label: 'Mods', amount: 0, color: '#2ECC71' },
    accident: { label: 'Accident', amount: 0, color: '#FF4D4D' },
  };

  logs.forEach((entry) => {
    const e = entry as unknown as Record<string, unknown>;
    let amount = 0;
    if ('totalCostInr' in e && typeof e.totalCostInr === 'number') amount = e.totalCostInr;
    else if ('costInr' in e && typeof e.costInr === 'number') amount = e.costInr;
    else if ('amountInr' in e && typeof e.amountInr === 'number') amount = e.amountInr;

    if (entry.logType in buckets) {
      buckets[entry.logType].amount += amount;
    }
  });

  return Object.values(buckets).filter((b) => b.amount > 0);
}

function calcResaleScore(vehicle: Vehicle, logs: LogEntry[]): number {
  let score = 40;

  const serviceLogs = logs.filter((l) => l.logType === 'service');
  score += Math.min(serviceLogs.length * 5, 20);

  const docs = vehicle.documents;
  if (docs) {
    const now = new Date();
    const isValid = (expiry?: string) => {
      if (!expiry) return false;
      return new Date(expiry) > now;
    };
    if (isValid(docs.insuranceExpiry)) score += 15;
    if (isValid(docs.pucExpiry)) score += 10;
    if (isValid(docs.rcExpiry)) score += 10;
    if (vehicle.baseline) score += 5;
  }

  return Math.min(score, 100);
}

interface DocStatusItem {
  label: string;
  expiry: string | undefined;
  icon: keyof typeof Ionicons.glyphMap;
}

function getDocStatus(vehicle: Vehicle): DocStatusItem[] {
  const docs = vehicle.documents;
  return [
    { label: 'Insurance', expiry: docs?.insuranceExpiry, icon: 'shield-checkmark-outline' },
    { label: 'PUC', expiry: docs?.pucExpiry, icon: 'leaf-outline' },
    { label: 'RC', expiry: docs?.rcExpiry, icon: 'document-text-outline' },
  ];
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  const { colors, spacing, radius, typography } = useTheme();
  return (
    <View
      style={[
        styles.metricCard,
        {
          backgroundColor: colors.surface1,
          borderColor: colors.border,
          borderRadius: radius.md,
          padding: spacing.md,
        },
      ]}
    >
      <Text style={[typography.micro, { color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.6 }]}>
        {label}
      </Text>
      <Text style={[typography.headline, { color: colors.textPrimary, marginTop: 2 }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      {sub != null && (
        <Text style={[typography.micro, { color: colors.textSecondary, marginTop: 1 }]}>{sub}</Text>
      )}
    </View>
  );
}

function ExpenseBar({ label, amount, total, color }: { label: string; amount: number; total: number; color: string }) {
  const { colors, spacing, typography, radius } = useTheme();
  const pct = total > 0 ? amount / total : 0;
  return (
    <View style={{ marginBottom: spacing.sm }}>
      <View style={styles.expenseBarHeader}>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>{label}</Text>
        <Text style={[typography.caption, { color: colors.textPrimary, fontWeight: '600' }]}>
          {formatINR(amount, true)}
        </Text>
      </View>
      <View style={[styles.expenseBarTrack, { backgroundColor: colors.surface2, borderRadius: radius.full, marginTop: 4 }]}>
        <View
          style={[
            styles.expenseBarFill,
            { backgroundColor: color, borderRadius: radius.full, width: `${Math.round(pct * 100)}%` },
          ]}
        />
      </View>
      <Text style={[typography.micro, { color: colors.textMuted, marginTop: 2 }]}>
        {Math.round(pct * 100)}%
      </Text>
    </View>
  );
}

function ResaleScoreBar({ score }: { score: number }) {
  const { colors, spacing, radius, typography } = useTheme();
  const barColor = score >= 75 ? colors.success : score >= 50 ? colors.warning : colors.danger;

  return (
    <View
      style={[
        styles.resaleCard,
        {
          backgroundColor: colors.surface1,
          borderColor: colors.border,
          borderRadius: radius.lg,
          padding: spacing.base,
          marginBottom: spacing.md,
        },
      ]}
    >
      <View style={styles.resaleHeader}>
        <View>
          <Text style={[typography.title, { color: colors.textPrimary }]}>Resale readiness</Text>
          <Text style={[typography.caption, { color: colors.textMuted }]}>Based on docs, logs & history</Text>
        </View>
        <Text style={[{ fontSize: 28, fontWeight: '700', color: barColor }]}>{score}%</Text>
      </View>
      <View style={[styles.resaleBarTrack, { backgroundColor: colors.surface2, borderRadius: radius.full, marginTop: spacing.md }]}>
        <View
          style={[
            styles.resaleBarFill,
            {
              backgroundColor: barColor,
              borderRadius: radius.full,
              width: `${score}%`,
            },
          ]}
        />
      </View>
      <Text style={[typography.micro, { color: colors.textMuted, marginTop: spacing.sm }]}>
        {score >= 75
          ? 'Great history. Your vehicle is well documented.'
          : score >= 50
          ? 'Good start. Complete your documents and add more logs.'
          : 'Build your history to improve your resale value.'}
      </Text>
    </View>
  );
}

function DocStatusRow({ doc, vehicle }: { doc: DocStatusItem; vehicle: Vehicle }) {
  const { colors, spacing, radius, typography } = useTheme();
  const days = doc.expiry != null ? daysUntil(doc.expiry) : null;
  const isExpired = days != null && days < 0;
  const isWarning = days != null && days >= 0 && days <= 30;
  const isValid = days != null && days > 30;

  const statusColor = isExpired ? colors.danger : isWarning ? colors.warning : isValid ? colors.success : colors.textMuted;
  const statusBg = isExpired ? colors.dangerDim : isWarning ? colors.warningDim : isValid ? colors.successDim : colors.surface2;

  return (
    <View
      style={[
        styles.docRow,
        {
          backgroundColor: colors.surface1,
          borderColor: colors.border,
          borderRadius: radius.md,
          padding: spacing.md,
          marginBottom: spacing.sm,
        },
      ]}
    >
      <View style={[styles.docIcon, { backgroundColor: statusBg, borderRadius: radius.sm }]}>
        <Ionicons name={doc.icon} size={18} color={statusColor} />
      </View>
      <View style={{ flex: 1, marginLeft: spacing.sm }}>
        <Text style={[typography.caption, { color: colors.textPrimary, fontWeight: '600' }]}>{doc.label}</Text>
        {doc.expiry != null ? (
          <Text style={[typography.micro, { color: colors.textSecondary }]}>
            Expires {formatDateShort(doc.expiry)}
          </Text>
        ) : (
          <Text style={[typography.micro, { color: colors.textMuted }]}>Not added</Text>
        )}
      </View>
      {days != null && (
        <View style={[styles.daysBadge, { backgroundColor: statusBg, borderRadius: radius.pill }]}>
          <Text style={[typography.micro, { color: statusColor, fontWeight: '700' }]}>
            {isExpired ? `${Math.abs(days)}d ago` : `${days}d`}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function InsightsScreen() {
  const { colors, spacing, typography, radius } = useTheme();
  const { vehicles, activeVehicleId, setActiveVehicle, logs } = useGarageStore();

  const effectiveVehicleId = activeVehicleId ?? (vehicles[0]?.id ?? null);
  const selectedVehicle = vehicles.find((v) => v.id === effectiveVehicleId) ?? null;
  const vehicleLogs = effectiveVehicleId ? (logs[effectiveVehicleId] ?? []) : [];

  const totalSpend = useMemo(() => calcTotalSpend(vehicleLogs), [vehicleLogs]);
  const avgEfficiency = useMemo(() => calcAvgEfficiency(vehicleLogs), [vehicleLogs]);
  const breakdown = useMemo(() => calcExpenseBreakdown(vehicleLogs), [vehicleLogs]);
  const resaleScore = useMemo(
    () => (selectedVehicle ? calcResaleScore(selectedVehicle, vehicleLogs) : 0),
    [selectedVehicle, vehicleLogs],
  );
  const docStatus = useMemo(
    () => (selectedVehicle ? getDocStatus(selectedVehicle) : []),
    [selectedVehicle],
  );

  const totalDist = useMemo(() => {
    if (!selectedVehicle) return null;
    const baseline = selectedVehicle.baseline?.odometerKm;
    if (baseline == null) return null;
    return selectedVehicle.currentOdometer - baseline;
  }, [selectedVehicle]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingHorizontal: spacing.base, paddingTop: spacing.md, paddingBottom: spacing.sm }]}>
        <Text style={[typography.headline, { color: colors.textPrimary }]}>Insights</Text>
      </View>

      {vehicles.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: spacing.base, gap: spacing.sm, paddingBottom: spacing.sm }}
        >
          {vehicles.map((v) => {
            const isSelected = v.id === effectiveVehicleId;
            return (
              <TouchableOpacity
                key={v.id}
                onPress={() => setActiveVehicle(v.id)}
                style={[
                  styles.vehiclePill,
                  {
                    backgroundColor: isSelected ? colors.accentDim : colors.surface1,
                    borderColor: isSelected ? colors.accent : colors.border,
                    borderRadius: radius.pill,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                  },
                ]}
              >
                <Text style={[typography.caption, { color: isSelected ? colors.accent : colors.textSecondary, fontWeight: isSelected ? '600' : '400' }]}>
                  {v.nickname ?? `${v.make} ${v.model}`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {vehicles.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="bar-chart-outline" size={48} color={colors.textMuted} />
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.lg, textAlign: 'center' }]}>
            Add a vehicle and start logging to see your insights here.
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.base, paddingBottom: 100 }}>
          <View style={[styles.metricsRow, { marginBottom: spacing.md }]}>
            <View style={{ flex: 1, marginRight: spacing.sm }}>
              <MetricCard
                label="Total spend"
                value={formatINR(totalSpend, true)}
                sub="all time"
              />
            </View>
            <View style={{ flex: 1, marginRight: spacing.sm }}>
              <MetricCard
                label="Avg efficiency"
                value={avgEfficiency != null ? `${avgEfficiency.toFixed(1)} km/l` : '—'}
                sub="from fuel logs"
              />
            </View>
            <View style={{ flex: 1 }}>
              <MetricCard
                label="Since baseline"
                value={totalDist != null ? formatOdometer(totalDist) : '—'}
                sub="distance logged"
              />
            </View>
          </View>

          {breakdown.length > 0 && (
            <View
              style={[
                styles.section,
                {
                  backgroundColor: colors.surface1,
                  borderColor: colors.border,
                  borderRadius: radius.lg,
                  padding: spacing.base,
                  marginBottom: spacing.md,
                },
              ]}
            >
              <Text style={[typography.title, { color: colors.textPrimary, marginBottom: spacing.md }]}>
                Expense breakdown
              </Text>
              {breakdown.map((item) => (
                <ExpenseBar
                  key={item.label}
                  label={item.label}
                  amount={item.amount}
                  total={totalSpend}
                  color={item.color}
                />
              ))}
            </View>
          )}

          {vehicleLogs.length === 0 && (
            <View
              style={[
                styles.noLogsCard,
                {
                  backgroundColor: colors.surface1,
                  borderColor: colors.border,
                  borderRadius: radius.lg,
                  padding: spacing.base,
                  marginBottom: spacing.md,
                },
              ]}
            >
              <Ionicons name="analytics-outline" size={28} color={colors.textMuted} />
              <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing.sm, textAlign: 'center' }]}>
                Start logging fuel fills and service visits to see your expense breakdown and efficiency trends here.
              </Text>
            </View>
          )}

          {selectedVehicle && (
            <ResaleScoreBar score={resaleScore} />
          )}

          {docStatus.length > 0 && selectedVehicle && (
            <View style={{ marginBottom: spacing.md }}>
              <Text style={[typography.caption, { color: colors.textMuted, marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 0.8 }]}>
                Document status
              </Text>
              {docStatus.map((doc) => (
                <DocStatusRow key={doc.label} doc={doc} vehicle={selectedVehicle} />
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  vehiclePill: {
    borderWidth: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 80,
  },
  metricsRow: {
    flexDirection: 'row',
  },
  metricCard: {
    borderWidth: 1,
  },
  section: {
    borderWidth: 1,
  },
  expenseBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  expenseBarTrack: {
    height: 6,
    overflow: 'hidden',
  },
  expenseBarFill: {
    height: '100%',
  },
  resaleCard: {
    borderWidth: 1,
  },
  resaleHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  resaleBarTrack: {
    height: 8,
    overflow: 'hidden',
  },
  resaleBarFill: {
    height: '100%',
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  docIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daysBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  noLogsCard: {
    borderWidth: 1,
    alignItems: 'center',
  },
});
