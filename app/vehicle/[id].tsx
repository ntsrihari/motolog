import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGarageStore } from '@/store/garage';
import { useTheme } from '@/hooks/useTheme';
import { formatINR } from '@/utils/formatINR';
import { formatDateShort, daysUntil } from '@/utils/formatDate';
import { formatOdometer } from '@/utils/formatOdometer';
import type { LogEntry, LogType, Vehicle } from '@/types';

type ScreenTab = 'timeline' | 'specs' | 'documents';

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

function getLogTypeColor(type: LogType, colors: ReturnType<typeof useTheme>['colors']): string {
  const map: Record<LogType, string> = {
    service: colors.accent,
    fuel: colors.blue,
    expense: colors.warning,
    modification: colors.success,
    document: colors.blueLight,
    accident: colors.danger,
    track_session: colors.accentLight,
  };
  return map[type] ?? colors.textMuted;
}

function getLogCost(entry: LogEntry): number | null {
  const e = entry as unknown as Record<string, unknown>;
  if ('totalCostInr' in e && typeof e.totalCostInr === 'number') return e.totalCostInr;
  if ('costInr' in e && typeof e.costInr === 'number') return e.costInr;
  if ('amountInr' in e && typeof e.amountInr === 'number') return e.amountInr;
  if ('repairCostInr' in e && typeof e.repairCostInr === 'number') return e.repairCostInr;
  return null;
}

function getLogSummary(entry: LogEntry): string {
  const e = entry as unknown as Record<string, unknown>;
  if (entry.logType === 'service' && typeof e.serviceType === 'string') return String(e.serviceType).replace(/_/g, ' ');
  if (entry.logType === 'fuel' && typeof e.volumeLitres === 'number') return `${e.volumeLitres}L filled`;
  if (entry.logType === 'expense' && typeof e.category === 'string') return String(e.category).replace(/_/g, ' ');
  if (entry.logType === 'modification' && typeof e.modName === 'string') return String(e.modName);
  if (entry.logType === 'document' && typeof e.docType === 'string') return String(e.docType).toUpperCase();
  if (entry.logType === 'accident' && typeof e.severity === 'string') return `${String(e.severity)} incident`;
  if (entry.logType === 'track_session' && typeof e.venue === 'string') return String(e.venue);
  return entry.notes ?? 'Log entry';
}

function calcHealthScore(vehicle: Vehicle, logs: LogEntry[]): number {
  let score = 50;
  const serviceLogs = logs.filter((l) => l.logType === 'service');
  score += Math.min(serviceLogs.length * 5, 20);

  const docs = vehicle.documents;
  if (docs) {
    const now = new Date();
    if (docs.insuranceExpiry && new Date(docs.insuranceExpiry) > now) score += 15;
    if (docs.pucExpiry && new Date(docs.pucExpiry) > now) score += 10;
  }
  if (vehicle.baseline) score += 5;
  return Math.min(score, 100);
}

function BaselinePin({ baseline }: { baseline: NonNullable<Vehicle['baseline']> }) {
  const { colors, spacing, radius, typography } = useTheme();
  return (
    <View
      style={[
        styles.baselinePin,
        {
          borderColor: colors.border,
          borderRadius: radius.md,
          padding: spacing.md,
          marginBottom: spacing.sm,
          backgroundColor: colors.surface1,
        },
      ]}
    >
      <View style={styles.baselinePinHeader}>
        <View style={[styles.baselineIconBg, { backgroundColor: colors.surface2, borderRadius: radius.sm }]}>
          <Ionicons name="flag-outline" size={16} color={colors.textMuted} />
        </View>
        <View style={{ flex: 1, marginLeft: spacing.sm }}>
          <Text style={[typography.caption, { color: colors.textMuted, fontStyle: 'italic' }]}>
            Before MotoLog
          </Text>
          <Text style={[typography.micro, { color: colors.textMuted }]}>
            Baseline snapshot · {formatOdometer(baseline.odometerKm)}
          </Text>
        </View>
        <View style={[styles.baselineBadge, { backgroundColor: colors.surface2, borderRadius: radius.pill }]}>
          <Text style={[typography.micro, { color: colors.textMuted }]}>Baseline</Text>
        </View>
      </View>
      {baseline.lastServiceItems.length > 0 && (
        <Text style={[typography.micro, { color: colors.textMuted, marginTop: 6 }]}>
          Last service: {baseline.lastServiceItems.join(', ')}
        </Text>
      )}
    </View>
  );
}

