import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CartesianChart, Line } from 'victory-native';
import { useTheme } from '@/hooks/useTheme';
import type { FuelLog } from '@/types';

interface EfficiencyChartProps {
  logs: FuelLog[];
  height?: number;
}

interface ChartDataPoint extends Record<string, unknown> {
  index: number;
  efficiency: number;
  movingAvg: number;
}

const MIN_POINTS = 2;
const MOVING_AVG_WINDOW = 3;

function computeMovingAverage(values: number[], window: number): number[] {
  return values.map((_, i) => {
    const start = Math.max(0, i - Math.floor(window / 2));
    const end = Math.min(values.length, start + window);
    const slice = values.slice(start, end);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });
}

function EmptyState({ height, message }: { height: number; message: string }) {
  const { colors, typography } = useTheme();
  return (
    <View style={[styles.emptyContainer, { height }]}>
      <Text
        style={{
          fontSize: typography.caption.fontSize,
          color: colors.textMuted,
          textAlign: 'center',
        }}
      >
        {message}
      </Text>
    </View>
  );
}

export default function EfficiencyChart({
  logs,
  height = 200,
}: EfficiencyChartProps) {
  const { colors } = useTheme();

  // Filter to fuel logs that have efficiency data, sorted by date ascending
  const chartData = useMemo<ChartDataPoint[]>(() => {
    const withEfficiency = logs
      .filter((l) => l.efficiencyKmPerL != null && l.efficiencyKmPerL > 0)
      .sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );

    if (withEfficiency.length < MIN_POINTS) return [];

    const effValues = withEfficiency.map((l) => l.efficiencyKmPerL as number);
    const movingAvgs = computeMovingAverage(effValues, MOVING_AVG_WINDOW);

    return withEfficiency.map((l, i) => ({
      index: i,
      efficiency: Math.round(effValues[i] * 10) / 10,
      movingAvg: Math.round(movingAvgs[i] * 10) / 10,
    }));
  }, [logs]);

  if (logs.length === 0) {
    return (
      <EmptyState
        height={height}
        message="No fuel logs yet. Add your first fill-up to track efficiency."
      />
    );
  }

  if (chartData.length < MIN_POINTS) {
    return (
      <EmptyState
        height={height}
        message={`Add ${MIN_POINTS - chartData.length} more fuel ${
          MIN_POINTS - chartData.length === 1 ? 'log' : 'logs'
        } with efficiency data to see the chart.`}
      />
    );
  }

  // Compute y-axis domain with 10% padding
  const effValues = chartData.map((d) => d.efficiency);
  const minEff = Math.min(...effValues);
  const maxEff = Math.max(...effValues);
  const padding = Math.max((maxEff - minEff) * 0.15, 1);
  const yDomain: [number, number] = [
    Math.max(0, minEff - padding),
    maxEff + padding,
  ];

  return (
    <View style={[styles.container, { height }]}>
      <CartesianChart
        data={chartData}
        xKey="index"
        yKeys={['efficiency', 'movingAvg']}
        domain={{ y: yDomain }}
        domainPadding={{ left: 16, right: 16, top: 8, bottom: 8 }}
      >
        {({ points }) => (
          <>
            {/* Moving average line — blue, slightly thicker */}
            <Line
              points={points.movingAvg}
              color={colors.blue}
              strokeWidth={2}
              curveType="natural"
              opacity={0.7}
            />
            {/* Main efficiency line — accent yellow-lime */}
            <Line
              points={points.efficiency}
              color={colors.accent}
              strokeWidth={2.5}
              curveType="natural"
            />
          </>
        )}
      </CartesianChart>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendDot,
              { backgroundColor: colors.accent },
            ]}
          />
          <Text
            style={[
              styles.legendLabel,
              { color: colors.textSecondary, fontSize: 11 },
            ]}
          >
            km/L
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendDot,
              { backgroundColor: colors.blue, opacity: 0.7 },
            ]}
          />
          <Text
            style={[
              styles.legendLabel,
              { color: colors.textMuted, fontSize: 11 },
            ]}
          >
            Avg
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  emptyContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
    paddingTop: 6,
    paddingRight: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});
