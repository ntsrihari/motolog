import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import type { AlertSeverity } from '@/types';

type PillSize = 'sm' | 'md';

interface MetricPillProps {
  label: string;
  value: string | number;
  unit?: string;
  accent?: boolean;
  severity?: AlertSeverity;
  size?: PillSize;
}

export default function MetricPill({
  label,
  value,
  unit,
  accent = false,
  severity,
  size = 'md',
}: MetricPillProps) {
  const { colors, radius } = useTheme();

  const getSeverityBackground = (): string => {
    if (severity === 'urgent') return colors.dangerDim;
    if (severity === 'warning') return colors.warningDim;
    if (severity === 'info') return colors.blueDim;
    return colors.surface1;
  };

  const getSeverityBorder = (): string => {
    if (severity === 'urgent') return `${colors.danger}40`;
    if (severity === 'warning') return `${colors.warning}40`;
    if (severity === 'info') return `${colors.blue}40`;
    return colors.border;
  };

  const getValueColor = (): string => {
    if (accent) return '#E8FF3A';
    if (severity === 'urgent') return colors.danger;
    if (severity === 'warning') return colors.warning;
    if (severity === 'info') return colors.blue;
    return colors.textPrimary;
  };

  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: getSeverityBackground(),
          borderColor: getSeverityBorder(),
          borderRadius: radius.pill,
          paddingHorizontal: isSmall ? 8 : 12,
          paddingVertical: isSmall ? 4 : 6,
          borderWidth: 1,
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          {
            fontSize: isSmall ? 10 : 11,
            color: colors.textSecondary,
            marginBottom: 1,
          },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
      <View style={styles.valueRow}>
        <Text
          style={[
            styles.value,
            {
              fontSize: isSmall ? 13 : 15,
              color: getValueColor(),
            },
          ]}
          numberOfLines={1}
        >
          {value}
        </Text>
        {unit && (
          <Text
            style={[
              styles.unit,
              {
                fontSize: isSmall ? 10 : 11,
                color: colors.textSecondary,
              },
            ]}
          >
            {' '}{unit}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    alignSelf: 'flex-start',
  },
  label: {
    fontWeight: '400',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  unit: {
    fontWeight: '400',
  },
});