function TimelineItem({
  entry,
  colors,
  onDelete,
}: {
  entry: LogEntry;
  colors: ReturnType<typeof useTheme>['colors'];
  onDelete: (id: string) => void;
}) {
  const { spacing, radius, typography } = useTheme();
  const typeColor = getLogTypeColor(entry.logType, colors);
  const icon = getLogTypeIcon(entry.logType);
  const summary = getLogSummary(entry);
  const cost = getLogCost(entry);

  const handleDelete = () => {
    Alert.alert('Delete log', 'Remove this entry from your history?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(entry.id) },
    ]);
  };

  return (
    <View
      style={[
        styles.timelineItem,
        {
          backgroundColor: colors.surface1,
          borderColor: colors.border,
          borderRadius: radius.md,
          padding: spacing.md,
          marginBottom: spacing.sm,
        },
      ]}
    >
      <View style={styles.timelineItemContent}>
        <View style={[styles.timelineIcon, { backgroundColor: `${typeColor}20`, borderRadius: radius.sm }]}>
          <Ionicons name={icon} size={16} color={typeColor} />
        </View>
        <View style={{ flex: 1, marginLeft: spacing.sm }}>
          <Text style={[typography.caption, { color: colors.textPrimary, fontWeight: '600', textTransform: 'capitalize' }]}>
            {summary}
          </Text>
          <View style={styles.timelineMeta}>
            <Text style={[typography.micro, { color: colors.textMuted }]}>
              {formatDateShort(entry.date)}
            </Text>
            {entry.odometerKm != null && (
              <Text style={[typography.micro, { color: colors.textMuted, marginLeft: spacing.sm }]}>
                · {formatOdometer(entry.odometerKm)}
              </Text>
            )}
          </View>
          {entry.notes != null && (
            <Text style={[typography.micro, { color: colors.textSecondary, marginTop: 2 }]} numberOfLines={1}>
              {entry.notes}
            </Text>
          )}
        </View>
        {cost != null && (
          <Text style={[typography.caption, { color: typeColor, fontWeight: '700' }]}>
            {formatINR(cost, true)}
          </Text>
        )}
        <TouchableOpacity onPress={handleDelete} style={[styles.deleteBtn, { marginLeft: spacing.sm }]}>
          <Ionicons name="trash-outline" size={15} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function SpecsTab({ vehicle }: { vehicle: Vehicle }) {
  const { colors, spacing, radius, typography } = useTheme();
  const specs = vehicle.specs;
  const specRows: { label: string; value: string }[] = [];

  if (specs) {
    if (specs.displacement) specRows.push({ label: 'Displacement', value: `${specs.displacement}cc` });
    if (specs.powerBhp) specRows.push({ label: 'Power', value: `${specs.powerBhp} BHP` });
    if (specs.torqueNm) specRows.push({ label: 'Torque', value: `${specs.torqueNm} Nm` });
    if (specs.kerbWeightKg) specRows.push({ label: 'Kerb weight', value: `${specs.kerbWeightKg} kg` });
    if (specs.tankCapacityL) specRows.push({ label: 'Tank capacity', value: `${specs.tankCapacityL}L` });
    if (specs.tyresFront) specRows.push({ label: 'Tyres (front)', value: specs.tyresFront });
    if (specs.tyresRear) specRows.push({ label: 'Tyres (rear)', value: specs.tyresRear });
    if (specs.serviceIntervalKm) specRows.push({ label: 'Service interval', value: `${specs.serviceIntervalKm.toLocaleString('en-IN')} km` });
    if (specs.oilGrade) specRows.push({ label: 'Oil grade', value: specs.oilGrade });
  }

  const infoRows: { label: string; value: string }[] = [
    { label: 'Make', value: vehicle.make },
    { label: 'Model', value: vehicle.model },
    { label: 'Year', value: vehicle.year.toString() },
    { label: 'Fuel type', value: vehicle.fuelType.charAt(0).toUpperCase() + vehicle.fuelType.slice(1) },
    { label: 'Vehicle type', value: vehicle.vehicleType.charAt(0).toUpperCase() + vehicle.vehicleType.slice(1) },
    { label: 'Registration', value: vehicle.registrationNumber },
    { label: 'Usage', value: vehicle.usageRole.replace(/_/g, ' ') },
  ];

  if (vehicle.purchaseDate) infoRows.push({ label: 'Purchase date', value: formatDateShort(vehicle.purchaseDate) });
  if (vehicle.purchasePriceInr != null) infoRows.push({ label: 'Purchase price', value: formatINR(vehicle.purchasePriceInr) });

  const renderRows = (rows: { label: string; value: string }[]) => (
    <View style={[styles.specCard, { backgroundColor: colors.surface1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.base, marginBottom: spacing.md }]}>
      {rows.map((row, idx) => (
        <React.Fragment key={row.label}>
          {idx > 0 && <View style={[styles.specDivider, { backgroundColor: colors.border }]} />}
          <View style={styles.specRow}>
            <Text style={[typography.caption, { color: colors.textMuted, flex: 1 }]}>{row.label}</Text>
            <Text style={[typography.caption, { color: colors.textPrimary, fontWeight: '600', textTransform: 'capitalize' }]}>
              {row.value}
            </Text>
          </View>
        </React.Fragment>
      ))}
    </View>
  );

  return (
    <View>
      <Text style={[typography.caption, { color: colors.textMuted, marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 0.8 }]}>
        Vehicle info
      </Text>
      {renderRows(infoRows)}
      {specRows.length > 0 && (
        <>
          <Text style={[typography.caption, { color: colors.textMuted, marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 0.8 }]}>
            Specifications
          </Text>
          {renderRows(specRows)}
        </>
      )}
      {specRows.length === 0 && (
        <View style={[styles.noSpecsCard, { backgroundColor: colors.surface1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.base }]}>
          <Text style={[typography.caption, { color: colors.textMuted, textAlign: 'center' }]}>
            No spec data available. Add specs by editing this vehicle.
          </Text>
        </View>
      )}
    </View>
  );
}

function DocumentsTab({ vehicle }: { vehicle: Vehicle }) {
  const { colors, spacing, radius, typography } = useTheme();
  const docs = vehicle.documents;

  const docItems: { label: string; expiry?: string; icon: keyof typeof Ionicons.glyphMap; provider?: string }[] = [
    { label: 'Insurance', expiry: docs?.insuranceExpiry, icon: 'shield-checkmark-outline', provider: docs?.insuranceProvider },
    { label: 'PUC', expiry: docs?.pucExpiry, icon: 'leaf-outline' },
    { label: 'RC', expiry: docs?.rcExpiry, icon: 'document-text-outline' },
    { label: 'Warranty', expiry: docs?.warrantyExpiry, icon: 'star-outline' },
  ];

  return (
    <View>
      {docItems.map((doc) => {
        const days = doc.expiry ? daysUntil(doc.expiry) : null;
        const isExpired = days != null && days < 0;
        const isWarning = days != null && days >= 0 && days <= 30;
        const isValid = days != null && days > 30;
        const statusColor = isExpired ? colors.danger : isWarning ? colors.warning : isValid ? colors.success : colors.textMuted;
        const statusBg = isExpired ? colors.dangerDim : isWarning ? colors.warningDim : isValid ? colors.successDim : colors.surface2;

        return (
          <View
            key={doc.label}
            style={[
              styles.docCard,
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
              <Ionicons name={doc.icon} size={20} color={statusColor} />
            </View>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Text style={[typography.caption, { color: colors.textPrimary, fontWeight: '700' }]}>{doc.label}</Text>
              {doc.provider != null && (
                <Text style={[typography.micro, { color: colors.textSecondary }]}>{doc.provider}</Text>
              )}
              {doc.expiry != null ? (
                <Text style={[typography.micro, { color: colors.textSecondary }]}>
                  Expires {formatDateShort(doc.expiry)}
                </Text>
              ) : (
                <Text style={[typography.micro, { color: colors.textMuted }]}>Not added</Text>
              )}
            </View>
            {days != null && (
              <View style={[styles.daysChip, { backgroundColor: statusBg, borderRadius: radius.pill }]}>
                <Text style={[typography.micro, { color: statusColor, fontWeight: '700' }]}>
                  {isExpired ? `${Math.abs(days)}d ago` : `${days}d`}
                </Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

export default function VehicleDetailScreen() {
  const { colors, spacing, radius, typography } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { vehicles, logs, removeLog, alerts } = useGarageStore();
  const [activeTab, setActiveTab] = useState<ScreenTab>('timeline');
  const [refreshing, setRefreshing] = useState(false);

  const vehicle = vehicles.find((v) => v.id === id) ?? null;
  const vehicleLogs: LogEntry[] = id ? (logs[id] ?? []) : [];
  const sortedLogs = [...vehicleLogs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  const vehicleAlerts = alerts.filter((a) => a.vehicleId === id && !a.isRead);
  const nextDue = vehicleAlerts.find((a) => a.severity === 'urgent' || a.severity === 'warning');
  const healthScore = vehicle ? calcHealthScore(vehicle, vehicleLogs) : 0;

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setRefreshing(false);
  }, []);

  const handleDeleteLog = useCallback(
    (logId: string) => {
      if (id) removeLog(id, logId);
    },
    [id, removeLog],
  );

  if (vehicle == null) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.notFound}>
          <Ionicons name="car-outline" size={48} color={colors.textMuted} />
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.md }]}>
            Vehicle not found.
          </Text>
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: spacing.md }}>
            <Text style={[typography.caption, { color: colors.accent }]}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const displayName = vehicle.nickname ?? `${vehicle.make} ${vehicle.model}`;
  const scoreColor = healthScore >= 75 ? colors.success : healthScore >= 50 ? colors.warning : colors.danger;

  const TABS: { key: ScreenTab; label: string }[] = [
    { key: 'timeline', label: 'Timeline' },
    { key: 'specs', label: 'Specs' },
    { key: 'documents', label: 'Documents' },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { paddingHorizontal: spacing.base, paddingTop: spacing.md, paddingBottom: spacing.sm }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.surface1, borderColor: colors.border, borderRadius: radius.sm }]}
        >
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[typography.title, { color: colors.textPrimary, flex: 1, marginLeft: spacing.md }]} numberOfLines={1}>
          {displayName}
        </Text>
        <TouchableOpacity style={[styles.editBtn, { backgroundColor: colors.surface1, borderColor: colors.border, borderRadius: radius.sm }]}>
          <Ionicons name="ellipsis-horizontal" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.summaryBar,
          {
            backgroundColor: colors.surface1,
            borderBottomColor: colors.border,
            paddingHorizontal: spacing.base,
            paddingVertical: spacing.md,
          },
        ]}
      >
        <View style={styles.summaryLeft}>
          <Text style={[{ fontSize: 28, fontWeight: '800', color: colors.accent, letterSpacing: -0.5 }]}>
            {formatOdometer(vehicle.currentOdometer)}
          </Text>
          <Text style={[typography.micro, { color: colors.textMuted }]}>Current odometer</Text>
        </View>
        <View style={styles.summaryMid}>
          <View style={[styles.healthBadge, { backgroundColor: `${scoreColor}20`, borderColor: scoreColor, borderRadius: radius.pill }]}>
            <Text style={[typography.caption, { color: scoreColor, fontWeight: '700' }]}>
              {healthScore}%
            </Text>
          </View>
          <Text style={[typography.micro, { color: colors.textMuted, marginTop: 2 }]}>Health</Text>
        </View>
        {nextDue != null && (
          <View style={styles.summaryRight}>
            <Ionicons name="time-outline" size={13} color={colors.warning} />
            <Text style={[typography.micro, { color: colors.warning, marginLeft: 3, flex: 1 }]} numberOfLines={2}>
              {nextDue.title}
            </Text>
          </View>
        )}
      </View>

      <View style={[styles.tabBar, { borderBottomColor: colors.border, paddingHorizontal: spacing.base }]}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[
                styles.tabItem,
                isActive && { borderBottomColor: colors.accent, borderBottomWidth: 2 },
              ]}
            >
              <Text
                style={[
                  typography.caption,
                  {
                    color: isActive ? colors.accent : colors.textMuted,
                    fontWeight: isActive ? '700' : '400',
                    paddingBottom: spacing.sm,
                  },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.base, paddingTop: spacing.md, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
            title="Refreshing..."
            titleColor={colors.textSecondary}
          />
        }
      >
        {activeTab === 'timeline' && (
          <>
            {vehicle.baseline != null && <BaselinePin baseline={vehicle.baseline} />}
            {sortedLogs.length === 0 ? (
              <View style={styles.emptyTimeline}>
                <Ionicons name="time-outline" size={36} color={colors.textMuted} />
                <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.md, textAlign: 'center' }]}>
                  No logs yet. Tap the + button to add your first entry.
                </Text>
              </View>
            ) : (
              <FlatList
                data={sortedLogs}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TimelineItem entry={item} colors={colors} onDelete={handleDeleteLog} />
                )}
                scrollEnabled={false}
              />
            )}
          </>
        )}

        {activeTab === 'specs' && <SpecsTab vehicle={vehicle} />}
        {activeTab === 'documents' && <DocumentsTab vehicle={vehicle} />}
      </ScrollView>

      <TouchableOpacity
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
        <Ionicons name="add" size={26} color="#0D0D0D" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  editBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  summaryLeft: {
    flex: 2,
  },
  summaryMid: {
    alignItems: 'center',
    flex: 1,
  },
  healthBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  summaryRight: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingLeft: 8,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabItem: {
    marginRight: 24,
    paddingTop: 10,
  },
  timelineItem: {
    borderWidth: 1,
  },
  timelineItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  deleteBtn: {
    padding: 4,
  },
  baselinePin: {
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  baselinePinHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  baselineIconBg: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  baselineBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  specCard: {
    borderWidth: 1,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  specDivider: {
    height: 1,
  },
  noSpecsCard: {
    borderWidth: 1,
    alignItems: 'center',
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  docIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daysChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  emptyTimeline: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
