import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../design/tokens';
import { type } from '../design/typography';
import { ActionButton } from '../components/ActionButton';
import { AppSurface } from '../components/AppSurface';
import { DotRadar } from '../components/DotRadar';
import { FriendCard } from '../components/FriendCard';
import { HeaderBar } from '../components/HeaderBar';
import { friends } from '../data/mockSignals';

export function PeopleScreen() {
  return (
    <AppSurface>
      <HeaderBar title="친구" right="+" showDot />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.radarArea}>
          <DotRadar size={210} />
        </View>
        <View style={styles.friendRow}>
          {friends.map((friend) => (
            <FriendCard key={friend.id} friend={friend} />
          ))}
        </View>
        <Text style={type.tinyMono}>관계 설정</Text>
        <View style={styles.chips}>
          {['가까운 친구', '베스트', '소울메이트', '기타'].map((label, index) => (
            <ActionButton key={label} label={label} variant={index === 0 ? 'dark' : 'light'} />
          ))}
        </View>
        <View style={styles.bottomActions}>
          <ActionButton label="✳ 친구 초대" flex />
          <ActionButton label="회로에 보내기   ›" variant="dark" flex />
        </View>
      </ScrollView>
    </AppSurface>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[8],
    gap: spacing[5],
  },
  radarArea: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
  },
  friendRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  bottomActions: {
    flexDirection: 'row',
    gap: spacing[3],
  },
});
