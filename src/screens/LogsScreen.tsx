import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../design/tokens';
import { type } from '../design/typography';
import { HeaderBar } from '../components/HeaderBar';
import { PagerFrame } from '../components/PagerFrame';
import { StatusDot } from '../components/StatusDot';
import { TicketLogRow } from '../components/TicketLogRow';
import { logs } from '../data/mockSignals';

export function LogsScreen() {
  return (
    <PagerFrame variant="cream">
      <HeaderBar title="BEEP-GET LOG" right="•••" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <Text style={type.metaValue}>기록 목록</Text>
          <StatusDot size={7} />
        </View>
        <View style={styles.list}>
          {logs.map((item) => (
            <TicketLogRow key={item.id} item={item} />
          ))}
        </View>
        <View style={styles.note}>
          <Text style={type.tinyMono}>NOTE.</Text>
          <Text style={type.bodyMuted}>만료된 Blink는 슬립 메타데이터만 기록되며, 3 프레임 이미지는 보관되지 않습니다.</Text>
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
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  list: {
    gap: spacing[3],
  },
  note: {
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    borderRadius: radius.control,
    padding: spacing[5],
    gap: spacing[2],
  },
  pull: {
    textAlign: 'center',
  },
});
