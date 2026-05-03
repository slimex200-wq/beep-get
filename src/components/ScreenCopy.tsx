import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../design/tokens';
import { type } from '../design/typography';

type Props = {
  no: string;
  title: string;
  body: string;
};

export function ScreenCopy({ no, title, body }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>{no} {title}</Text>
      <View style={styles.rule} />
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
    marginBottom: spacing[4],
  },
  heading: {
    ...type.boardLabel,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  rule: {
    width: 28,
    height: 1,
    backgroundColor: 'rgba(247,243,234,0.45)',
    marginVertical: spacing[3],
  },
  body: {
    ...type.boardLabel,
    color: 'rgba(247,243,234,0.78)',
    lineHeight: 19,
  },
});
