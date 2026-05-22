import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useGarageStore } from '@/store/garage';
import { useUserStore } from '@/store/user';
import type { Vehicle, VehicleBaseline } from '@/types';
import type { FuelType, UsageRole } from '@/config/vehicles.config';

const SERVICE_ITEMS = [
  { id: 'oil_change', label: 'Oil change' },
  { id: 'filters', label: 'Filters' },
  { id: 'brakes', label: 'Brakes' },
  { id: 'tyres', label: 'Tyres' },
  { id: 'full_service', label: 'Full service' },
  { id: 'not_sure', label: 'Not sure' },
];

const USAGE_OPTIONS: { id: UsageRole; label: string; desc: string }[] = [
  { id: 'daily_commute', label: 'Daily commute', desc: 'Work, school, everyday use' },
  { id: 'weekend', label: 'Weekend', desc: 'Leisure and weekend drives' },
  { id: 'occasional', label: 'Occasional', desc: 'Infrequent, as needed' },
  { id: 'track', label: 'Track', desc: 'Circuit and performance driving' },
];

const STEPS = ['Vehicle', 'Baseline', 'Done'];

function StepIndicator({ currentStep }: { currentStep: number }) {
  const { colors, spacing, radius, typography } = useTheme();
  return (
    <View style={styles.stepIndicator}>
      {STEPS.map((step, idx) => {
        const isActive = idx === currentStep;
        const isDone = idx < currentStep;
        return (
          <React.Fragment key={step}>
            {idx > 0 && (
              <View
                style={[
                  styles.stepLine,
                  { backgroundColor: isDone ? colors.accent : colors.surface2 },
                ]}
              />
            )}
            <View
              style={[
                styles.stepDot,
                {
                  backgroundColor: isDone ? colors.accent : isActive ? colors.accentDim : colors.surface2,
                  borderColor: isActive ? colors.accent : isDone ? colors.accent : colors.border,
                  borderRadius: radius.full,
                },
              ]}
            >
              {isDone ? (
                <Ionicons name="checkmark" size={12} color="#0D0D0D" />
              ) : (
                <Text style={[typography.micro, { color: isActive ? colors.accent : colors.textMuted, fontWeight: '700' }]}>
                  {idx + 1}
                </Text>
              )}
            </View>
          </React.Fragment>
        );
      })}
    </View>
  );
}

function SuccessState({ vehicleName, onEnter }: { vehicleName: string; onEnter: () => void }) {
  const { colors, spacing, radius, typography } = useTheme();
  return (
    <View style={styles.successContainer}>
      <View style={[styles.successIcon, { backgroundColor: colors.successDim, borderRadius: radius.full }]}>
        <Ionicons name="checkmark-circle" size={56} color={colors.success} />
      </View>
      <Text style={[typography.headline, { color: colors.textPrimary, marginTop: spacing.xl, textAlign: 'center' }]}>
        Here's your{' '}
        <Text style={{ color: colors.accent }}>{vehicleName}</Text>
        {'\n'}starting point in MotoLog.
      </Text>
      <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.md, textAlign: 'center', paddingHorizontal: spacing.xl }]}>
        Everything from today builds on this. Your history is growing from here.
      </Text>
      <TouchableOpacity
        onPress={onEnter}
        style={[
          styles.enterBtn,
          {
            backgroundColor: colors.accent,
            borderRadius: radius.md,
            marginTop: spacing['2xl'],
          },
        ]}
      >
        <Text style={[typography.title, { color: '#0D0D0D' }]}>Enter MotoLog</Text>
        <Ionicons name="arrow-forward" size={18} color="#0D0D0D" style={{ marginLeft: 8 }} />
      </TouchableOpacity>
    </View>
  );
}

