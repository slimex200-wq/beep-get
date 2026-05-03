import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../design/tokens';
import { type } from '../design/typography';
import { ActionButton } from '../components/ActionButton';
import { AppSurface } from '../components/AppSurface';
import { HeaderBar } from '../components/HeaderBar';
import { StatusDot } from '../components/StatusDot';
import { WidgetCard } from '../components/WidgetCard';

const statusRows = [
  ['위젯 활성화', '●'],
  ['알림 켜짐', '●'],
  ['바로 답장 가능', '●'],
  ['마지막 테스트', '14:56'],
];

export function StudioScreen() {
  return (
    <AppSurface>
      <HeaderBar title="BEEP-GET STUDIO" right="⌘" showDot />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.panel}>
          <Text style={type.metaValue}>알림 및 상태</Text>
          {statusRows.map(([label, value]) => (
            <View key={label} style={styles.statusRow}>
              <Text style={type.bodyMuted}>{label}</Text>
              {value === '●' ? <StatusDot color={colors.greenDot} size={8} /> : <Text style={type.monoValue}>{value}</Text>}
            </View>
          ))}
        </View>
        <Text style={type.metaValue}>위젯 미리보기</Text>
        <View style={styles.previewRow}>
          <View style={styles.previewCard}>
            <WidgetCard state="incoming-beep" />
          </View>
          <View style={styles.sizeColumn}>
            <ActionButton label="SMALL" mono />
            <ActionButton label="MEDIUM" mono variant="dark" />
          </View>
        </View>
        <Text style={type.metaValue}>스킨</Text>
        <View style={styles.chips}>
          <ActionButton label="크림" flex />
          <ActionButton label="LCD" flex variant="success" />
          <ActionButton label="야간" flex variant="dark" />
        </View>
        <Text style={type.metaValue}>바로 답장 슬롯</Text>
        <View style={styles.chips}>
          {['OK', '8282', '486', '열기'].map((label) => (
            <ActionButton key={label} label={label} mono={/^[0-9A-Z]+$/.test(label)} flex />
          ))}
        </View>
        <ActionButton label="테스트 Beep 보내기   ›" variant="dark" />
      </ScrollView>
    </AppSurface>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[8],
    gap: spacing[4],
  },
  panel: {
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    borderRadius: 12,
    padding: spacing[5],
    gap: spacing[3],
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  statusRow: {
    height: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.rule,
  },
  previewRow: {
    flexDirection: 'row',
    gap: spacing[4],
    alignItems: 'stretch',
  },
  previewCard: {
    flex: 1,
  },
  sizeColumn: {
    width: 88,
    gap: spacing[3],
  },
  chips: {
    flexDirection: 'row',
    gap: spacing[3],
  },
});
