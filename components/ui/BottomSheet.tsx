import React, { useEffect, useRef, useCallback } from 'react';
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  snapPoints?: number[];
}

const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function BottomSheet({
  visible,
  onClose,
  title,
  children,
  snapPoints = [400],
}: BottomSheetProps) {
  const { colors, glass, typography, spacing, radius } = useTheme();
  const sheetHeight = snapPoints[0];

  const translateY = useRef(new Animated.Value(sheetHeight)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const animateIn = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 320,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start();
  }, [translateY, overlayOpacity]);

  const animateOut = useCallback(
    (onDone?: () => void) => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: sheetHeight + 60,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start(() => onDone?.());
    },
    [translateY, overlayOpacity, sheetHeight],
  );

  useEffect(() => {
    if (visible) {
      translateY.setValue(sheetHeight + 60);
      overlayOpacity.setValue(0);
      animateIn();
    }
  }, [visible, animateIn, sheetHeight, translateY, overlayOpacity]);

  const handleClose = useCallback(() => {
    animateOut(onClose);
  }, [animateOut, onClose]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.root}>
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={handleClose} accessibilityLabel="Close sheet">
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: colors.overlay, opacity: overlayOpacity },
            ]}
          />
        </TouchableWithoutFeedback>

        {/* Sheet */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.kavWrapper}
          pointerEvents="box-none"
        >
          <Animated.View
            style={[
              styles.sheet,
              {
                height: sheetHeight,
                backgroundColor: colors.surface2,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                borderWidth: 1,
                borderBottomWidth: 0,
                borderColor: glass.border,
                transform: [{ translateY }],
                ...glass.shadow,
              },
            ]}
          >
            {/* Drag handle */}
            <View style={styles.handleContainer} accessibilityRole="none">
              <View
                style={[
                  styles.handle,
                  { backgroundColor: colors.textMuted },
                ]}
              />
            </View>

            {/* Header */}
            {(title != null) && (
              <View
                style={[
                  styles.header,
                  { borderBottomColor: glass.border, borderBottomWidth: 1 },
                ]}
              >
                <Text
                  style={[
                    styles.title,
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
                <Pressable
                  onPress={handleClose}
                  style={({ pressed }) => [
                    styles.closeBtn,
                    {
                      backgroundColor: pressed
                        ? colors.surface3
                        : colors.surface1,
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Close"
                  hitSlop={8}
                >
                  <Ionicons
                    name="close"
                    size={18}
                    color={colors.textSecondary}
                  />
                </Pressable>
              </View>
            )}

            {/* Content */}
            <View style={[styles.content, { padding: spacing.base }]}>
              {children}
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {},
  kavWrapper: {
    justifyContent: 'flex-end',
  },
  sheet: {
    width: '100%',
    overflow: 'hidden',
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    opacity: 0.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  title: {
    flex: 1,
    marginRight: 12,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
});
