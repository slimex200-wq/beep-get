import React, { useEffect, useMemo } from "react";
import { Alert, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppSurface } from "@/components/AppSurface";
import { BeepyMascot } from "@/components/BeepyMascot";
import { StatusDot } from "@/components/StatusDot";
import { colors, radius, spacing } from "@/design/tokens";
import { font, type } from "@/design/typography";
import { identityPacks, type IdentityPack, type IdentityPackTone } from "@/lib/identityPacks";
import type { RootStackParamList } from "@/navigation/RootNavigator";
import { generateShareText } from "@/services/contactService";
import { useAuthStore } from "@/stores/authStore";
import { useDictionaryStore } from "@/stores/dictionaryStore";

const DEFAULT_WIDGET_SLOTS = ["배고픔", "집중중", "끝나고"];

export function MyScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { profile } = useAuthStore();
  const { entries, fetch: fetchDictionary } = useDictionaryStore();

  useEffect(() => {
    if (!profile) return;
    fetchDictionary(profile.id).catch(reportError);
  }, [profile?.id, fetchDictionary]);

  const replySlots = useMemo(() => {
    const codes = entries.map((entry) => entry.code).filter(Boolean);
    return Array.from(new Set([...codes, ...DEFAULT_WIDGET_SLOTS])).slice(0, 3);
  }, [entries]);

  const shareBeepId = async () => {
    if (!profile) return;
    await Share.share({ message: generateShareText(profile.beep_id, profile.nickname) });
  };

  const openLockedPack = (pack: IdentityPack) => {
    Alert.alert(
      pack.name,
      "출시 전에는 미리보기만 제공합니다. 실제 결제는 App Store / Google Play 인앱결제로 분리해서 붙입니다.",
    );
  };

  return (
    <AppSurface backgroundColor={stylesConst.stage} statusBarStyle="light">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.brandRow}>
          <View>
            <View style={styles.brandTitleRow}>
              <Text style={styles.brandTitle}>BEEP-GET</Text>
              <StatusDot size={8} color={stylesConst.red} />
            </View>
            <Text style={styles.brandSub}>PRIVATE PAGER SYSTEM</Text>
          </View>
          <View style={styles.brandMascot}>
            <Text style={styles.beepyBubble}>Beepy</Text>
            <BeepyMascot size={74} />
          </View>
        </View>

        <View style={styles.heroGrid}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>
              사고 싶은 건{"\n"}스킨이 아니라{"\n"}
              <Text style={styles.heroTitleRed}>친구 폰에 박힐{"\n"}내 분위기.</Text>
            </Text>
            <Text style={styles.heroBody}>
              BEEP-GET은 말보다 빠른 신호. 화면을 켜지 않아도, 위젯으로 도착하는 나만의 Beep과 Blink.
            </Text>
          </View>
          <View style={styles.miniSlip}>
            <Text style={styles.miniSlipTitle}>YOUR SIGNAL. YOUR STYLE.</Text>
            <Text style={styles.miniSlipBody}>오늘의 신호가, 친구의 하루를 바꾼다.</Text>
          </View>
        </View>

        <SectionHeader label="FRIEND HOME SCREEN TRY-ON" />
        <FriendHomeTryOn replySlots={replySlots} />

        <SectionHeader label="STYLE SHOP" right="5 IDENTITY PACKS" />
        <View style={styles.packGrid}>
          {identityPacks.map((pack) => (
            <PackCard
              key={pack.slug}
              pack={pack}
              onPress={() => (pack.isFree ? shareBeepId() : openLockedPack(pack))}
            />
          ))}
        </View>

        <View style={styles.shopStrip}>
          <BottomFeature icon="✎" title="MAKE IT YOURS" body="스킨, 코드, Reply Slot, Beepy까지 커스터마이즈." />
          <BottomFeature icon="□" title="COLLECT & UNLOCK" body="공식 팩을 모아 내 위젯의 성격을 만든다." />
          <BottomFeature icon="♡" title="SHOW YOUR VIBE" body="친구에게 보이는 건 내 센스와 감정." />
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate("StudioTools")}
            style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
          >
            <Text style={styles.actionText}>STUDIO TOOLS</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate("WidgetStates", { size: "medium" })}
            style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
          >
            <Text style={styles.actionText}>WIDGET STATES</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate("Logs")}
            style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
          >
            <Text style={styles.actionText}>ARCHIVE LOGS</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate("Account")}
            style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
          >
            <Text style={styles.actionText}>ACCOUNT</Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Barcode />
          <Text style={styles.footerText}>PAPER SLIP UI SYSTEM / SIMPLE / PRECISE / PRIVATE</Text>
        </View>
      </ScrollView>
    </AppSurface>
  );
}

