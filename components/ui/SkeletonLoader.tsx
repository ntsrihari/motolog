import React, { useEffect } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';

interface SkeletonLoaderProps {
  width: number | string;
  height: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

const SHIMMER_COLOR_START = 'rgba(255,255,255,0.04)';
const SHIMMER_COLOR_END = 'rgba(255,255,255,0.12)';

export default function SkeletonLoader({
  width,
  height,
  radius = 8,
  style,
}: SkeletonLoaderProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, {
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      [SHIMMER_COLOR_START, SHIMMER_COLOR_END],
    );
    return { backgroundColor };
  });

  return (
    <Animated.View
      style={[
        styles.base,
        {
          width: width as number | `${number}%`,
          height,
          borderRadius: radius,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
});
