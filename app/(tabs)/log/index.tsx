import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGarageStore } from '@/store/garage';
import { useTheme } from '@/hooks/useTheme';
import { formatINR } from '@/utils/formatINR';
import { formatDateShort } from '@/utils/formatDate';
import { formatOdometer } from '@/utils/formatOdometer';
import type { LogEntry, LogType, Vehicle } from '@/types';

interface LogTypeCard {
  type: LogType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
}

const LOG_TYPE_CARDS: LogTypeCard[] = [
  { type: 'service', label: 'Service', icon: 'construct-outline', description: 'Oil, filters, brakes...' },
  { type: 'fuel', label: 'Fuel Fill', icon: 'water-outline', description: 'Track every fill-up' },
  { type: 'expense', label: 'Expense', icon: 'receipt-outline', description: 'Repairs, fines, parking' },
  { type: 'modification', label: 'Modification', icon: 'settings-outline', description: 'Parts & upgrades' },
  { type: 'document', label: 'Document', icon: 'document-text-outline', description: 'Insurance, PUC, RC' },
  { type: 'accident', label: 'Accident', icon: 'alert-circle-outline', description: 'Incidents & repairs' },
];

function getLogTypeIcon(type: LogType): keyof typeof Ionicons.glyphMap {
  const map: Record<LogType, keyof typeof Ionicons.glyphMap> = {
    service: 'construct-outline',
    fuel: 'water-outline',
    expense: 'receipt-outline',
    modification: 'settings-outline',
    document: 'document-text-outline',
    accident: 'alert-circle-outline',
    track_session: 'speedometer-outline',
  };
  return map[type] ?? 'ellipse-outline';
}

function getLogTypeCost(entry: LogEntry): number | null {
  const e = entry as unknown as Record<string, unknown>;
  if ('totalCostInr' in e && typeof e.totalCostInr === 'number') return e.totalCostInr;
  if ('costInr' in e && typeof e.costInr === 'number') return e.costInr;
  if ('amountInr' in e && typeof e.amountInr === 'number') return e.amountInr;
  if ('repairCostInr' in e && typeof e.repairCostInr === 'number') return e.repairCostInr;
  return null;
}

function getLogSummary(entry: LogEntry): string {
  const e = entry as unknown as Record<string, unknown>;
  if (entry.logType === 'service' && typeof e.serviceType === 'string') return e.serviceType;
  if (entry.logType === 'fuel' && typeof e.volumeLitres === 'number') return `${e.volumeLitres}L filled`;
  if (entry.logType === 'expense' && typeof e.category === 'string') return String(e.category).replace(/_/g, ' ');
  if (entry.logType === 'modification' && typeof e.modName === 'string') return String(e.modName);
  if (entry.logType === 'document' && typeof e.docType === 'string') return String(e.docType).toUpperCase().replace(/_/g, ' ');
  if (entry.logType === 'accident' && typeof e.severity === 'string') return `${String(e.severity)} incident`;
  if (entry.logType === 'track_session' && typeof e.venue === 'string') return String(e.venue);
  return entry.notes ?? 'Log entry';
}

