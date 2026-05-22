import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '@/components/ui/GlassCard';
import { useTheme } from '@/hooks/useTheme';
import { formatOdometer } from '@/utils/formatOdometer';
import type { Vehicle, UsageRole, AlertSeverity } from '@/types';

interface VehicleAvatarProps {
  vehicle: Vehicle;
  onPress: () => void;
  compact?: boolean;
  alertSeverity?: AlertSeverity | null;
}

type VehicleIconName =
  | 'car-outline'
  | 'bicycle-outline'
  | 'car-sport-outline';

function getVehicleIcon(type: Vehicle['vehicleType']): VehicleIconName {
  switch (type) {
    case 'bike':
    case 'scooter':
      return 'bicycle-outline';
    case 'suv':
    case 'truck':
      return 'car-sport-outline';
    case 'car':
    default:
      return 'car-outline';
  }
}

const USAGE_ROLE_LABELS: Record<UsageRole, string> = {
  daily_commute: 'Daily',
  weekend: 'Weekend',
  occasional: 'Occasional',
  track: 'Track',
};

function HealthDot({
  severity,
}: {
  severity?: AlertSeverity | null;
}) {
  const { colors } = useTheme();
  const dotColor =
    severity === 'urgent'
      ? colors.danger
      : severity === 'warning'
      ? colors.warning
      : colors.success;

  return (
    <View
      style={[
        styles.healthDot,
        { backgroundColor: dotColor },
      ]}
      accessibilityLabel={`Health: ${severity ?? 'good'}`}
    />
  );
}

export default function VehicleAvatar({
  vehicle,
  onPress,
  compact = false,
  alertSeverity = null,
}: VehicleAvatarProps) {
  const { colors, typography, spacing, radius } = useTheme();

  const vehicleIcon = getVehicleIcon(vehicle.vehicleType);
  const displayName = vehicle.nickname ?? `${vehicle.make} ${vehicle.model}`;
  const usageLabel = USAGE_ROLE_LABELS[vehicle.usageRole];

  if (compact) {
    return (
      <GlassCard
        onPress={onPress}
        padding={12}
        style={styles.compactCard}
      >
        <View style={styles.compactRow}>
          {/* Icon */}
          <View
            style={[
              styles.compactIconWrap,
              {
                backgroundColor: colors.surface2,
                borderRadius: radius.sm,
              },
            ]}
          >
            <Ionicons
              name={vehicleIcon}
              size={22}
              color={colors.accent}
            />
          </View>

          {/* Details */}
          <View style={styles.compactDetails}>
            <Text
              style={[
                styles.compactName,
                {
                  fontSize: typography.title.fontSize,
                  fontWeight: typography.title.fontWeight,
                  color: colors.textPrimary,
                },
              ]}
              numberOfLines={1}
            >
              {displayName}
            </Text>
            <Text
              style={[
                styles.compactReg,
                {
                  fontSize: typography.caption.fontSize,
                  color: colors.textSecondary,
                  marginTop: 2,
                },
              ]}
              numberOfLines={1}
            >
              {vehicle.registrationNumber}
            </Text>
          </View>

          {/* Odometer + health */}
          <View style={styles.compactRight}>
            <Text
              style={[
                styles.compactOdo,
                {
                  fontSize: typography.caption.fontSize,
                  fontWeight: '600',
                  color: colors.accent,
                },
              ]}
            >
              {formatOdometer(vehicle.currentOdometer)}
            </Text>
            <HealthDot severity={alertSeverity} />
          </View>
        </View>
      </GlassCard>
    );
  }

  // Full card
  return (
    <GlassCard onPress={onPress} padding={spacing.base}>
      {/* Header row: icon + health dot */}
      <View style={styles.fullHeader}>
        <View
          style={[
            styles.fullIconWrap,
            {
              backgroundColor: colors.accentDim,
              borderRadius: radius.md,
            },
          ]}
        >
          <Ionicons name={vehicleIcon} size={32} color={colors.accent} />
        </View>
        <HealthDot severity={alertSeverity} />
      </View>

      {/* Make + Model */}
      <Text
        style={[
          styles.fullName,
          {
            fontSize: typography.headline.fontSize,
            fontWeight: typography.headline.fontWeight,
            lineHeight: typography.headline.lineHeight,
            color: colors.textPrimary,
            marginTop: spacing.sm,
          },
        ]}
        numberOfLines={1}
      >
        {displayName}
      </Text>

      {/* Year + Make if nickname set */}
      {vehicle.nickname && (
        <Text
          style={[
            {
              fontSize: typography.caption.fontSize,
              color: colors.textSecondary,
              marginTop: 2,
            },
          ]}
          numberOfLines={1}
        >
          {vehicle.make} {vehicle.model} · {vehicle.year}
        </Text>
      )}

      {/* Registration */}
      <Text
        style={[
          {
            fontSize: typography.caption.fontSize,
            color: colors.textMuted,
            marginTop: 2,
            letterSpacing: 0.5,
          },
        ]}
        numberOfLines={1}
      >
        {vehicle.registrationNumber}
      </Text>

      {/* Odometer */}
      <Text
        style={[
          styles.fullOdo,
          {
            fontSize: typography.display.fontSize,
            fontWeight: typography.display.fontWeight,
            lineHeight: typography.display.lineHeight,
            color: colors.accent,
            marginTop: spacing.base,
          },
        ]}
      >
        {formatOdometer(vehicle.currentOdometer)}
      </Text>

      {/* Usage role pill */}
      <View style={styles.fullFooter}>
        <View
          style={[
            styles.usagePill,
            {
              backgroundColor: colors.surface2,
              borderRadius: radius.pill,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: 10,
              paddingVertical: 4,
            },
          ]}
        >
          <Text
            style={{
              fontSize: typography.micro.fontSize,
              fontWeight: typography.micro.fontWeight,
              color: colors.textSecondary,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            {usageLabel}
          </Text>
        </View>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  // Compact
  compactCard: {
    marginBottom: 8,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  compactIconWrap: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  compactDetails: {
    flex: 1,
    minWidth: 0,
  },
  compactName: {
    letterSpacing: 0.1,
  },
  compactReg: {
    letterSpacing: 0.4,
  },
  compactRight: {
    alignItems: 'flex-end',
    gap: 4,
    flexShrink: 0,
  },
  compactOdo: {
    letterSpacing: 0.2,
  },

  // Full
  fullHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  fullIconWrap: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullName: {
    letterSpacing: 0.1,
  },
  fullOdo: {
    letterSpacing: -0.5,
  },
  fullFooter: {
    flexDirection: 'row',
    marginTop: 12,
  },
  usagePill: {
    alignSelf: 'flex-start',
  },

  // Shared
  healthDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
