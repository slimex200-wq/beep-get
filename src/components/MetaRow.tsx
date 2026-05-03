import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../design/tokens';
import { type } from '../design/typography';

type Props = {
  label: string;
  value: string;
  mono?: boolean;
};

export function MetaRow({ label, value, mono = false }: Props) {
  return (
    <View style={styles.row}>
      <Text style={type.metaLabel}>{label}</Text>
      <Text style={mono ? type.monoValue : type.metaValue}>{value}</Text>
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