function SectionHeader({ label, right }: { label: string; right?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.openCircle} />
      <Text style={styles.sectionLabel}>{label}</Text>
      <StatusDot size={6} color={stylesConst.red} />
      <View style={styles.sectionLine} />
      {right ? <Text style={styles.sectionPill}>{right}</Text> : null}
    </View>
  );
}

function FriendHomeTryOn({ replySlots }: { replySlots: string[] }) {
  return (
    <View style={styles.phoneTryOn}>
      <View style={styles.statusLine}>
        <Text style={styles.statusText}>9:41</Text>
        <Text style={styles.statusText}>Wi-Fi ▭</Text>
      </View>
      <View style={styles.speech}>
        <Text style={styles.speechText}>친구 폰{"\n"}홈화면에{"\n"}이렇게 보여요!</Text>
      </View>

      <View style={[styles.homeWidget, styles.paperWidget]}>
        <WidgetHeader title="Incoming Beep" />
        <View style={styles.widgetBody}>
          <Text style={styles.widgetLabel}>NO.</Text>
          <Text style={styles.heroCode}>8282</Text>
          <MetaGrid from="Mina" time="14:52" />
        </View>
      </View>

      <View style={[styles.homeWidget, styles.cherryHomeWidget]}>
        <WidgetHeader title="Incoming Blink" />
        <View style={styles.widgetBody}>
          <Text style={styles.widgetLabel}>NO.</Text>
          <Text style={styles.blinkCode}>1004</Text>
          <MetaGrid from="유나" time="15:34" />
          <FilmFrames tone="cherry" />
        </View>
      </View>

      <View style={[styles.homeWidget, styles.nightHomeWidget]}>
        <WidgetHeader title="Secret Signal" dark />
        <View style={styles.widgetBody}>
          <Text style={[styles.widgetLabel, styles.glowText]}>NO.</Text>
          <Text style={[styles.heroCode, styles.glowCode]}>2020</Text>
          <MetaGrid from="J" time="00:12" dark />
          <View style={styles.darkQuickRow}>
            {replySlots.map((slot) => (
              <View key={slot} style={styles.darkQuickChip}>
                <Text style={styles.darkQuickText}>{slot}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.stickyNote}>
        <Text style={styles.stickyText}>지금 기분,{"\n"}한 번에 전달.{"\n"}코드 하나,{"\n"}감정 하나.</Text>
        <Text style={styles.stickyHeart}>♥</Text>
      </View>
    </View>
  );
}

function PackCard({ pack, onPress }: { pack: IdentityPack; onPress: () => void }) {
  const dark = pack.tone === "night";
  const photo = pack.tone === "photo";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${pack.name} identity pack`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.packCard,
        packToneStyles[pack.tone],
        dark && styles.packCardDark,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.packTop}>
        <Text style={[styles.numTag, dark && styles.numTagDark]}>{pack.index}</Text>
        <Text style={[styles.packName, dark && styles.darkTitle]}>{pack.name}</Text>
        <Text style={[styles.badge, pack.badge === "RARE" && styles.rareBadge]}>{pack.badge}</Text>
      </View>

      <View style={[styles.miniWidget, miniWidgetToneStyles[pack.tone]]}>
        <WidgetHeader title={pack.title} dark={dark} dotColor={dark ? stylesConst.glow : stylesConst.red} />
        <View style={styles.widgetBody}>
          {photo ? (
            <>
              <Text style={[styles.widgetLabel, styles.photoLabel]}>NO.</Text>
              <Text style={styles.photoCode}>{pack.code}</Text>
              <MetaGrid from={pack.from} time={pack.time} />
              <FilmFrames tone="photo" />
            </>
          ) : (
            <>
              <Text style={[styles.widgetLabel, dark && styles.glowText]}>NO.</Text>
              <Text style={[styles.cardCode, pack.tone === "school" && styles.schoolCode, dark && styles.glowCode]}>
                {pack.code}
              </Text>
              <MetaGrid from={pack.from} time={pack.time} dark={dark} />
            </>
          )}
        </View>
      </View>

      <Text style={[styles.replyLabel, dark && styles.glowText]}>REPLY SLOTS</Text>
      <View style={styles.slotRow}>
        {pack.slots.map((slot) => (
          <View key={slot} style={[styles.slotChip, dark && styles.darkChip]}>
            <Text style={[styles.slotText, dark && styles.darkChipText]}>{slot}</Text>
          </View>
        ))}
      </View>

      <Text style={[styles.replyLabel, dark && styles.glowText]}>BEEPY EMOJI</Text>
      <View style={styles.emoteRow}>
        {pack.emotes.map((emote, index) => (
          <View key={`${pack.slug}-${emote}-${index}`} style={[styles.emoteBox, dark && styles.darkEmoteBox]}>
            <Text style={[styles.emoteText, dark && styles.darkChipText]}>{emote}</Text>
            <StatusDot size={5} color={stylesConst.red} style={styles.emoteDot} />
          </View>
        ))}
      </View>

      <View style={[styles.pricePill, dark && styles.rarePricePill]}>
        <Text style={[styles.priceText, dark && styles.rarePriceText]}>{pack.priceLabel}</Text>
      </View>
    </Pressable>
  );
}

function WidgetHeader({
  title,
  dark = false,
  dotColor = stylesConst.red,
}: {
  title: string;
  dark?: boolean;
  dotColor?: string;
}) {
  return (
    <View style={[styles.widgetHeader, dark && styles.darkWidgetHeader]}>
      <Text style={[styles.widgetTitle, dark && styles.glowText]}>{title}</Text>
      <StatusDot size={7} color={dotColor} />
    </View>
  );
}

function MetaGrid({ from, time, dark = false }: { from: string; time: string; dark?: boolean }) {
  return (
    <View style={[styles.metaGrid, dark && styles.darkMetaGrid]}>
      <Text style={[styles.metaLabel, dark && styles.glowText]}>FROM.</Text>
      <Text style={[styles.metaValue, dark && styles.glowText]}>{from}</Text>
      <Text style={[styles.metaLabel, dark && styles.glowText]}>TIME.</Text>
      <Text style={[styles.metaValue, dark && styles.glowText]}>{time}</Text>
    </View>
  );
}

function FilmFrames({ tone }: { tone: "photo" | "cherry" }) {
  return (
    <View style={styles.filmStrip}>
      {["01", "02", "03"].map((label) => (
        <View key={label} style={[styles.filmFrame, tone === "cherry" && styles.cherryFilmFrame]}>
          <Text style={styles.frameIndex}>{label}</Text>
        </View>
      ))}
    </View>
  );
}

function BottomFeature({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <View style={styles.bottomFeature}>
      <View style={styles.bottomIcon}>
        <Text style={styles.bottomIconText}>{icon}</Text>
      </View>
      <View style={styles.bottomFeatureCopy}>
        <Text style={styles.bottomTitle}>{title}</Text>
        <Text style={styles.bottomBody}>{body}</Text>
      </View>
    </View>
  );
}

function Barcode() {
  return <View style={styles.barcode} />;
}

function reportError(err: unknown) {
  const message = err instanceof Error ? err.message : "Unexpected error";
  Alert.alert("BEEP-GET", message);
}

const stylesConst = {
  stage: "#050505",
  stageSoft: "#0B0B0B",
  red: "#F04936",
  paper: "#F4EDE0",
  paperWarm: "#FFF4DF",
  glow: "#BFFF79",
  ink: "#070707",
};

const packToneStyles: Record<IdentityPackTone, object> = {
  paper: { backgroundColor: "#F4EDE0" },
  school: { backgroundColor: "#F7DBA8" },
  cherry: { backgroundColor: "#F8CDD1" },
  photo: { backgroundColor: "#DCE9FF" },
  night: { backgroundColor: "#050505" },
};

const miniWidgetToneStyles: Record<IdentityPackTone, object> = {
  paper: { backgroundColor: "#FFF4DF" },
  school: { backgroundColor: "#FFF0BF" },
  cherry: { backgroundColor: "#FFF0F0", borderColor: "rgba(240,73,54,0.58)" },
  photo: { backgroundColor: "#EDF4FF" },
  night: { backgroundColor: "#11190C", borderColor: "#405B28" },
};

const styles = StyleSheet.create({
  content: {
    padding: spacing[5],
    paddingBottom: spacing[16],
    gap: spacing[5],
    backgroundColor: stylesConst.stage,
  },
  brandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingTop: spacing[2],
  },
  brandTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
  },
  brandTitle: {
    color: colors.paper,
    fontFamily: font.sans,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  brandSub: {
    color: colors.paper,
    fontFamily: font.mono,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  brandMascot: {
    width: 82,
    alignItems: "center",
    marginTop: -8,
  },
  beepyBubble: {
    zIndex: 2,
    alignSelf: "flex-start",
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: radius.pill,
    backgroundColor: colors.paper,
    color: colors.ink,
    fontSize: 9,
    fontWeight: "900",
    transform: [{ rotate: "-8deg" }],
  },
  heroGrid: {
    gap: spacing[4],
  },
  heroCopy: {
    gap: spacing[4],
  },
  heroTitle: {
    color: colors.paper,
    fontFamily: font.sans,
    fontSize: 38,
    lineHeight: 43,
    fontWeight: "900",
    letterSpacing: -2.2,
  },
  heroTitleRed: {
    color: stylesConst.red,
  },
  heroBody: {
    color: "rgba(244,237,224,0.8)",
    fontFamily: font.displayKo,
    fontSize: 15,
    lineHeight: 24,
  },
  miniSlip: {
    alignSelf: "flex-start",
    minWidth: 260,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(7,7,7,0.55)",
    backgroundColor: colors.paper,
    padding: spacing[5],
  },
  miniSlipTitle: {
    color: colors.ink,
    fontFamily: font.mono,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  miniSlipBody: {
    marginTop: spacing[2],
    color: colors.ink,
    fontFamily: font.displayKo,
    fontSize: 12,
    lineHeight: 18,
  },
  sectionHeader: {
    minHeight: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
  },
  openCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(244,237,224,0.72)",
  },
  sectionLabel: {
    color: colors.paper,
    fontFamily: font.mono,
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(244,237,224,0.28)",
  },
  sectionPill: {
    borderWidth: 1,
    borderColor: "rgba(244,237,224,0.38)",
    borderRadius: radius.pill,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    color: "rgba(244,237,224,0.72)",
    fontFamily: font.mono,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.7,
  },
  phoneTryOn: {
    minHeight: 620,
    borderWidth: 1,
    borderColor: "rgba(244,237,224,0.28)",
    borderRadius: 28,
    padding: spacing[5],
    backgroundColor: "#0C1114",
    overflow: "hidden",
  },
  statusLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing[10],
  },
  statusText: {
    color: colors.paper,
    fontFamily: font.sans,
    fontSize: 14,
    fontWeight: "700",
  },
  speech: {
    position: "absolute",
    right: spacing[5],
    top: 98,
    width: 116,
    height: 100,
    borderWidth: 1,
    borderColor: "rgba(244,237,224,0.55)",
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  speechText: {
    color: colors.paper,
    fontFamily: font.sans,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    fontWeight: "700",
  },
  homeWidget: {
    position: "absolute",
    borderWidth: 1,
    borderColor: "rgba(7,7,7,0.62)",
    borderRadius: 14,
    overflow: "hidden",
  },
  paperWidget: {
    left: 24,
    top: 72,
    width: 210,
    height: 166,
    backgroundColor: colors.paperWarm,
  },
  cherryHomeWidget: {
    right: -2,
    top: 262,
    width: 204,
    height: 204,
    backgroundColor: "#F7CBD0",
  },
  nightHomeWidget: {
    left: 12,
    bottom: 128,
    width: 178,
    height: 200,
    backgroundColor: "#11190C",
    borderColor: "#405B28",
  },
  widgetHeader: {
    minHeight: 36,
    paddingHorizontal: spacing[5],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(7,7,7,0.46)",
  },
  darkWidgetHeader: {
    borderBottomColor: "rgba(191,255,121,0.32)",
  },
  widgetTitle: {
    color: colors.ink,
    fontFamily: font.sans,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
  },
  widgetBody: {
    padding: spacing[5],
  },
  widgetLabel: {
    color: colors.ink,
    fontFamily: font.mono,
    fontSize: 8,
    lineHeight: 11,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  heroCode: {
    color: colors.ink,
    fontFamily: font.mono,
    fontSize: 42,
    lineHeight: 48,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -2,
  },
  blinkCode: {
    color: colors.ink,
    fontFamily: font.mono,
    fontSize: 38,
    lineHeight: 44,
    fontWeight: "700",
    letterSpacing: -1.5,
  },
  cardCode: {
    color: colors.ink,
    fontFamily: font.mono,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -1.4,
  },
  schoolCode: {
    fontFamily: font.displayKo,
    fontSize: 30,
    letterSpacing: -1.8,
  },
  glowCode: {
    color: stylesConst.glow,
    textShadowColor: "rgba(191,255,121,0.7)",
    textShadowRadius: 6,
  },
  glowText: {
    color: stylesConst.glow,
  },
  metaGrid: {
    marginTop: spacing[3],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: "rgba(7,7,7,0.35)",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[2],
  },
  darkMetaGrid: {
    borderTopColor: "rgba(191,255,121,0.32)",
  },
  metaLabel: {
    color: colors.ink,
    fontFamily: font.mono,
    fontSize: 8,
    lineHeight: 11,
    fontWeight: "900",
  },
  metaValue: {
    color: colors.ink,
    fontFamily: font.mono,
    fontSize: 8,
    lineHeight: 11,
    fontWeight: "900",
    minWidth: 38,
  },
  darkQuickRow: {
    position: "absolute",
    left: spacing[4],
    right: spacing[4],
    bottom: spacing[4],
    flexDirection: "row",
    gap: spacing[2],
  },
  darkQuickChip: {
    flex: 1,
    minHeight: 26,
    borderWidth: 1,
    borderColor: "rgba(191,255,121,0.46)",
    borderRadius: radius.button,
    alignItems: "center",
    justifyContent: "center",
  },
  darkQuickText: {
    color: stylesConst.glow,
    fontFamily: font.sans,
    fontSize: 9,
    fontWeight: "900",
  },
  stickyNote: {
    position: "absolute",
    right: spacing[8],
    bottom: 34,
    width: 126,
    minHeight: 140,
    backgroundColor: "#EEE5D3",
    padding: spacing[6],
    transform: [{ rotate: "-2deg" }],
  },
  stickyText: {
    color: colors.ink,
    fontFamily: font.displayKo,
    fontSize: 16,
    lineHeight: 24,
  },
  stickyHeart: {
    position: "absolute",
    right: spacing[5],
    bottom: spacing[4],
    color: stylesConst.red,
    fontSize: 18,
  },
  filmStrip: {
    marginTop: spacing[3],
    height: 44,
    flexDirection: "row",
    gap: spacing[1],
    padding: spacing[1],
    backgroundColor: colors.ink,
  },
  filmFrame: {
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "#222",
    justifyContent: "flex-end",
    padding: spacing[1],
  },
  cherryFilmFrame: {
    backgroundColor: "#3A1919",
  },
  frameIndex: {
    color: colors.paper,
    fontFamily: font.mono,
    fontSize: 7,
    fontWeight: "900",
  },
  packGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[4],
  },
  packCard: {
    width: "48%",
    minHeight: 354,
    borderRadius: 14,
    padding: spacing[4],
    overflow: "hidden",
  },
  packCardDark: {
    borderWidth: 1,
    borderColor: "rgba(244,237,224,0.2)",
  },
  packTop: {
    minHeight: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  numTag: {
    width: 24,
    height: 22,
    borderWidth: 1,
    borderColor: "rgba(7,7,7,0.55)",
    borderRadius: 4,
    textAlign: "center",
    textAlignVertical: "center",
    color: colors.ink,
    fontFamily: font.mono,
    fontSize: 10,
    fontWeight: "900",
  },
  numTagDark: {
    color: colors.paper,
    borderColor: "rgba(244,237,224,0.35)",
  },
  packName: {
    flex: 1,
    color: colors.ink,
    fontFamily: font.sans,
    fontSize: 16,
    lineHeight: 17,
    fontWeight: "900",
    letterSpacing: -0.6,
  },
  darkTitle: {
    color: colors.paper,
  },
  badge: {
    borderWidth: 1,
    borderColor: stylesConst.red,
    borderRadius: radius.pill,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    color: stylesConst.red,
    fontFamily: font.mono,
    fontSize: 8,
    fontWeight: "900",
  },
  rareBadge: {
    borderColor: "#E2BE24",
    color: "#E2BE24",
  },
  miniWidget: {
    minHeight: 128,
    borderWidth: 1,
    borderColor: "rgba(7,7,7,0.52)",
    borderRadius: 9,
    overflow: "hidden",
  },
  photoLabel: {
    color: colors.ink,
  },
  photoCode: {
    color: colors.ink,
    fontFamily: font.mono,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -1,
  },
  replyLabel: {
    marginTop: spacing[4],
    color: colors.ink,
    fontFamily: font.mono,
    fontSize: 7,
    lineHeight: 10,
    fontWeight: "900",
    letterSpacing: 0.6,
  },
  slotRow: {
    marginTop: spacing[2],
    flexDirection: "row",
    gap: spacing[2],
  },
  slotChip: {
    flex: 1,
    minHeight: 28,
    borderWidth: 1,
    borderColor: "rgba(7,7,7,0.48)",
    borderRadius: radius.button,
    backgroundColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  darkChip: {
    backgroundColor: "#070B05",
    borderColor: "#405B28",
  },
  slotText: {
    color: colors.ink,
    fontFamily: font.sans,
    fontSize: 9,
    fontWeight: "900",
  },
  darkChipText: {
    color: stylesConst.glow,
  },
  emoteRow: {
    marginTop: spacing[2],
    flexDirection: "row",
    gap: spacing[2],
  },
  emoteBox: {
    flex: 1,
    height: 38,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(7,7,7,0.35)",
    borderRadius: radius.control,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  darkEmoteBox: {
    backgroundColor: "#070B05",
    borderColor: "#405B28",
  },
  emoteText: {
    color: colors.ink,
    fontFamily: font.displayKo,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "900",
  },
  emoteDot: {
    position: "absolute",
    right: spacing[2],
    top: spacing[2],
  },
  pricePill: {
    marginTop: "auto",
    minHeight: 30,
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  rarePricePill: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#E2BE24",
  },
  priceText: {
    color: colors.paper,
    fontFamily: font.mono,
    fontSize: 12,
    fontWeight: "900",
  },
  rarePriceText: {
    color: "#E2BE24",
  },
  shopStrip: {
    borderWidth: 1,
    borderColor: "rgba(244,237,224,0.34)",
    borderRadius: 12,
    overflow: "hidden",
  },
  bottomFeature: {
    minHeight: 76,
    padding: spacing[5],
    borderBottomWidth: 1,
    borderBottomColor: "rgba(244,237,224,0.18)",
    flexDirection: "row",
    gap: spacing[4],
  },
  bottomIcon: {
    width: 34,
    height: 34,
    borderWidth: 1,
    borderColor: "rgba(244,237,224,0.44)",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomIconText: {
    color: colors.paper,
    fontSize: 20,
  },
  bottomFeatureCopy: {
    flex: 1,
    gap: spacing[2],
  },
  bottomTitle: {
    color: colors.paper,
    fontFamily: font.mono,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.7,
  },
  bottomBody: {
    color: "rgba(244,237,224,0.64)",
    fontFamily: font.sans,
    fontSize: 12,
    lineHeight: 18,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[3],
  },
  actionButton: {
    flexGrow: 1,
    minHeight: 40,
    paddingHorizontal: spacing[5],
    borderWidth: 1,
    borderColor: "rgba(244,237,224,0.38)",
    borderRadius: radius.button,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    color: colors.paper,
    fontFamily: font.mono,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.7,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ translateY: 1 }],
  },
  footer: {
    paddingTop: spacing[5],
    borderTopWidth: 1,
    borderTopColor: "rgba(244,237,224,0.28)",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[5],
  },
  barcode: {
    width: 80,
    height: 28,
    backgroundColor: colors.paper,
  },
  footerText: {
    flex: 1,
    color: "rgba(244,237,224,0.72)",
    fontFamily: font.mono,
    fontSize: 10,
    lineHeight: 15,
    letterSpacing: 0.7,
  },
});
