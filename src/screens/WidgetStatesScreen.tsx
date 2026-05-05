import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing } from '../design/tokens';
import { type } from '../design/typography';
import { AppSurface } from '../components/AppSurface';
import { HeaderBar } from '../components/HeaderBar';
import { WidgetCard, WidgetState } from '../components/WidgetCard';
import type { RootStackParamList } from '../navigation/RootNavigator';

const states: Array<{ label: string; state: WidgetState }> = [
  { label: '01 비어 있음', state: 'empty' },
  { label: '02 도착한 Beep', state: 'incoming-beep' },
  { label: '03 도착한 Blink', state: 'incoming-blink' },
  { label: '04 전송 중', state: 'sending' },
  { label: '05 보냄', state: 'sent' },
  { label: '06 앱 열기', state: 'failed' },
];

export function WidgetStatesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <AppSurface>
      <HeaderBar title="WIDGET STATES" left="CLOSE" right="" onLeftPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
  grid: {
    gap: spacing[5],
  },
  cell: {
    gap: spacing[3],
  },
});
