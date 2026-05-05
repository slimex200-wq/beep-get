import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../design/tokens';
import { type } from '../design/typography';

type Props = {
  compact?: boolean;
  frameUris?: string[] | null;
};

export function BlinkStrip({ compact = false, frameUris }: Props) {
  const frames = (frameUris ?? []).filter(Boolean).slice(0, 3);
  const displayFrames = frames.length > 0 ? frames : ['01', '02', '03'];

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={type.tinyMono}>Blink  2.0s</Text>
        <Text style={type.tinyMono}>{displayFrames.length} / 3</Text>
      </View>
      <View style={styles.frames}>
        {displayFrames.map((frame, index) => (
          <View key={`${frame}-${index}`} style={[styles.frame, compact && styles.compactFrame]}>
            {isDisplayableUri(frame) ? (
              <Image source={{ uri: frame }} style={styles.image} resizeMode="cover" />
            ) : (
              <Text style={styles.hand}>{frames.length > 0 ? 'IMG' : '✌︎'}</Text>
            )}
            <Text style={styles.index}>{String(index + 1).padStart(2, '0')}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function isDisplayableUri(uri: string): boolean {
  return /^(https?:|file:|content:|data:image)/.test(uri);
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
  image: {
    width: '100%',
    height: '100%',
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