export default function BaselineScreen() {
  const { colors, spacing, radius, typography } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{
    plate: string;
    make: string;
    model: string;
    year: string;
    fuelType: string;
    insuranceExpiry: string;
    pucExpiry: string;
  }>();

  const { addVehicle } = useGarageStore();
  const { setOnboarded } = useUserStore();

  const [odometer, setOdometer] = useState('');
  const [lastServiceMonth, setLastServiceMonth] = useState('');
  const [lastServiceYear, setLastServiceYear] = useState('');
  const [selectedServiceItems, setSelectedServiceItems] = useState<string[]>([]);
  const [primaryUsage, setPrimaryUsage] = useState<UsageRole | null>(null);
  const [insuranceConfirmed, setInsuranceConfirmed] = useState(
    params.insuranceExpiry != null && params.insuranceExpiry.length > 0,
  );
  const [pucConfirmed, setPucConfirmed] = useState(
    params.pucExpiry != null && params.pucExpiry.length > 0,
  );
  const [submitted, setSubmitted] = useState(false);
  const [odometerError, setOdometerError] = useState<string | null>(null);

  const vehicleName = params.make && params.model ? `${params.make} ${params.model}` : 'your vehicle';

  const toggleServiceItem = (id: string) => {
    setSelectedServiceItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const buildLastServiceDate = (): string | undefined => {
    const m = parseInt(lastServiceMonth, 10);
    const y = parseInt(lastServiceYear, 10);
    if (isNaN(m) || isNaN(y) || m < 1 || m > 12 || y < 1980) return undefined;
    return `${y}-${m.toString().padStart(2, '0')}-01`;
  };

  const handleSubmit = () => {
    const odoNum = parseInt(odometer, 10);
    if (isNaN(odoNum) || odoNum < 0) {
      setOdometerError('Enter a valid odometer reading');
      return;
    }
    setOdometerError(null);

    const vehicleId = `vehicle_${Date.now()}`;
    const now = new Date().toISOString();

    const baseline: VehicleBaseline = {
      vehicleId,
      odometerKm: odoNum,
      lastServiceDate: buildLastServiceDate(),
      lastServiceItems: selectedServiceItems,
      hasMajorMods: false,
      primaryUsage: primaryUsage ?? 'daily_commute',
      insuranceConfirmed,
      pucConfirmed,
      createdAt: now,
      isEstimated: false,
    };

    const normalizedFuel = (params.fuelType ?? 'petrol').toLowerCase() as FuelType;

    const vehicle: Vehicle = {
      id: vehicleId,
      ownerId: 'local',
      registrationNumber: (params.plate ?? '').toUpperCase(),
      make: params.make ?? '',
      model: params.model ?? '',
      year: parseInt(params.year ?? '0', 10) || new Date().getFullYear(),
      fuelType: ['petrol', 'diesel', 'cng', 'electric', 'hybrid'].includes(normalizedFuel)
        ? normalizedFuel
        : 'petrol',
      vehicleType: 'car',
      currentOdometer: odoNum,
      usageRole: primaryUsage ?? 'daily_commute',
      isActive: true,
      createdAt: now,
      updatedAt: now,
      baseline,
      documents: {
        vehicleId,
        insuranceExpiry: params.insuranceExpiry || undefined,
        pucExpiry: params.pucExpiry || undefined,
      },
    };

    addVehicle(vehicle);
    setOnboarded(true);
    setSubmitted(true);
  };

  const handleEnterApp = () => {
    router.replace('/(tabs)/garage');
  };

  const inputStyle = [
    styles.textInput,
    {
      backgroundColor: colors.surface2,
      borderColor: colors.border,
      borderRadius: radius.sm,
      color: colors.textPrimary,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
  ];

  if (submitted) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <SuccessState vehicleName={vehicleName} onEnter={handleEnterApp} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { paddingHorizontal: spacing.base, paddingTop: spacing.md }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.surface1, borderColor: colors.border, borderRadius: radius.sm }]}
        >
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: spacing.base, paddingBottom: 80 }}
      >
        <StepIndicator currentStep={1} />

        <Text style={[typography.display, { color: colors.textPrimary, fontSize: 26, fontWeight: '700', marginTop: spacing.lg, marginBottom: spacing.sm }]}>
          Set your starting point
        </Text>
        <Text style={[typography.body, { color: colors.textSecondary, marginBottom: spacing.xl }]}>
          Your history before MotoLog is not lost — it's just unlogged. What matters is what you build from here.
        </Text>

        <View
          style={[
            styles.vehicleChip,
            {
              backgroundColor: colors.surface1,
              borderColor: colors.border,
              borderRadius: radius.md,
              padding: spacing.md,
              marginBottom: spacing.xl,
            },
          ]}
        >
          <View style={[styles.vehicleChipIcon, { backgroundColor: colors.accentDim, borderRadius: radius.sm }]}>
            <Ionicons name="car-outline" size={18} color={colors.accent} />
          </View>
          <View style={{ flex: 1, marginLeft: spacing.sm }}>
            <Text style={[typography.caption, { color: colors.textPrimary, fontWeight: '700' }]}>
              {vehicleName}
            </Text>
            <Text style={[typography.micro, { color: colors.textMuted }]}>
              {params.plate} · {params.year}
            </Text>
          </View>
        </View>

        <Text style={[typography.caption, { color: colors.textMuted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.6 }]}>
          Current odometer (km) *
        </Text>
        <TextInput
          style={[inputStyle, { fontSize: 22, fontWeight: '700', letterSpacing: 1 }, odometerError != null && { borderColor: colors.danger }]}
          placeholder="e.g. 23450"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          value={odometer}
          onChangeText={(t) => { setOdometer(t); setOdometerError(null); }}
        />
        {odometerError != null && (
          <Text style={[typography.micro, { color: colors.danger, marginTop: 4 }]}>{odometerError}</Text>
        )}

        <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.lg, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.6 }]}>
          Last service
        </Text>
        <View style={styles.dateRow}>
          <View style={{ flex: 1, marginRight: spacing.sm }}>
            <TextInput
              style={inputStyle}
              placeholder="MM"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              value={lastServiceMonth}
              onChangeText={setLastServiceMonth}
              maxLength={2}
            />
          </View>
          <View style={{ flex: 2 }}>
            <TextInput
              style={inputStyle}
              placeholder="YYYY"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              value={lastServiceYear}
              onChangeText={setLastServiceYear}
              maxLength={4}
            />
          </View>
        </View>
        <Text style={[typography.micro, { color: colors.textMuted, marginTop: 4 }]}>
          Approximate is fine. Leave blank if unsure.
        </Text>

        <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.lg, marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 0.6 }]}>
          What was done?
        </Text>
        <View style={styles.chipGrid}>
          {SERVICE_ITEMS.map((item) => {
            const isSelected = selectedServiceItems.includes(item.id);
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => toggleServiceItem(item.id)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? colors.accentDim : colors.surface1,
                    borderColor: isSelected ? colors.accent : colors.border,
                    borderRadius: radius.pill,
                    paddingHorizontal: spacing.md,
                    paddingVertical: 7,
                  },
                ]}
              >
                <Text style={[typography.caption, { color: isSelected ? colors.accent : colors.textSecondary, fontWeight: isSelected ? '600' : '400' }]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.lg, marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 0.6 }]}>
          Primary usage
        </Text>
        {USAGE_OPTIONS.map((opt) => {
          const isSelected = primaryUsage === opt.id;
          return (
            <TouchableOpacity
              key={opt.id}
              onPress={() => setPrimaryUsage(opt.id)}
              style={[
                styles.usageRow,
                {
                  backgroundColor: isSelected ? colors.accentDim : colors.surface1,
                  borderColor: isSelected ? colors.accent : colors.border,
                  borderRadius: radius.md,
                  padding: spacing.md,
                  marginBottom: spacing.sm,
                },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[typography.caption, { color: isSelected ? colors.accent : colors.textPrimary, fontWeight: '600' }]}>
                  {opt.label}
                </Text>
                <Text style={[typography.micro, { color: colors.textMuted }]}>{opt.desc}</Text>
              </View>
              {isSelected && (
                <Ionicons name="checkmark-circle" size={18} color={colors.accent} />
              )}
            </TouchableOpacity>
          );
        })}

        <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.lg, marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 0.6 }]}>
          Documents confirmed
        </Text>
        <View
          style={[
            styles.docsCard,
            {
              backgroundColor: colors.surface1,
              borderColor: colors.border,
              borderRadius: radius.md,
              padding: spacing.base,
            },
          ]}
        >
          <View style={[styles.docToggleRow, { marginBottom: spacing.md }]}>
            <View>
              <Text style={[typography.caption, { color: colors.textPrimary }]}>Insurance valid</Text>
              {params.insuranceExpiry ? (
                <Text style={[typography.micro, { color: colors.textMuted }]}>Expires {params.insuranceExpiry}</Text>
              ) : (
                <Text style={[typography.micro, { color: colors.textMuted }]}>Enter expiry in Documents later</Text>
              )}
            </View>
            <Switch
              value={insuranceConfirmed}
              onValueChange={setInsuranceConfirmed}
              trackColor={{ false: colors.surface2, true: colors.accentDim }}
              thumbColor={insuranceConfirmed ? colors.accent : colors.textMuted}
            />
          </View>
          <View style={[styles.docDivider, { backgroundColor: colors.border, marginBottom: spacing.md }]} />
          <View style={styles.docToggleRow}>
            <View>
              <Text style={[typography.caption, { color: colors.textPrimary }]}>PUC valid</Text>
              {params.pucExpiry ? (
                <Text style={[typography.micro, { color: colors.textMuted }]}>Expires {params.pucExpiry}</Text>
              ) : (
                <Text style={[typography.micro, { color: colors.textMuted }]}>Enter expiry in Documents later</Text>
              )}
            </View>
            <Switch
              value={pucConfirmed}
              onValueChange={setPucConfirmed}
              trackColor={{ false: colors.surface2, true: colors.accentDim }}
              thumbColor={pucConfirmed ? colors.accent : colors.textMuted}
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={odometer.length === 0}
          style={[
            styles.submitBtn,
            {
              backgroundColor: odometer.length > 0 ? colors.accent : colors.surface2,
              borderRadius: radius.md,
              marginTop: spacing.xl,
            },
          ]}
        >
          <Text style={[typography.title, { color: odometer.length > 0 ? '#0D0D0D' : colors.textMuted }]}>
            Set baseline & enter MotoLog
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleEnterApp}
          style={[styles.skipBtn, { marginTop: spacing.md }]}
        >
          <Text style={[typography.caption, { color: colors.textMuted }]}>Skip for now</Text>
        </TouchableOpacity>
      </ScrollView>
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
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 0,
  },
  stepDot: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  stepLine: {
    flex: 1,
    height: 2,
  },
  vehicleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  vehicleChipIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    borderWidth: 1,
    fontSize: 15,
  },
  dateRow: {
    flexDirection: 'row',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
  },
  usageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  docsCard: {
    borderWidth: 1,
  },
  docToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  docDivider: {
    height: 1,
  },
  submitBtn: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  successIcon: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  enterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 15,
  },
});
