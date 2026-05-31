import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../design/tokens';
import { type } from '../design/typography';
import { useAppPalette, type AppPalette } from '../design/appTheme';
import { StatusDot } from './StatusDot';

type Props = {
  title: string;
  left?: string;
  right?: string;
  showDot?: boolean;
  onLeftPress?: () => void;
  onRightPress?: () => void;
};

export function HeaderBar({ title, left = '', right = '', showDot = false, onLeftPress, onRightPress }: Props) {
  const palette = useAppPalette();
  return (
    <View style={styles.header}>
      <SideSlot label={left} onPress={onLeftPress} palette={palette} />
      <Text style={[type.appTitle, styles.title, { color: palette.text }]}>{title}</Text>
      <SideSlot label={right} onPress={onRightPress} showDot={showDot} palette={palette} />
    </View>
  );
}

function SideSlot({ label, onPress, showDot = false, palette }: { label?: string; onPress?: () => void; showDot?: boolean; palette: AppPalette }) {
  const hasLabel = Boolean(label);
  const content = (
    <>
      {hasLabel ? <Text style={[styles.sideText, { color: palette.text }]}>{label}</Text> : null}
      {showDot ? <StatusDot size={6} style={styles.dot} /> : null}
    </>
  );

  if (onPress && hasLabel) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [
          styles.sideSlot,
          styles.sideAction,
          { backgroundColor: palette.chip, borderColor: palette.ruleStrong },
          pressed && styles.pressed,
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={styles.sideSlot}>{content}</View>;
}

const styles = StyleSheet.create({
  header: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
  },
  sideSlot: {
    width: 68,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideAction: {
    minHeight: 34,
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  sideText: {
    fontFamily: type.tinyMono.fontFamily,
    fontSize: 10,
    lineHeight: 13,
    letterSpacing: 0.7,
    color: colors.ink,
    fontWeight: '700',
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
  pressed: {
    transform: [{ translateY: 1 }],
    opacity: 0.84,
  },
  dot: {
    position: 'absolute',
    right: 10,
    top: 9,
  },
});
