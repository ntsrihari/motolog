import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '@/components/ui/GlassCard';
import { useTheme } from '@/hooks/useTheme';
import { formatDateShort } from '@/utils/formatDate';
import { formatOdometer } from '@/utils/formatOdometer';
import { formatINR } from '@/utils/formatINR';
import type { ServiceLog } from '@/types';

interface ServiceCardProps {
  log: ServiceLog;
  onPress?: () => void;
}

type ServiceIconName =
  | 'construct-outline'
  | 'water-outline'
  | 'funnel-outline'
  | 'flash-outline'
  | 'disc-outline'
  | 'car-outline'
  | 'battery-charging-outline'
  | 'snow-outline'
  | 'settings-outline';

function getServiceIcon(serviceType: string): ServiceIconName {
  const t = serviceType.toLowerCase();
  if (t.includes('oil')) return 'water-outline';
  if (t.includes('filter')) return 'funnel-outline';
  if (t.includes('spark') || t.includes('plug')) return 'flash-outline';
  if (t.includes('brake') || t.includes('disc')) return 'disc-outline';
  if (t.includes('battery')) return 'battery-charging-outline';
  if (t.includes('ac') || t.includes('cool')) return 'snow-outline';
  if (t.includes('tyre') || t.includes('wheel')) return 'car-outline';
  return 'construct-outline';
}

function getServiceLabel(serviceType: string): string {
  // Convert snake_case or id strings to readable labels
  return serviceType
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ServiceCard({ log, onPress }: ServiceCardProps) {
  const { colors, typography, spacing, radius } = useTheme();

  const serviceIcon = getServiceIcon(log.serviceType);
  const serviceLabel = getServiceLabel(log.serviceType);
  const hasNextService = log.nextServiceKm != null || log.nextServiceDate != null;

  return (
    <GlassCard onPress={onPress} padding={spacing.base}>
      {/* Header row */}
      <View style={styles.headerRow}>
        {/* Icon */}
        <View
          style={[
            styles.iconWrap,
            {
              backgroundColor: colors.surface2,
              borderRadius: radius.sm,
            },
          ]}
        >
          <Ionicons name={serviceIcon} size={20} color={colors.accent} />
        </View>

        {/* Title + date */}
        <View style={styles.titleGroup}>
          <Text
            style={[
              styles.serviceTitle,
              {
                fontSize: typography.title.fontSize,
                fontWeight: typography.title.fontWeight,
                lineHeight: typography.title.lineHeight,
                color: colors.textPrimary,
              },
            ]}
            numberOfLines={1}
          >
            {serviceLabel}
          </Text>
          <Text
            style={[
              {
                fontSize: typography.caption.fontSize,
                color: colors.textSecondary,
                marginTop: 2,
              },
            ]}
          >
            {formatDateShort(log.date)}
            {log.odometerKm != null && (
              <>
                {'  ·  '}
                <Text style={{ color: colors.textMuted }}>
                  {formatOdometer(log.odometerKm)}
                </Text>
              </>
            )}
          </Text>
        </View>

        {/* Cost */}
        <View style={styles.costGroup}>
          <Text
            style={[
              styles.costValue,
              {
                fontSize: typography.title.fontSize,
                fontWeight: '700',
                color: colors.textPrimary,
              },
            ]}
          >
            {formatINR(log.costInr)}
          </Text>
        </View>
      </View>

      {/* Items serviced */}
      {log.itemsServiced.length > 0 && (
        <View style={[styles.itemsRow, { marginTop: spacing.sm }]}>
          {log.itemsServiced.map((item) => (
            <View
              key={item}
              style={[
                styles.itemPill,
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
                {item}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Service center */}
      {log.serviceCenterName != null && log.serviceCenterName.length > 0 && (
        <View
          style={[
            styles.centerRow,
            { marginTop: spacing.sm },
          ]}
        >
          <Ionicons
            name="business-outline"
            size={12}
            color={colors.textMuted}
            style={{ marginRight: 4 }}
          />
          <Text
            style={{
              fontSize: typography.caption.fontSize,
              color: colors.textMuted,
              flex: 1,
            }}
            numberOfLines={1}
          >
            {log.serviceCenterName}
          </Text>
        </View>
      )}

      {/* Next service prediction */}
      {hasNextService && (
        <View
          style={[
            styles.nextServiceRow,
            {
              backgroundColor: colors.accentDim,
              borderRadius: radius.sm,
              padding: spacing.sm,
              marginTop: spacing.sm,
              borderWidth: 1,
              borderColor: `${colors.accent}25`,
            },
          ]}
        >
          <Ionicons
            name="calendar-outline"
            size={12}
            color={colors.accent}
            style={{ marginRight: 5 }}
          />
          <Text
            style={{
              fontSize: typography.caption.fontSize,
              color: colors.accent,
              fontWeight: '500',
              flex: 1,
            }}
          >
            Next service
            {log.nextServiceKm != null && (
              <>
                {': '}
                <Text style={{ fontWeight: '700' }}>
                  {formatOdometer(log.nextServiceKm)}
                </Text>
              </>
            )}
            {log.nextServiceDate != null && (
              <>
                {log.nextServiceKm != null ? '  or  ' : ': '}
                <Text style={{ fontWeight: '700' }}>
                  {formatDateShort(log.nextServiceDate)}
                </Text>
              </>
            )}
          </Text>
        </View>
      )}

      {/* Notes */}
      {log.notes != null && log.notes.length > 0 && (
        <Text
          style={[
            {
              fontSize: typography.caption.fontSize,
              color: colors.textMuted,
              marginTop: spacing.sm,
              fontStyle: 'italic',
              lineHeight: 18,
            },
          ]}
          numberOfLines={2}
        >
          {log.notes}
        </Text>
      )}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  iconWrap: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  titleGroup: {
    flex: 1,
    minWidth: 0,
  },
  serviceTitle: {},
  costGroup: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  costValue: {
    letterSpacing: -0.2,
  },
  itemsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  itemPill: {},
  centerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextServiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
