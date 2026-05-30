import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../design/tokens';
import { type } from '../design/typography';
import { useAppPalette } from '../design/appTheme';

export function CameraLensPanel({ compact = false }: { compact?: boolean } = {}) {
  const palette = useAppPalette();
  return (
    <View style={[styles.wrap, { backgroundColor: palette.card, borderColor: palette.ruleStrong }, compact && styles.wrapCompact]}>
      <View style={[styles.tape, { backgroundColor: palette.chip, borderRightColor: palette.rule }]}>
        <Text style={[type.tinyMono, styles.tapeText, { color: palette.text }]}>SELECT</Text>
      </View>
      <View style={styles.lensWrap}>
        <View style={styles.lensOuter}>
          <View style={styles.lensMid}>
            <View style={styles.lensInner} />
          </View>
        </View>
      </View>
      <View style={styles.rulePanel}>
        <Text style={type.tinyMono}>RULE</Text>
        <Text style={type.metaValue}>2초 제한</Text>
        <View style={styles.ruleLine} />
        <Text style={type.tinyMono}>TIMER</Text>
        <Text style={type.monoValue}>00.0 / 02.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: 160,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    borderRadius: radius.slipSmall,
    overflow: 'hidden',
    backgroundColor: colors.paperDeep,
  },
  wrapCompact: {
    minHeight: 124,
  },
  tape: {
    width: 31,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: colors.rule,
    backgroundColor: '#E7E0D1',
  },
  tapeText: {
    transform: [{ rotate: '-90deg' }],
    width: 56,
    textAlign: 'center',
  },
  lensWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lensOuter: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#0F0F0F',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.65)',
  },
  lensMid: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#242424',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#000',
  },
  lensInner: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#060606',
    borderWidth: 1,
    borderColor: '#3E3E3E',
  },
  rulePanel: {
    width: 112,
    backgroundColor: colors.lcd,
    borderLeftWidth: 1,
    borderLeftColor: colors.ruleStrong,
    padding: spacing[5],
    justifyContent: 'center',
    gap: spacing[2],
  },
  ruleLine: {
    height: 1,
    backgroundColor: 'rgba(10,10,10,0.22)',
    marginVertical: spacing[2],
  },
});