function VehicleSelectorPill({
  vehicles,
  selectedId,
  onSelect,
}: {
  vehicles: Vehicle[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const { colors, spacing, radius, typography } = useTheme();
  if (vehicles.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: spacing.base, gap: spacing.sm }}
      style={{ marginBottom: spacing.md }}
    >
      {vehicles.map((v) => {
        const isSelected = v.id === selectedId;
        return (
          <TouchableOpacity
            key={v.id}
            onPress={() => onSelect(v.id)}
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
            <Text
              style={[
                typography.caption,
                { color: isSelected ? colors.accent : colors.textSecondary, fontWeight: isSelected ? '600' : '400' },
              ]}
            >
              {v.nickname ?? `${v.make} ${v.model}`}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

function LogTypeGrid({ onTypePress }: { onTypePress: (type: LogType) => void }) {
  const { colors, spacing, radius, typography } = useTheme();
  return (
    <View style={styles.logTypeGrid}>
      {LOG_TYPE_CARDS.map((card) => (
        <TouchableOpacity
          key={card.type}
          onPress={() => onTypePress(card.type)}
          activeOpacity={0.8}
          style={[
            styles.logTypeCard,
            {
              backgroundColor: colors.surface1,
              borderColor: colors.border,
              borderRadius: radius.md,
              padding: spacing.md,
            },
          ]}
        >
          <View
            style={[
              styles.logTypeIconBg,
              { backgroundColor: colors.surface2, borderRadius: radius.sm },
            ]}
          >
            <Ionicons name={card.icon} size={22} color={colors.accent} />
          </View>
          <Text style={[typography.caption, { color: colors.textPrimary, marginTop: spacing.sm, fontWeight: '600' }]}>
            {card.label}
          </Text>
          <Text style={[typography.micro, { color: colors.textMuted, marginTop: 2 }]} numberOfLines={1}>
            {card.description}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function RecentLogItem({ entry }: { entry: LogEntry }) {
  const { colors, spacing, radius, typography } = useTheme();
  const cost = getLogTypeCost(entry);
  const summary = getLogSummary(entry);
  const icon = getLogTypeIcon(entry.logType);

  return (
    <View
      style={[
        styles.recentLogItem,
        {
          backgroundColor: colors.surface1,
          borderColor: colors.border,
          borderRadius: radius.md,
          padding: spacing.md,
          marginBottom: spacing.sm,
        },
      ]}
    >
      <View style={styles.recentLogLeft}>
        <View style={[styles.recentLogIcon, { backgroundColor: colors.surface2, borderRadius: radius.sm }]}>
          <Ionicons name={icon} size={16} color={colors.textSecondary} />
        </View>
        <View style={{ flex: 1, marginLeft: spacing.sm }}>
          <Text style={[typography.caption, { color: colors.textPrimary, fontWeight: '600', textTransform: 'capitalize' }]}>
            {summary}
          </Text>
          <View style={styles.recentLogMeta}>
            <Text style={[typography.micro, { color: colors.textMuted }]}>
              {formatDateShort(entry.date)}
            </Text>
            {entry.odometerKm != null && (
              <Text style={[typography.micro, { color: colors.textMuted, marginLeft: spacing.sm }]}>
                · {formatOdometer(entry.odometerKm)}
              </Text>
            )}
          </View>
        </View>
      </View>
      {cost != null && (
        <Text style={[typography.caption, { color: colors.accent, fontWeight: '600' }]}>
          {formatINR(cost, true)}
        </Text>
      )}
    </View>
  );
}

function EmptyLogs() {
  const { colors, spacing, typography } = useTheme();
  return (
    <View style={styles.emptyLogs}>
      <Ionicons name="clipboard-outline" size={32} color={colors.textMuted} />
      <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.sm, textAlign: 'center' }]}>
        No logs yet. Tap a category above to get started.
      </Text>
    </View>
  );
}

export default function LogScreen() {
  const { colors, spacing, typography, radius } = useTheme();
  const router = useRouter();
  const { vehicles, activeVehicleId, setActiveVehicle, logs } = useGarageStore();

  const effectiveVehicleId = activeVehicleId ?? (vehicles[0]?.id ?? null);

  const recentLogs = useMemo(() => {
    if (!effectiveVehicleId) return [];
    const vehicleLogs = logs[effectiveVehicleId] ?? [];
    return [...vehicleLogs]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  }, [logs, effectiveVehicleId]);

  const handleLogTypePress = (_type: LogType) => {
    if (!effectiveVehicleId) {
      router.push('/onboarding/lookup');
      return;
    }
    // Navigate to the log entry form for the given type
    // For now, uses UI store bottom sheet model
  };

  const handleQuickFuel = () => {
    if (!effectiveVehicleId) return;
    // Open fuel log quick-entry
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingHorizontal: spacing.base, paddingTop: spacing.md, paddingBottom: spacing.sm }]}>
        <Text style={[typography.headline, { color: colors.textPrimary }]}>Log</Text>
        {effectiveVehicleId && vehicles.length > 0 && (
          <View style={[styles.activeVehicleBadge, { backgroundColor: colors.surface1, borderColor: colors.border, borderRadius: radius.pill }]}>
            <Ionicons name="car-outline" size={12} color={colors.textSecondary} style={{ marginRight: 4 }} />
            <Text style={[typography.micro, { color: colors.textSecondary }]}>
              {vehicles.find((v) => v.id === effectiveVehicleId)?.nickname ??
                (() => {
                  const v = vehicles.find((vv) => vv.id === effectiveVehicleId);
                  return v ? `${v.make} ${v.model}` : '';
                })()}
            </Text>
          </View>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {vehicles.length > 1 && (
          <VehicleSelectorPill
            vehicles={vehicles}
            selectedId={effectiveVehicleId}
            onSelect={setActiveVehicle}
          />
        )}

        <View style={{ paddingHorizontal: spacing.base }}>
          <Text style={[typography.caption, { color: colors.textMuted, marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 0.8 }]}>
            What do you want to log?
          </Text>
          <LogTypeGrid onTypePress={handleLogTypePress} />
        </View>

        <View style={{ paddingHorizontal: spacing.base, marginTop: spacing.lg }}>
          <Text style={[typography.caption, { color: colors.textMuted, marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 0.8 }]}>
            Recent logs
          </Text>
          {vehicles.length === 0 ? (
            <View style={[styles.noVehicleCard, { backgroundColor: colors.surface1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.base }]}>
              <Text style={[typography.caption, { color: colors.textSecondary, textAlign: 'center' }]}>
                Add a vehicle first to start logging.
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/onboarding/lookup')}
                style={[styles.addVehicleBtn, { backgroundColor: colors.accent, borderRadius: radius.sm, marginTop: spacing.md }]}
              >
                <Text style={[typography.caption, { color: '#0D0D0D', fontWeight: '700' }]}>Add vehicle</Text>
              </TouchableOpacity>
            </View>
          ) : recentLogs.length === 0 ? (
            <EmptyLogs />
          ) : (
            <FlatList
              data={recentLogs}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <RecentLogItem entry={item} />}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>

      {effectiveVehicleId && (
        <TouchableOpacity
          onPress={handleQuickFuel}
          style={[
            styles.fab,
            {
              backgroundColor: colors.accent,
              borderRadius: radius.full,
              bottom: 80,
              right: spacing.base,
            },
          ]}
          activeOpacity={0.85}
        >
          <Ionicons name="water-outline" size={22} color="#0D0D0D" />
        </TouchableOpacity>
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
  activeVehicleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
  },
  vehiclePill: {
    borderWidth: 1,
  },
  logTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  logTypeCard: {
    width: '30.5%',
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  logTypeIconBg: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentLogItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
  },
  recentLogLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  recentLogIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentLogMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  emptyLogs: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  noVehicleCard: {
    borderWidth: 1,
    alignItems: 'center',
  },
  addVehicleBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
