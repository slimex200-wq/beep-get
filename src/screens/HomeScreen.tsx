import React, { useEffect, useMemo } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import type { RootStackParamList } from "@/navigation/RootNavigator";
import { useAuthStore } from "@/stores/authStore";
import { useMessageStore } from "@/stores/messageStore";
import { buildSignalPresentation, type SignalPresentation } from "@/lib/beepBlinkPresentation";
import {
  formatWidgetIndex,
  formatWidgetTimeParts,
  getWidgetSenderName,
} from "@/lib/homeWidgetPresentation";
import {
  legacyMessageToSignalInput,
  type LegacySignalMessage,
} from "@/lib/messageSignalAdapter";

type HomeMessage = LegacySignalMessage & {
  id: string;
  from_user: string;
  to_user: string;
  number_code: string;
  is_read: boolean;
  is_saved?: boolean;
  created_at: string;
  from_user_profile?: {
    nickname?: string | null;
    beep_id?: string | null;
  } | null;
};

const SWISS = {
  paper: "#F2EDE4",
  ink: "#0A0A0A",
  mute: "#68615A",
  accent: "#D8361E",
  stage: "#070706",
  rail: "rgba(242,237,228,0.22)",
};

export function HomeScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { width } = useWindowDimensions();
  const { profile } = useAuthStore();
  const { received, loading, fetchReceived, read, save, subscribeRealtime, unsubscribeRealtime } =
    useMessageStore();

  useEffect(() => {
    if (!profile) return;
    fetchReceived(profile.id);
    subscribeRealtime(profile.id);
    return () => unsubscribeRealtime();
  }, [profile?.id]);

  const latestMessage = received[0] as HomeMessage | undefined;
  const recentMessages = received.slice(1, 4) as HomeMessage[];
  const latestPresentation = latestMessage
    ? buildSignalPresentation(legacyMessageToSignalInput(latestMessage))
    : null;
  const styles = useMemo(() => createStyles(width), [width]);
  const openReplyRoom = () => {
    if (!latestMessage) return;
    navigation.navigate("ReplyRoom", { signalId: latestMessage.id });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
    >
      <View style={styles.header}>
        <View style={styles.headerRule} />
        <Text style={styles.kicker}>BEEP-GET / WIDGET SYSTEM</Text>
        <View style={styles.titleLockup}>
          <Text style={styles.titleModern}>Today</Text>
          <Text style={styles.titlePager}>Room</Text>
        </View>
        <Text style={styles.subhead}>WIDGET TEASER OPENS THE ROOM</Text>
      </View>

      <View style={styles.phone}>
        <View style={styles.phoneStatus}>
          <Text style={styles.phoneTime}>9:41</Text>
          <View style={styles.dynamicIsland} />
          <Text style={styles.phoneMeta}>LTE</Text>
        </View>

        <View style={styles.widgetStage}>
          {latestMessage && latestPresentation ? (
            <SwissPaperWidget
              message={latestMessage}
              presentation={latestPresentation}
              totalMessages={received.length}
              disabled={loading}
              onConfirm={() => read(latestMessage.id)}
              onSave={() => save(latestMessage.id)}
            />
          ) : (
            <EmptyWidget />
          )}
        </View>

        <View style={styles.recentPanel}>
          <View>
            <Text style={styles.panelLabel}>TRANSMISSIONS</Text>
            <Text style={styles.panelCount}>{String(received.length).padStart(2, "0")}</Text>
          </View>
          <View style={styles.recentList}>
            {recentMessages.length > 0 ? (
              recentMessages.map((message, index) => (
                <RecentTransmission
                  key={message.id}
                  message={message}
                  index={index + 2}
                />
              ))
            ) : (
              <Text style={styles.emptyRecent}>NO ARCHIVE YET</Text>
            )}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open Reply Room"
            disabled={!latestMessage}
            onPress={openReplyRoom}
            style={({ pressed }) => [
              styles.replyRoomButton,
              pressed && styles.replyRoomButtonPressed,
              !latestMessage && styles.replyRoomButtonDisabled,
            ]}
          >
            <Text style={styles.replyRoomButtonText}>
              OPEN REPLY ROOM
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.footerStrip}>
        <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
          WIDGET-FIRST LOOP
        </Text>
        <Text style={styles.footerText}>BEEP / BLINK / LOG</Text>
      </View>
    </ScrollView>
  );
}

