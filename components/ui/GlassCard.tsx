import React, { useRef, useCallback } from 'react';
import {
  Animated,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  blur?: number;
  opacity?: number;
  accentBorder?: boolean;
  onPress?: () => void;
  padding?: number;
}

export default function GlassCard({
  children,
  style,
  blur: _blur = 20,
  opacity,
  accentBorder = false,
  onPress,
  padding = 16,
}: GlassCardProps) {
  const { glass, colors, radius, isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const resolvedOpacity = opacity ?? (isDark ? 0.06 : 0.75);
  const backgroundColor = isDark
    ? `rgba(255,255,255,${resolvedOpacity})`
    : `rgba(255,255,255,${resolvedOpacity})`;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 50,
      bounciness: 2,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  const cardStyle: ViewStyle = {
    backgroundColor,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: glass.border,
    padding,
    ...glass.shadow,
  };

  const accentBorderStyle: ViewStyle = accentBorder
    ? {
        borderLeftWidth: 2,
        borderLeftColor: '#E8FF3A',
      }
    : {};

  const content = (
    <Animated.View
      style={[
        cardStyle,
        accentBorderStyle,
        { transform: [{ scale: onPress ? scaleAnim : 1 }] },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <TouchableWithoutFeedback
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
    >
      {content}
    </TouchableWithoutFeedback>
  );
}

const _styles = StyleSheet.create({
  // Reserved for future static styles
});
