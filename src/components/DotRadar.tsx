import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '../design/tokens';
import { type } from '../design/typography';
import { useAppPalette } from '../design/appTheme';
import { StatusDot } from './StatusDot';

type Props = {
  size?: number;
  label?: string;
  style?: ViewStyle;
};

export function DotRadar({ size = 180, label = 'CLOSE\nCIRCUIT\n07', style }: Props) {
  const palette = useAppPalette();
  const ringSizes = [size, size * 0.74, size * 0.48, size * 0.24];
  return (
    <View style={[styles.wrap, { width: size, height: size }, style]}>
      {ringSizes.map((ringSize) => (
        <View
          key={ringSize}
          style={[
            styles.ring,
            { borderColor: palette.rule },
            {
              width: ringSize,
              height: ringSize,
              borderRadius: ringSize / 2,
              left: (size - ringSize) / 2,
              top: (size - ringSize) / 2,
            },
          ]}
        />
      ))}
      <StatusDot size={8} style={{ left: size / 2 - 4, top: size / 2 - 4, position: 'absolute' }} />
      <StatusDot size={5} color={palette.text} style={{ left: size * 0.18, top: size * 0.31, position: 'absolute' }} />
      <StatusDot size={5} color={palette.text} style={{ left: size * 0.71, top: size * 0.23, position: 'absolute' }} />
      <StatusDot size={5} color={palette.text} style={{ left: size * 0.27, top: size * 0.68, position: 'absolute' }} />
      <StatusDot size={5} color={palette.text} style={{ left: size * 0.81, top: size * 0.63, position: 'absolute' }} />
      <Text style={[type.tinyMono, styles.label, { color: palette.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(10,10,10,0.16)',
    borderStyle: 'dashed',
  },
  label: {
    color: colors.ink,
    textAlign: 'center',
    letterSpacing: 0.9,
  },
});
