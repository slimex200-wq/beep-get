import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../design/tokens';
import { type } from '../design/typography';
import { useAppPalette } from '../design/appTheme';
import { Signal } from '../data/mockSignals';
import { StatusDot } from './StatusDot';

type Props = {
  item: Signal;
};

export function TicketLogRow({ item }: Props) {
  const palette = useAppPalette();
  const isExpired = item.status === 'expired';
  return (
    <View style={[styles.row, { backgroundColor: palette.card, borderColor: palette.ruleStrong }, isExpired && styles.expired]}>
      <View style={styles.codeColumn}>
        <Text style={[type.tinyMono, { color: palette.muted }]}>NO.</Text>
        <Text style={[type.codeMedium, { color: palette.text }]}>{item.code}</Text>
      </View>
      <View style={styles.infoColumn}>
        <Text style={[type.metaValue, { color: palette.text }]}>{item.sender}</Text>
        <Text style={[type.bodyMuted, { color: palette.muted }]}>{item.note}</Text>
        <Text style={[type.monoValue, { color: palette.text }]}>{item.time}</Text>
      </View>
      <StatusDot size={7} color={isExpired ? colors.faint : colors.red} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 92,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[5],
    padding: spacing[5],
    backgroundColor: colors.paperWarm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.ruleStrong,
    borderRadius: radius.slipSmall,
  },
  expired: {
    opacity: 0.78,
  },
  codeColumn: {
    minWidth: 112,
  },
  infoColumn: {
    flex: 1,
    gap: spacing[1],
  },
});
