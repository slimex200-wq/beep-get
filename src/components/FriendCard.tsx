import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../design/tokens';
import { type } from '../design/typography';
import { Friend } from '../data/mockSignals';
import { StatusDot } from './StatusDot';

type Props = {
  friend: Friend;
};

export function FriendCard({ friend }: Props) {
  return (
    <View style={styles.card}>
      {friend.isClose ? <StatusDot size={7} style={styles.dot} /> : null}
      <Text style={type.tinyMono}>NO.</Text>
      <Text style={type.codeSmall}>{friend.no}</Text>
      <Text style={type.metaValue}>{friend.name}</Text>
      <Text style={styles.relation}>{friend.relation}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 120,
    padding: spacing[5],
    borderRadius: radius.slipSmall,
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    backgroundColor: colors.paperWarm,
    position: 'relative',
  },
  dot: {
    position: 'absolute',
    top: spacing[4],
    right: spacing[4],
  },
  relation: {
    ...type.tinyMono,
    color: colors.redDeep,
    marginTop: spacing[3],
  },
});