function SwissPaperWidget({
  message,
  presentation,
  totalMessages,
  disabled,
  onConfirm,
  onSave,
}: {
  message: HomeMessage;
  presentation: SignalPresentation;
  totalMessages: number;
  disabled: boolean;
  onConfirm: () => void;
  onSave: () => void;
}) {
  const time = formatWidgetTimeParts(message.created_at);
  const indexNo = formatWidgetIndex(totalMessages);
  const fromName = presentation.senderName;

  return (
    <View
      accessibilityRole="summary"
      accessibilityLabel={`Incoming beep from ${fromName}, code ${message.number_code}, ${time.hour}:${time.minute}`}
      style={stylesStatic.widget}
    >
      <View style={stylesStatic.widgetGrid}>
        <View style={stylesStatic.widgetTop}>
          <View style={stylesStatic.titleCell}>
            <Text style={stylesStatic.incoming}>Incoming</Text>
            <Text style={stylesStatic.beepWord}>
              {presentation.kind === "blink" ? "Blink" : "Beep"}
            </Text>
            <Text style={stylesStatic.metaLine}>
              FROM - {fromName.toUpperCase()} - N {indexNo}
            </Text>
          </View>
          <View style={stylesStatic.symbolCell}>
            {presentation.teaser ? (
              <MiniFilmStrip teaser={presentation.teaser} />
            ) : (
              <DotCircle size={72} />
            )}
          </View>
        </View>

        <View style={stylesStatic.widgetBottom}>
          <View style={stylesStatic.codeCell}>
            <Text style={stylesStatic.indexBox}>{indexNo}</Text>
            <Text selectable style={stylesStatic.code}>
              {message.number_code}
            </Text>
          </View>
          <View style={stylesStatic.timeCell}>
            <Text style={stylesStatic.timeText}>{time.hour}</Text>
            <Text style={stylesStatic.timeDivider}>-</Text>
            <Text style={stylesStatic.timeText}>{time.minute}</Text>
          </View>
        </View>
      </View>

      {!message.is_read && <View style={stylesStatic.newDot} />}

      <View style={stylesStatic.actionRow}>
        <WidgetAction title="CONFIRM" onPress={onConfirm} disabled={disabled} />
        <WidgetAction title="SAVE" onPress={onSave} disabled={disabled} />
      </View>
    </View>
  );
}

function MiniFilmStrip({ teaser }: { teaser: NonNullable<SignalPresentation["teaser"]> }) {
  const frames = teaser.stripFrameUris.length > 0 ? teaser.stripFrameUris : ["01", "02", "03"];

  return (
    <View style={stylesStatic.filmStrip}>
      {frames.slice(0, 3).map((frame, index) => (
        <View key={`${frame}-${index}`} style={stylesStatic.filmFrame}>
          <Text style={stylesStatic.filmFrameText}>{String(index + 1).padStart(2, "0")}</Text>
        </View>
      ))}
      <Text style={stylesStatic.filmDuration}>02 SEC</Text>
    </View>
  );
}

function EmptyWidget() {
  return (
    <View style={[stylesStatic.widget, stylesStatic.emptyWidget]}>
      <Text style={stylesStatic.emptyTitle}>BEEP-GET</Text>
      <Text style={stylesStatic.emptyCopy}>WAITING FOR INCOMING BEEP</Text>
    </View>
  );
}

function RecentTransmission({
  message,
  index,
}: {
  message: HomeMessage;
  index: number;
}) {
  const time = formatWidgetTimeParts(message.created_at);

  return (
    <View style={stylesStatic.recentRow}>
      <Text style={stylesStatic.recentIndex}>{String(index).padStart(2, "0")}</Text>
      <View style={stylesStatic.recentBody}>
        <Text style={stylesStatic.recentName}>{getWidgetSenderName(message)}</Text>
        <Text selectable style={stylesStatic.recentCode}>
          {message.number_code}
        </Text>
      </View>
      <Text style={stylesStatic.recentTime}>
        {time.hour}:{time.minute}
      </Text>
    </View>
  );
}

