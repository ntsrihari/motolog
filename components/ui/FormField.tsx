import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface FormFieldProps {
  label: string;
  error?: string;
  helper?: string;
  required?: boolean;
  children: React.ReactNode;
}

export default function FormField({
  label,
  error,
  helper,
  required = false,
  children,
}: FormFieldProps) {
  const { colors, spacing, typography } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text
          style={[
            styles.label,
            {
              fontSize: typography.caption.fontSize,
              lineHeight: typography.caption.lineHeight,
              color: colors.textSecondary,
            },
          ]}
        >
          {label}
          {required && (
            <Text style={{ color: colors.danger }}>{' '}*</Text>
          )}
        </Text>
      </View>

      <View style={styles.inputWrapper}>{children}</View>

      {error ? (
        <Text
          style={[
            styles.helperText,
            {
              fontSize: typography.caption.fontSize,
              lineHeight: typography.caption.lineHeight,
              color: colors.danger,
              marginTop: spacing.xs,
            },
          ]}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          {error}
        </Text>
      ) : helper ? (
        <Text
          style={[
            styles.helperText,
            {
              fontSize: typography.caption.fontSize,
              lineHeight: typography.caption.lineHeight,
              color: colors.textMuted,
              marginTop: spacing.xs,
            },
          ]}
        >
          {helper}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  inputWrapper: {
    // Children (TextInput etc.) render here
  },
  helperText: {
    fontWeight: '400',
  },
});
