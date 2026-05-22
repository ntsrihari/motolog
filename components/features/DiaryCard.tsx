import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '@/components/ui/GlassCard';
import { useTheme } from '@/hooks/useTheme';
import { formatRelativeDate } from '@/utils/formatDate';
import { formatOdometerShort } from '@/utils/formatOdometer';
import { formatINR } from '@/utils/formatINR';
import type { DiaryEntry } from '@/types';

interface DiaryCardProps {
  entry: DiaryEntry;
  vehicleName: string;
  onPromote?: () => void;
}

export default function DiaryCard({
  entry,
  vehicleName: _vehicleName,
  onPromote,
}: DiaryCardProps) {
  const { colors, typography, spacing, radius } = useTheme();

  const relativeDate = formatRelativeDate(entry.date);
  const hasFuel = entry.fuelLitres != null && entry.fuelLitres > 0;
  const hasOdoRange = entry.odometerStart != null && entry.odometerEnd != null;
  const hasOdoCurrent = entry.odometerCurrent != null;
  const hasConditionTags =
    entry.conditionTags != null && entry.conditionTags.length > 0;

  return (
    <GlassCard
      padding={spacing.base}
      accentBorder={entry.hasWarningLight === true}
    >
      {/* Top row: date + warning light indicator */}
      <View style={styles.topRow}>
        <View style={styles.dateGroup}>
          <Text
            style={[
              styles.dateText,
              {
                fontSize: typography.title.fontSize,
                fontWeight: typography.title.fontWeight,
                color: colors.textPrimary,
              },
            ]}
          >
            {relativeDate}
          </Text>
          <Text
            style={[
              {
                fontSize: typography.caption.fontSize,
                color: colors.textMuted,
                marginTop: 1,
              },
            ]}
          >
            {new Date(entry.date).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </Text>
        </View>

        {entry.hasWarningLight && (
          <View
            style={[
              styles.warningPill,
              {
                backgroundColor: colors.dangerDim,
                borderRadius: radius.pill,
                borderWidth: 1,
                borderColor: `${colors.danger}40`,
                paddingHorizontal: 8,
                paddingVertical: 4,
              },
            ]}
            accessibilityLabel="Warning light active"
          >
            <Ionicons
              name="warning"
              size={12}
              color={colors.danger}
              style={{ marginRight: 4 }}
            />
            <Text
              style={{
                fontSize: typography.micro.fontSize,
                fontWeight: '600',
                color: colors.danger,
              }}
            >
              Warning light
            </Text>
          </View>
        )}
      </View>

      {/* Warning light description */}
      {entry.hasWarningLight && entry.warningLightDesc && (
        <Text
          style={[
            {
              fontSize: typography.caption.fontSize,
              color: colors.danger,
              marginTop: spacing.xs,
              fontStyle: 'italic',
            },
          ]}
          numberOfLines={2}
        >
          {entry.warningLightDesc}
        </Text>
      )}

      {/* Odometer range */}
      {(hasOdoRange || hasOdoCurrent) && (
        <View style={[styles.odoRow, { marginTop: spacing.sm }]}>
          <Ionicons
            name="speedometer-outline"
            size={13}
            color={colors.textSecondary}
            style={{ marginRight: 5 }}
          />
          {hasOdoRange ? (
            <Text
              style={[
                {
                  fontSize: typography.caption.fontSize,
                  color: colors.textSecondary,
                },
              ]}
            >
              {formatOdometerShort(entry.odometerStart!)} →{' '}
              <Text style={{ fontWeight: '600', color: colors.accent }}>
                {formatOdometerShort(entry.odometerEnd!)} km
              </Text>
              <Text style={{ color: colors.textMuted }}>
                {' '}(+
                {formatOdometerShort(
                  entry.odometerEnd! - entry.odometerStart!,
                )}{' '}
                km)
              </Text>
            </Text>
          ) : (
            <Text
              style={[
                {
                  fontSize: typography.caption.fontSize,
                  color: colors.textSecondary,
                },
              ]}
            >
              <Text style={{ fontWeight: '600', color: colors.accent }}>
                {formatOdometerShort(entry.odometerCurrent!)} km
              </Text>
            </Text>
          )}
        </View>
      )}

      {/* Fuel info */}
      {hasFuel && (
        <View
          style={[
            styles.fuelRow,
            {
              backgroundColor: colors.surface2,
              borderRadius: radius.sm,
              padding: spacing.sm,
              marginTop: spacing.sm,
            },
          ]}
        >
          <Ionicons
            name="flame-outline"
            size={14}
            color={colors.warning}
            style={{ marginRight: 6 }}
          />
          <Text
            style={{
              fontSize: typography.caption.fontSize,
              color: colors.textSecondary,
              flex: 1,
            }}
          >
            <Text style={{ fontWeight: '600', color: colors.textPrimary }}>
              {entry.fuelLitres?.toFixed(1)}L
            </Text>
            {entry.fuelCostPerLitre != null && (
              <>
                {' @ '}
                {formatINR(entry.fuelCostPerLitre)}/L
              </>
            )}
            {entry.fuelTotalInr != null && (
              <Text style={{ fontWeight: '600', color: colors.warning }}>
                {'  '}{formatINR(entry.fuelTotalInr)}
              </Text>
            )}
          </Text>
        </View>
      )}

      {/* Drive feel note */}
      {entry.driveFeelNote != null && entry.driveFeelNote.length > 0 && (
        <Text
          style={[
            styles.driveNote,
            {
              fontSize: typography.body.fontSize,
              lineHeight: typography.body.lineHeight,
              color: colors.textSecondary,
              marginTop: spacing.sm,
            },
          ]}
          numberOfLines={2}
        >
          {entry.driveFeelNote}
        </Text>
      )}

      {/* Condition tags */}
      {hasConditionTags && (
        <View style={[styles.tagsRow, { marginTop: spacing.sm }]}>
          {entry.conditionTags!.map((tag) => (
            <View
              key={tag}
              style={[
                styles.tag,
                {
                  backgroundColor: colors.surface2,
                  borderRadius: radius.pill,
                  borderWidth: 1,
                  borderColor: colors.border,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                },
              ]}
            >
              <Text
                style={{
                  fontSize: typography.micro.fontSize,
                  fontWeight: typography.micro.fontWeight,
                  color: colors.textSecondary,
                }}
              >
                {tag}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Promote to log action */}
      {onPromote && !entry.isPromotedToLog && (
        <Pressable
          onPress={onPromote}
          style={({ pressed }) => [
            styles.promoteBtn,
            {
              marginTop: spacing.sm,
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: radius.sm,
              backgroundColor: pressed
                ? colors.accentDim
                : 'transparent',
              borderWidth: 1,
              borderColor: `${colors.accent}40`,
              alignSelf: 'flex-start',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Promote to log entry"
        >
          <Ionicons
            name="arrow-up-circle-outline"
            size={14}
            color={colors.accent}
          />
          <Text
            style={{
              fontSize: typography.caption.fontSize,
              fontWeight: '600',
              color: colors.accent,
            }}
          >
            Promote to log
          </Text>
        </Pressable>
      )}

      {/* Already promoted badge */}
      {entry.isPromotedToLog && (
        <View style={[styles.promotedBadge, { marginTop: spacing.xs }]}>
          <Ionicons
            name="checkmark-circle"
            size={12}
            color={colors.success}
            style={{ marginRight: 3 }}
          />
          <Text
            style={{
              fontSize: typography.micro.fontSize,
              fontWeight: typography.micro.fontWeight,
              color: colors.success,
            }}
          >
            Added to log
          </Text>
        </View>
      )}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  dateGroup: {
    flex: 1,
  },
  dateText: {},
  warningPill: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    marginLeft: 8,
  },
  odoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fuelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driveNote: {
    fontStyle: 'italic',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {},
  promoteBtn: {},
  promotedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
