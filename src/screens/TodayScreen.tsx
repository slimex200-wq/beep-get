import React, { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { colors, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { useAppPalette } from "@/design/appTheme";
import { ActionButton } from "@/components/ActionButton";
import { AppSurface } from "@/components/AppSurface";
import { FriendPulseCard, type FriendPulseItem } from "@/components/FriendPulseCard";
import { MockupCard } from "@/components/KotlinMockupUI";
import { TodayIncomingCard } from "@/components/TodayIncomingCard";
import { TodayMockupHeader, TodaySectionHeader } from "@/components/TodayMockupChrome";
import { WidgetPreviewPanel } from "@/components/WidgetPreviewPanel";
import { FriendsGroupIcon, RefreshLineIcon } from "@/components/MockupLineIcons";
import { getIdentityPack } from "@/design/identityPacks";
import type { RootStackParamList } from "@/navigation/RootNavigator";
import { useAuthStore } from "@/stores/authStore";
import { useDictionaryStore } from "@/stores/dictionaryStore";
import { useFriendStore } from "@/stores/friendStore";
import { useMessageStore } from "@/stores/messageStore";
import { useSkinStore } from "@/stores/skinStore";
import { messageToSlipSignal, relationshipToSlipFriend } from "@/lib/slipUiModels";
import { isQuickReplySlotEntry } from "@/lib/quickReplySlots";

const FALLBACK_MEANINGS: Record<string, string> = {
  "8282": "Hurry up",
  "486": "Miss you",
  "1004": "Angel",
  "7942": "Between friends",
  "0404": "Forever",
};

export function TodayScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const palette = useAppPalette();
  const { profile } = useAuthStore();
  const { activeIdentityPackSlug } = useSkinStore();
  const { entries, fetch: fetchDictionary } = useDictionaryStore();
  const { friends, fetch: fetchFriends } = useFriendStore();
  const {
    received,
    loading,
    fetchReceived,
    read,
    subscribeRealtime,
    unsubscribeRealtime,
  } = useMessageStore();
  const [doneFeedback, setDoneFeedback] = useState(false);

  useEffect(() => {
    if (!profile) return;
    fetchFriends(profile.id).catch(reportError);
    fetchDictionary(profile.id).catch(reportError);
  }, [profile?.id, fetchFriends, fetchDictionary]);

  useEffect(() => {
    if (!profile) return;
    fetchReceived(profile.id, friends).catch(reportError);
  }, [profile?.id, friends.length, fetchReceived]);

  useEffect(() => {
    if (!profile) return;
    subscribeRealtime(profile.id);
    return () => unsubscribeRealtime();
  }, [profile?.id, subscribeRealtime, unsubscribeRealtime]);

  const latestMessage = received[0];
  const activePack = getIdentityPack(activeIdentityPackSlug);
  const latestWidgetKind =
    latestMessage?.kind === "blink" || Boolean(latestMessage?.media) ? "blink" : "beep";
  const latestFrameUris = latestMessage?.media?.stripFrameUris ?? undefined;
  const latestSignal = useMemo(
    () => (latestMessage ? messageToSlipSignal(latestMessage, { index: 0 }) : null),
    [latestMessage],
  );
  const friendPulseItems = useMemo<FriendPulseItem[]>(() => {
    return friends.slice(0, 3).flatMap((friend, index) => {
      const slipFriend = relationshipToSlipFriend(friend, index);
      const recentSignal = received.find((message) => message.from_user === slipFriend.id);
      if (!recentSignal) return [];

      const code = recentSignal.number_code;
      const isBlink = recentSignal.kind === "blink" || Boolean(recentSignal.media);

      return [{
        id: slipFriend.id,
        name: slipFriend.name,
        status: `${formatPulseTime(recentSignal.created_at)} - ${isBlink ? "BLINK" : code}`,
        code: isBlink ? "BLINK" : code,
        ...(slipFriend.avatarUri ? { avatarUri: slipFriend.avatarUri } : {}),
        accent: index === 0 ? colors.mint : index === 1 ? colors.pink : colors.lavender,
      }];
    });
  }, [friends, received]);

  const latestMeaning = latestSignal
    ? entries.find((entry) => !isQuickReplySlotEntry(entry) && entry.code === latestSignal.code)?.meaning ??
      latestSignal.note ??
      FALLBACK_MEANINGS[latestSignal.code] ??
      "Hurry up"
    : null;

  const refresh = () => {
    if (!profile) return;
    fetchReceived(profile.id, friends).catch(reportError);
  };

  const handleDone = async () => {
    if (!latestMessage) return;
    setDoneFeedback(true);
    setTimeout(() => setDoneFeedback(false), 1200);
    await read(latestMessage.id).catch(reportError);
  };

  return (
    <AppSurface backgroundColor={palette.background} statusBarStyle={palette.statusBar}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TodayMockupHeader
          title="TODAY"
          actions={[
            {
              label: loading ? "Syncing" : "Refresh",
              icon: <RefreshLineIcon />,
              accessibilityLabel: "Refresh Today",
              onPress: refresh,
            },
            {
              label: "People",
              icon: <FriendsGroupIcon />,
              accessibilityLabel: "Open People",
              onPress: () => navigation.navigate("Main", { screen: "People" }),
            },
          ]}
        />
        <View style={styles.mockupFlow}>
          <TodaySectionHeader label="Incoming Now" hint="Latest signal" />
          {latestSignal ? (
            <TodayIncomingCard
              sender={latestSignal.sender}
              time={latestSignal.time}
              code={latestSignal.code}
              meaning={latestMeaning}
              avatarUri={latestSignal.avatarUri}
              doneFeedback={doneFeedback}
              onView={() => navigation.navigate("ReplyRoom", { signalId: latestMessage.id })}
              onDone={handleDone}
            />
          ) : (
            <MockupCard style={styles.empty}>
              <Text style={[type.metaValue, { color: palette.text }]}>WAITING FOR SIGNAL</Text>
              <Text style={[type.bodyMuted, { color: palette.muted }]}>New Beeps and Blinks land here first.</Text>
              <ActionButton
                label={friends.length > 0 ? "SEND FIRST BEEP" : "ADD FRIEND"}
                variant="dark"
                onPress={() =>
                  navigation.navigate("Main", { screen: friends.length > 0 ? "Compose" : "People" })
                }
              />
            </MockupCard>
          )}

          <FriendPulseCard title="Friend Pulse" items={friendPulseItems} />
          <WidgetPreviewPanel
            title="Widget Mirror"
            subtitle="Home screen preview"
            code={latestSignal?.code ?? "----"}
            from={latestSignal?.sender ?? "No signal yet"}
            paperMode
            compact
            kind={latestWidgetKind}
            skin={activePack}
            frameUris={latestFrameUris}
          />
        </View>
      </ScrollView>
    </AppSurface>
  );
}

function formatPulseTime(dateStr: string): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "now";
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function reportError(err: unknown) {
  const message =
    err instanceof Error
      ? err.message
      : err && typeof err === "object" && "message" in err
        ? String((err as { message?: unknown }).message)
        : "Unexpected error";
  Alert.alert("BEEP-GET", message);
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing[6],
    paddingBottom: 110,
    gap: spacing[5],
  },
  mockupFlow: {
    gap: spacing[4],
  },
  empty: {
    minHeight: 132,
    justifyContent: "center",
    gap: spacing[2],
    padding: spacing[5],
  },
});
