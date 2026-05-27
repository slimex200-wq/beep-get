import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { StatusBar, type StatusBarStyle } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../design/tokens';
import { useAppPalette } from '../design/appTheme';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  backgroundColor?: string;
  statusBarStyle?: StatusBarStyle;
};

export function AppSurface({
  children,
  style,
  backgroundColor,
  statusBarStyle,
}: Props) {
  const palette = useAppPalette();
  const usesThemeBackground =
    !backgroundColor || backgroundColor === colors.paper || backgroundColor === "#F8F6F1";
  const resolvedBackground = usesThemeBackground ? palette.background : backgroundColor;
  const resolvedStatusBarStyle = statusBarStyle ?? palette.statusBar;

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: resolvedBackground }]}>
      <StatusBar style={resolvedStatusBarStyle} backgroundColor={resolvedBackground} />
      <View style={[styles.surface, { backgroundColor: resolvedBackground }, style]}>{children}</View>
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
