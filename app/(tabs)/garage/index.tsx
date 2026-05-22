import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGarageStore } from '@/store/garage';
import { useTheme } from '@/hooks/useTheme';
import { formatOdometer } from '@/utils/formatOdometer';
import { formatDate } from '@/utils/formatDate';
import type { Vehicle, Alert } from '@/types';

function SkeletonCard() {
  const { colors, radius, spacing } = useTheme();
  return (
    <View
      style={[
        styles.skeletonCard,
        {
          backgroundColor: colors.surface1,
          borderRadius: radius.lg,
          borderColor: colors.border,
          marginBottom: spacing.md,
        },
      ]}
    >
      <View style={[styles.skeletonLine, { backgroundColor: colors.surface2, width: '60%' }]} />
      <View
        style={[styles.skeletonLine, { backgroundColor: colors.surface2, width: '40%', marginTop: 8 }]}
      />
      <View
        style={[styles.skeletonLine, { backgroundColor: colors.surface2, width: '30%', marginTop: 8 }]}
      />
    </View>
  );
}

function AlertPill({ alert, onPress }: { alert: Alert; onPress: () => void }) {
  const { colors, spacing, radius, typography } = useTheme();
  const bgColor =
    alert.severity === 'urgent'
      ? colors.dangerDim
      : alert.severity === 'warning'
        ? colors.warningDim
        : colors.blueDim;
  const textColor =
    alert.severity === 'urgent'
      ? colors.danger
      : alert.severity === 'warning'
        ? colors.warning
        : colors.blue;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.alertPill,
        {
          backgroundColor: bgColor,
          borderColor: textColor,
          borderRadius: radius.pill,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.xs,
          marginRight: spacing.sm,
        },
      ]}
    >
      <Ionicons
        name={alert.severity === 'urgent' ? 'warning-outline' : 'information-circle-outline'}
        size={13}
        color={textColor}
        style={{ marginRight: 4 }}
      />
      <Text style={[typography.micro, { color: textColor }]} numberOfLines={1}>
        {alert.title}
      </Text>
    </TouchableOpacity>
  );
}

function VehicleCard({ vehicle, alerts }: { vehicle: Vehicle; alerts: Alert[] }) {
  const router = useRouter();
  const { colors, spacing, radius, typography } = useTheme();
  const vehicleAlerts = alerts.filter((a) => a.vehicleId === vehicle.id && !a.isRead);
  const nextDueAlert = vehicleAlerts.find(
    (a) => a.severity === 'urgent' || a.severity === 'warning',
  );

  const displayName = vehicle.nickname
    ? vehicle.nickname
    : `${vehicle.make} ${vehicle.model}`;

  return (
    <TouchableOpacity
      onPress={() => router.push(`/vehicle/${vehicle.id}`)}
      activeOpacity={0.85}
      style={[
        styles.vehicleCard,
        {
          backgroundColor: colors.surface1,
          borderRadius: radius.lg,
          borderColor: colors.border,
          padding: spacing.base,
          marginBottom: spacing.md,
        },
      ]}
    >
      <View style={styles.vehicleCardHeader}>
        <View style={styles.vehicleCardTitleRow}>
          <View
            style={[
              styles.vehicleIconBadge,
              { backgroundColor: colors.accentDim, borderRadius: radius.sm },
            ]}
          >
            <Ionicons name="car-outline" size={20} color={colors.accent} />
          </View>
          <View style={styles.vehicleCardTitleText}>
            <Text style={[typography.title, { color: colors.textPrimary }]} numberOfLines={1}>
              {displayName}
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              {vehicle.year} · {vehicle.registrationNumber}
            </Text>
          </View>
        </View>
        {vehicleAlerts.length > 0 && (
          <View
            style={[
              styles.alertBadge,
              { backgroundColor: colors.dangerDim, borderRadius: radius.full },
            ]}
          >
            <Text style={[typography.micro, { color: colors.danger, fontWeight: '700' }]}>
              {vehicleAlerts.length}
            </Text>
          </View>
        )}
      </View>

      <View style={[styles.vehicleCardDivider, { backgroundColor: colors.border, marginVertical: spacing.sm }]} />

      <View style={styles.vehicleCardStats}>
        <View style={styles.statItem}>
          <Ionicons name="speedometer-outline" size={14} color={colors.textMuted} />
          <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: 4 }]}>
            {formatOdometer(vehicle.currentOdometer)}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="flash-outline" size={14} color={colors.textMuted} />
          <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: 4 }]}>
            {vehicle.fuelType.charAt(0).toUpperCase() + vehicle.fuelType.slice(1)}
          </Text>
        </View>
        {vehicle.documents?.insuranceExpiry && (
          <View style={styles.statItem}>
            <Ionicons name="shield-checkmark-outline" size={14} color={colors.textMuted} />
            <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: 4 }]}>
              Ins. {formatDate(vehicle.documents.insuranceExpiry)}
            </Text>
          </View>
        )}
      </View>

      {nextDueAlert && (
        <View
          style={[
            styles.nextDueRow,
            {
              backgroundColor: colors.warningDim,
              borderRadius: radius.sm,
              padding: spacing.sm,
              marginTop: spacing.sm,
            },
          ]}
        >
          <Ionicons name="time-outline" size={13} color={colors.warning} />
          <Text style={[typography.micro, { color: colors.warning, marginLeft: 4, flex: 1 }]} numberOfLines={1}>
            {nextDueAlert.title}
          </Text>
        </View>
      )}

      <View style={styles.vehicleCardFooter}>
        <Text style={[typography.micro, { color: colors.textMuted }]}>
          Updated {formatDate(vehicle.updatedAt)}
        </Text>
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
}

