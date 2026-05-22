import React, { useRef, useCallback } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import type { AlertSeverity } from '@/types';

interface AlertBannerProps {
  severity: AlertSeverity;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
}

type SeverityConfig = {
  bg: string;
  border: string;
  icon: string;
  iconColor: string;
  actionColor: string;
};

export default function AlertBanner({
  severity,
  title,
  message,
  actionLabel,
  onAction,
  onDismiss,
}: AlertBannerProps) {
  const { colors, typography, spacing, radius } = useTheme();
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const getSeverityConfig = useCallback((): SeverityConfig => {
    switch (severity) {
      case 'urgent':
        return {
          bg: colors.dangerDim,
          border: colors.danger,
          icon: 'alert-circle',
          iconColor: colors.danger,
          actionColor: colors.danger,
        };
      case 'warning':
        return {
          bg: colors.warningDim,
          border: colors.warning,
          icon: 'warning',
          iconColor: colors.warning,
          actionColor: colors.warning,
        };
      case 'info':
      default:
        return {
          bg: colors.blueDim,
          border: colors.blue,
          icon: 'information-circle',
          iconColor: colors.blue,
          actionColor: colors.blue,
        };
    }
  }, [severity, colors]);

  const handleDismiss = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => onDismiss?.());
  }, [fadeAnim, onDismiss]);

  const config = getSeverityConfig();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          backgroundColor: config.bg,
          borderRadius: radius.md,
          borderLeftWidth: 3,
          borderLeftColor: config.border,
          borderWidth: 1,
          borderColor: `${config.border}30`,
        },
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      {/* Left icon strip */}
      <View style={[styles.iconWrapper, { paddingTop: 2 }]}>
        <Ionicons
          name={config.icon as any}
          size={18}
          color={config.iconColor}
        />
      </View>

      {/* Main content */}
      <View style={styles.body}>
        <Text
          style={[
            styles.titleText,
            {
              fontSize: typography.title.fontSize,
              fontWeight: typography.title.fontWeight,
              lineHeight: typography.title.lineHeight,
              color: colors.textPrimary,
            },
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
        <Text
          style={[
            styles.messageText,
            {
              fontSize: typography.body.fontSize,
              lineHeight: typography.body.lineHeight,
              color: colors.textSecondary,
              marginTop: spacing.xs / 2,
            },
          ]}
        >
          {message}
        </Text>
        {actionLabel && onAction && (
          <TouchableOpacity
            onPress={onAction}
            style={[styles.actionBtn, { marginTop: spacing.sm }]}
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
            hitSlop={6}
          >
            <Text
              style={[
                styles.actionText,
                {
                  fontSize: typography.caption.fontSize,
                  fontWeight: '600',
                  color: config.actionColor,
                },
              ]}
            >
              {actionLabel}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Dismiss button */}
      {onDismiss && (
        <Pressable
          onPress={handleDismiss}
          style={({ pressed }) => [
            styles.dismissBtn,
            { opacity: pressed ? 0.6 : 1 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Dismiss alert"
          hitSlop={8}
        >
          <Ionicons
            name="close"
            size={16}
            color={colors.textMuted}
          />
        </Pressable>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 10,
  },
  iconWrapper: {
    flexShrink: 0,
  },
  body: {
    flex: 1,
  },
  titleText: {
    letterSpacing: 0.1,
  },
  messageText: {
    letterSpacing: 0.1,
  },
  actionBtn: {
    alignSelf: 'flex-start',
  },
  actionText: {
    letterSpacing: 0.2,
  },
  dismissBtn: {
    flexShrink: 0,
    padding: 2,
    marginTop: 1,
  },
});
