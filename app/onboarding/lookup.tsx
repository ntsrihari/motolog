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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { lookupRegistration } from '@/lib/api';
import { registrationNumberSchema, sanitizeRegistration } from '@/utils/validators';
import type { RegistrationData } from '@/lib/api';

const MAKE_OPTIONS = [
  'Maruti Suzuki', 'Hyundai', 'Tata Motors', 'Honda', 'Toyota',
  'Kia', 'Mahindra', 'Volkswagen', 'Skoda', 'Renault',
  'Hero MotoCorp', 'Bajaj', 'TVS Motor', 'Royal Enfield', 'Yamaha',
  'KTM', 'BMW', 'Mercedes-Benz', 'Audi',
];

const FUEL_TYPE_OPTIONS = ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'];

function LookupResultCard({ data, plate }: { data: RegistrationData; plate: string }) {
  const { colors, spacing, radius, typography } = useTheme();

  const fields: { label: string; value: string | undefined }[] = [
    { label: 'Make', value: data.make },
    { label: 'Model', value: data.model },
    { label: 'Year', value: data.year?.toString() },
    { label: 'Fuel type', value: data.fuelType },
    { label: 'Insurance expiry', value: data.insuranceExpiry },
    { label: 'PUC expiry', value: data.pucExpiry },
    { label: 'RC status', value: data.rcStatus },
    { label: 'Owner count', value: data.ownerCount?.toString() },
  ].filter((f) => f.value != null && f.value.trim() !== '');

  return (
    <View
      style={[
        styles.resultCard,
        {
          backgroundColor: colors.surface1,
          borderColor: colors.accent,
          borderRadius: radius.lg,
          padding: spacing.base,
          marginBottom: spacing.md,
        },
      ]}
    >
      <View style={styles.resultCardHeader}>
        <View style={[styles.plateChip, { backgroundColor: colors.accentDim, borderRadius: radius.sm }]}>
          <Text style={[typography.title, { color: colors.accent, letterSpacing: 1 }]}>{plate}</Text>
        </View>
        <View style={[styles.successBadge, { backgroundColor: colors.successDim, borderRadius: radius.pill }]}>
          <Ionicons name="checkmark-circle" size={13} color={colors.success} />
          <Text style={[typography.micro, { color: colors.success, marginLeft: 4 }]}>Found</Text>
        </View>
      </View>
      <View style={[styles.resultDivider, { backgroundColor: colors.border, marginVertical: spacing.md }]} />
      <View style={styles.resultFields}>
        {fields.map((field) => (
          <View key={field.label} style={styles.resultField}>
            <Text style={[typography.micro, { color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }]}>
              {field.label}
            </Text>
            <Text style={[typography.caption, { color: colors.textPrimary, marginTop: 2, fontWeight: '600', textTransform: 'capitalize' }]}>
              {field.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function ManualForm({
  onSubmit,
}: {
  onSubmit: (data: { make: string; model: string; year: string; fuelType: string }) => void;
}) {
  const { colors, spacing, radius, typography } = useTheme();
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [showMakeOptions, setShowMakeOptions] = useState(false);
  const [showFuelOptions, setShowFuelOptions] = useState(false);

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
        styles.manualForm,
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
        Enter vehicle details
      </Text>

      <Text style={[typography.caption, { color: colors.textMuted, marginBottom: 4 }]}>Make</Text>
      <TouchableOpacity
        onPress={() => setShowMakeOptions(!showMakeOptions)}
        style={[inputStyle, styles.dropdownBtn]}
      >
        <Text style={[typography.body, { color: make ? colors.textPrimary : colors.textMuted, flex: 1 }]}>
          {make || 'Select make...'}
        </Text>
        <Ionicons name={showMakeOptions ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} />
      </TouchableOpacity>
      {showMakeOptions && (
        <View style={[styles.dropdown, { backgroundColor: colors.surface2, borderColor: colors.border, borderRadius: radius.sm }]}>
          <ScrollView style={{ maxHeight: 180 }}>
            {MAKE_OPTIONS.map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => { setMake(m); setShowMakeOptions(false); }}
                style={[styles.dropdownItem, { borderBottomColor: colors.border }]}
              >
                <Text style={[typography.caption, { color: colors.textPrimary }]}>{m}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.md, marginBottom: 4 }]}>
        Model
      </Text>
      <TextInput
        style={inputStyle}
        placeholder="e.g. Swift, Activa, Nexon"
        placeholderTextColor={colors.textMuted}
        value={model}
        onChangeText={setModel}
      />

      <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.md, marginBottom: 4 }]}>
        Year
      </Text>
      <TextInput
        style={inputStyle}
        placeholder={`e.g. ${new Date().getFullYear()}`}
        placeholderTextColor={colors.textMuted}
        keyboardType="number-pad"
        value={year}
        onChangeText={setYear}
        maxLength={4}
      />

      <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.md, marginBottom: 4 }]}>
        Fuel type
      </Text>
      <TouchableOpacity
        onPress={() => setShowFuelOptions(!showFuelOptions)}
        style={[inputStyle, styles.dropdownBtn]}
      >
        <Text style={[typography.body, { color: fuelType ? colors.textPrimary : colors.textMuted, flex: 1 }]}>
          {fuelType || 'Select fuel type...'}
        </Text>
        <Ionicons name={showFuelOptions ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} />
      </TouchableOpacity>
      {showFuelOptions && (
        <View style={[styles.dropdown, { backgroundColor: colors.surface2, borderColor: colors.border, borderRadius: radius.sm }]}>
          {FUEL_TYPE_OPTIONS.map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => { setFuelType(f); setShowFuelOptions(false); }}
              style={[styles.dropdownItem, { borderBottomColor: colors.border }]}
            >
              <Text style={[typography.caption, { color: colors.textPrimary }]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity
        onPress={() => onSubmit({ make, model, year, fuelType })}
        disabled={!make || !model || !year}
        style={[
          styles.continueBtn,
          {
            backgroundColor: make && model && year ? colors.accent : colors.surface2,
            borderRadius: radius.md,
            marginTop: spacing.lg,
          },
        ]}
      >
        <Text style={[typography.title, { color: make && model && year ? '#0D0D0D' : colors.textMuted }]}>
          Continue
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function LookupScreen() {
  const { colors, spacing, radius, typography } = useTheme();
  const router = useRouter();

  const [plate, setPlate] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RegistrationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showManual, setShowManual] = useState(false);
  const [cleanPlate, setCleanPlate] = useState('');

  const handlePlateChange = (text: string) => {
    const sanitized = sanitizeRegistration(text);
    setPlate(sanitized);
    setError(null);
    setResult(null);
  };

  const handleLookup = async () => {
    const validation = registrationNumberSchema.safeParse(plate);
    if (!validation.success) {
      const issues = validation.error.issues;
      setError(issues[0]?.message ?? 'Invalid registration number');
      return;
    }
    const sanitized = validation.data;
    setCleanPlate(sanitized);
    setLoading(true);
    setError(null);
    setResult(null);
    setShowManual(false);

    try {
      const data = await lookupRegistration(sanitized);
      if (data) {
        setResult(data);
      } else {
        setError('Could not fetch vehicle details. Try entering manually.');
        setShowManual(true);
      }
    } catch {
      setError('Lookup failed. Check your connection and try again.');
      setShowManual(true);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    router.push({
      pathname: '/onboarding/baseline',
      params: {
        plate: cleanPlate,
        make: result?.make ?? '',
        model: result?.model ?? '',
        year: result?.year?.toString() ?? '',
        fuelType: result?.fuelType ?? '',
        insuranceExpiry: result?.insuranceExpiry ?? '',
        pucExpiry: result?.pucExpiry ?? '',
      },
    });
  };

  const handleManualSubmit = (data: { make: string; model: string; year: string; fuelType: string }) => {
    router.push({
      pathname: '/onboarding/baseline',
      params: {
        plate: cleanPlate || plate,
        make: data.make,
        model: data.model,
        year: data.year,
        fuelType: data.fuelType.toLowerCase(),
        insuranceExpiry: '',
        pucExpiry: '',
      },
    });
  };

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
        contentContainerStyle={{ paddingHorizontal: spacing.base, paddingBottom: 80, paddingTop: spacing.lg }}
      >
        <Text style={[typography.display, { color: colors.textPrimary, fontSize: 28, fontWeight: '700', marginBottom: spacing.sm }]}>
          Add your vehicle
        </Text>
        <Text style={[typography.body, { color: colors.textSecondary, marginBottom: spacing.xl }]}>
          Enter your registration number to auto-fill details from the government database.
        </Text>

        <Text style={[typography.caption, { color: colors.textMuted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.6 }]}>
          Registration number
        </Text>
        <View
          style={[
            styles.inputRow,
            {
              backgroundColor: colors.surface1,
              borderColor: error ? colors.danger : colors.border,
              borderRadius: radius.md,
            },
          ]}
        >
          <Ionicons name="car-outline" size={20} color={colors.textMuted} style={{ marginRight: spacing.sm }} />
          <TextInput
            style={[styles.plateInput, { color: colors.textPrimary, flex: 1 }]}
            placeholder="e.g. MH12AB1234"
            placeholderTextColor={colors.textMuted}
            value={plate}
            onChangeText={handlePlateChange}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={12}
          />
        </View>
        <Text style={[typography.micro, { color: colors.textMuted, marginTop: 4 }]}>
          Format: MH12AB1234 (state code + district + series + number)
        </Text>

        {error != null && (
          <View style={[styles.errorRow, { backgroundColor: colors.dangerDim, borderRadius: radius.sm, padding: spacing.sm, marginTop: spacing.sm }]}>
            <Ionicons name="alert-circle-outline" size={14} color={colors.danger} />
            <Text style={[typography.caption, { color: colors.danger, marginLeft: 4, flex: 1 }]}>{error}</Text>
          </View>
        )}

        <TouchableOpacity
          onPress={handleLookup}
          disabled={loading || plate.length < 6}
          style={[
            styles.lookupBtn,
            {
              backgroundColor: plate.length >= 6 ? colors.accent : colors.surface2,
              borderRadius: radius.md,
              marginTop: spacing.lg,
            },
          ]}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#0D0D0D" />
          ) : (
            <>
              <Ionicons name="search-outline" size={18} color={plate.length >= 6 ? '#0D0D0D' : colors.textMuted} style={{ marginRight: spacing.sm }} />
              <Text style={[typography.title, { color: plate.length >= 6 ? '#0D0D0D' : colors.textMuted }]}>
                Look up vehicle
              </Text>
            </>
          )}
        </TouchableOpacity>

        {loading && (
          <View
            style={[
              styles.skeletonCard,
              {
                backgroundColor: colors.surface1,
                borderColor: colors.border,
                borderRadius: radius.lg,
                padding: spacing.base,
                marginTop: spacing.md,
              },
            ]}
          >
            <View style={[styles.skeletonLine, { backgroundColor: colors.surface2, width: '60%' }]} />
            <View style={[styles.skeletonLine, { backgroundColor: colors.surface2, width: '40%', marginTop: 10 }]} />
            <View style={[styles.skeletonLine, { backgroundColor: colors.surface2, width: '70%', marginTop: 10 }]} />
          </View>
        )}

        {result != null && !loading && (
          <>
            <LookupResultCard data={result} plate={cleanPlate} />
            <TouchableOpacity
              onPress={handleConfirm}
              style={[styles.lookupBtn, { backgroundColor: colors.accent, borderRadius: radius.md }]}
            >
              <Ionicons name="checkmark" size={18} color="#0D0D0D" style={{ marginRight: spacing.sm }} />
              <Text style={[typography.title, { color: '#0D0D0D' }]}>Confirm & continue</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          onPress={() => setShowManual(!showManual)}
          style={[styles.manualToggle, { marginTop: spacing.lg }]}
        >
          <Ionicons name="pencil-outline" size={14} color={colors.textMuted} style={{ marginRight: 4 }} />
          <Text style={[typography.caption, { color: colors.textMuted }]}>
            {showManual ? 'Hide manual entry' : 'Enter manually instead'}
          </Text>
        </TouchableOpacity>

        {showManual && <ManualForm onSubmit={handleManualSubmit} />}
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  plateInput: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lookupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  resultCard: {
    borderWidth: 1,
  },
  resultCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  plateChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  resultDivider: {
    height: 1,
  },
  resultFields: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  resultField: {
    minWidth: '40%',
  },
  skeletonCard: {
    borderWidth: 1,
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
  },
  manualToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingVertical: 8,
  },
  manualForm: {
    borderWidth: 1,
    marginTop: 12,
  },
  textInput: {
    borderWidth: 1,
    fontSize: 15,
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdown: {
    borderWidth: 1,
    marginTop: 2,
    zIndex: 100,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  continueBtn: {
    alignItems: 'center',
    paddingVertical: 14,
  },
});
