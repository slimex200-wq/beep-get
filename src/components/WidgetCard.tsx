import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../design/tokens';
import { type } from '../design/typography';
import { BlinkStrip } from './BlinkStrip';
import { DotRadar } from './DotRadar';
import { MetaRow } from './MetaRow';
import { SignalCode } from './SignalCode';
import { SlipFrame } from './SlipFrame';
import { StatusDot } from './StatusDot';

export type WidgetState = 'empty' | 'incoming-beep' | 'incoming-blink' | 'sending' | 'sent' | 'failed';

type Props = {
  state: WidgetState;
};

export function WidgetCard({ state }: Props) {
  if (state === 'sent') {
    return (
      <SlipFrame title="보냄" variant="success" compact accent={false}>
        <View style={styles.centerState}>
          <Text style={styles.check}>✓</Text>
          <MetaRow label="TO." value="민아 - NO 04" />
          <MetaRow label="TIME." value="14:57" mono />
        </View>
      </SlipFrame>
    );
  }

  if (state === 'failed') {
    return (
      <SlipFrame title="전송 실패" variant="danger" compact>
        <View style={styles.centerState}>
          <Text style={styles.x}>×</Text>
          <MetaRow label="TO." value="민아 - NO 04" />
          <View style={styles.redButton}>
            <Text style={[type.button, styles.redButtonText]}>앱 열기</Text>
          </View>
        </View>
      </SlipFrame>
    );
  }

  if (state === 'sending') {
    return (
      <SlipFrame title="전송 중..." compact>
        <View style={styles.centerState}>
          <DotRadar size={104} label="" />
          <MetaRow label="TO." value="민아 - NO 04" />
          <MetaRow label="TIME." value="00:02 / 02.0" mono />
        </View>
      </SlipFrame>
    );
  }

  const isBlink = state === 'incoming-blink';
  const isEmpty = state === 'empty';

  return (
    <SlipFrame title={isBlink ? '도착한 Blink' : '도착한 Beep'} compact accent={!isEmpty}>
      {isEmpty ? (
        <View style={styles.emptyBlock}>
          <Text style={[type.tinyMono, styles.emptyLabel]}>NO.</Text>
          <Text style={[type.codeMedium, styles.emptyCode]}>----</Text>
          <MetaRow label="FROM." value="—" />
          <MetaRow label="TIME." value="—" />
        </View>
      ) : (
        <>
          <Text style={type.tinyMono}>NO.</Text>
          <SignalCode code="8282" size="medium" />
          {isBlink ? <BlinkStrip compact /> : null}
          <MetaRow label="FROM." value="민아 - NO 04" />
          <MetaRow label="TIME." value="14:56" mono />
        </>
      )}
    </SlipFrame>
  );
}

const styles = StyleSheet.create({
  emptyBlock: {
    gap: spacing[2],
  },
  emptyLabel: {
    color: colors.muted,
  },
  emptyCode: {
    textAlign: 'center',
    color: colors.ink,
  },
  centerState: {
    gap: spacing[4],
    alignItems: 'stretch',
  },
  check: {
    fontSize: 48,
    lineHeight: 60,
    textAlign: 'center',
    color: colors.ink,
  },
  x: {
    fontSize: 48,
    lineHeight: 60,
    textAlign: 'center',
    color: colors.red,
  },
  redButton: {
    backgroundColor: colors.red,
    borderRadius: radius.button,
    paddingVertical: spacing[4],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.redDeep,
  },
  redButtonText: {
    color: colors.white,
  },
});
