import React from 'react';
import { StyleSheet, Text, TextStyle } from 'react-native';
import { type } from '../design/typography';
import { useAppPalette } from '../design/appTheme';

type Props = {
  code: string;
  size?: 'hero' | 'medium' | 'small';
  style?: TextStyle;
};

export function SignalCode({ code, size = 'hero', style }: Props) {
  const palette = useAppPalette();
  const textStyle = size === 'hero' ? type.codeHero : size === 'medium' ? type.codeMedium : type.codeSmall;
  return <Text style={[textStyle, styles.center, { color: palette.text }, style]}>{code}</Text>;
}

const styles = StyleSheet.create({
  center: {
    textAlign: 'center',
  },
});
