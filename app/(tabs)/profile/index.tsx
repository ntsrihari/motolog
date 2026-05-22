import React, { useState } from 'react';
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
import { useUserStore } from '@/store/user';
import { useGarageStore } from '@/store/garage';
import { useTheme } from '@/hooks/useTheme';
import { formatDateShort } from '@/utils/formatDate';
import { AppConfig } from '@/config/app.config';

const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bengaluru', 'Chennai', 'Hyderabad',
  'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Surat',
];

function AvatarPlaceholder({ name }: { name?: string }) {
  const { colors, radius, typography } = useTheme();
  const initials = name
    ? name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';
  return (
    <View
      style={[
        styles.avatar,
        { backgroundColor: colors.accentDim, borderRadius: radius.full, borderColor: colors.accent },
      ]}
    >
      <Text style={[typography.headline, { color: colors.accent }]}>{initials}</Text>
    </View>
  );
}

function SettingsRow({
  icon,
  label,
  value,
  onPress,
  right,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  right?: React.ReactNode;
}) {
  const { colors, spacing, typography } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={onPress == null && right == null}
      style={[styles.settingsRow, { paddingHorizontal: spacing.base, paddingVertical: spacing.md }]}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.settingsRowIcon, { backgroundColor: colors.surface2, borderRadius: 8 }]}>
        <Ionicons name={icon} size={18} color={colors.textSecondary} />
      </View>
      <View style={{ flex: 1, marginLeft: spacing.md }}>
        <Text style={[typography.body, { color: colors.textPrimary }]}>{label}</Text>
        {value != null && (
          <Text style={[typography.caption, { color: colors.textSecondary }]}>{value}</Text>
        )}
      </View>
      {right != null ? (
        right
      ) : onPress != null ? (
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      ) : null}
    </TouchableOpacity>
  );
}

