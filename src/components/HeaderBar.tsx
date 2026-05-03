import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../design/tokens';
import { type } from '../design/typography';
import { StatusDot } from './StatusDot';

type Props = {
  title: string;
  left?: string;
  right?: string;
  showDot?: boolean;
  onLeftPress?: () => void;
  onRightPress?: () => void;
};

export function HeaderBar({ title, left = '☰', right = '•••', showDot = false, onLeftPress, onRightPress }: Props) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onLeftPress} style={styles.sideButton}>
        <Text style={styles.sideText}>{left}</Text>
      </Pressable>
      <Text style={[type.appTitle, styles.title]}>{title}</Text>
      <Pressable onPress={onRightPress} style={styles.sideButton}>
        <Text style={styles.sideText}>{right}</Text>
        {showDot ? <StatusDot size={6} style={styles.dot} /> : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[5],
  },
  sideButton: {
    width: 48,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideText: {
    fontSize: 19,
    color: colors.ink,
    fontWeight: '700',
  },
  title: {
    textAlign: 'center',
  },
  dot: {
    position: 'absolute',
    right: 9,
    top: 8,
  },
});
