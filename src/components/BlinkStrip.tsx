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
      <View style={[styles.frames, compact && styles.compactFrames]}>
        {displayFrames.map((frame, index) => (
          <View key={`${frame}-${index}`} style={[styles.frame, compact && styles.compactFrame]}>
            {isDisplayableUri(frame) ? (
              <Image source={{ uri: frame }} style={styles.image} resizeMode="cover" />
            ) : (
              <FallbackFrame compact={compact} index={index} hasCapturedFrames={frames.length > 0} />
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

function FallbackFrame({
  compact,
  index,
  hasCapturedFrames,
}: {
  compact: boolean;
  index: number;
  hasCapturedFrames: boolean;
}) {
  return (
    <View style={styles.fakePhoto}>
      <View style={[styles.fakePhotoHead, compact && styles.fakePhotoHeadCompact]} />
      <View style={[styles.fakePhotoBody, compact && styles.fakePhotoBodyCompact]} />
      <View style={[styles.fakePhotoFlash, index === 1 && styles.fakePhotoFlashAlt]} />
      <Text style={[styles.fakePhotoMark, compact && styles.fakePhotoMarkCompact]}>
        {hasCapturedFrames ? 'IMG' : 'B'}
      </Text>
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
    height: 86,
    flexDirection: 'row',
    gap: spacing[3],
  },
  compactFrames: {
    height: 64,
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
  fakePhoto: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: spacing[8],
    backgroundColor: '#191919',
  },
  fakePhotoHead: {
    width: 62,
    height: 62,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(247,243,234,0.86)',
    backgroundColor: '#55524C',
  },
  fakePhotoHeadCompact: {
    width: 25,
    height: 25,
  },
  fakePhotoBody: {
    width: 112,
    height: 58,
    marginTop: -5,
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
    backgroundColor: '#48453F',
    borderWidth: 1,
    borderColor: 'rgba(247,243,234,0.56)',
  },
  fakePhotoBodyCompact: {
    width: 48,
    height: 22,
    marginTop: -2,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  fakePhotoFlash: {
    position: 'absolute',
    right: 14,
    top: 14,
    width: 18,
    height: 18,
    borderRadius: 999,
    backgroundColor: 'rgba(247,243,234,0.76)',
  },
  fakePhotoFlashAlt: {
    left: 14,
    right: 'auto',
  },
  fakePhotoMark: {
    position: 'absolute',
    right: 6,
    bottom: 5,
    color: colors.paper,
    fontSize: 10,
    fontWeight: '800',
    transform: [{ rotate: '-8deg' }],
  },
  fakePhotoMarkCompact: {
    fontSize: 7,
    bottom: 3,
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
