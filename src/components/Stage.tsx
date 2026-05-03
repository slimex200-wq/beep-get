import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { colors, spacing } from '../design/tokens';

export function Stage({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.crosshairTopLeft} />
        <View style={styles.crosshairTopRight} />
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.stage,
  },
  scroll: {
    minHeight: '100%',
    paddingHorizontal: spacing[5],
    paddingTop: spacing[5],
    paddingBottom: spacing[10],
    backgroundColor: colors.stage,
  },
  crosshairTopLeft: {
    position: 'absolute',
    left: 13,
    top: 14,
    width: 18,
    height: 1,
    backgroundColor: 'rgba(247,243,234,0.45)',
  },
  crosshairTopRight: {
    position: 'absolute',
    right: 13,
    top: 14,
    width: 18,
    height: 1,
    backgroundColor: 'rgba(247,243,234,0.45)',
  },
});
