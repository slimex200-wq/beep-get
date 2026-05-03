import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../design/tokens';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export function AppSurface({ children, style }: Props) {
  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <StatusBar style="dark" backgroundColor={colors.paper} />
      <View style={[styles.surface, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  surface: {
    flex: 1,
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
    backgroundColor: colors.paper,
  },
});
