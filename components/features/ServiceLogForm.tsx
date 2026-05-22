import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { formatINR } from '@/utils/formatINR';
import { todayISO } from '@/utils/formatDate';
import { SERVICE_TYPES } from '@/config/vehicles.config';
import type { ServiceLog, Vehicle } from '@/types';

interface ServiceLogFormProps {
  vehicle: Vehicle;
  onSave: (log: Omit<ServiceLog, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isSaving?: boolean;
  userLevel?: 1 | 2 | 3;
}

export default function ServiceLogForm({
  vehicle,
  onSave,
  onCancel,
  isSaving = false,
  userLevel = 1,
}: ServiceLogFormProps) {
  const { colors, spacing, radius, typography } = useTheme();
  const [odometer, setOdometer] = useState(String(vehicle.currentOdometer));
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [serviceCenter, setServiceCenter] = useState('');
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');
  const [oilGrade, setOilGrade] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function toggleItem(id: string) {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    const odo = parseInt(odometer);
    if (!odometer || isNaN(odo) || odo < 0) errs.odometer = 'Enter the current odometer';
    if (selectedItems.length === 0) errs.items = 'Select at least one service item';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    const odo = parseInt(odometer);
    const costVal = parseFloat(cost) || 0;
    const specs = vehicle.specs;
    const nextKm = specs?.serviceIntervalKm ? odo + specs.serviceIntervalKm : undefined;

    onSave({
      vehicleId: vehicle.id,
      logType: 'service',
      date: todayISO(),
      odometerKm: odo,
      serviceType: selectedItems[0] ?? 'service',
      itemsServiced: selectedItems,
      serviceCenterName: serviceCenter || undefined,
      costInr: Math.round(costVal),
      notes: notes || undefined,
      oilGrade: oilGrade || undefined,
      nextServiceKm: nextKm,
      attachments: [],
    });
  }

  const s = StyleSheet.create({
    container: { paddingHorizontal: spacing.base, paddingBottom: spacing.lg },
    field: { marginBottom: spacing.md },
    label: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.xs },
    required: { color: colors.danger },
    input: {
      backgroundColor: colors.surface2,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      color: colors.textPrimary,
      ...typography.body,
      minHeight: 44,
    },
    inputError: { borderColor: colors.danger },
    errorText: { ...typography.micro, color: colors.danger, marginTop: 4 },
    chipsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
    chip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface1,
    },
    chipActive: { borderColor: colors.accent, backgroundColor: colors.accentDim },
    chipText: { ...typography.caption, color: colors.textSecondary },
    chipTextActive: { color: colors.accent, fontWeight: '600' },
    sectionLabel: {
      ...typography.caption,
      color: colors.textMuted,
      marginBottom: spacing.sm,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    buttonRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
    cancelBtn: {
      flex: 1,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: spacing.md,
      alignItems: 'center',
    },
    cancelLabel: { ...typography.body, color: colors.textSecondary, fontWeight: '500' },
    saveBtn: {
      flex: 2,
      backgroundColor: colors.accent,
      borderRadius: radius.md,
      paddingVertical: spacing.md,
      alignItems: 'center',
    },
    saveBtnDisabled: { opacity: 0.5 },
    saveLabel: { ...typography.body, color: '#0D0D0D', fontWeight: '700' },
  });

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={s.container}>
        <View style={s.field}>
          <Text style={s.label}>
            Odometer (km) <Text style={s.required}>*</Text>
          </Text>
          <TextInput
            style={[s.input, errors.odometer && s.inputError]}
            value={odometer}
            onChangeText={setOdometer}
            keyboardType="numeric"
            placeholder={String(vehicle.currentOdometer)}
            placeholderTextColor={colors.textMuted}
            accessibilityLabel="Current odometer"
          />
          {errors.odometer && <Text style={s.errorText}>{errors.odometer}</Text>}
        </View>

        <View style={s.field}>
          <Text style={s.label}>
            What was done? <Text style={s.required}>*</Text>
          </Text>
          <View style={s.chipsGrid}>
            {SERVICE_TYPES.map((type) => {
              const active = selectedItems.includes(type.id);
              return (
                <TouchableOpacity
                  key={type.id}
                  style={[s.chip, active && s.chipActive]}
                  onPress={() => toggleItem(type.id)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: active }}
                  accessibilityLabel={type.label}
                >
                  <Text style={[s.chipText, active && s.chipTextActive]}>{type.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {errors.items && <Text style={[s.errorText, { marginTop: spacing.xs }]}>{errors.items}</Text>}
        </View>

        <View style={s.field}>
          <Text style={s.label}>Service center (optional)</Text>
          <TextInput
            style={s.input}
            value={serviceCenter}
            onChangeText={setServiceCenter}
            placeholder="e.g. Maruti Service, Bandra"
            placeholderTextColor={colors.textMuted}
            accessibilityLabel="Service center name"
          />
        </View>

        <View style={s.field}>
          <Text style={s.label}>Total cost (₹)</Text>
          <TextInput
            style={s.input}
            value={cost}
            onChangeText={setCost}
            keyboardType="numeric"
            placeholder="e.g. 4500"
            placeholderTextColor={colors.textMuted}
            accessibilityLabel="Service cost"
          />
        </View>

        {userLevel >= 2 && (
          <>
            <Text style={s.sectionLabel}>Service details</Text>
            <View style={s.field}>
              <Text style={s.label}>Oil grade (if changed)</Text>
              <TextInput
                style={s.input}
                value={oilGrade}
                onChangeText={setOilGrade}
                placeholder="e.g. 5W-40 Fully Synthetic"
                placeholderTextColor={colors.textMuted}
                accessibilityLabel="Oil grade"
              />
            </View>
          </>
        )}

        <View style={s.field}>
          <Text style={s.label}>Notes</Text>
          <TextInput
            style={[s.input, { height: 80, textAlignVertical: 'top' }]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Any additional notes about this service"
            placeholderTextColor={colors.textMuted}
            multiline
            accessibilityLabel="Service notes"
          />
        </View>

        <View style={s.buttonRow}>
          <TouchableOpacity style={s.cancelBtn} onPress={onCancel} accessibilityRole="button" accessibilityLabel="Cancel">
            <Text style={s.cancelLabel}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.saveBtn, isSaving && s.saveBtnDisabled]}
            onPress={handleSave}
            disabled={isSaving}
            accessibilityRole="button"
            accessibilityLabel="Save service log"
          >
            {isSaving ? (
              <ActivityIndicator color="#0D0D0D" size="small" />
            ) : (
              <Text style={s.saveLabel}>Save service log</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
