import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useUIStore } from '@/store/ui';

const ICON_MAP = {
  info: 'information-circle',
  success: 'checkmark-circle',
  warning: 'warning',
  error: 'close-circle',
} as const;

export default function Toast() {
  const { colors, spacing, radius, typography, zIndex } = useTheme();
  const { toastMessage, toastSeverity, clearToast } = useUIStore();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (!toastMessage) return;

    opacity.setValue(0);
    translateY.setValue(-20);

    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, speed: 40, bounciness: 5 }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -20, duration: 250, useNativeDriver: true }),
      ]).start(() => clearToast());
    }, 3000);

    return () => clearTimeout(timer);
  }, [toastMessage]);

  if (!toastMessage) return null;

  const severityColors = {
    info: colors.blue,
    success: colors.success,
    warning: colors.warning,
    error: colors.danger,
  };

  const accentColor = severityColors[toastSeverity];
  const icon = ICON_MAP[toastSeverity];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface2,
          borderRadius: radius.md,
          borderLeftWidth: 3,
          borderLeftColor: accentColor,
          zIndex: zIndex.toast,
          opacity,
          transform: [{ translateY }],
          marginHorizontal: spacing.base,
        },
      ]}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
    >
      <Ionicons name={icon as any} size={18} color={accentColor} />
      <Text
        style={[styles.message, { color: colors.textPrimary, ...typography.body }]}
        numberOfLines={2}
      >
        {toastMessage}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 12,
  },
  message: {
    flex: 1,
  },
});
