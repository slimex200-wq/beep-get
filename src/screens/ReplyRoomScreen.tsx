import React, { useMemo } from "react";
import type { RouteProp } from "@react-navigation/native";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { RootStackParamList } from "@/navigation/RootNavigator";
import { buildSignalPresentation } from "@/lib/beepBlinkPresentation";
import { legacyMessageToSignalInput, type LegacySignalMessage } from "@/lib/messageSignalAdapter";
import { useMessageStore } from "@/stores/messageStore";

type ReplyRoomRoute = RouteProp<RootStackParamList, "ReplyRoom">;

const INK = "#0A0A0A";
const PAPER = "#F2EDE4";
const STAGE = "#070706";
const MUTED = "#77706A";
const ACCENT = "#D8361E";

export function ReplyRoomScreen({ route }: { route: ReplyRoomRoute }) {
  const { signalId } = route.params;
  const { received, quickReply, read, save } = useMessageStore();
  const message = (received.find((item) => item.id === signalId) ?? received[0]) as
    | LegacySignalMessage
    | undefined;

  const presentation = useMemo(
    () => (message ? buildSignalPresentation(legacyMessageToSignalInput(message)) : null),
    [message]
  );

  if (!message || !presentation) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>NO SIGNAL</Text>
        <Text style={styles.emptyCopy}>The Reply Room opens when a Beep or Blink arrives.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <Text style={styles.kicker}>REPLY ROOM</Text>
        <Text style={styles.sender}>{presentation.senderName}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.incoming}>{presentation.title}</Text>
        <Text selectable style={styles.code}>
          {presentation.code}
        </Text>
        <Text style={styles.meta}>
          {presentation.availability.toUpperCase()} / {presentation.status.toUpperCase()}
        </Text>

        <View style={styles.blinkStage}>
          {presentation.teaser ? (
            <>
              <View style={styles.playGlyph}>
                <Text style={styles.playGlyphText}>PLAY</Text>
              </View>
              <View style={styles.strip}>
                {presentation.teaser.stripFrameUris.map((frame, index) => (
                  <View key={`${frame}-${index}`} style={styles.frame}>
                    <Text style={styles.frameText}>{String(index + 1).padStart(2, "0")}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.duration}>2 SECOND BLINK</Text>
            </>
          ) : (
            <Text style={styles.noBlink}>CODE-ONLY BEEP</Text>
          )}
        </View>

        <View style={styles.actions}>
          <RoomAction label="CONFIRM" onPress={() => read(message.id)} />
          <RoomAction label="SAVE LOG" onPress={() => save(message.id)} />
          <RoomAction
            label="REPLY 8282"
            onPress={() => quickReply(message.id, "8282").catch(reportError)}
          />
        </View>
      </View>

      <Text style={styles.note}>
        Widget shows the teaser. The app opens here for the full emotional context.
      </Text>
    </ScrollView>
  );
}

function reportError(err: unknown) {
  const message = err instanceof Error ? err.message : "Unexpected error";
  Alert.alert("BEEP-GET", message);
}

function RoomAction({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
    >
      {({ pressed }) => (
        <Text style={[styles.actionText, pressed && styles.actionTextPressed]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: STAGE,
  },
  content: {
    minHeight: "100%",
    paddingHorizontal: 18,
    paddingTop: 54,
    paddingBottom: 32,
    gap: 18,
  },
  topBar: {
    gap: 8,
  },
  kicker: {
    fontFamily: "IBMPlexMono",
    fontSize: 10,
    letterSpacing: 2.4,
    color: "rgba(242,237,228,0.48)",
  },
  sender: {
    fontFamily: "Pretendard-Bold",
    fontSize: 48,
    lineHeight: 50,
    color: PAPER,
  },
  card: {
    backgroundColor: PAPER,
    borderRadius: 24,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: INK,
    padding: 18,
    gap: 14,
  },
  incoming: {
    fontFamily: "Pretendard-Medium",
    fontSize: 34,
    color: INK,
  },
  code: {
    fontFamily: "IBMPlexMono-Bold",
    fontSize: 58,
    lineHeight: 64,
    letterSpacing: 1.5,
    color: INK,
    fontVariant: ["tabular-nums"],
  },
  meta: {
    fontFamily: "IBMPlexMono",
    fontSize: 10,
    letterSpacing: 1.8,
    color: MUTED,
  },
  blinkStage: {
    minHeight: 220,
    borderWidth: 1,
    borderColor: INK,
    backgroundColor: "#E8DFD2",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    padding: 18,
  },
  playGlyph: {
    width: 88,
    height: 88,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: INK,
    alignItems: "center",
    justifyContent: "center",
  },
  playGlyphText: {
    fontFamily: "IBMPlexMono-Bold",
    fontSize: 11,
    letterSpacing: 2,
    color: INK,
  },
  strip: {
    flexDirection: "row",
    gap: 8,
  },
  frame: {
    width: 58,
    height: 36,
    borderWidth: 1,
    borderColor: INK,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PAPER,
  },
  frameText: {
    fontFamily: "IBMPlexMono-Bold",
    fontSize: 10,
    color: INK,
  },
  duration: {
    fontFamily: "IBMPlexMono-Bold",
    fontSize: 10,
    letterSpacing: 2,
    color: ACCENT,
  },
  noBlink: {
    fontFamily: "IBMPlexMono-Bold",
    fontSize: 12,
    letterSpacing: 2,
    color: INK,
  },
  actions: {
    gap: 8,
  },
  action: {
    borderWidth: 1,
    borderColor: INK,
    paddingVertical: 13,
    alignItems: "center",
    backgroundColor: PAPER,
  },
  actionPressed: {
    backgroundColor: INK,
  },
  actionText: {
    fontFamily: "IBMPlexMono-Bold",
    fontSize: 10,
    letterSpacing: 1.8,
    color: INK,
  },
  actionTextPressed: {
    color: PAPER,
  },
  note: {
    fontFamily: "IBMPlexMono",
    fontSize: 10,
    lineHeight: 18,
    letterSpacing: 0.8,
    color: "rgba(242,237,228,0.5)",
  },
  empty: {
    flex: 1,
    backgroundColor: STAGE,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 10,
  },
  emptyTitle: {
    fontFamily: "IBMPlexMono-Bold",
    fontSize: 18,
    letterSpacing: 2,
    color: PAPER,
  },
  emptyCopy: {
    fontFamily: "IBMPlexMono",
    fontSize: 11,
    lineHeight: 18,
    color: "rgba(242,237,228,0.5)",
    textAlign: "center",
  },
});
