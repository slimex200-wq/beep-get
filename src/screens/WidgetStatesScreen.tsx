import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../design/tokens';
import { type } from '../design/typography';
import { AppSurface } from '../components/AppSurface';
import { WidgetCard, WidgetState } from '../components/WidgetCard';

const states: Array<{ label: string; state: WidgetState }> = [
  { label: '01 비어 있음', state: 'empty' },
  { label: '02 도착한 Beep', state: 'incoming-beep' },
  { label: '03 도착한 Blink', state: 'incoming-blink' },
  { label: '04 전송 중', state: 'sending' },
  { label: '05 보냄', state: 'sent' },
  { label: '06 앱 열기', state: 'failed' },
];

export function WidgetStatesScreen() {
  return (
    <AppSurface>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>WIDGET STATES</Text>
        <View style={styles.grid}>
          {states.map((item) => (
            <View key={item.state} style={styles.cell}>
              <Text style={type.tinyMono}>{item.label}</Text>
              <WidgetCard state={item.state} />
            </View>
          ))}
        </View>
      </ScrollView>
    </AppSurface>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing[5],
    paddingBottom: spacing[8],
    gap: spacing[5],
  },
  header: {
    ...type.appTitle,
    color: colors.ink,
    textAlign: 'center',
  },
  grid: {
    gap: spacing[5],
  },
  cell: {
    gap: spacing[3],
  },
});
