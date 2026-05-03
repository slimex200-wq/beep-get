import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../design/tokens';
import { type } from '../design/typography';
import { ActionButton } from '../components/ActionButton';
import { HeaderBar } from '../components/HeaderBar';
import { MetaRow } from '../components/MetaRow';
import { PagerFrame } from '../components/PagerFrame';
import { SignalCode } from '../components/SignalCode';
import { SlipFrame } from '../components/SlipFrame';

export function SendBeepScreen() {
  return (
    <PagerFrame>
      <HeaderBar title="보낼 Beep" left="취소" right="기록" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SlipFrame title="보낼 Beep" accent={false}>
          <View style={styles.recipientRow}>
            <View style={styles.recipientText}>
              <MetaRow label="TO." value="민아 - NO 04" />
            </View>
            <View style={styles.stamp}>
              <Text style={type.tinyMono}>CODE</Text>
              <Text style={type.codeSmall}>04</Text>
            </View>
          </View>
          <View style={styles.codeArea}>
            <Text style={type.tinyMono}>CODE.</Text>
            <SignalCode code="486_" />
          </View>
          <Text style={type.tinyMono}>PRESET</Text>
          <View style={styles.presets}>
            {['8282', '486', '000', '1004'].map((code) => (
              <ActionButton key={code} label={code} mono flex variant={code === '486' ? 'dark' : 'light'} />
            ))}
          </View>
          <View style={styles.memo}>
            <Text style={type.tinyMono}>MEMO (선택)</Text>
            <Text style={type.body}>같이 저녁 어때?</Text>
            <Text style={[type.tinyMono, styles.counter]}>12 / 40</Text>
          </View>
        </SlipFrame>
        <ActionButton label="비프 보내기   ›" variant="dark" />
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
  recipientRow: {
    flexDirection: 'row',
    gap: spacing[5],
    alignItems: 'center',
  },
  recipientText: {
    flex: 1,
  },
  stamp: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-8deg' }],
  },
  codeArea: {
    marginTop: spacing[6],
    marginBottom: spacing[4],
  },
  presets: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[3],
  },
  memo: {
    marginTop: spacing[5],
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radius.control,
    position: 'relative',
  },
  counter: {
    position: 'absolute',
    right: spacing[4],
    bottom: spacing[4],
  },
});
