import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../design/tokens';
import { type } from '../design/typography';
import { BlinkStrip } from './BlinkStrip';
import { DotRadar } from './DotRadar';
import { MetaRow } from './MetaRow';
import { SignalCode } from './SignalCode';
import { SlipFrame } from './SlipFrame';

export type WidgetState = 'empty' | 'incoming-beep' | 'incoming-blink' | 'sending' | 'sent' | 'failed';
export type WidgetPreviewSize = 'small' | 'medium';

type Props = {
  state: WidgetState;
  signal?: {
    code: string;
    sender: string;
    senderNo: string;
    time: string;
  } | null;
  stripFrameUris?: string[] | null;
  size?: WidgetPreviewSize;
};

export function WidgetCard({ state, signal, stripFrameUris, size = 'small' }: Props) {
  const senderLabel = signal ? `${signal.sender} - NO ${signal.senderNo}` : '민아 - NO 04';
  const code = signal?.code ?? '8282';
  const time = signal?.time ?? '14:56';
  const isMedium = size === 'medium';

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
          <SignalCode code={code} size="medium" />
          {isBlink ? <BlinkStrip compact frameUris={stripFrameUris} /> : null}
          <MetaRow label="FROM." value={senderLabel} />
          <MetaRow label="TIME." value={time} mono />
          {isMedium ? <MediumWidgetActions /> : null}
        </>
      )}
    </SlipFrame>
  );
}

function MediumWidgetActions() {
  return (
    <View style={styles.mediumActions}>
      {['OK', '8282', 'OPEN'].map((label) => (
        <View key={label} style={styles.mediumActionChip}>
          <Text style={styles.mediumActionText}>{label}</Text>
        </View>
      ))}
    </View>
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
  mediumActions: {
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[2],
  },
  mediumActionChip: {
    flex: 1,
    minHeight: 26,
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.ink,
  },
  mediumActionText: {
    ...type.tinyMono,
    color: colors.paperWarm,
  },
});
