import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const BENEFITS = [
  {
    icon: 'construct-outline' as const,
    title: 'Never miss a service',
    desc: 'Smart reminders based on km and time, so your vehicle is always in top shape.',
  },
  {
    icon: 'calculator-outline' as const,
    title: 'Know your real running cost',
    desc: 'Track fuel, repairs, and expenses. See exactly what each km costs you.',
  },
  {
    icon: 'time-outline' as const,
    title: 'Build a complete vehicle history',
    desc: 'Every service, modification, and incident — documented and always at hand.',
  },
];

export default function OnboardingWelcomeScreen() {
  const { colors, spacing, radius, typography } = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <View style={styles.topSection}>
          <View style={[styles.logoArea, { marginBottom: spacing.lg }]}>
            <Text style={[styles.logoMoto, { color: colors.textPrimary }]}>Moto</Text>
            <Text style={[styles.logoLog, { color: colors.accent }]}>Log</Text>
          </View>
          <Text style={[typography.title, { color: colors.textSecondary, textAlign: 'center', paddingHorizontal: spacing.xl }]}>
            Your garage. Your history. Your call.
          </Text>
        </View>

        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface1,
              borderColor: colors.border,
              borderRadius: radius.xl,
              padding: spacing.lg,
              marginHorizontal: spacing.base,
              marginBottom: spacing.lg,
            },
          ]}
        >
          {BENEFITS.map((benefit, idx) => (
            <View key={benefit.title} style={[styles.benefitRow, idx < BENEFITS.length - 1 && styles.benefitRowBorder, idx > 0 && { paddingTop: spacing.md }, idx < BENEFITS.length - 1 && { paddingBottom: spacing.md, borderBottomColor: colors.border }]}>
              <View style={[styles.benefitIcon, { backgroundColor: colors.accentDim, borderRadius: radius.sm }]}>
                <Ionicons name={benefit.icon} size={20} color={colors.accent} />
              </View>
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={[typography.caption, { color: colors.textPrimary, fontWeight: '700' }]}>
                  {benefit.title}
                </Text>
                <Text style={[typography.micro, { color: colors.textSecondary, marginTop: 3 }]}>
                  {benefit.desc}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.actions, { paddingHorizontal: spacing.base }]}>
          <TouchableOpacity
            onPress={() => router.push('/onboarding/lookup')}
            style={[
              styles.primaryBtn,
              { backgroundColor: colors.accent, borderRadius: radius.md },
            ]}
            activeOpacity={0.85}
          >
            <Text style={[typography.title, { color: '#0D0D0D' }]}>Get started</Text>
            <Ionicons name="arrow-forward" size={18} color="#0D0D0D" style={{ marginLeft: spacing.sm }} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/onboarding/lookup')}
            style={[
              styles.ghostBtn,
              {
                borderColor: colors.border,
                borderRadius: radius.md,
                marginTop: spacing.md,
              },
            ]}
            activeOpacity={0.8}
          >
            <Text style={[typography.title, { color: colors.textSecondary }]}>Sign in</Text>
          </TouchableOpacity>
        </View>

        <Text style={[typography.micro, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.lg }]}>
          India-first · Works offline · Your data, your control
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 24,
  },
  topSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoArea: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logoMoto: {
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -1,
  },
  logoLog: {
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -1,
  },
  card: {
    borderWidth: 1,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  benefitRowBorder: {
    borderBottomWidth: 1,
  },
  benefitIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  actions: {
    width: '100%',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  ghostBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderWidth: 1,
  },
});