function SectionHeader({ title }: { title: string }) {
  const { colors, spacing, typography } = useTheme();
  return (
    <Text
      style={[
        typography.micro,
        {
          color: colors.textMuted,
          textTransform: 'uppercase',
          letterSpacing: 0.8,
          paddingHorizontal: spacing.base,
          paddingTop: spacing.lg,
          paddingBottom: spacing.sm,
        },
      ]}
    >
      {title}
    </Text>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  const { colors, radius } = useTheme();
  return (
    <View
      style={[
        styles.sectionCard,
        {
          backgroundColor: colors.surface1,
          borderColor: colors.border,
          borderRadius: radius.lg,
          marginHorizontal: 16,
          overflow: 'hidden',
        },
      ]}
    >
      {children}
    </View>
  );
}

function Divider() {
  const { colors } = useTheme();
  return <View style={[styles.divider, { backgroundColor: colors.border }]} />;
}

export default function ProfileScreen() {
  const { colors, spacing, typography, radius } = useTheme();
  const { user, isAuthenticated, theme, city, setTheme, setCity } = useUserStore();
  const { vehicles, logs } = useGarageStore();

  const [editingCity, setEditingCity] = useState(false);
  const [cityInput, setCityInput] = useState(city);
  const [inviteInput, setInviteInput] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [notifService, setNotifService] = useState(true);
  const [notifInsurance, setNotifInsurance] = useState(true);
  const [notifFuel, setNotifFuel] = useState(false);

  const totalLogs = Object.values(logs).reduce((sum, arr) => sum + arr.length, 0);
  const memberSince = user?.createdAt ? formatDateShort(user.createdAt) : '—';

  const handleSaveCity = () => {
    const trimmed = cityInput.trim();
    if (trimmed.length > 0) setCity(trimmed);
    setEditingCity(false);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingHorizontal: spacing.base, paddingTop: spacing.md, paddingBottom: spacing.sm }]}>
        <Text style={[typography.headline, { color: colors.textPrimary }]}>Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={[styles.profileSection, { paddingHorizontal: spacing.base, paddingVertical: spacing.lg }]}>
          <AvatarPlaceholder name={user?.name ?? (isAuthenticated ? 'User' : undefined)} />
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={[typography.title, { color: colors.textPrimary }]}>
              {user?.name ?? (isAuthenticated ? 'My Account' : 'Guest')}
            </Text>
            {user?.phone != null && (
              <Text style={[typography.caption, { color: colors.textSecondary }]}>+91 {user.phone}</Text>
            )}
            {user?.email != null && (
              <Text style={[typography.caption, { color: colors.textSecondary }]}>{user.email}</Text>
            )}
            {!isAuthenticated && (
              <Text style={[typography.caption, { color: colors.textMuted }]}>Not signed in</Text>
            )}
          </View>
        </View>

        <View
          style={[
            styles.statsRow,
            {
              backgroundColor: colors.surface1,
              borderColor: colors.border,
              borderRadius: radius.lg,
              marginHorizontal: spacing.base,
              marginBottom: spacing.sm,
            },
          ]}
        >
          <View style={styles.statItem}>
            <Text style={[{ fontSize: 22, fontWeight: '700', color: colors.accent }]}>
              {vehicles.length}
            </Text>
            <Text style={[typography.micro, { color: colors.textMuted, marginTop: 2 }]}>Vehicles</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[{ fontSize: 22, fontWeight: '700', color: colors.accent }]}>
              {totalLogs}
            </Text>
            <Text style={[typography.micro, { color: colors.textMuted, marginTop: 2 }]}>Total logs</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[{ fontSize: 13, fontWeight: '600', color: colors.textSecondary }]}>
              {memberSince}
            </Text>
            <Text style={[typography.micro, { color: colors.textMuted, marginTop: 2 }]}>Member since</Text>
          </View>
        </View>

        <SectionHeader title="Appearance" />
        <SectionCard>
          <SettingsRow
            icon="moon-outline"
            label="Dark mode"
            right={
              <Switch
                value={theme === 'dark'}
                onValueChange={(v) => setTheme(v ? 'dark' : 'light')}
                trackColor={{ false: colors.surface2, true: colors.accentDim }}
                thumbColor={theme === 'dark' ? colors.accent : colors.textMuted}
              />
            }
          />
        </SectionCard>

        <SectionHeader title="Location" />
        <SectionCard>
          {editingCity ? (
            <View style={{ padding: spacing.base }}>
              <Text style={[typography.caption, { color: colors.textMuted, marginBottom: spacing.sm }]}>
                City (for fuel prices)
              </Text>
              <TextInput
                style={[
                  styles.cityInput,
                  {
                    backgroundColor: colors.surface2,
                    borderColor: colors.border,
                    borderRadius: radius.sm,
                    color: colors.textPrimary,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                  },
                ]}
                value={cityInput}
                onChangeText={setCityInput}
                placeholder="Enter city..."
                placeholderTextColor={colors.textMuted}
                autoFocus
              />
              <View style={[styles.citySuggestions, { marginTop: spacing.sm }]}>
                {INDIAN_CITIES.filter((c) => c.toLowerCase().startsWith(cityInput.toLowerCase()) && c !== cityInput).slice(0, 4).map((c) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => { setCityInput(c); handleSaveCity(); }}
                    style={[styles.citySuggestion, { backgroundColor: colors.surface2, borderRadius: radius.sm, marginRight: spacing.sm, marginBottom: spacing.sm }]}
                  >
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.cityActions}>
                <TouchableOpacity
                  onPress={handleSaveCity}
                  style={[styles.cityBtn, { backgroundColor: colors.accent, borderRadius: radius.sm }]}
                >
                  <Text style={[typography.caption, { color: '#0D0D0D', fontWeight: '700' }]}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => { setCityInput(city); setEditingCity(false); }}
                  style={[styles.cityBtn, { backgroundColor: colors.surface2, borderRadius: radius.sm, marginLeft: spacing.sm }]}
                >
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <SettingsRow
              icon="location-outline"
              label="City"
              value={`${city} — fuel prices from here`}
              onPress={() => setEditingCity(true)}
            />
          )}
        </SectionCard>

        <SectionHeader title="Family sharing" />
        <SectionCard>
          <SettingsRow
            icon="people-outline"
            label="Invite member"
            value="Share vehicle access with family"
            onPress={() => setShowInvite(!showInvite)}
          />
          {showInvite && (
            <View style={{ padding: spacing.base, paddingTop: 0 }}>
              <TextInput
                style={[
                  styles.cityInput,
                  {
                    backgroundColor: colors.surface2,
                    borderColor: colors.border,
                    borderRadius: radius.sm,
                    color: colors.textPrimary,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                  },
                ]}
                value={inviteInput}
                onChangeText={setInviteInput}
                placeholder="Phone number or email..."
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => { setInviteInput(''); setShowInvite(false); }}
                style={[styles.cityBtn, { backgroundColor: colors.accent, borderRadius: radius.sm, marginTop: spacing.sm, alignSelf: 'flex-start' }]}
              >
                <Text style={[typography.caption, { color: '#0D0D0D', fontWeight: '700' }]}>Send invite</Text>
              </TouchableOpacity>
            </View>
          )}
        </SectionCard>

        <SectionHeader title="Notifications" />
        <SectionCard>
          <SettingsRow
            icon="construct-outline"
            label="Service reminders"
            value="Get notified when service is due"
            right={
              <Switch
                value={notifService}
                onValueChange={setNotifService}
                trackColor={{ false: colors.surface2, true: colors.accentDim }}
                thumbColor={notifService ? colors.accent : colors.textMuted}
              />
            }
          />
          <Divider />
          <SettingsRow
            icon="shield-checkmark-outline"
            label="Insurance & PUC alerts"
            value="Before documents expire"
            right={
              <Switch
                value={notifInsurance}
                onValueChange={setNotifInsurance}
                trackColor={{ false: colors.surface2, true: colors.accentDim }}
                thumbColor={notifInsurance ? colors.accent : colors.textMuted}
              />
            }
          />
          <Divider />
          <SettingsRow
            icon="water-outline"
            label="Fuel price updates"
            value="When city prices change"
            right={
              <Switch
                value={notifFuel}
                onValueChange={setNotifFuel}
                trackColor={{ false: colors.surface2, true: colors.accentDim }}
                thumbColor={notifFuel ? colors.accent : colors.textMuted}
              />
            }
          />
        </SectionCard>

        <SectionHeader title="About" />
        <SectionCard>
          <SettingsRow
            icon="information-circle-outline"
            label="Version"
            value={`MotoLog ${AppConfig.version}`}
          />
          <Divider />
          <SettingsRow
            icon="chatbubble-outline"
            label="Send feedback"
            onPress={() => {}}
          />
          <Divider />
          <SettingsRow
            icon="star-outline"
            label="Rate the app"
            onPress={() => {}}
          />
        </SectionCard>

        {isAuthenticated && (
          <>
            <SectionHeader title="Account" />
            <SectionCard>
              <SettingsRow
                icon="log-out-outline"
                label="Sign out"
                onPress={() => {}}
              />
            </SectionCard>
          </>
        )}

        {!isAuthenticated && (
          <View style={{ paddingHorizontal: spacing.base, marginTop: spacing.lg }}>
            <TouchableOpacity
              style={[styles.signInBtn, { backgroundColor: colors.accent, borderRadius: radius.md }]}
            >
              <Text style={[typography.title, { color: '#0D0D0D' }]}>Sign in to sync your data</Text>
            </TouchableOpacity>
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
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 32,
  },
  sectionCard: {
    borderWidth: 1,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsRowIcon: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    marginLeft: 16 + 34 + 12,
  },
  cityInput: {
    borderWidth: 1,
    fontSize: 15,
  },
  citySuggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  citySuggestion: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  cityActions: {
    flexDirection: 'row',
    marginTop: 8,
  },
  cityBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  signInBtn: {
    alignItems: 'center',
    paddingVertical: 14,
  },
});
