import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
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
  const route = useRoute<RouteProp<RootStackParamList, 'WidgetStates'>>();
  const size = route.params?.size ?? 'small';
  const closeToStudio = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate("StudioTools");
  };

  return (
    <AppSurface>
      <HeaderBar title="WIDGET STATES" left="CLOSE" right="" onLeftPress={closeToStudio} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sizePanel}>
          <Text style={type.tinyMono}>ACTIVE PREVIEW</Text>
          <Text style={type.metaValue}>{size.toUpperCase()} WIDGET</Text>
          <Text style={type.bodyMuted}>
            {size === 'medium'
              ? 'Medium preview includes the widget reply chips: OK / 8282 / OPEN.'
              : 'Small preview focuses on the latest incoming slip.'}
          </Text>
        </View>
        <View style={styles.grid}>
          {states.map((item) => (
            <View key={item.state} style={styles.cell}>
              <Text style={type.tinyMono}>{item.label}</Text>
              <WidgetCard state={item.state} size={size} />
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
  sizePanel: {
    gap: spacing[2],
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  cell: {
    gap: spacing[3],
  },
});
