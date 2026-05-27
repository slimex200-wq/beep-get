import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../design/tokens';
import { type } from '../design/typography';
import { useAppPalette } from '../design/appTheme';

type Variant = 'light' | 'dark' | 'ghost' | 'danger' | 'success' | 'kakao';

type Props = {
  label: string;
  variant?: Variant;
  mono?: boolean;
  flex?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
};

export function ActionButton({ label, variant = 'light', mono = false, flex = false, onPress, disabled = false, style }: Props) {
  const palette = useAppPalette();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        flex && styles.flex,
        variant === 'light' && { backgroundColor: palette.chip, borderColor: palette.rule },
        variant === 'dark' && { backgroundColor: palette.primary, borderColor: palette.primary },
        variant === 'ghost' && { backgroundColor: colors.transparent, borderColor: palette.rule },
        variant === 'danger' && styles.danger,
        variant === 'success' && styles.success,
        variant === 'kakao' && styles.kakao,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text
        style={[
          mono ? type.buttonMono : type.button,
          { color: variant === 'dark' ? palette.primaryText : palette.text },
          variant === 'danger' && styles.dangerText,
          variant === 'kakao' && styles.kakaoText,
        ]}
      >
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
  danger: {
    backgroundColor: colors.red,
    borderColor: colors.redDeep,
  },
  success: {
    backgroundColor: colors.lcd,
    borderColor: colors.green,
  },
  kakao: {
    backgroundColor: '#FEE500',
    borderColor: '#D6BE00',
  },
  pressed: {
    transform: [{ translateY: 1 }],
    opacity: 0.86,
  },
  disabled: {
    opacity: 0.44,
  },
  dangerText: {
    color: colors.white,
  },
  kakaoText: {
    color: '#191600',
  },
});
