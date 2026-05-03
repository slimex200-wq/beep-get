import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../design/tokens';
import { type } from '../design/typography';
import { Signal } from '../data/mockSignals';
import { StatusDot } from './StatusDot';

type Props = {
  item: Signal;
};

export function TicketLogRow({ item }: Props) {
  const isExpired = item.status === 'expired';
  return (
    <View style={[styles.row, isExpired && styles.expired]}>
      <View style={styles.codeColumn}>
        <Text style={type.tinyMono}>NO.</Text>
        <Text style={type.codeMedium}>{item.code}</Text>
      </View>
      <View style={styles.infoColumn}>
        <Text style={type.metaValue}>{item.sender}</Text>
        <Text style={type.bodyMuted}>{item.note}</Text>
        <Text style={type.monoValue}>{item.time}</Text>
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
