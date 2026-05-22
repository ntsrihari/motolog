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
import { useFuelPrice } from '@/hooks/useFuelPrice';
import { formatINR } from '@/utils/formatINR';
import { todayISO } from '@/utils/formatDate';
import type { FuelLog, Vehicle } from '@/types';

interface FuelLogFormProps {
  vehicle: Vehicle;
  onSave: (log: Omit<FuelLog, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isSaving?: boolean;
  userLevel?: 1 | 2 | 3;
}

export default function FuelLogForm({
  vehicle,
  onSave,
  onCancel,
  isSaving = false,
  userLevel = 1,
}: FuelLogFormProps) {
  const { colors, spacing, radius, typography } = useTheme();
  const { petrol, diesel, city, date: priceDate } = useFuelPrice();

  const defaultPricePerL =
    vehicle.fuelType === 'diesel' ? diesel : petrol;

  const [odometer, setOdometer] = useState(String(vehicle.currentOdometer));
  const [litres, setLitres] = useState('');
  const [pricePerL, setPricePerL] = useState(defaultPricePerL ? String(defaultPricePerL) : '');
  const [station, setStation] = useState('');
  const [performanceNote, setPerformanceNote] = useState('');
  const [fuelGrade, setFuelGrade] = useState('');
  const [isBrimFull, setIsBrimFull] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalCost =
    parseFloat(litres || '0') * parseFloat(pricePerL || '0');

  const prevOdometer = vehicle.currentOdometer;
  const kmDriven = parseInt(odometer || '0') - prevOdometer;
  const efficiency =
    litres && kmDriven > 0 ? kmDriven / parseFloat(litres) : null;

  function validate(): boolean {
    const errs: Record<string, string> = {};
    const odo = parseInt(odometer);
    const vol = parseFloat(litres);
    const ppl = parseFloat(pricePerL);

    if (!odometer || isNaN(odo) || odo <= 0) errs.odometer = 'Enter the current odometer reading';
    if (odo < prevOdometer) errs.odometer = `Odometer can't be less than ${prevOdometer} km`;
    if (!litres || isNaN(vol) || vol <= 0) errs.litres = 'Enter the litres filled';
    if (vol > 200) errs.litres = 'That seems too high — double check';
    if (!pricePerL || isNaN(ppl) || ppl <= 0) errs.pricePerL = 'Enter the cost per litre';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    const vol = parseFloat(litres);
    const ppl = parseFloat(pricePerL);
    const odo = parseInt(odometer);

    onSave({
      vehicleId: vehicle.id,
      logType: 'fuel',
      date: todayISO(),
      odometerKm: odo,
      volumeLitres: vol,
      costPerLitre: ppl,
      totalCostInr: Math.round(vol * ppl),
      fuelStation: station || undefined,
      efficiencyKmPerL: efficiency ?? undefined,
      isBrimFull,
      performanceNote: performanceNote || undefined,
      fuelGradeRon: fuelGrade ? parseInt(fuelGrade) : undefined,
      attachments: [],
    });
  }

  const s = StyleSheet.create({
    container: { paddingHorizontal: spacing.base, paddingBottom: spacing.lg },
    row: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
    field: { flex: 1, marginBottom: spacing.md },
    label: {
      ...typography.caption,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
    },
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
    helperText: { ...typography.micro, color: colors.textMuted, marginTop: 4 },
    hint: {
      backgroundColor: colors.blueDim,
      borderRadius: radius.sm,
      padding: spacing.md,
      marginBottom: spacing.base,
    },
    hintText: { ...typography.caption, color: colors.blue },
    summaryCard: {
      backgroundColor: colors.accentDim,
      borderRadius: radius.md,
      padding: spacing.md,
      marginBottom: spacing.base,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    summaryLabel: { ...typography.caption, color: colors.textSecondary },
    summaryValue: { ...typography.title, color: colors.accent },
    effNote: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
    brimRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
    },
    brimLabel: { ...typography.body, color: colors.textPrimary },
    toggle: {
      width: 48,
      height: 26,
      borderRadius: 13,
      justifyContent: 'center',
      paddingHorizontal: 2,
    },
    toggleKnob: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: '#fff',
    },
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
        {defaultPricePerL && city && (
          <View style={s.hint}>
            <Text style={s.hintText}>
              {vehicle.fuelType === 'diesel' ? 'Diesel' : 'Petrol'} in {city}
              {priceDate ? ` as of ${priceDate}` : ''} — ₹{defaultPricePerL}/litre. Tap to edit.
            </Text>
          </View>
        )}

        <View style={s.row}>
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
              accessibilityLabel="Current odometer reading"
            />
            {errors.odometer ? (
              <Text style={s.errorText}>{errors.odometer}</Text>
            ) : (
              <Text style={s.helperText}>Current reading on your trip meter</Text>
            )}
          </View>
        </View>

        <View style={s.row}>
          <View style={s.field}>
            <Text style={s.label}>
              Litres filled <Text style={s.required}>*</Text>
            </Text>
            <TextInput
              style={[s.input, errors.litres && s.inputError]}
              value={litres}
              onChangeText={setLitres}
              keyboardType="decimal-pad"
              placeholder="e.g. 35.5"
              placeholderTextColor={colors.textMuted}
              accessibilityLabel="Litres filled"
            />
            {errors.litres && <Text style={s.errorText}>{errors.litres}</Text>}
          </View>
          <View style={s.field}>
            <Text style={s.label}>
              ₹/litre <Text style={s.required}>*</Text>
            </Text>
            <TextInput
              style={[s.input, errors.pricePerL && s.inputError]}
              value={pricePerL}
              onChangeText={setPricePerL}
              keyboardType="decimal-pad"
              placeholder="e.g. 104.7"
              placeholderTextColor={colors.textMuted}
              accessibilityLabel="Cost per litre"
            />
            {errors.pricePerL && <Text style={s.errorText}>{errors.pricePerL}</Text>}
          </View>
        </View>

        {litres && pricePerL && (
          <View style={s.summaryCard}>
            <View>
              <Text style={s.summaryLabel}>Total cost</Text>
              {efficiency && (
                <Text style={s.effNote}>
                  {efficiency.toFixed(1)} km/l for this fill
                </Text>
              )}
            </View>
            <Text style={s.summaryValue}>{formatINR(totalCost)}</Text>
          </View>
        )}

        <View style={s.brimRow}>
          <Text style={s.brimLabel}>Full tank fill-up?</Text>
          <TouchableOpacity
            onPress={() => setIsBrimFull(!isBrimFull)}
            style={[
              s.toggle,
              { backgroundColor: isBrimFull ? colors.accent : colors.surface2 },
            ]}
            accessibilityRole="switch"
            accessibilityState={{ checked: isBrimFull }}
            accessibilityLabel="Full tank fill-up"
          >
            <View
              style={[
                s.toggleKnob,
                { alignSelf: isBrimFull ? 'flex-end' : 'flex-start' },
              ]}
            />
          </TouchableOpacity>
        </View>

        <View style={s.field}>
          <Text style={s.label}>Fuel station (optional)</Text>
          <TextInput
            style={s.input}
            value={station}
            onChangeText={setStation}
            placeholder="e.g. HP Pump, Andheri West"
            placeholderTextColor={colors.textMuted}
            accessibilityLabel="Fuel station name"
          />
        </View>

        {userLevel >= 2 && (
          <>
            <Text style={s.sectionLabel}>Enthusiast details</Text>
            <View style={s.row}>
              <View style={s.field}>
                <Text style={s.label}>Fuel grade (RON)</Text>
                <TextInput
                  style={s.input}
                  value={fuelGrade}
                  onChangeText={setFuelGrade}
                  keyboardType="numeric"
                  placeholder="91 / 95 / 98"
                  placeholderTextColor={colors.textMuted}
                  accessibilityLabel="Fuel octane rating"
                />
              </View>
            </View>
            <View style={s.field}>
              <Text style={s.label}>Drive feel note</Text>
              <TextInput
                style={[s.input, { height: 80, textAlignVertical: 'top' }]}
                value={performanceNote}
                onChangeText={setPerformanceNote}
                placeholder={
                  userLevel === 3
                    ? 'e.g. boost felt flat above 4500 rpm'
                    : 'e.g. engine felt smoother after this fill'
                }
                placeholderTextColor={colors.textMuted}
                multiline
                accessibilityLabel="Drive feel note"
              />
            </View>
          </>
        )}

        <View style={s.buttonRow}>
          <TouchableOpacity style={s.cancelBtn} onPress={onCancel} accessibilityRole="button" accessibilityLabel="Cancel">
            <Text style={s.cancelLabel}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.saveBtn, isSaving && s.saveBtnDisabled]}
            onPress={handleSave}
            disabled={isSaving}
            accessibilityRole="button"
            accessibilityLabel="Save fuel log"
          >
            {isSaving ? (
              <ActivityIndicator color="#0D0D0D" size="small" />
            ) : (
              <Text style={s.saveLabel}>Save fuel log</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
