import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../design/tokens';
import { type } from '../design/typography';
import { ActionButton } from '../components/ActionButton';
import { HeaderBar } from '../components/HeaderBar';
import { PagerFrame } from '../components/PagerFrame';
import { SignalSlip } from '../components/SignalSlip';
import { StatusDot } from '../components/StatusDot';
import { latestSignal, signalQueue } from '../data/mockSignals';

export function TodayScreen() {
  return (
    <PagerFrame>
      <HeaderBar title="BEEP-GET" right="⌘" showDot />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SignalSlip signal={latestSignal} title="도착한 Beep" />
        <View style={styles.quickRow}>
          <ActionButton label="OK" mono flex />
          <ActionButton label="8282" mono flex />
          <ActionButton label="열기" variant="dark" flex />
        </View>
        <ActionButton label="저장" variant="ghost" />
        <View style={styles.queue}>
          {signalQueue.map((item) => (
            <View key={item.id} style={styles.queueRow}>
              <View style={styles.noColumn}>
                <Text style={type.tinyMono}>NO.</Text>
                <Text style={type.codeSmall}>{item.code}</Text>
              </View>
              <View style={styles.fromColumn}>
                <Text style={type.tinyMono}>FROM.</Text>
                <Text style={type.metaValue}>{item.sender}</Text>
              </View>
              <Text style={type.monoValue}>{item.time}</Text>
              <StatusDot size={7} color={item.status === 'new' ? colors.red : colors.faint} />
            </View>
          ))}
        </View>
        <Text style={[type.tinyMono, styles.pull]}>↓ PULL TO REFRESH</Text>
      </ScrollView>
    </PagerFrame>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[8],
    gap: spacing[4],
  },
  quickRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  queue: {
    gap: spacing[2],
    marginTop: spacing[3],
  },
  queueRow: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
    paddingHorizontal: spacing[4],
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    backgroundColor: colors.paperWarm,
    borderRadius: 10,
  },
  noColumn: {
    width: 86,
  },
  fromColumn: {
    flex: 1,
  },
  pull: {
    textAlign: 'center',
    marginTop: spacing[2],
  },
});
