import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../design/tokens';
import { type } from '../design/typography';
import { useAppPalette } from '../design/appTheme';
import { BlinkPersonStrip } from './BlinkPersonStrip';

type Props = {
  compact?: boolean;
  frameUris?: string[] | null;
};

export function BlinkStrip({ compact = false, frameUris }: Props) {
  const palette = useAppPalette();
  const frames = (frameUris ?? []).filter(Boolean).slice(0, 3);
  const displayFrames = frames.length > 0 ? frames : ['01', '02', '03'];
  const hasDisplayableFrames = frames.some(isDisplayableUri);

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={[type.tinyMono, { color: palette.muted }]}>Blink  2.0s</Text>
        <Text style={[type.tinyMono, { color: palette.muted }]}>{displayFrames.length} / 3</Text>
      </View>
      <View style={[styles.frames, compact && styles.compactFrames, !hasDisplayableFrames && styles.generatedFrames]}>
        {hasDisplayableFrames ? (
          displayFrames.map((frame, index) => (
            <View key={`${frame}-${index}`} style={[styles.frame, compact && styles.compactFrame]}>
              {isDisplayableUri(frame) ? (
                <Image source={{ uri: frame }} style={styles.image} resizeMode="cover" />
              ) : (
                <View style={styles.emptyCapturedFrame} />
              )}
              <Text style={styles.index}>{String(index + 1).padStart(2, '0')}</Text>
            </View>
          ))
        ) : (
          <BlinkPersonStrip compact={compact} />
        )}
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
    height: 86,
    flexDirection: 'row',
    gap: spacing[3],
  },
  compactFrames: {
    height: 64,
  },
  generatedFrames: {
    gap: 0,
  },
  frame: {
    flex: 1,
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
    borderRadius: radius.control - 2,
  },
  emptyCapturedFrame: {
    width: '100%',
    height: '100%',
    backgroundColor: '#191919',
  },
  index: {
    position: 'absolute',
    left: 5,
    bottom: 4,
    color: colors.paper,
    fontSize: 7,
    fontFamily: 'IBMPlexMono',
  },
});