function EmptyGarage({ onAddVehicle }: { onAddVehicle: () => void }) {
  const { colors, spacing, radius, typography } = useTheme();
  return (
    <View style={[styles.emptyState, { paddingHorizontal: spacing.base }]}>
      <View
        style={[
          styles.emptyIconContainer,
          {
            backgroundColor: colors.surface1,
            borderRadius: radius.xl,
            borderColor: colors.border,
          },
        ]}
      >
        <Ionicons name="car-outline" size={48} color={colors.textMuted} />
      </View>
      <Text style={[typography.headline, { color: colors.textPrimary, marginTop: spacing.lg, textAlign: 'center' }]}>
        Your garage is empty
      </Text>
      <Text
        style={[
          typography.body,
          { color: colors.textSecondary, marginTop: spacing.sm, textAlign: 'center' },
        ]}
      >
        Add your first vehicle to get started.
      </Text>
      <TouchableOpacity
        onPress={onAddVehicle}
        style={[
          styles.emptyCtaButton,
          { backgroundColor: colors.accent, borderRadius: radius.md, marginTop: spacing.xl },
        ]}
      >
        <Ionicons name="add" size={20} color="#0D0D0D" />
        <Text style={[typography.title, { color: '#0D0D0D', marginLeft: 8 }]}>Add vehicle</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function GarageScreen() {
  const { colors, spacing, typography, radius } = useTheme();
  const router = useRouter();
  const { vehicles, alerts, isLoading } = useGarageStore();
  const [refreshing, setRefreshing] = useState(false);

  const unreadAlerts = alerts.filter((a) => !a.isRead);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const handleAddVehicle = () => {
    router.push('/onboarding/lookup');
  };

  const handleAlertPress = (_alert: Alert) => {
    // Navigate to relevant vehicle or alert detail
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingHorizontal: spacing.base, paddingTop: spacing.md, paddingBottom: spacing.sm }]}>
        <View>
          <Text style={[typography.display, { color: colors.textPrimary, fontSize: 24, fontWeight: '700' }]}>
            My Garage
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            {vehicles.length === 0
              ? 'No vehicles yet'
              : `${vehicles.length} vehicle${vehicles.length > 1 ? 's' : ''}`}
          </Text>
        </View>
        <View style={styles.headerRight}>
          {unreadAlerts.length > 0 && (
            <View
              style={[
                styles.headerAlertBadge,
                {
                  backgroundColor: colors.dangerDim,
                  borderRadius: radius.full,
                  borderColor: colors.danger,
                  marginRight: spacing.sm,
                },
              ]}
            >
              <Text style={[typography.micro, { color: colors.danger, fontWeight: '700' }]}>
                {unreadAlerts.length}
              </Text>
            </View>
          )}
          <TouchableOpacity
            onPress={handleAddVehicle}
            style={[
              styles.addButton,
              { backgroundColor: colors.accent, borderRadius: radius.md },
            ]}
          >
            <Ionicons name="add" size={20} color="#0D0D0D" />
            <Text style={[{ color: '#0D0D0D', fontSize: 13, fontWeight: '600', marginLeft: 4 }]}>
              Add
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {unreadAlerts.length > 0 && (
        <View style={{ paddingTop: spacing.sm, paddingBottom: spacing.sm }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: spacing.base }}
          >
            {unreadAlerts.map((alert) => (
              <AlertPill key={alert.id} alert={alert} onPress={() => handleAlertPress(alert)} />
            ))}
          </ScrollView>
        </View>
      )}

      {isLoading && !refreshing ? (
        <View style={{ paddingHorizontal: spacing.base, paddingTop: spacing.sm }}>
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : vehicles.length === 0 ? (
        <EmptyGarage onAddVehicle={handleAddVehicle} />
      ) : (
        <FlatList
          data={vehicles}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <VehicleCard vehicle={item} alerts={alerts} />}
          contentContainerStyle={{ paddingHorizontal: spacing.base, paddingTop: spacing.sm, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.accent}
              title="Refreshing..."
              titleColor={colors.textSecondary}
            />
          }
        />
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAlertBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  alertPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  vehicleCard: {
    borderWidth: 1,
  },
  vehicleCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  vehicleCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  vehicleIconBadge: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  vehicleCardTitleText: {
    flex: 1,
  },
  alertBadge: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  vehicleCardDivider: {
    height: 1,
  },
  vehicleCardStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextDueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  emptyCtaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  skeletonCard: {
    height: 120,
    padding: 16,
    borderWidth: 1,
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
  },
});
