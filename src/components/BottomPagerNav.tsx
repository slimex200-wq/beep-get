import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../design/tokens';
import { type } from '../design/typography';
import { StatusDot } from './StatusDot';

export type ScreenKey = 'first' | 'today' | 'reply' | 'sendBeep' | 'sendBlink' | 'people' | 'studio' | 'logs' | 'widgets';

export const navItems: Array<{ key: ScreenKey; label: string }> = [
  { key: 'first', label: '첫 시작' },
  { key: 'today', label: '오늘' },
  { key: 'reply', label: '답장룸' },
  { key: 'sendBeep', label: 'Beep' },
  { key: 'sendBlink', label: 'Blink' },
  { key: 'people', label: '친구' },
  { key: 'studio', label: '스튜디오' },
  { key: 'logs', label: '기록' },
  { key: 'widgets', label: '위젯' },
];

type Props = {
  active: ScreenKey;
  onChange: (key: ScreenKey) => void;
};

export function BottomPagerNav({ active, onChange }: Props) {
  return (
    <View style={styles.wrap}>
      {navItems.map((item) => {
        const selected = item.key === active;
        return (
          <Pressable key={item.key} onPress={() => onChange(item.key)} style={[styles.item, selected && styles.active]}>
            {selected ? <StatusDot size={5} style={styles.dot} /> : null}
            <Text style={[type.tinyMono, styles.label, selected && styles.activeLabel]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 430,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginTop: spacing[5],
    padding: spacing[3],
    backgroundColor: colors.stageSoft,
    borderWidth: 1,
    borderColor: 'rgba(247,243,234,0.16)',
    borderRadius: radius.control,
  },
  item: {
    minHeight: 32,
    paddingHorizontal: spacing[3],
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: 'rgba(247,243,234,0.13)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  active: {
    backgroundColor: colors.paperWarm,
    borderColor: colors.paperWarm,
  },
  label: {
    color: colors.white,
  },
  activeLabel: {
    color: colors.ink,
  },
  dot: {
    position: 'absolute',
    top: 3,
    right: 3,
  },
});