function WidgetAction({
  title,
  onPress,
  disabled,
}: {
  title: string;
  onPress: () => void;
  disabled: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        stylesStatic.action,
        pressed && stylesStatic.actionPressed,
        disabled && stylesStatic.actionDisabled,
      ]}
    >
      {({ pressed }) => (
        <Text style={[stylesStatic.actionText, pressed && stylesStatic.actionTextPressed]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

function DotCircle({ size }: { size: number }) {
  const dots = Array.from({ length: 28 }, (_, index) => {
    const angle = (Math.PI * 2 * index) / 28;
    const radius = size * (index % 2 === 0 ? 0.32 : 0.22);
    return {
      left: size / 2 + Math.cos(angle) * radius - 1,
      top: size / 2 + Math.sin(angle) * radius - 1,
    };
  });

  return (
    <View style={[stylesStatic.dotCircle, { width: size, height: size, borderRadius: size / 2 }]}>
      {dots.map((dot, index) => (
        <View
          key={index}
          style={[stylesStatic.dot, { left: dot.left, top: dot.top }]}
        />
      ))}
      <View style={stylesStatic.dotCore} />
    </View>
  );
}

function createStyles(width: number) {
  const phoneWidth = Math.min(width - 28, 390);

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: SWISS.stage,
    },
    content: {
      minHeight: "100%",
      alignItems: "center",
      gap: 18,
      paddingHorizontal: 14,
      paddingTop: 30,
      paddingBottom: 32,
    },
    header: {
      width: phoneWidth,
      alignItems: "center",
      gap: 7,
      paddingTop: 8,
    },
    headerRule: {
      width: "100%",
      height: StyleSheet.hairlineWidth,
      backgroundColor: SWISS.rail,
      marginBottom: 2,
    },
    kicker: {
      fontFamily: "IBMPlexMono",
      fontSize: 9,
      letterSpacing: 2.4,
      color: "rgba(242,237,228,0.58)",
    },
    titleLockup: {
      alignItems: "center",
      marginTop: 2,
      marginBottom: 2,
    },
    titleModern: {
      fontFamily: "Pretendard-Bold",
      fontSize: 45,
      lineHeight: 43,
      color: SWISS.paper,
      letterSpacing: -1.2,
    },
    titlePager: {
      fontFamily: "Pretendard-Medium",
      fontSize: 46,
      lineHeight: 42,
      color: SWISS.paper,
      letterSpacing: -1.6,
      marginTop: -4,
    },
    subhead: {
      fontFamily: "IBMPlexMono",
      fontSize: 9,
      letterSpacing: 1.7,
      color: "rgba(242,237,228,0.45)",
    },
    phone: {
      width: phoneWidth,
      minHeight: 640,
      borderRadius: 34,
      borderCurve: "continuous",
      backgroundColor: "#11100E",
      borderWidth: 1,
      borderColor: "#24211D",
      padding: 18,
      gap: 18,
      boxShadow: "0 34px 90px rgba(0,0,0,0.55)",
    },
    phoneStatus: {
      height: 28,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    phoneTime: {
      fontFamily: "IBMPlexMono",
      color: SWISS.paper,
      fontSize: 13,
    },
    dynamicIsland: {
      width: 104,
      height: 27,
      borderRadius: 999,
      backgroundColor: "#000000",
    },
    phoneMeta: {
      fontFamily: "IBMPlexMono",
      color: SWISS.paper,
      fontSize: 10,
      letterSpacing: 1.2,
    },
    widgetStage: {
      alignItems: "center",
      paddingTop: 18,
      paddingBottom: 8,
    },
    recentPanel: {
      flex: 1,
      borderTopWidth: 1,
      borderTopColor: "rgba(242,237,228,0.16)",
      paddingTop: 18,
      gap: 18,
    },
    panelLabel: {
      fontFamily: "IBMPlexMono",
      fontSize: 9,
      letterSpacing: 2.2,
      color: "rgba(242,237,228,0.52)",
    },
    panelCount: {
      fontFamily: "IBMPlexMono-Bold",
      fontSize: 72,
      lineHeight: 72,
      color: SWISS.paper,
    },
    recentList: {
      gap: 10,
    },
    replyRoomButton: {
      borderWidth: 1,
      borderColor: "rgba(242,237,228,0.72)",
      paddingVertical: 14,
      alignItems: "center",
      backgroundColor: SWISS.paper,
    },
    replyRoomButtonPressed: {
      backgroundColor: "#FFFFFF",
    },
    replyRoomButtonDisabled: {
      opacity: 0.34,
    },
    replyRoomButtonText: {
      fontFamily: "IBMPlexMono-Bold",
      fontSize: 10,
      letterSpacing: 2,
      color: SWISS.ink,
    },
    emptyRecent: {
      fontFamily: "IBMPlexMono",
      fontSize: 11,
      letterSpacing: 1.6,
      color: "rgba(242,237,228,0.42)",
    },
    footerStrip: {
      width: phoneWidth,
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12,
      paddingHorizontal: 4,
    },
    footerText: {
      fontFamily: "IBMPlexMono",
      fontSize: 9,
      letterSpacing: 1.3,
      color: "rgba(242,237,228,0.44)",
    },
  });
}

const stylesStatic = StyleSheet.create({
  widget: {
    width: "100%",
    maxWidth: 338,
    borderRadius: 22,
    borderCurve: "continuous",
    backgroundColor: SWISS.paper,
    padding: 10,
    boxShadow: "0 24px 70px rgba(0,0,0,0.38)",
  },
  widgetGrid: {
    height: 158,
    borderWidth: 1,
    borderColor: SWISS.ink,
    borderRadius: 14,
    borderCurve: "continuous",
    overflow: "hidden",
  },
  widgetTop: {
    flex: 1,
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: SWISS.ink,
  },
  titleCell: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: SWISS.ink,
  },
  incoming: {
    fontFamily: "Pretendard-Bold",
    color: SWISS.ink,
    fontSize: 28,
    lineHeight: 27,
    letterSpacing: -1.2,
  },
  beepWord: {
    fontFamily: "Pretendard-Medium",
    color: SWISS.ink,
    fontSize: 28,
    lineHeight: 26,
    paddingLeft: 68,
    marginTop: -6,
    letterSpacing: -1.1,
  },
  metaLine: {
    marginTop: "auto",
    fontFamily: "IBMPlexMono",
    fontSize: 8,
    letterSpacing: 1.5,
    color: SWISS.mute,
  },
  symbolCell: {
    width: 96,
    alignItems: "center",
    justifyContent: "center",
  },
  widgetBottom: {
    height: 50,
    flexDirection: "row",
  },
  codeCell: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    borderRightWidth: 1,
    borderRightColor: SWISS.ink,
  },
  indexBox: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderColor: SWISS.ink,
    textAlign: "center",
    textAlignVertical: "center",
    fontFamily: "IBMPlexMono-Bold",
    fontSize: 9,
    color: SWISS.ink,
  },
  code: {
    fontFamily: "IBMPlexMono-Medium",
    fontSize: 27,
    letterSpacing: 0.5,
    color: SWISS.ink,
    fontVariant: ["tabular-nums"],
  },
  timeCell: {
    width: 96,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  timeText: {
    fontFamily: "IBMPlexMono",
    fontSize: 11,
    letterSpacing: 1,
    color: SWISS.ink,
    fontVariant: ["tabular-nums"],
  },
  timeDivider: {
    fontFamily: "IBMPlexMono",
    fontSize: 11,
    color: SWISS.mute,
  },
  newDot: {
    position: "absolute",
    top: 24,
    right: 23,
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: SWISS.accent,
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  action: {
    flex: 1,
    borderWidth: 1,
    borderColor: SWISS.ink,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: SWISS.paper,
  },
  actionPressed: {
    backgroundColor: SWISS.ink,
  },
  actionDisabled: {
    opacity: 0.45,
  },
  actionText: {
    fontFamily: "IBMPlexMono",
    fontSize: 10,
    letterSpacing: 1.8,
    color: SWISS.ink,
  },
  actionTextPressed: {
    color: SWISS.paper,
  },
  emptyWidget: {
    minHeight: 190,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: SWISS.ink,
  },
  emptyTitle: {
    fontFamily: "Pretendard-Bold",
    fontSize: 36,
    color: SWISS.ink,
  },
  emptyCopy: {
    fontFamily: "IBMPlexMono",
    fontSize: 10,
    letterSpacing: 1.6,
    color: SWISS.mute,
  },
  dotCircle: {
    borderWidth: 1,
    borderColor: SWISS.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    position: "absolute",
    width: 2,
    height: 2,
    borderRadius: 999,
    backgroundColor: SWISS.ink,
  },
  dotCore: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: SWISS.ink,
    borderWidth: 2,
    borderColor: SWISS.paper,
    outlineColor: SWISS.ink,
    outlineWidth: 1,
  },
  filmStrip: {
    width: 76,
    gap: 4,
    alignItems: "center",
  },
  filmFrame: {
    width: 58,
    height: 14,
    borderWidth: 1,
    borderColor: SWISS.ink,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E2D9CB",
  },
  filmFrameText: {
    fontFamily: "IBMPlexMono-Bold",
    fontSize: 7,
    color: SWISS.ink,
  },
  filmDuration: {
    fontFamily: "IBMPlexMono-Bold",
    fontSize: 8,
    letterSpacing: 1,
    color: SWISS.accent,
    marginTop: 2,
  },
  recentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(242,237,228,0.18)",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  recentIndex: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: "rgba(242,237,228,0.5)",
    color: SWISS.paper,
    textAlign: "center",
    textAlignVertical: "center",
    fontFamily: "IBMPlexMono-Bold",
    fontSize: 9,
  },
  recentBody: {
    flex: 1,
    gap: 2,
  },
  recentName: {
    fontFamily: "IBMPlexMono",
    fontSize: 9,
    letterSpacing: 1.2,
    color: "rgba(242,237,228,0.5)",
    textTransform: "uppercase",
  },
  recentCode: {
    fontFamily: "IBMPlexMono-Medium",
    fontSize: 20,
    color: SWISS.paper,
    letterSpacing: 1,
    fontVariant: ["tabular-nums"],
  },
  recentTime: {
    fontFamily: "IBMPlexMono",
    fontSize: 10,
    color: "rgba(242,237,228,0.56)",
    fontVariant: ["tabular-nums"],
  },
});
