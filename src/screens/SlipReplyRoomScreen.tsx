import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { spacing } from '../design/tokens';
import { ActionButton } from '../components/ActionButton';
import { BlinkStrip } from '../components/BlinkStrip';
import { HeaderBar } from '../components/HeaderBar';
import { PagerFrame } from '../components/PagerFrame';
import { SignalSlip } from '../components/SignalSlip';
import { latestSignal } from '../data/mockSignals';

export function ReplyRoomScreen() {
  return (
    <PagerFrame>
      <HeaderBar title="NO. 8282" left="‹" right="•••" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SignalSlip signal={latestSignal} title="도착한 Beep" />
        <BlinkStrip />
        <View style={styles.replyRow}>
          <ActionButton label="OK" mono flex />
          <ActionButton label="8282" mono flex />
          <ActionButton label="486" mono flex />
        </View>
        <ActionButton label="✳  Blink로 답장" variant="ghost" />
        <ActionButton label="기록  ▱" variant="ghost" />
      </ScrollView>
    </PagerFrame>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[8],
    gap: spacing[5],
  },
  replyRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
});
