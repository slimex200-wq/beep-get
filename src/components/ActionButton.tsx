import React, { useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
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
  icon?: React.ReactNode | ((color: string) => React.ReactNode);
  iconPosition?: 'left' | 'right';
  animateIconOnPress?: boolean;
  accessibilityLabel?: string;
};

export function ActionButton({
  label,
  variant = 'light',
  mono = false,
  flex = false,
  onPress,
  disabled = false,
  style,
  icon,
  iconPosition = 'left',
  animateIconOnPress = false,
  accessibilityLabel,
}: Props) {
  const palette = useAppPalette();
  const iconFlight = useRef(new Animated.Value(0)).current;
  const isDisabled = disabled || !onPress;
  const foregroundColor =
    variant === 'dark'
      ? palette.primaryText
      : variant === 'danger'
        ? colors.white
        : variant === 'kakao'
          ? '#191600'
          : palette.text;
  const iconNode = typeof icon === 'function' ? icon(foregroundColor) : icon;

  const flyIcon = () => {
    iconFlight.stopAnimation();
    iconFlight.setValue(0);
    Animated.timing(iconFlight, {
      toValue: 1,
      duration: 520,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => iconFlight.setValue(0));
  };

  const handlePress = () => {
    if (isDisabled) return;
    if (animateIconOnPress && iconNode) flyIcon();
    onPress();
  };

  const iconFlightStyle = animateIconOnPress
    ? {
        opacity: iconFlight.interpolate({
          inputRange: [0, 0.68, 1],
          outputRange: [1, 1, 0],
        }),
        transform: [
          {
            translateX: iconFlight.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 24],
            }),
          },
          {
            translateY: iconFlight.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -10],
            }),
          },
          {
            rotate: iconFlight.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '-18deg'],
            }),
          },
        ],
      }
    : undefined;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      onPress={handlePress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        flex && styles.flex,
        variant === 'light' && { backgroundColor: palette.chip, borderColor: palette.rule },
        variant === 'dark' && { backgroundColor: palette.primary, borderColor: palette.primary },
        variant === 'ghost' && { backgroundColor: colors.transparent, borderColor: palette.rule },
        variant === 'danger' && styles.danger,
        variant === 'success' && styles.success,
        variant === 'kakao' && styles.kakao,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      <View style={styles.content}>
        {iconNode && iconPosition === 'left' ? (
          <Animated.View style={[styles.iconWrap, iconFlightStyle]}>{iconNode}</Animated.View>
        ) : null}
        <Text
          style={[
            mono ? type.buttonMono : type.button,
            { color: foregroundColor },
          ]}
        >
          {label}
        </Text>
        {iconNode && iconPosition === 'right' ? (
          <Animated.View style={[styles.iconWrap, iconFlightStyle]}>{iconNode}</Animated.View>
        ) : null}
      </View>
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
  content: {
    minHeight: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  },
  iconWrap: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
});
