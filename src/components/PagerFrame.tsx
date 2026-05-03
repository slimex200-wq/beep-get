import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, shadow, spacing } from '../design/tokens';
import { type } from '../design/typography';
import { StatusDot } from './StatusDot';

type Props = {
  children: React.ReactNode;
  variant?: 'dark' | 'cream';
  label?: string;
  style?: ViewStyle;
};

export function PagerFrame({ children, variant = 'dark', label = 'BEEP-GET', style }: Props) {
  const isCream = variant === 'cream';

  return (
    <SafeAreaView edges={['top']} style={styles.stage}>
      <View style={[styles.shell, isCream && styles.creamShell, style]}>
        <View style={styles.topHardware}>
          <View style={styles.vents}>
            <View style={styles.vent} />
            <View style={styles.vent} />
            <View style={styles.vent} />
          </View>
          <Text style={[type.tinyMono, styles.hardwareLabel]}>{label}</Text>
          <StatusDot size={9} />
        </View>
        <View style={styles.screenWell}>{children}</View>
        <View style={styles.bottomHardware}>
          <View style={styles.grille}>
            {Array.from({ length: 6 }).map((_, index) => (
              <View key={index} style={styles.grilleBar} />
            ))}
          </View>
          <Text style={[type.tinyMono, styles.emboss]}>BEEP-GET</Text>
          <View style={styles.leds}>
            <StatusDot size={6} />
            <StatusDot size={6} color={colors.redDeep} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    backgroundColor: colors.stage,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
  },
  shell: {
    flex: 1,
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
    minHeight: 0,
    borderRadius: radius.pager,
    backgroundColor: colors.shell,
    borderWidth: 1,
    borderColor: colors.shellEdge,
    padding: spacing[4],
    ...shadow.pager,
  },
  creamShell: {
    backgroundColor: '#E8DDCD',
    borderColor: '#B8A996',
  },
  topHardware: {
    height: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
  },
  vents: {
    flexDirection: 'row',
    gap: 3,
  },
  vent: {
    width: 3,
    height: 12,
    borderRadius: 2,
    backgroundColor: 'rgba(247,243,234,0.35)',
  },
  hardwareLabel: {
    color: 'rgba(247,243,234,0.52)',
    letterSpacing: 1.6,
  },
  screenWell: {
    flex: 1,
    borderRadius: radius.pagerInner,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.36)',
    overflow: 'hidden',
  },
  bottomHardware: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
  },
  grille: {
    flexDirection: 'row',
    gap: 4,
    width: 76,
  },
  grilleBar: {
    width: 3,
    height: 16,
    borderRadius: 2,
    backgroundColor: 'rgba(247,243,234,0.25)',
  },
  emboss: {
    flex: 1,
    textAlign: 'center',
    color: 'rgba(247,243,234,0.35)',
    letterSpacing: 1.4,
  },
  leds: {
    width: 36,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 6,
  },
});
