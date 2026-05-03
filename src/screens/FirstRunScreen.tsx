import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../design/tokens';
import { type } from '../design/typography';
import { ActionButton } from '../components/ActionButton';
import { PagerFrame } from '../components/PagerFrame';
import { SignalSlip } from '../components/SignalSlip';
import { latestSignal } from '../data/mockSignals';

export function FirstRunScreen() {
  return (
    <PagerFrame>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.systemRow}>
          <Text style={type.tinyMono}>+</Text>
          <Text style={type.tinyMono}>BEEP-GET SYSTEM{`\n`}VER 1.0</Text>
        </View>
        <Text style={styles.signalIcon}>⌾</Text>
        <Text style={styles.logo}>BEEP-GET</Text>
        <Text style={styles.subtitle}>친한 친구끼리 쓰는 작은 호출기</Text>
        <SignalSlip signal={latestSignal} title="도착한 Beep" compact />
        <View style={styles.buttons}>
          <ActionButton label="   Apple로 시작" variant="dark" />
          <ActionButton label="G   Google로 시작" variant="light" />
        </View>
        <View style={styles.footerStamp}>
          <Text style={type.tinyMono}>PRIVATE PAGER{`\n`}FOR CLOSE FRIENDS</Text>
        </View>
      </ScrollView>
    </PagerFrame>
  );
}

const styles = StyleSheet.create({
  content: {
    minHeight: 640,
    padding: spacing[6],
    justifyContent: 'center',
    gap: spacing[5],
  },
  systemRow: {
    position: 'absolute',
    top: spacing[5],
    left: spacing[6],
    right: spacing[6],
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signalIcon: {
    textAlign: 'center',
    color: colors.ink,
    fontSize: 38,
    lineHeight: 44,
  },
  logo: {
    fontFamily: 'monospace',
    color: colors.ink,
    fontSize: 42,
    lineHeight: 48,
    textAlign: 'center',
    fontWeight: '900',
    letterSpacing: -2.2,
  },
  subtitle: {
    ...type.bodyMuted,
    textAlign: 'center',
    color: colors.ink,
    marginTop: -spacing[4],
  },
  buttons: {
    gap: spacing[4],
    marginTop: spacing[3],
  },
  footerStamp: {
    alignSelf: 'flex-start',
    marginTop: spacing[4],
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
});
