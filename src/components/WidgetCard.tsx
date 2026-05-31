import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../design/tokens';
import { type } from '../design/typography';
import { useAppPalette } from '../design/appTheme';
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
  const palette = useAppPalette();
  const senderLabel = signal ? `${signal.sender} - NO ${signal.senderNo}` : 'Mina - NO 04';
  const code = signal?.code ?? '8282';
  const time = signal?.time ?? '14:56';
  const isMedium = size === 'medium';

  if (state === 'sent') {
    return (
      <SlipFrame title="Sent Beep" variant="success" compact accent={false}>
        <View style={styles.centerState}>
          <Text style={styles.check}>✓</Text>
          <MetaRow label="TO." value="Mina - NO 04" />
          <MetaRow label="TIME." value="14:57" mono />
        </View>
      </SlipFrame>
    );
  }

  if (state === 'failed') {
    return (
      <SlipFrame title="Send Failed" variant="danger" compact>
        <View style={styles.centerState}>
          <Text style={styles.x}>×</Text>
          <MetaRow label="TO." value="Mina - NO 04" />
          <View style={styles.redButton}>
            <Text style={[type.button, styles.redButtonText]}>OPEN APP</Text>
          </View>
        </View>
      </SlipFrame>
    );
  }

  if (state === 'sending') {
    return (
      <SlipFrame title="Sending..." compact>
        <View style={styles.centerState}>
          <DotRadar size={104} label="" />
          <MetaRow label="TO." value="Mina - NO 04" />
          <MetaRow label="TIME." value="00:02 / 02.0" mono />
        </View>
      </SlipFrame>
    );
  }

  const isBlink = state === 'incoming-blink';
  const isEmpty = state === 'empty';

  return (
    <SlipFrame title={isBlink ? 'Incoming Blink' : 'Incoming Beep'} compact accent={!isEmpty}>
      {isEmpty ? (
        <View style={styles.emptyBlock}>
          <Text style={[type.tinyMono, styles.emptyLabel, { color: palette.muted }]}>NO.</Text>
          <Text style={[type.codeMedium, styles.emptyCode, { color: palette.text }]}>----</Text>
          <MetaRow label="FROM." value="—" />
          <MetaRow label="TIME." value="—" />
        </View>
      ) : (
        <>
          <Text style={[type.tinyMono, { color: palette.muted }]}>NO.</Text>
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
