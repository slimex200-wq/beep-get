import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { StatusBar, type StatusBarStyle } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../design/tokens';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  backgroundColor?: string;
  statusBarStyle?: StatusBarStyle;
};

export function AppSurface({
  children,
  style,
  backgroundColor = colors.paper,
  statusBarStyle = 'dark',
}: Props) {
  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor }]}>
      <StatusBar style={statusBarStyle} backgroundColor={backgroundColor} />
      <View style={[styles.surface, { backgroundColor }, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  surface: {
    flex: 1,
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
  },
});
