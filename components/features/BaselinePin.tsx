import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { formatOdometer } from '@/utils/formatOdometer';
import { formatDateShort } from '@/utils/formatDate';
import type { VehicleBaseline } from '@/types';

interface BaselinePinProps {
  baseline: VehicleBaseline;
  vehicleName: string;
  onEditPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export default function BaselinePin({
  baseline,
  vehicleName,
  onEditPress,
  style,
}: BaselinePinProps) {
  const { colors, typography, spacing, radius } = useTheme();

  const hasServiceDate = !!baseline.lastServiceDate;
  const hasServiceItems = baseline.lastServiceItems.length > 0;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface1,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: `${colors.accent}28`,
          borderStyle: 'dashed',
          padding: spacing.base,
          opacity: 0.88,
        },
        style,
      ]}
      accessibilityRole="summary"
      accessibilityLabel={`Baseline for ${vehicleName}: ${formatOdometer(baseline.odometerKm)}`}
    >
      {/* Pin header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.pinIconWrap,
              {
                backgroundColor: colors.accentDim,
                borderRadius: radius.sm,
              },
            ]}
          >
            <Ionicons
              name="location"
              size={16}
              color={colors.accent}
            />
          </View>
          <View style={styles.headerTextGroup}>
            <Text
              style={[
                styles.pinLabel,
                {
                  fontSize: typography.caption.fontSize,
                  fontWeight: '600',
                  color: colors.accent,
                  textTransform: 'uppercase',
                  letterSpacing: 0.6,
                },
              ]}
            >
              Starting point
            </Text>
            <Text
              style={[
                {
                  fontSize: typography.micro.fontSize,
                  fontWeight: typography.micro.fontWeight,
                  color: colors.textMuted,
                  fontStyle: 'italic',
                  marginTop: 1,
                },
              ]}
            >
              Estimated — before MotoLog
            </Text>
          </View>
        </View>

        {/* Edit action */}
        {onEditPress && (
          <Pressable
            onPress={onEditPress}
            style={({ pressed }) => [
              styles.editBtn,
              {
                opacity: pressed ? 0.6 : 1,
                backgroundColor: pressed ? colors.surface2 : 'transparent',
                borderRadius: radius.sm,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Edit baseline"
            hitSlop={8}
          >
            <Ionicons
              name="pencil-outline"
              size={14}
              color={colors.textMuted}
            />
          </Pressable>
        )}
      </View>

      {/* Divider */}
      <View
        style={[
          styles.divider,
          {
            borderTopColor: `${colors.accent}20`,
            marginVertical: spacing.sm,
          },
        ]}
      />

      {/* Odometer */}
      <View style={styles.odoRow}>
        <Text
          style={[
            {
              fontSize: typography.caption.fontSize,
              color: colors.textMuted,
              marginBottom: 2,
            },
          ]}
        >
          Odometer at baseline
        </Text>
        <Text
          style={[
            styles.odoValue,
            {
              fontSize: typography.display.fontSize,
              fontWeight: typography.display.fontWeight,
              lineHeight: typography.display.lineHeight,
              color: colors.accent,
              letterSpacing: -0.5,
            },
          ]}
        >
          {formatOdometer(baseline.odometerKm)}
        </Text>
      </View>

      {/* Last service info */}
      {(hasServiceDate || hasServiceItems) && (
        <View
          style={[
            styles.serviceRow,
            {
              backgroundColor: colors.surface2,
              borderRadius: radius.sm,
              padding: spacing.sm,
              marginTop: spacing.sm,
            },
          ]}
        >
          <View style={styles.serviceHeader}>
            <Ionicons
              name="construct-outline"
              size={13}
              color={colors.textSecondary}
              style={{ marginRight: 4 }}
            />
            <Text
              style={{
                fontSize: typography.caption.fontSize,
                fontWeight: '600',
                color: colors.textSecondary,
              }}
            >
              Last service
            </Text>
            {hasServiceDate && (
              <Text
                style={{
                  fontSize: typography.caption.fontSize,
                  color: colors.textMuted,
                  marginLeft: 6,
                }}
              >
                {formatDateShort(baseline.lastServiceDate!)}
              </Text>
            )}
          </View>
          {hasServiceItems && (
            <Text
              style={{
                fontSize: typography.micro.fontSize,
                color: colors.textMuted,
                marginTop: 4,
                lineHeight: 16,
              }}
              numberOfLines={2}
            >
              {baseline.lastServiceItems.join(' · ')}
            </Text>
          )}
        </View>
      )}

      {/* Tap to edit hint */}
      {onEditPress && (
        <Pressable
          onPress={onEditPress}
          style={({ pressed }) => [
            styles.editHint,
            { opacity: pressed ? 0.5 : 0.7, marginTop: spacing.sm },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Edit baseline"
        >
          <Text
            style={[
              {
                fontSize: typography.micro.fontSize,
                fontWeight: typography.micro.fontWeight,
                color: colors.textMuted,
                textAlign: 'center',
                fontStyle: 'italic',
              },
            ]}
          >
            Tap to edit baseline
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 8,
  },
  pinIconWrap: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerTextGroup: {
    flex: 1,
  },
  pinLabel: {},
  editBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  divider: {
    borderTopWidth: 1,
    borderStyle: 'dashed',
  },
  odoRow: {},
  odoValue: {},
  serviceRow: {},
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editHint: {},
});
