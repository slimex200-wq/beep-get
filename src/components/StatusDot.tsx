import React from 'react';
import { View, ViewStyle } from 'react-native';
import { colors } from '../design/tokens';

type Props = {
  color?: string;
  size?: number;
  style?: ViewStyle;
};

export function StatusDot({ color = colors.red, size = 8, style }: Props) {
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,0.25)',
        },
        style,
      ]}
    />
  );
}
