import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, radius, shadow, spacing } from '../design/tokens';
import { type } from '../design/typography';
import { StatusDot } from './StatusDot';

type Props = {
  title: string;
  children: React.ReactNode;
  accent?: boolean;
  variant?: 'default' | 'success' | 'danger' | 'lcd';
  compact?: boolean;
  footer?: React.ReactNode;
  style?: ViewStyle;
};

export function SlipFrame({ title, children, accent = true, variant = 'default', compact = false, footer, style }: Props) {
  return (
    <View style={[styles.slip, compact && styles.compact, styles[variant], style]}>
      <View style={styles.topNotch} />
      <View style={styles.titleRow}>
        <Text style={compact ? type.slipTitleSmall : type.slipTitle}>{title}</Text>
        {accent ? <StatusDot /> : null}
      </View>
      <View style={styles.rule} />
      {children}
      {footer ? <View style={styles.footer}>{footer}</View> : null}
      <View style={styles.bottomPerforation} />
    </View>
  );
}

const styles = StyleSheet.create({
  slip: {
    position: 'relative',
    backgroundColor: colors.paperWarm,
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    borderRadius: radius.slip,
    padding: spacing[5],
    overflow: 'hidden',
    ...shadow.slip,
  },
  compact: {
    padding: spacing[4],
    borderRadius: radius.slipSmall,
  },
  default: {},
  success: {
    backgroundColor: colors.lcd,
    borderColor: 'rgba(111,135,98,0.55)',
  },
  danger: {
    backgroundColor: '#F7E6E1',
    borderColor: 'rgba(158,33,21,0.55)',
  },
  lcd: {
    backgroundColor: colors.lcd,
  },
  titleRow: {
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[4],
  },
  rule: {
    height: 1,
    backgroundColor: colors.rule,
    marginTop: spacing[3],
    marginBottom: spacing[5],
  },
  footer: {
    marginTop: spacing[5],
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderTopColor: colors.rule,
  },
  topNotch: {
    position: 'absolute',
    top: -1,
    left: '50%',
    width: 30,
    height: 10,
    marginLeft: -15,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.ruleStrong,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    backgroundColor: colors.paper,
  },
  bottomPerforation: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: -1,
    height: 1,
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    borderBottomColor: colors.ruleStrong,
  },
});
