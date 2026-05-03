import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../design/tokens';
import { type } from '../design/typography';

type Props = {
  compact?: boolean;
};

export function BlinkStrip({ compact = false }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={type.tinyMono}>Blink  2.0s</Text>
        <Text style={type.tinyMono}>3 / 3</Text>
      </View>
      <View style={styles.frames}>
        {[1, 2, 3].map((index) => (
          <View key={index} style={[styles.frame, compact && styles.compactFrame]}>
            <Text style={styles.hand}>✌︎</Text>
            <Text style={styles.index}>{String(index).padStart(2, '0')}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing[2],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  frames: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  frame: {
    flex: 1,
    minHeight: 76,
    borderRadius: radius.control,
    backgroundColor: colors.ink,
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  compactFrame: {
    minHeight: 44,
  },
  hand: {
    color: colors.paper,
    fontSize: 28,
    transform: [{ rotate: '-8deg' }],
  },
  index: {
    position: 'absolute',
    left: 5,
    bottom: 4,
    color: colors.paper,
    fontSize: 7,
    fontFamily: 'monospace',
  },
});
