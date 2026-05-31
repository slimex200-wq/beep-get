import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../design/tokens';
import { type } from '../design/typography';
import { useAppPalette } from '../design/appTheme';

type Props = {
  label: string;
  value: string;
  mono?: boolean;
};

export function MetaRow({ label, value, mono = false }: Props) {
  const palette = useAppPalette();
  return (
    <View style={[styles.row, { borderTopColor: palette.rule }]}>
      <Text style={[type.metaLabel, { color: palette.muted }]}>{label}</Text>
      <Text style={[mono ? type.monoValue : type.metaValue, { color: palette.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 22,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.rule,
    gap: spacing[4],
  },
});
