import React, { useEffect, useMemo, useState } from "react";
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
const DEFAULT_PACK = "classic-paper";

export function MyScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { profile } = useAuthStore();
  const { entries, fetch: fetchDictionary } = useDictionaryStore();
  const [selectedSlug, setSelectedSlug] = useState(DEFAULT_PACK);

  useEffect(() => {
    if (!profile) return;
    fetchDictionary(profile.id).catch(reportError);
  }, [profile?.id, fetchDictionary]);

  const selectedPack = useMemo(
    () => identityPacks.find((pack) => pack.slug === selectedSlug) ?? identityPacks[0],
    [selectedSlug],
  );

  const replySlots = useMemo(() => {
    const saved = entries.map((entry) => entry.code).filter(Boolean);
    return Array.from(new Set([...saved, ...DEFAULT_WIDGET_SLOTS])).slice(0, 3);
  }, [entries]);

  const handleShare = async () => {
    if (!profile) return;
    await Share.share({ message: generateShareText(profile.beep_id, profile.nickname) });
  };

  const handleApply = () => {
    if (selectedPack.isFree) {
      Alert.alert("Classic Paper 적용됨", "현재 빌드에서는 무료 기본 스킨만 실제 적용 상태로 둡니다.");
      return;
    }

    Alert.alert(
      selectedPack.name,
      "지금은 미리보기 단계입니다. 결제는 StoreKit / Google Play Billing 설계 후 별도 PR에서 붙입니다.",
    );
  };

  return (
    <AppSurface backgroundColor={colors.paper} statusBarStyle="dark">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <View style={styles.headerKickerRow}>
              <Text style={styles.headerKicker}>BEEP-GET</Text>
              <StatusDot size={6} color={colors.red} />
            </View>
            <Text style={styles.headerTitle}>MY BEEP ROOM</Text>
            <Text style={styles.headerBody}>내 위젯이 친구 폰에 어떻게 보일지 고르고, 답장 슬롯을 확인합니다.</Text>
          </View>
          <View style={styles.mascotDock}>
            <Text style={styles.mascotBubble}>Beepy</Text>
            <BeepyMascot size={62} />
          </View>
        </View>

        <ProfileSlip
          beepId={profile?.beep_id ?? "NO 04"}
          nickname={profile?.nickname ?? "Mina"}
          pack={selectedPack}
          onShare={handleShare}
        />

        <SectionHeader label="CURRENT WIDGET" hint="FRIEND HOME PREVIEW" />
        <WidgetPreview pack={selectedPack} replySlots={replySlots} />

        <SectionHeader label="STYLE SHOP" hint="PICK ONE PACK" />
        <View style={styles.packGrid}>
          {identityPacks.map((pack) => (
            <PackTile
              key={pack.slug}
              pack={pack}
              selected={pack.slug === selectedPack.slug}
              onPress={() => setSelectedSlug(pack.slug)}
            />
          ))}
        </View>

        <PackDetail pack={selectedPack} replySlots={replySlots} onApply={handleApply} />

        <View style={styles.toolPanel}>
          <Text style={styles.toolTitle}>ROOM TOOLS</Text>
          <ToolButton label="WIDGET PREVIEWS" onPress={() => navigation.navigate("WidgetStates", { size: "medium" })} />
          <ToolButton label="ARCHIVE LOGS" onPress={() => navigation.navigate("Logs")} />
          <ToolButton label="STUDIO TOOLS" onPress={() => navigation.navigate("StudioTools")} />
          <ToolButton label="ACCOUNT / DELETE" onPress={() => navigation.navigate("Account")} />
        </View>
      </ScrollView>
    </AppSurface>
  );
}

