import React, { useRef, useCallback } from 'react';
import {
  Animated,
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface NeuButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  fullWidth?: boolean;
}

const SIZE_CONFIG: Record<Size, { height: number; paddingH: number; fontSize: number; iconSize: number }> = {
  sm: { height: 36, paddingH: 14, fontSize: 13, iconSize: 16 },
  md: { height: 48, paddingH: 20, fontSize: 15, iconSize: 18 },
  lg: { height: 56, paddingH: 28, fontSize: 17, iconSize: 20 },
};

export default function NeuButton({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
}: NeuButtonProps) {
  const { colors, neu, radius, typography, isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shadowLightAnim = useRef(new Animated.Value(1)).current;

  const sizeConf = SIZE_CONFIG[size];
  const isDisabled = disabled || loading;

  const handlePressIn = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
        speed: 60,
        bounciness: 1,
      }),
      Animated.timing(shadowLightAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: false,
      }),
    ]).start();
  }, [scaleAnim, shadowLightAnim]);

  const handlePressOut = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 40,
        bounciness: 5,
      }),
      Animated.timing(shadowLightAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();
  }, [scaleAnim, shadowLightAnim]);

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: '#E8FF3A',
          borderColor: 'transparent',
          textColor: '#0D0D0D',
          borderWidth: 0,
        };
      case 'secondary':
        return {
          backgroundColor: colors.surface2,
          borderColor: colors.border,
          textColor: colors.textPrimary,
          borderWidth: 1,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderColor: 'rgba(255,255,255,0.12)',
          textColor: colors.textPrimary,
          borderWidth: 1,
        };
      case 'danger':
        return {
          backgroundColor: colors.dangerDim,
          borderColor: 'transparent',
          textColor: colors.danger,
          borderWidth: 0,
        };
    }
  };

  const variantStyles = getVariantStyles();

  const neuShadow = variant === 'primary' || variant === 'secondary'
    ? {
        shadowColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.12)',
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 4,
      }
    : {};

  return (
    <TouchableWithoutFeedback
      onPress={isDisabled ? undefined : onPress}
      onPressIn={isDisabled ? undefined : handlePressIn}
      onPressOut={isDisabled ? undefined : handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      <Animated.View
        style={[
          styles.base,
          {
            height: sizeConf.height,
            minHeight: 44,
            paddingHorizontal: sizeConf.paddingH,
            borderRadius: radius.pill,
            backgroundColor: variantStyles.backgroundColor,
            borderColor: variantStyles.borderColor,
            borderWidth: variantStyles.borderWidth,
            opacity: isDisabled ? 0.5 : 1,
            alignSelf: fullWidth ? 'stretch' : 'flex-start',
            transform: [{ scale: scaleAnim }],
            ...neuShadow,
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variantStyles.textColor}
          />
        ) : (
          <View style={styles.content}>
            {icon && (
              <Ionicons
                name={icon as any}
                size={sizeConf.iconSize}
                color={variantStyles.textColor}
                style={styles.icon}
              />
            )}
            <Text
              style={[
                styles.label,
                {
                  fontSize: sizeConf.fontSize,
                  color: variantStyles.textColor,
                  fontWeight: variant === 'primary' ? '700' : '600',
                },
              ]}
              numberOfLines={1}
            >
              {label}
            </Text>
          </View>
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  icon: {
    marginRight: 2,
  },
  label: {
    letterSpacing: 0.2,
  },
});
