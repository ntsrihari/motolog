import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDiaryStore } from '@/store/diary';
import { useGarageStore } from '@/store/garage';
import { useTheme } from '@/hooks/useTheme';
import { useVehicleInference } from '@/hooks/useVehicleInference';
import { greetingByHour, formatDateShort, todayISO } from '@/utils/formatDate';
import { formatINR } from '@/utils/formatINR';
import { formatOdometer } from '@/utils/formatOdometer';
import type { DiaryEntry } from '@/types';

const CONDITION_TAGS = [
  { id: 'smooth_roads', label: 'Smooth roads' },
  { id: 'rough_roads', label: 'Rough roads' },
  { id: 'heavy_traffic', label: 'Heavy traffic' },
  { id: 'highway_run', label: 'Highway run' },
  { id: 'track_session', label: 'Track session' },
];

function InferenceCard({
  vehicleName,
  reason,
  onConfirm,
  onSwitch,
  onDismiss,
}: {
  vehicleName: string;
  reason: string;
  onConfirm: () => void;
  onSwitch: () => void;
  onDismiss: () => void;
}) {
  const { colors, spacing, radius, typography } = useTheme();
  return (
    <View
      style={[
        styles.inferenceCard,
        {
          backgroundColor: colors.surface1,
          borderColor: colors.border,
          borderRadius: radius.lg,
          padding: spacing.base,
          marginBottom: spacing.md,
        },
      ]}
    >
      <View style={styles.inferenceCardHeader}>
        <View style={[styles.inferenceIconBg, { backgroundColor: colors.accentDim, borderRadius: radius.sm }]}>
          <Ionicons name="bulb-outline" size={18} color={colors.accent} />
        </View>
        <TouchableOpacity onPress={onDismiss} style={{ marginLeft: 'auto' }}>
          <Ionicons name="close" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
      <Text style={[typography.body, { color: colors.textPrimary, marginTop: spacing.sm, fontWeight: '500' }]}>
        {greetingByHour()}. Looks like you used your{' '}
        <Text style={{ color: colors.accent }}>{vehicleName}</Text> today. Want to log anything?
      </Text>
      <Text style={[typography.caption, { color: colors.textMuted, marginTop: 4 }]}>{reason}</Text>
      <View style={[styles.inferenceActions, { marginTop: spacing.md }]}>
        <TouchableOpacity
          onPress={onConfirm}
          style={[styles.inferenceBtn, { backgroundColor: colors.accent, borderRadius: radius.sm }]}
        >
          <Text style={[typography.caption, { color: '#0D0D0D', fontWeight: '700' }]}>Yes, log it</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onSwitch}
          style={[styles.inferenceBtn, { backgroundColor: colors.surface2, borderRadius: radius.sm, marginLeft: spacing.sm }]}
        >
          <Text style={[typography.caption, { color: colors.textSecondary }]}>Switch vehicle</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function TodayEntryForm({
  vehicleId,
  onSubmit,
}: {
  vehicleId: string;
  onSubmit: (entry: Partial<DiaryEntry>) => void;
}) {
  const { colors, spacing, radius, typography } = useTheme();
  const [odometer, setOdometer] = useState('');
  const [fuelLitres, setFuelLitres] = useState('');
  const [fuelCost, setFuelCost] = useState('');
  const [driveNote, setDriveNote] = useState('');
  const [hasWarning, setHasWarning] = useState(false);
  const [warningDesc, setWarningDesc] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (id: string) => {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  };

  const handleSubmit = () => {
    const odomNum = parseInt(odometer, 10);
    const fuelNum = parseFloat(fuelLitres);
    const fuelCostNum = parseFloat(fuelCost);
    onSubmit({
      vehicleId,
      date: todayISO(),
      odometerCurrent: isNaN(odomNum) ? undefined : odomNum,
      fuelLitres: isNaN(fuelNum) ? undefined : fuelNum,
      fuelCostPerLitre: isNaN(fuelCostNum) ? undefined : fuelCostNum,
      fuelTotalInr: (!isNaN(fuelNum) && !isNaN(fuelCostNum)) ? fuelNum * fuelCostNum : undefined,
      driveFeelNote: driveNote.trim() || undefined,
      hasWarningLight: hasWarning,
      warningLightDesc: hasWarning ? warningDesc.trim() : undefined,
      conditionTags: selectedTags.length > 0 ? selectedTags : undefined,
    });
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

  return (
    <View
      style={[
        styles.entryForm,
        {
          backgroundColor: colors.surface1,
          borderColor: colors.border,
          borderRadius: radius.lg,
          padding: spacing.base,
          marginBottom: spacing.md,
        },
      ]}
    >
      <Text style={[typography.title, { color: colors.textPrimary, marginBottom: spacing.md }]}>
        Today's entry
      </Text>

      <Text style={[typography.caption, { color: colors.textMuted, marginBottom: 4 }]}>
        Odometer (km)
      </Text>
      <TextInput
        style={inputStyle}
        placeholder="e.g. 23450"
        placeholderTextColor={colors.textMuted}
        keyboardType="number-pad"
        value={odometer}
        onChangeText={setOdometer}
      />

      <View style={[styles.fuelRow, { marginTop: spacing.md }]}>
        <View style={{ flex: 1, marginRight: spacing.sm }}>
          <Text style={[typography.caption, { color: colors.textMuted, marginBottom: 4 }]}>Fuel (L)</Text>
          <TextInput
            style={inputStyle}
            placeholder="e.g. 10.5"
            placeholderTextColor={colors.textMuted}
            keyboardType="decimal-pad"
            value={fuelLitres}
            onChangeText={setFuelLitres}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[typography.caption, { color: colors.textMuted, marginBottom: 4 }]}>₹/Litre</Text>
          <TextInput
            style={inputStyle}
            placeholder="e.g. 103.5"
            placeholderTextColor={colors.textMuted}
            keyboardType="decimal-pad"
            value={fuelCost}
            onChangeText={setFuelCost}
          />
        </View>
      </View>

      <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.md, marginBottom: 4 }]}>
        How did it drive?
      </Text>
      <TextInput
        style={[inputStyle, { minHeight: 64, textAlignVertical: 'top' }]}
        placeholder="Smooth ride, noticed a slight vibration..."
        placeholderTextColor={colors.textMuted}
        multiline
        value={driveNote}
        onChangeText={setDriveNote}
      />

      <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.md, marginBottom: spacing.sm }]}>
        Condition tags
      </Text>
      <View style={styles.tagGrid}>
        {CONDITION_TAGS.map((tag) => {
          const isSelected = selectedTags.includes(tag.id);
          return (
            <TouchableOpacity
              key={tag.id}
              onPress={() => toggleTag(tag.id)}
              style={[
                styles.conditionTag,
                {
                  backgroundColor: isSelected ? colors.accentDim : colors.surface2,
                  borderColor: isSelected ? colors.accent : colors.border,
                  borderRadius: radius.pill,
                  paddingHorizontal: spacing.md,
                  paddingVertical: 6,
                },
              ]}
            >
              <Text
                style={[
                  typography.micro,
                  { color: isSelected ? colors.accent : colors.textSecondary, fontWeight: isSelected ? '600' : '400' },
                ]}
              >
                {tag.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={[styles.warningRow, { marginTop: spacing.md }]}>
        <View style={{ flex: 1 }}>
          <Text style={[typography.caption, { color: colors.textPrimary }]}>Warning light?</Text>
          <Text style={[typography.micro, { color: colors.textMuted }]}>Check engine, oil, etc.</Text>
        </View>
        <Switch
          value={hasWarning}
          onValueChange={setHasWarning}
          trackColor={{ false: colors.surface2, true: colors.accentDim }}
          thumbColor={hasWarning ? colors.accent : colors.textMuted}
        />
      </View>

      {hasWarning && (
        <TextInput
          style={[inputStyle, { marginTop: spacing.sm }]}
          placeholder="Describe the warning light..."
          placeholderTextColor={colors.textMuted}
          value={warningDesc}
          onChangeText={setWarningDesc}
        />
      )}

      <TouchableOpacity
        onPress={handleSubmit}
        style={[
          styles.submitBtn,
          {
            backgroundColor: colors.accent,
            borderRadius: radius.md,
            marginTop: spacing.lg,
          },
        ]}
      >
        <Text style={[typography.title, { color: '#0D0D0D' }]}>Save entry</Text>
      </TouchableOpacity>
    </View>
  );
}

function DiaryEntryCard({ entry }: { entry: DiaryEntry }) {
  const { colors, spacing, radius, typography } = useTheme();
  return (
    <View
      style={[
        styles.diaryCard,
        {
          backgroundColor: colors.surface1,
          borderColor: colors.border,
          borderRadius: radius.lg,
          padding: spacing.base,
          marginBottom: spacing.md,
        },
      ]}
    >
      <View style={styles.diaryCardHeader}>
        <Text style={[typography.caption, { color: colors.textSecondary, fontWeight: '600' }]}>
          {formatDateShort(entry.date)}
        </Text>
        {entry.hasWarningLight && (
          <View style={[styles.warningBadge, { backgroundColor: colors.warningDim, borderRadius: radius.pill }]}>
            <Ionicons name="warning-outline" size={11} color={colors.warning} />
            <Text style={[typography.micro, { color: colors.warning, marginLeft: 3 }]}>Warning light</Text>
          </View>
        )}
      </View>

      {entry.odometerCurrent != null && (
        <View style={[styles.diaryMetaRow, { marginTop: spacing.sm }]}>
          <Ionicons name="speedometer-outline" size={13} color={colors.textMuted} />
          <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: 4 }]}>
            {formatOdometer(entry.odometerCurrent)}
          </Text>
          {entry.fuelLitres != null && (
            <>
              <Text style={[typography.caption, { color: colors.textMuted, marginHorizontal: 6 }]}>·</Text>
              <Ionicons name="water-outline" size={13} color={colors.textMuted} />
              <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: 4 }]}>
                {entry.fuelLitres}L
              </Text>
            </>
          )}
          {entry.fuelTotalInr != null && (
            <>
              <Text style={[typography.caption, { color: colors.textMuted, marginHorizontal: 6 }]}>·</Text>
              <Text style={[typography.caption, { color: colors.accent }]}>
                {formatINR(entry.fuelTotalInr)}
              </Text>
            </>
          )}
        </View>
      )}

      {entry.driveFeelNote != null && (
        <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing.sm, fontStyle: 'italic' }]} numberOfLines={2}>
          "{entry.driveFeelNote}"
        </Text>
      )}

      {entry.conditionTags && entry.conditionTags.length > 0 && (
        <View style={[styles.tagRow, { marginTop: spacing.sm }]}>
          {entry.conditionTags.map((tag) => (
            <View
              key={tag}
              style={[
                styles.smallTag,
                { backgroundColor: colors.surface2, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 3 },
              ]}
            >
              <Text style={[typography.micro, { color: colors.textMuted }]}>
                {CONDITION_TAGS.find((t) => t.id === tag)?.label ?? tag}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export default function DiaryScreen() {
  const { colors, spacing, typography } = useTheme();
  const { entries, todayEntry, inferredVehicleId, inferredReason, addEntry, setTodayEntry, setInferredVehicle } = useDiaryStore();
  const { vehicles } = useGarageStore();
  const [showForm, setShowForm] = useState(false);
  const [dismissedInference, setDismissedInference] = useState(false);

  useVehicleInference();

  const inferredVehicle = vehicles.find((v) => v.id === inferredVehicleId);
  const showInferenceCard = !dismissedInference && inferredVehicle != null && todayEntry == null;

  const effectiveVehicleId = inferredVehicleId ?? vehicles[0]?.id ?? null;

  const allEntries = useMemo(() => {
    const result: DiaryEntry[] = [];
    for (const vehicleId in entries) {
      result.push(...entries[vehicleId]);
    }
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [entries]);

  const pastEntries = allEntries.filter((e) => e.date !== todayISO());

  const handleConfirmInference = () => {
    setShowForm(true);
    setDismissedInference(true);
  };

  const handleSwitchVehicle = () => {
    const others = vehicles.filter((v) => v.id !== inferredVehicleId);
    if (others.length > 0) {
      setInferredVehicle(others[0].id, 'Manually selected');
    }
  };

  const handleDismiss = () => {
    setDismissedInference(true);
  };

  const handleSubmitEntry = (partial: Partial<DiaryEntry>) => {
    if (!effectiveVehicleId) return;
    const newEntry: DiaryEntry = {
      id: `diary_${Date.now()}`,
      vehicleId: effectiveVehicleId,
      userId: 'local',
      date: todayISO(),
      createdAt: new Date().toISOString(),
      ...partial,
    };
    addEntry(newEntry);
    setTodayEntry(newEntry);
    setShowForm(false);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingHorizontal: spacing.base, paddingTop: spacing.md, paddingBottom: spacing.sm }]}>
        <View>
          <Text style={[typography.headline, { color: colors.textPrimary }]}>
            {greetingByHour()}
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </Text>
        </View>
        {effectiveVehicleId && !showForm && todayEntry == null && (
          <TouchableOpacity
            onPress={() => setShowForm(true)}
            style={[styles.logTodayBtn, { backgroundColor: colors.accent, borderRadius: 8 }]}
          >
            <Ionicons name="add" size={18} color="#0D0D0D" />
            <Text style={[typography.caption, { color: '#0D0D0D', fontWeight: '700', marginLeft: 3 }]}>
              Log today
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.base, paddingBottom: 100 }}>
        {showInferenceCard && !showForm && inferredVehicle != null && (
          <InferenceCard
            vehicleName={inferredVehicle.nickname ?? `${inferredVehicle.make} ${inferredVehicle.model}`}
            reason={inferredReason ?? ''}
            onConfirm={handleConfirmInference}
            onSwitch={handleSwitchVehicle}
            onDismiss={handleDismiss}
          />
        )}

        {todayEntry != null && !showForm && (
          <View style={{ marginBottom: spacing.md }}>
            <Text style={[typography.caption, { color: colors.textMuted, marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 0.8 }]}>
              Today
            </Text>
            <DiaryEntryCard entry={todayEntry} />
          </View>
        )}

        {showForm && effectiveVehicleId != null && (
          <TodayEntryForm vehicleId={effectiveVehicleId} onSubmit={handleSubmitEntry} />
        )}

        {vehicles.length === 0 && (
          <View style={[styles.emptyVehicle, { backgroundColor: colors.surface1, borderColor: colors.border, borderRadius: 14 }]}>
            <Ionicons name="car-outline" size={32} color={colors.textMuted} />
            <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.md, textAlign: 'center' }]}>
              Add a vehicle to start keeping a driving diary.
            </Text>
          </View>
        )}

        {pastEntries.length > 0 && (
          <>
            <Text style={[typography.caption, { color: colors.textMuted, marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 0.8 }]}>
              Past entries
            </Text>
            {pastEntries.map((entry) => (
              <DiaryEntryCard key={entry.id} entry={entry} />
            ))}
          </>
        )}

        {vehicles.length > 0 && pastEntries.length === 0 && !showForm && todayEntry == null && !showInferenceCard && (
          <View style={styles.emptyDiary}>
            <Ionicons name="journal-outline" size={32} color={colors.textMuted} />
            <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.md, textAlign: 'center' }]}>
              Your diary is empty. Start logging your drives today.
            </Text>
          </View>
        )}
      </ScrollView>
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
  logTodayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  inferenceCard: {
    borderWidth: 1,
  },
  inferenceCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inferenceIconBg: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inferenceActions: {
    flexDirection: 'row',
  },
  inferenceBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  entryForm: {
    borderWidth: 1,
  },
  textInput: {
    borderWidth: 1,
    fontSize: 15,
  },
  fuelRow: {
    flexDirection: 'row',
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  conditionTag: {
    borderWidth: 1,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitBtn: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  diaryCard: {
    borderWidth: 1,
  },
  diaryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  diaryMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  smallTag: {},
  emptyVehicle: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyDiary: {
    alignItems: 'center',
    paddingVertical: 40,
  },
});