function ProfileSlip({
  beepId,
  nickname,
  pack,
  onShare,
}: {
  beepId: string;
  nickname: string;
  pack: IdentityPack;
  onShare: () => void;
}) {
  return (
    <View style={styles.profileSlip}>
      <View style={styles.slipTopLine}>
        <Text style={styles.slipTitle}>MY BEEP SLIP</Text>
        <StatusDot size={8} color={colors.red} />
      </View>
      <MetaRow label="NO." value={beepId} />
      <MetaRow label="NICKNAME" value={nickname} />
      <MetaRow label="ACTIVE STYLE" value={pack.name} />
      <Pressable
        accessibilityRole="button"
        onPress={onShare}
        style={({ pressed }) => [styles.shareButton, pressed && styles.pressed]}
      >
        <Text style={styles.shareText}>SHARE MY BEEP ID</Text>
      </Pressable>
    </View>
  );
}

function WidgetPreview({ pack, replySlots }: { pack: IdentityPack; replySlots: string[] }) {
  const dark = pack.tone === "night";
  const blinkCode = pack.tone === "photo" ? pack.code : "1004";
  const blinkFrom = pack.tone === "photo" ? pack.from : "유나";

  return (
    <View style={styles.previewShell}>
      <View style={styles.previewStage}>
        <View style={[styles.widgetCard, widgetToneStyle[pack.tone], dark && styles.widgetCardDark]}>
          <WidgetHeader title={pack.title} dark={dark} />
          <Text style={[styles.widgetLabel, dark && styles.glowText]}>NO.</Text>
          <Text style={[styles.widgetCode, pack.tone === "school" && styles.textCode, dark && styles.glowCode]}>
            {pack.code}
          </Text>
          <MetaRow label="FROM." value={pack.from} dark={dark} />
          <MetaRow label="TIME." value={pack.time} dark={dark} />
        </View>

        <View style={[styles.blinkCard, pack.tone === "night" && styles.blinkCardDark]}>
          <View style={styles.slipTopLine}>
            <Text style={[styles.blinkTitle, dark && styles.glowText]}>Blink preview</Text>
            <StatusDot size={7} color={dark ? colors.greenDot : colors.red} />
          </View>
          <Text style={[styles.blinkCode, dark && styles.glowCode]}>{blinkCode}</Text>
          <MetaRow label="FROM." value={blinkFrom} dark={dark} />
          <MiniFilmStrip tone={pack.tone} />
          <View style={styles.slotRow}>
            {replySlots.map((slot) => (
              <View key={slot} style={[styles.slotChip, dark && styles.slotChipDark]}>
                <Text style={[styles.slotText, dark && styles.slotTextDark]}>{slot}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
      <Text style={styles.previewNote}>위젯에서는 작게 보이고, 탭하면 Reply Room으로 열립니다.</Text>
    </View>
  );
}

function PackTile({
  pack,
  selected,
  onPress,
}: {
  pack: IdentityPack;
  selected: boolean;
  onPress: () => void;
}) {
  const dark = pack.tone === "night";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${pack.name} 스킨 미리보기`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.packTile,
        packTileToneStyle[pack.tone],
        selected && styles.packTileSelected,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.packTop}>
        <Text style={[styles.packIndex, dark && styles.packIndexDark]}>{pack.index}</Text>
        <Text style={[styles.packName, dark && styles.darkText]}>{pack.name}</Text>
        <Text style={[styles.packBadge, pack.badge === "RARE" && styles.rareBadge]}>{pack.badge}</Text>
      </View>
      <View style={[styles.tileSlip, widgetToneStyle[pack.tone], dark && styles.tileSlipDark]}>
        <WidgetHeader title={pack.title} dark={dark} dotColor={dark ? colors.greenDot : colors.red} />
        <Text style={[styles.tileCode, pack.tone === "school" && styles.tileTextCode, dark && styles.glowCode]}>
          {pack.code}
        </Text>
        <MetaRow label="FROM." value={pack.from} dark={dark} compact />
      </View>
      <View style={styles.packBottom}>
        <Text style={[styles.priceText, dark && styles.glowText]}>{pack.priceLabel}</Text>
        <Text style={[styles.selectText, selected && styles.selectTextActive]}>{selected ? "SELECTED" : "TRY"}</Text>
      </View>
    </Pressable>
  );
}

function PackDetail({
  pack,
  replySlots,
  onApply,
}: {
  pack: IdentityPack;
  replySlots: string[];
  onApply: () => void;
}) {
  const dark = pack.tone === "night";

  return (
    <View style={[styles.detailPanel, pack.tone === "night" && styles.detailPanelDark]}>
      <View style={styles.detailHeader}>
        <View>
          <Text style={[styles.detailKicker, dark && styles.glowText]}>PACK DETAIL</Text>
          <Text style={[styles.detailTitle, dark && styles.darkText]}>{pack.name}</Text>
        </View>
        <Text style={[styles.detailPrice, dark && styles.glowText]}>{pack.priceLabel}</Text>
      </View>

      <Text style={[styles.detailCopy, dark && styles.darkBody]}>
        스킨은 앱 화면을 바꾸는 장식이 아니라, 친구 홈 위젯에 도착하는 신호의 표정입니다.
      </Text>

      <View style={styles.detailGrid}>
        <View style={styles.detailBlock}>
          <Text style={[styles.blockLabel, dark && styles.glowText]}>REPLY SLOTS</Text>
          <View style={styles.slotRow}>
            {pack.slots.map((slot) => (
              <View key={slot} style={[styles.slotChip, dark && styles.slotChipDark]}>
                <Text style={[styles.slotText, dark && styles.slotTextDark]}>{slot}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.detailBlock}>
          <Text style={[styles.blockLabel, dark && styles.glowText]}>MY SLOTS</Text>
          <View style={styles.slotRow}>
            {replySlots.map((slot) => (
              <View key={slot} style={[styles.slotChip, dark && styles.slotChipDark]}>
                <Text style={[styles.slotText, dark && styles.slotTextDark]}>{slot}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.detailGrid}>
        <View style={styles.detailBlock}>
          <Text style={[styles.blockLabel, dark && styles.glowText]}>BEEPY EMOTE</Text>
          <View style={styles.emoteRow}>
            {pack.emotes.map((emote, index) => (
              <View key={`${pack.slug}-${index}`} style={[styles.emoteBox, dark && styles.emoteBoxDark]}>
                <Text style={[styles.emoteText, dark && styles.glowText]}>{emote}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.detailBlock}>
          <Text style={[styles.blockLabel, dark && styles.glowText]}>BLINK 3-CUT</Text>
          <MiniFilmStrip tone={pack.tone} />
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={onApply}
        style={({ pressed }) => [styles.applyButton, dark && styles.applyButtonDark, pressed && styles.pressed]}
      >
        <Text style={[styles.applyText, dark && styles.glowText]}>{pack.isFree ? "EQUIPPED" : "PREVIEW LOCKED PACK"}</Text>
      </Pressable>
    </View>
  );
}

function SectionHeader({ label, hint }: { label: string; hint: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.sectionLine} />
      <Text style={styles.sectionHint}>{hint}</Text>
    </View>
  );
}

function WidgetHeader({
  title,
  dark,
  dotColor = colors.red,
}: {
  title: string;
  dark?: boolean;
  dotColor?: string;
}) {
  return (
    <View style={styles.widgetHeader}>
      <Text style={[styles.widgetTitle, dark && styles.glowText]}>{title}</Text>
      <StatusDot size={8} color={dotColor} />
    </View>
  );
}

function MetaRow({
  label,
  value,
  dark,
  compact,
}: {
  label: string;
  value: string;
  dark?: boolean;
  compact?: boolean;
}) {
  return (
    <View style={[styles.metaRow, compact && styles.metaRowCompact, dark && styles.metaRowDark]}>
      <Text style={[styles.metaLabel, dark && styles.glowText]}>{label}</Text>
      <Text style={[styles.metaValue, dark && styles.darkText]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function MiniFilmStrip({ tone }: { tone: IdentityPackTone }) {
  const dark = tone === "night";

  return (
    <View style={[styles.filmStrip, dark && styles.filmStripDark]}>
      {[1, 2, 3].map((frame) => (
        <View key={frame} style={[styles.filmFrame, dark && styles.filmFrameDark]}>
          <Text style={[styles.frameNum, dark && styles.glowText]}>0{frame}</Text>
          <Text style={[styles.frameMark, dark && styles.glowText]}>{tone === "photo" ? "✌" : "♥"}</Text>
        </View>
      ))}
    </View>
  );
}

function ToolButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.toolButton, pressed && styles.pressed]}
    >
      <Text style={styles.toolButtonText}>{label}</Text>
      <Text style={styles.toolArrow}>›</Text>
    </Pressable>
  );
}

function reportError(err: unknown) {
  console.warn(err);
}

const packTileToneStyle = StyleSheet.create({
  paper: {
    backgroundColor: colors.paperWarm,
  },
  school: {
    backgroundColor: "#F9DFB8",
  },
  cherry: {
    backgroundColor: "#F9D3D7",
  },
  photo: {
    backgroundColor: "#DDEBFF",
  },
  night: {
    backgroundColor: "#10160A",
    borderColor: "rgba(174, 224, 98, 0.45)",
  },
});

const widgetToneStyle = StyleSheet.create({
  paper: {
    backgroundColor: colors.paperWarm,
  },
  school: {
    backgroundColor: "#FFE6B9",
    borderColor: "#C7A06A",
  },
  cherry: {
    backgroundColor: "#F8D6D9",
    borderColor: "#D9868A",
  },
  photo: {
    backgroundColor: "#E6F0FF",
    borderColor: "#8AA8D7",
  },
  night: {
    backgroundColor: "#12190B",
    borderColor: "#9ED85B",
  },
});

const styles = StyleSheet.create({
  content: {
    padding: spacing[6],
    paddingBottom: 110,
    gap: spacing[8],
  },
  header: {
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: radius.slip,
    padding: spacing[7],
    backgroundColor: colors.paperWarm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[5],
  },
  headerText: {
    flex: 1,
    gap: spacing[3],
  },
  headerKickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
  },
  headerKicker: {
    ...type.tinyMono,
    color: colors.ink,
    letterSpacing: 1.5,
  },
  headerTitle: {
    ...type.screenTitle,
    fontFamily: font.mono,
    fontSize: 24,
    lineHeight: 29,
    letterSpacing: -0.8,
  },
  headerBody: {
    ...type.bodyMuted,
    maxWidth: 260,
  },
  mascotDock: {
    width: 82,
    alignItems: "center",
    justifyContent: "center",
  },
  mascotBubble: {
    ...type.tinyMono,
    color: colors.ink,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: radius.pill,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[1],
    transform: [{ rotate: "-8deg" }],
  },
  profileSlip: {
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    borderRadius: radius.slip,
    backgroundColor: colors.paperWarm,
    padding: spacing[7],
    gap: spacing[4],
  },
  slipTopLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[4],
  },
  slipTitle: {
    ...type.slipTitle,
    fontFamily: font.mono,
    letterSpacing: -0.2,
  },
  shareButton: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: radius.button,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.ink,
    marginTop: spacing[2],
  },
  shareText: {
    ...type.buttonMono,
    color: colors.paperWarm,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[4],
    paddingHorizontal: spacing[2],
  },
  sectionLabel: {
    ...type.tinyMono,
    color: colors.ink,
    letterSpacing: 1.4,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.ruleStrong,
  },
  sectionHint: {
    ...type.tinyMono,
    color: colors.muted,
    letterSpacing: 0.7,
  },
  previewShell: {
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: radius.pagerInner,
    backgroundColor: colors.stage,
    padding: spacing[6],
    gap: spacing[5],
  },
  previewStage: {
    minHeight: 360,
    borderWidth: 1,
    borderColor: "rgba(247, 243, 234, 0.22)",
    borderRadius: radius.slip,
    padding: spacing[7],
    justifyContent: "space-between",
    backgroundColor: "#0D0D0D",
    gap: spacing[6],
  },
  widgetCard: {
    width: "78%",
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    borderRadius: radius.slipSmall,
    padding: spacing[6],
    gap: spacing[3],
    alignSelf: "flex-start",
  },
  widgetCardDark: {
    borderColor: "rgba(158, 216, 91, 0.58)",
  },
  blinkCard: {
    width: "76%",
    alignSelf: "flex-end",
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    borderRadius: radius.slipSmall,
    backgroundColor: colors.paperWarm,
    padding: spacing[6],
    gap: spacing[4],
  },
  blinkCardDark: {
    backgroundColor: "#12190B",
    borderColor: "rgba(158, 216, 91, 0.58)",
  },
  previewNote: {
    ...type.tinyMono,
    color: colors.white,
    textAlign: "center",
  },
  widgetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.ruleStrong,
    paddingBottom: spacing[3],
  },
  widgetTitle: {
    ...type.slipTitleSmall,
    fontSize: 15,
    lineHeight: 19,
  },
  widgetLabel: {
    ...type.metaLabel,
    marginTop: spacing[2],
  },
  widgetCode: {
    ...type.codeMedium,
    textAlign: "center",
    fontSize: 54,
    lineHeight: 62,
  },
  textCode: {
    fontFamily: font.displayKo,
    fontSize: 35,
    lineHeight: 45,
    letterSpacing: -1,
  },
  blinkTitle: {
    ...type.slipTitleSmall,
  },
  blinkCode: {
    ...type.codeSmall,
    fontSize: 42,
    lineHeight: 46,
    textAlign: "center",
  },
  metaRow: {
    minHeight: 26,
    borderTopWidth: 1,
    borderTopColor: colors.ruleStrong,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[4],
  },
  metaRowCompact: {
    minHeight: 21,
  },
  metaRowDark: {
    borderTopColor: "rgba(158, 216, 91, 0.36)",
  },
  metaLabel: {
    ...type.metaLabel,
    width: 74,
  },
  metaValue: {
    ...type.metaValue,
    flex: 1,
  },
  packGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[5],
  },
  packTile: {
    width: "48%",
    minHeight: 210,
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: radius.slip,
    padding: spacing[5],
    gap: spacing[4],
  },
  packTileSelected: {
    borderWidth: 2,
    transform: [{ translateY: -2 }],
  },
  packTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
  },
  packIndex: {
    ...type.tinyMono,
    color: colors.ink,
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    borderRadius: radius.control,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
  },
  packIndexDark: {
    color: "#B6EF65",
    borderColor: "rgba(182, 239, 101, 0.42)",
  },
  packName: {
    ...type.slipTitleSmall,
    flex: 1,
  },
  packBadge: {
    ...type.tinyMono,
    color: colors.red,
    borderWidth: 1,
    borderColor: colors.red,
    borderRadius: radius.pill,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
  },
  rareBadge: {
    color: "#E0C759",
    borderColor: "#E0C759",
  },
  tileSlip: {
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    borderRadius: radius.slipSmall,
    padding: spacing[4],
    gap: spacing[2],
    minHeight: 104,
  },
  tileSlipDark: {
    borderColor: "rgba(158, 216, 91, 0.58)",
  },
  tileCode: {
    ...type.codeSmall,
    textAlign: "center",
    fontSize: 33,
    lineHeight: 38,
  },
  tileTextCode: {
    fontFamily: font.displayKo,
    fontSize: 23,
    lineHeight: 31,
    letterSpacing: -0.8,
  },
  packBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "auto",
  },
  priceText: {
    ...type.buttonMono,
  },
  selectText: {
    ...type.tinyMono,
    color: colors.muted,
  },
  selectTextActive: {
    color: colors.red,
  },
  detailPanel: {
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: radius.slip,
    backgroundColor: colors.paperWarm,
    padding: spacing[7],
    gap: spacing[6],
  },
  detailPanelDark: {
    backgroundColor: "#10160A",
    borderColor: "rgba(182, 239, 101, 0.62)",
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing[4],
  },
  detailKicker: {
    ...type.tinyMono,
    color: colors.muted,
  },
  detailTitle: {
    ...type.screenTitle,
    fontSize: 21,
    lineHeight: 28,
  },
  detailPrice: {
    ...type.buttonMono,
    color: colors.ink,
  },
  detailCopy: {
    ...type.body,
    color: colors.muted,
  },
  detailGrid: {
    flexDirection: "row",
    gap: spacing[5],
  },
  detailBlock: {
    flex: 1,
    gap: spacing[4],
  },
  blockLabel: {
    ...type.tinyMono,
    color: colors.muted,
  },
  slotRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[3],
  },
  slotChip: {
    minHeight: 30,
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    borderRadius: radius.button,
    paddingHorizontal: spacing[4],
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.34)",
  },
  slotChipDark: {
    borderColor: "rgba(182, 239, 101, 0.42)",
    backgroundColor: "rgba(158, 216, 91, 0.08)",
  },
  slotText: {
    ...type.button,
    fontSize: 11,
  },
  slotTextDark: {
    color: "#D5FF8A",
  },
  emoteRow: {
    flexDirection: "row",
    gap: spacing[3],
  },
  emoteBox: {
    width: 42,
    height: 38,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.ruleStrong,
    borderRadius: radius.control,
    alignItems: "center",
    justifyContent: "center",
  },
  emoteBoxDark: {
    borderColor: "rgba(182, 239, 101, 0.42)",
  },
  emoteText: {
    ...type.slipTitle,
    fontFamily: font.mono,
    fontSize: 18,
  },
  filmStrip: {
    minHeight: 48,
    borderRadius: radius.control,
    backgroundColor: colors.ink,
    flexDirection: "row",
    overflow: "hidden",
  },
  filmStripDark: {
    backgroundColor: "#040604",
    borderWidth: 1,
    borderColor: "rgba(182, 239, 101, 0.3)",
  },
  filmFrame: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: "rgba(244,239,229,0.25)",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[1],
  },
  filmFrameDark: {
    borderRightColor: "rgba(182, 239, 101, 0.18)",
  },
  frameNum: {
    ...type.tinyMono,
    color: colors.white,
  },
  frameMark: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
  applyButton: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: radius.button,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  applyButtonDark: {
    borderColor: "rgba(182, 239, 101, 0.72)",
    backgroundColor: "#050805",
  },
  applyText: {
    ...type.buttonMono,
    color: colors.paperWarm,
  },
  toolPanel: {
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    borderRadius: radius.slip,
    backgroundColor: colors.paperWarm,
    padding: spacing[6],
    gap: spacing[3],
  },
  toolTitle: {
    ...type.tinyMono,
    color: colors.muted,
    letterSpacing: 1,
    marginBottom: spacing[2],
  },
  toolButton: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    borderRadius: radius.button,
    paddingHorizontal: spacing[5],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.paper,
  },
  toolButtonText: {
    ...type.buttonMono,
  },
  toolArrow: {
    fontFamily: font.mono,
    fontSize: 24,
    lineHeight: 26,
    color: colors.ink,
  },
  darkText: {
    color: "#F3F7D0",
  },
  darkBody: {
    color: "rgba(243, 247, 208, 0.72)",
  },
  glowText: {
    color: "#B6EF65",
  },
  glowCode: {
    color: "#9BEA5B",
    textShadowColor: "rgba(155, 234, 91, 0.42)",
    textShadowRadius: 9,
  },
  pressed: {
    opacity: 0.7,
  },
});
