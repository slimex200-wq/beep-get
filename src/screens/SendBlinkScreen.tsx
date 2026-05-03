import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../design/tokens';
import { type } from '../design/typography';
import { ActionButton } from '../components/ActionButton';
import { BlinkStrip } from '../components/BlinkStrip';
import { CameraLensPanel } from '../components/CameraLensPanel';
import { HeaderBar } from '../components/HeaderBar';
import { MetaRow } from '../components/MetaRow';
import { PagerFrame } from '../components/PagerFrame';
import { SlipFrame } from '../components/SlipFrame';

type Props = {
  modeSwitch?: React.ReactNode;
};

export function SendBlinkScreen({ modeSwitch }: Props = {}) {
  return (
    <PagerFrame>
      <HeaderBar title="보낼 Blink" left="취소" right="기록" />
      {modeSwitch}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SlipFrame title="보낼 Blink" accent={false}>
          <View style={styles.recipientRow}>
            <View style={styles.recipientText}>
              <MetaRow label="TO." value="민아 - NO 04" />
            </View>
            <View style={styles.stamp}>
              <Text style={type.tinyMono}>CODE</Text>
              <Text style={type.codeSmall}>04</Text>
            </View>
          </View>
          <View style={styles.cameraBlock}>
            <CameraLensPanel />
          </View>
          <Text style={type.tinyMono}>PREVIEW  3 FRAMES</Text>
          <BlinkStrip compact />
        </SlipFrame>
        <View style={styles.actions}>
          <ActionButton label="다시 찍기" flex />
          <ActionButton label="Blink 보내기   ›" variant="dark" flex />
        </View>
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
  cameraBlock: {
    marginVertical: spacing[5],
  },
  actions: {
    flexDirection: 'row',
    gap: spacing[3],
  },
});
