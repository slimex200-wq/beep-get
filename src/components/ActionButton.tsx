import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../design/tokens';
import { type } from '../design/typography';

type Variant = 'light' | 'dark' | 'ghost' | 'danger' | 'success';

type Props = {
  label: string;
  variant?: Variant;
  mono?: boolean;
  flex?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
};

export function ActionButton({ label, variant = 'light', mono = false, flex = false, onPress, style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        flex && styles.flex,
        styles[variant],
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text style={[mono ? type.buttonMono : type.button, variant === 'dark' && styles.darkText, variant === 'danger' && styles.dangerText]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 39,
    paddingHorizontal: spacing[5],
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.ruleStrong,
  },
  flex: {
    flex: 1,
  },
  light: {
    backgroundColor: 'rgba(255,255,255,0.23)',
  },
  dark: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  ghost: {
    backgroundColor: colors.transparent,
  },
  danger: {
    backgroundColor: colors.red,
    borderColor: colors.redDeep,
  },
  success: {
    backgroundColor: colors.lcd,
    borderColor: colors.green,
  },
  pressed: {
    transform: [{ translateY: 1 }],
    opacity: 0.86,
  },
  darkText: {
    color: colors.paperWarm,
  },
  dangerText: {
    color: colors.white,
  },
});
