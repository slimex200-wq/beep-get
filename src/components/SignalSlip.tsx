import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../design/tokens';
import { type } from '../design/typography';
import { Signal } from '../data/mockSignals';
import { SlipFrame } from './SlipFrame';
import { SignalCode } from './SignalCode';
import { MetaRow } from './MetaRow';

type Props = {
  signal: Signal;
  title?: string;
  compact?: boolean;
};

export function SignalSlip({ signal, title = '도착한 Beep', compact = false }: Props) {
  return (
    <SlipFrame title={title} compact={compact}>
      <Text style={type.tinyMono}>NO.</Text>
      <SignalCode code={signal.code} size={compact ? 'medium' : 'hero'} />
      <View style={styles.metaBlock}>
        <MetaRow label="FROM." value={`${signal.sender} - NO ${signal.senderNo}`} />
        <MetaRow label="TIME." value={signal.time} mono />
        {signal.note ? <MetaRow label="NOTE." value={signal.note} /> : null}
      </View>
    </SlipFrame>
  );
}

const styles = StyleSheet.create({
  metaBlock: {
    marginTop: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
  },
});
