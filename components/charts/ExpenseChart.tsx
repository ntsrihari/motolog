import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { formatINR } from '@/utils/formatINR';
import type { LogEntry } from '@/types';

interface CategoryTotal {
  label: string;
  amount: number;
  color: string;
}

interface ExpenseChartProps {
  logs: LogEntry[];
  period?: 'monthly' | 'yearly';
}

const CATEGORY_COLORS: Record<string, string> = {
  fuel: '#3A8DFF',
  service: '#E8FF3A',
  modification: '#F59E0B',
  accident: '#FF4D4D',
  document: '#2ECC71',
  expense: '#9A9A9A',
  track_session: '#A855F7',
};

const CATEGORY_LABELS: Record<string, string> = {
  fuel: 'Fuel',
  service: 'Service',
  modification: 'Modifications',
  accident: 'Accident/Repair',
  document: 'Documents',
  expense: 'Other',
  track_session: 'Track Sessions',
};

export default function ExpenseChart({ logs, period = 'monthly' }: ExpenseChartProps) {
  const { colors, spacing, radius, typography } = useTheme();

  const now = new Date();
  const filtered = logs.filter((l) => {
    const d = new Date(l.date);
    if (period === 'monthly') {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    return d.getFullYear() === now.getFullYear();
  });

  const totals: Record<string, number> = {};
  for (const log of filtered) {
    const key = log.logType;
    const cost = (log as { costInr?: number }).costInr ?? 0;
    totals[key] = (totals[key] ?? 0) + cost;
  }

  const categories: CategoryTotal[] = Object.entries(totals)
    .filter(([, amount]) => amount > 0)
    .map(([key, amount]) => ({
      label: CATEGORY_LABELS[key] ?? key,
      amount,
      color: CATEGORY_COLORS[key] ?? colors.textMuted,
    }))
    .sort((a, b) => b.amount - a.amount);

  const totalAmount = categories.reduce((s, c) => s + c.amount, 0);

  const s = StyleSheet.create({
    container: { gap: spacing.sm },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    dotAndLabel: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flex: 1 },
    dot: { width: 8, height: 8, borderRadius: 4 },
    label: { ...typography.caption, color: colors.textSecondary, flex: 1 },
    barTrack: {
      flex: 2,
      height: 6,
      backgroundColor: colors.surface2,
      borderRadius: radius.pill,
      overflow: 'hidden',
    },
    barFill: { height: 6, borderRadius: radius.pill },
    amount: { ...typography.caption, color: colors.textPrimary, fontWeight: '600', minWidth: 64, textAlign: 'right' },
    empty: { ...typography.caption, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.lg },
    total: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      marginTop: spacing.xs,
    },
    totalLabel: { ...typography.caption, color: colors.textMuted },
    totalValue: { ...typography.title, color: colors.textPrimary },
  });

  if (categories.length === 0) {
    return (
      <Text style={s.empty}>
        No expenses logged {period === 'monthly' ? 'this month' : 'this year'} yet.
      </Text>
    );
  }

  return (
    <View style={s.container}>
      {categories.map((cat) => {
        const pct = totalAmount > 0 ? cat.amount / totalAmount : 0;
        return (
          <View key={cat.label} style={s.row}>
            <View style={s.dotAndLabel}>
              <View style={[s.dot, { backgroundColor: cat.color }]} />
              <Text style={s.label} numberOfLines={1}>{cat.label}</Text>
            </View>
            <View style={s.barTrack}>
              <View style={[s.barFill, { width: `${Math.round(pct * 100)}%`, backgroundColor: cat.color }]} />
            </View>
            <Text style={s.amount}>{formatINR(cat.amount, true)}</Text>
          </View>
        );
      })}
      <View style={s.total}>
        <Text style={s.totalLabel}>Total {period === 'monthly' ? 'this month' : 'this year'}</Text>
        <Text style={s.totalValue}>{formatINR(totalAmount)}</Text>
      </View>
    </View>
  );
}
