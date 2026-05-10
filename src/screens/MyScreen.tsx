import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Image, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppSurface } from "@/components/AppSurface";
import { BeepyMascot } from "@/components/BeepyMascot";
import { BlinkPersonStrip } from "@/components/BlinkPersonStrip";
import { StatusDot } from "@/components/StatusDot";
import { colors, radius, spacing } from "@/design/tokens";
import { font, type } from "@/design/typography";
import { identityPacks, type IdentityPack, type IdentityPackExpression, type IdentityPackTone } from "@/lib/identityPacks";
import type { RootStackParamList } from "@/navigation/RootNavigator";
import { generateShareText } from "@/services/contactService";
import { useAuthStore } from "@/stores/authStore";
import { useDictionaryStore } from "@/stores/dictionaryStore";

const DEFAULT_WIDGET_SLOTS = ["배고픔", "집중중", "끝나고"];
const DEFAULT_PACK = "classic-paper";
const PACK_EMOTE_LABELS: Record<IdentityPackTone, readonly [string, string, string]> = {
  paper: ["PING", "OK", "OPEN"],
  school: ["NOTE", "FOCUS", "DONE"],
  cherry: ["CHERRY", "HEART", "B:"],
  photo: ["CAM", "BEEPY", "POSE"],
  night: ["RADAR", "SECRET", "LOCK"],
};
export function MyScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { profile } = useAuthStore();
  const { entries, fetch: fetchDictionary } = useDictionaryStore();
  const [selectedSlug, setSelectedSlug] = useState(DEFAULT_PACK);
  const scrollRef = useRef<ScrollView>(null);
  const detailYRef = useRef(0);

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

  const handleSelectPack = (slug: string) => {
    setSelectedSlug(slug);
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: Math.max(detailYRef.current - spacing[6], 0), animated: true });
    });
  };

  return (
    <AppSurface backgroundColor={colors.paper} statusBarStyle="dark">
      <ScrollView ref={scrollRef} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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

        <SectionHeader label="STYLE SHOP" hint="TAP TO TRY" />
        <SelectedPackSummary pack={selectedPack} />
        <View style={styles.packPicker}>
          {identityPacks.map((pack) => (
            <PackTicket
              key={pack.slug}
              pack={pack}
              selected={pack.slug === selectedPack.slug}
              onPress={() => handleSelectPack(pack.slug)}
            />
          ))}
        </View>

        <View onLayout={(event) => (detailYRef.current = event.nativeEvent.layout.y)}>
          <PackDetail pack={selectedPack} replySlots={replySlots} onApply={handleApply} />
        </View>

        <View style={styles.toolPanel}>
          <View style={styles.toolHeaderRow}>
            <Text style={styles.toolTitle}>ROOM TOOLS</Text>
            <Text style={styles.toolHint}>OPTIONAL</Text>
          </View>
          <View style={styles.toolGrid}>
            <ToolButton label="WIDGET" onPress={() => navigation.navigate("WidgetStates", { size: "medium" })} />
            <ToolButton label="LOGS" onPress={() => navigation.navigate("Logs")} />
            <ToolButton label="STUDIO" onPress={() => navigation.navigate("StudioTools")} />
            <ToolButton label="ACCOUNT" onPress={() => navigation.navigate("Account")} />
          </View>
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
          <PackSurfaceDecor tone={pack.tone} />
          <WidgetHeader title={pack.title} dark={dark} />
          <Text style={[styles.widgetLabel, dark && styles.glowText]}>NO.</Text>
          <Text style={[styles.widgetCode, pack.tone === "school" && styles.textCode, dark && styles.glowCode]}>
            {pack.code}
          </Text>
          {pack.tone === "photo" ? <MiniFilmStrip tone={pack.tone} compact /> : null}
          <MetaRow label="FROM." value={pack.from} dark={dark} />
          <MetaRow label="TIME." value={pack.time} dark={dark} />
        </View>

        <View style={[styles.blinkCard, widgetToneStyle[pack.tone], pack.tone === "night" && styles.blinkCardDark]}>
          <PackSurfaceDecor tone={pack.tone} />
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

function SelectedPackSummary({ pack }: { pack: IdentityPack }) {
  const dark = pack.tone === "night";

  return (
    <View
      style={[
        styles.selectedPackPanel,
        detailToneStyle[pack.tone],
        dark && styles.selectedPackPanelDark,
      ]}
    >
      <View pointerEvents="none" style={styles.selectedPackDecor}>
        <PackSurfaceDecor tone={pack.tone} />
      </View>
      <View style={styles.selectedPackContent}>
        <View style={styles.selectedPackTop}>
          <View style={styles.selectedPackTitleBlock}>
            <Text style={[styles.selectedPackKicker, dark && styles.glowText]}>NOW PREVIEWING</Text>
            <Text style={[styles.selectedPackName, dark && styles.darkText]}>
              {pack.index}. {pack.name}
            </Text>
          </View>
          <View style={[styles.selectedPackPricePill, dark && styles.darkPill]}>
            <Text style={[styles.selectedPackPrice, dark && styles.darkText]}>{pack.priceLabel}</Text>
          </View>
        </View>

        <Text style={[styles.selectedPackCopy, dark && styles.darkMuted]} numberOfLines={2}>
          {pack.shortCopy}
        </Text>

        <View style={styles.selectedPackSignals}>
          <View style={[styles.signalPill, dark && styles.signalPillDark]}>
            <Text style={[styles.signalLabel, dark && styles.darkMuted]}>SIGNAL</Text>
            <Text style={[styles.signalValue, dark && styles.darkText]}>{pack.code}</Text>
          </View>
          <View style={[styles.signalPill, dark && styles.signalPillDark]}>
            <Text style={[styles.signalLabel, dark && styles.darkMuted]}>REPLY SLOTS</Text>
            <Text style={[styles.signalValueSmall, dark && styles.darkText]} numberOfLines={1}>
              {pack.slots.join(" / ")}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function PackTicket({
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
      <View style={[styles.tileSlip, widgetToneStyle[pack.tone], dark && styles.tileSlipDark]}>
        <PackSurfaceDecor tone={pack.tone} compact />
        <Text style={[styles.tileCode, pack.tone === "school" && styles.tileTextCode, dark && styles.glowCode]}>
          {pack.code}
        </Text>
        <View style={[styles.tileMiniDot, dark && styles.tileMiniDotDark]} />
      </View>
      <View style={styles.packTop}>
        <Text style={[styles.packIndex, dark && styles.packIndexDark]}>{pack.index}</Text>
        <Text style={[styles.packName, dark && styles.darkText]} numberOfLines={1}>
          {pack.name}
        </Text>
        <Text style={[styles.packBadge, pack.badge === "RARE" && styles.rareBadge]}>{pack.badge}</Text>
      </View>
      <View style={styles.packBottom}>
        <Text style={[styles.priceText, dark && styles.glowText]}>{pack.priceLabel}</Text>
        <Text style={[styles.selectText, selected && styles.selectTextActive]}>{selected ? "ON" : "TRY"}</Text>
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
    <View style={[styles.detailPanel, detailToneStyle[pack.tone], pack.tone === "night" && styles.detailPanelDark]}>
      <View pointerEvents="none" style={styles.detailDecor}>
        <PackSurfaceDecor tone={pack.tone} />
      </View>
      <View style={styles.detailContent}>
        <View style={styles.detailHeader}>
          <View>
            <Text style={[styles.detailKicker, dark && styles.glowText]}>PACK DETAIL</Text>
            <Text style={[styles.detailTitle, dark && styles.darkText]}>{pack.name}</Text>
          </View>
          <Text style={[styles.detailPrice, dark && styles.glowText]}>{pack.priceLabel}</Text>
        </View>

        <Text style={[styles.detailCopy, dark && styles.darkBody]}>
          {pack.shortCopy} 스킨은 앱 화면을 바꾸는 장식이 아니라, 친구 홈 위젯에 도착하는 신호의 표정입니다.
        </Text>

        <View style={styles.detailSlotGrid}>
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

        <View style={styles.detailMediaStack}>
          <View style={styles.detailBlockFull}>
            <Text style={[styles.blockLabel, dark && styles.glowText]}>BEEPY EMOTE</Text>
            <View style={styles.emoteRow}>
              {pack.expressions.slice(0, 3).map((expression, index) => (
                <PackEmote
                  key={`${pack.slug}-${expression.id}`}
                  tone={pack.tone}
                  index={index}
                  expression={expression}
                  dark={dark}
                />
              ))}
            </View>
          </View>

          <View style={styles.detailBlockFull}>
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

function PackSurfaceDecor({ tone, compact = false }: { tone: IdentityPackTone; compact?: boolean }) {
  if (tone === "school") {
    return (
      <View pointerEvents="none" style={styles.surfaceDecor}>
        <View style={[styles.schoolMargin, compact && styles.schoolMarginCompact]} />
        {[0, 1, 2, 3, 4].map((line) => (
          <View
            key={`school-${line}`}
            style={[
              styles.schoolRule,
              compact && styles.schoolRuleCompact,
              { top: (compact ? 24 : 34) + line * (compact ? 17 : 23) },
            ]}
          />
        ))}
        {[0, 1, 2].map((hole) => (
          <View key={`hole-${hole}`} style={[styles.binderHole, { top: 30 + hole * 34 }]} />
        ))}
      </View>
    );
  }

  if (tone === "cherry") {
    return (
      <View pointerEvents="none" style={styles.surfaceDecor}>
        <View style={[styles.cherryDot, styles.cherryDotLarge]} />
        <View style={[styles.cherryDot, styles.cherryDotSmall]} />
        <Text style={[styles.handDoodle, compact && styles.handDoodleCompact]}>B:</Text>
        <Text style={[styles.cherryMark, compact && styles.cherryMarkCompact]}>cherry</Text>
      </View>
    );
  }

  if (tone === "photo") {
    return (
      <View pointerEvents="none" style={styles.surfaceDecor}>
        {[0, 1, 2, 3].map((line) => (
          <View key={`grid-v-${line}`} style={[styles.photoGridV, { left: `${18 + line * 20}%` }]} />
        ))}
        {[0, 1, 2, 3].map((line) => (
          <View key={`grid-h-${line}`} style={[styles.photoGridH, { top: `${24 + line * 18}%` }]} />
        ))}
        <View style={styles.tapeTop} />
        <View style={styles.tapeBottom} />
      </View>
    );
  }

  if (tone === "night") {
    return (
      <View pointerEvents="none" style={styles.surfaceDecor}>
        {[0, 1, 2, 3, 4].map((line) => (
          <View key={`scan-${line}`} style={[styles.scanLine, { top: 24 + line * 21 }]} />
        ))}
        <View style={styles.signalGlow} />
        <Text style={styles.nightBeepy}>B</Text>
      </View>
    );
  }

  return (
    <View pointerEvents="none" style={styles.surfaceDecor}>
      <View style={styles.paperStamp} />
      <Text style={[styles.handDoodle, compact && styles.handDoodleCompact]}>B</Text>
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

function PackEmote({
  tone,
  index,
  expression,
  dark,
}: {
  tone: IdentityPackTone;
  index: number;
  expression: IdentityPackExpression;
  dark: boolean;
}) {
  const displayLabel = PACK_EMOTE_LABELS[tone][index] ?? expression.label;

  return (
    <View
      accessibilityLabel={`${expression.label} emote`}
      style={[
        styles.emoteBox,
        tone === "school" && styles.emoteBoxSchool,
        tone === "cherry" && styles.emoteBoxCherry,
        tone === "photo" && styles.emoteBoxPhoto,
        dark && styles.emoteBoxDark,
      ]}
    >
      <View style={styles.emoteArtSlot}>
        {expression.source === "asset" && expression.asset ? (
          <Image source={expression.asset} resizeMode="contain" style={styles.emoteImage} />
        ) : (
          <EmoteArt tone={tone} index={index} dark={dark} />
        )}
      </View>
      <Text style={[styles.emoteCaption, dark && styles.emoteCaptionDark]}>{displayLabel}</Text>
    </View>
  );
}

function EmoteArt({ tone, index, dark }: { tone: IdentityPackTone; index: number; dark: boolean }) {
  if (tone === "paper") {
    if (index === 0) {
      return <BeepyMascot size={34} style={styles.emoteMascotAsset} />;
    }

    if (index === 1) {
      return (
        <View style={styles.emotePaperOk}>
          <View style={styles.emotePaperRule} />
          <Text style={styles.emotePaperOkText}>OK</Text>
          <View style={styles.emotePaperStamp} />
        </View>
      );
    }

    return (
      <View style={styles.emotePaperOpen}>
        <View style={styles.emotePaperDoor} />
        <View style={styles.emotePaperSignal} />
        <Text style={styles.emotePaperOpenText}>B</Text>
      </View>
    );
  }

  if (tone === "photo") {
    if (index === 0) {
      return (
        <View style={styles.emoteCamera}>
          <View style={styles.emoteCameraTop} />
          <View style={styles.emoteCameraLens} />
          <View style={styles.emoteCameraFlash} />
        </View>
      );
    }

    if (index === 1) {
      return (
        <View style={styles.emotePhotoPoseArt}>
          <View style={styles.emotePhotoPoseFrame} />
          <Text style={styles.emotePhotoPoseText}>V</Text>
          <View style={styles.emotePhotoPoseFlash} />
        </View>
      );
    }

    return (
      <View style={styles.emotePhotoSpark}>
        <View style={styles.emotePhotoCard} />
        <Text style={styles.emoteSparkText}>V</Text>
      </View>
    );
  }

  if (tone === "cherry") {
    if (index === 1) {
      return (
        <View style={styles.emoteCherryHeartArt}>
          <View style={styles.emoteHeartLeft} />
          <View style={styles.emoteHeartRight} />
          <View style={styles.emoteHeartPoint} />
          <Text style={styles.emoteHeartText}>!</Text>
        </View>
      );
    }

    if (index === 2) {
      return (
        <View style={styles.emoteCherryShyArt}>
          <View style={styles.emoteCherryShyFace}>
            <View style={styles.emoteCherryShyEye} />
            <View style={[styles.emoteCherryShyEye, styles.emoteCherryShyEyeRight]} />
            <View style={styles.emoteCherryShyMouth} />
          </View>
          <View style={styles.emoteCherryAccent} />
        </View>
      );
    }

    return (
      <View style={styles.emoteCherryArt}>
        <View style={styles.emoteCherryStem} />
        <View style={[styles.emoteCherry, index === 1 && styles.emoteCherryHeart]} />
        <View style={[styles.emoteCherry, styles.emoteCherrySecond]} />
        <Text style={styles.emoteCherryFace}>:)</Text>
      </View>
    );
  }

  if (tone === "school") {
    if (index === 1) {
      return (
        <View style={styles.emoteFocusArt}>
          <View style={styles.emoteFocusRing} />
          <View style={styles.emoteFocusDot} />
          <View style={styles.emotePencil} />
        </View>
      );
    }

    if (index === 2) {
      return (
        <View style={styles.emoteDoneStamp}>
          <Text style={styles.emoteDoneCheck}>OK</Text>
          <View style={styles.emotePencilSmall} />
        </View>
      );
    }

    return (
      <View style={styles.emoteSchoolArt}>
        <View style={styles.emoteNoteSheet}>
          <View style={styles.emoteNoteHole} />
          <View style={styles.emoteNoteRule} />
          <View style={[styles.emoteNoteRule, styles.emoteNoteRuleSecond]} />
        </View>
        <Text style={styles.emoteSchoolMark}>!</Text>
      </View>
    );
  }

  if (tone === "night") {
    if (index === 1) {
      return (
        <View style={styles.emoteSecretArt}>
          <View style={styles.emoteSecretCard} />
          <View style={styles.emoteSecretBar} />
          <Text style={styles.emoteNightText}>B</Text>
        </View>
      );
    }

    return (
      <View style={styles.emoteNightArt}>
        <View style={styles.emoteRadarRing} />
        <View style={styles.emoteRadarRingSmall} />
        <View style={styles.emoteRadarDot} />
        {index === 2 ? (
          <View style={styles.emoteLock}>
            <View style={styles.emoteLockShackle} />
          </View>
        ) : (
          <Text style={styles.emoteNightText}>B</Text>
        )}
      </View>
    );
  }

  return <BeepyMini dark={dark} blush={index === 2} />;
}

function BeepyMini({ dark, blush = false }: { dark: boolean; blush?: boolean }) {
  return (
    <View style={[styles.beepyMini, dark && styles.beepyMiniDark]}>
      <View style={styles.beepyAntenna} />
      <View style={styles.beepyEyeRow}>
        <View style={[styles.beepyEye, dark && styles.beepyEyeDark]} />
        <View style={[styles.beepyEye, dark && styles.beepyEyeDark]} />
      </View>
      <View style={[styles.beepyMouth, blush && styles.beepyMouthBlush]} />
    </View>
  );
}

function MiniFilmStrip({ tone, compact = false }: { tone: IdentityPackTone; compact?: boolean }) {
  const dark = tone === "night";

  return (
    <View
      style={[
        styles.filmStrip,
        tone === "paper" && styles.filmStripPaper,
        tone === "school" && styles.filmStripSchool,
        tone === "cherry" && styles.filmStripCherry,
        tone === "photo" && styles.filmStripPhoto,
        compact && styles.filmStripCompact,
        dark && styles.filmStripDark,
      ]}
    >
      <BlinkPersonStrip compact={compact} />
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

const detailToneStyle = StyleSheet.create({
  paper: {
    backgroundColor: colors.paperWarm,
    borderColor: colors.ink,
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
    backgroundColor: "#10160A",
    borderColor: "rgba(182, 239, 101, 0.62)",
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
    overflow: "hidden",
    position: "relative",
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
    overflow: "hidden",
    position: "relative",
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
  surfaceDecor: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.88,
  },
  schoolMargin: {
    position: "absolute",
    left: 24,
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: "rgba(208, 68, 46, 0.5)",
  },
  schoolMarginCompact: {
    left: 18,
  },
  schoolRule: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(78, 142, 180, 0.34)",
  },
  schoolRuleCompact: {
    opacity: 0.72,
  },
  binderHole: {
    position: "absolute",
    left: 7,
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "rgba(10, 10, 10, 0.16)",
  },
  cherryDot: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: "rgba(216, 54, 30, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(216, 54, 30, 0.18)",
  },
  cherryDotLarge: {
    width: 92,
    height: 92,
    right: -28,
    bottom: -22,
  },
  cherryDotSmall: {
    width: 42,
    height: 42,
    left: 18,
    top: 44,
  },
  cherryMark: {
    position: "absolute",
    right: 12,
    bottom: 10,
    ...type.tinyMono,
    color: "rgba(158, 33, 21, 0.58)",
    transform: [{ rotate: "-12deg" }],
  },
  cherryMarkCompact: {
    fontSize: 7,
  },
  photoGridV: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: "rgba(85, 126, 179, 0.22)",
  },
  photoGridH: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(85, 126, 179, 0.22)",
  },
  tapeTop: {
    position: "absolute",
    top: 8,
    right: 18,
    width: 46,
    height: 16,
    backgroundColor: "rgba(196, 158, 95, 0.42)",
    transform: [{ rotate: "-9deg" }],
  },
  tapeBottom: {
    position: "absolute",
    bottom: 8,
    left: 22,
    width: 40,
    height: 14,
    backgroundColor: "rgba(196, 158, 95, 0.34)",
    transform: [{ rotate: "7deg" }],
  },
  scanLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(182, 239, 101, 0.18)",
  },
  signalGlow: {
    position: "absolute",
    right: 16,
    top: 18,
    width: 56,
    height: 56,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(182, 239, 101, 0.32)",
    backgroundColor: "rgba(126, 160, 94, 0.1)",
  },
  nightBeepy: {
    position: "absolute",
    right: 32,
    bottom: 12,
    fontFamily: font.mono,
    fontSize: 22,
    color: "rgba(182, 239, 101, 0.48)",
  },
  paperStamp: {
    position: "absolute",
    right: 15,
    bottom: 14,
    width: 38,
    height: 38,
    borderRadius: 999,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(10, 10, 10, 0.28)",
  },
  handDoodle: {
    position: "absolute",
    right: 20,
    bottom: 12,
    fontFamily: font.mono,
    fontSize: 23,
    color: "rgba(10, 10, 10, 0.42)",
    transform: [{ rotate: "8deg" }],
  },
  handDoodleCompact: {
    right: 14,
    bottom: 8,
    fontSize: 15,
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
  selectedPackPanel: {
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: radius.slip,
    padding: spacing[6],
    position: "relative",
    overflow: "hidden",
    gap: spacing[4],
  },
  selectedPackPanelDark: {
    borderColor: "rgba(182, 239, 101, 0.62)",
  },
  selectedPackDecor: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.44,
  },
  selectedPackContent: {
    gap: spacing[4],
  },
  selectedPackTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing[4],
  },
  selectedPackTitleBlock: {
    flex: 1,
    gap: spacing[1],
  },
  selectedPackKicker: {
    ...type.tinyMono,
    color: colors.muted,
  },
  selectedPackName: {
    ...type.screenTitle,
    fontSize: 22,
    lineHeight: 28,
  },
  selectedPackPricePill: {
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    borderRadius: radius.pill,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    backgroundColor: colors.paper,
  },
  selectedPackPrice: {
    ...type.buttonMono,
    color: colors.ink,
  },
  selectedPackCopy: {
    ...type.body,
    color: colors.muted,
  },
  selectedPackSignals: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[3],
  },
  signalPill: {
    flex: 1,
    minWidth: 120,
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    borderRadius: radius.control,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: "rgba(255, 253, 244, 0.72)",
  },
  signalPillDark: {
    borderColor: "rgba(182, 239, 101, 0.32)",
    backgroundColor: "rgba(182, 239, 101, 0.07)",
  },
  signalLabel: {
    ...type.tinyMono,
    color: colors.muted,
  },
  signalValue: {
    ...type.codeSmall,
    fontSize: 24,
    lineHeight: 29,
  },
  signalValueSmall: {
    ...type.buttonMono,
    color: colors.ink,
  },
  packPicker: {
    gap: spacing[3],
  },
  packTile: {
    width: "100%",
    minHeight: 78,
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    borderRadius: radius.slipSmall,
    padding: spacing[3],
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
  },
  packTileSelected: {
    borderWidth: 2,
    borderColor: colors.ink,
    transform: [{ translateY: -1 }],
  },
  packTop: {
    flex: 1,
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
    fontSize: 14,
    lineHeight: 18,
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
    width: 62,
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    borderRadius: radius.slipSmall,
    padding: spacing[2],
    gap: spacing[1],
    overflow: "hidden",
    position: "relative",
  },
  tileSlipDark: {
    borderColor: "rgba(158, 216, 91, 0.58)",
  },
  tileMiniDot: {
    position: "absolute",
    right: spacing[2],
    top: spacing[2],
    width: 6,
    height: 6,
    borderRadius: 99,
    backgroundColor: colors.red,
  },
  tileMiniDotDark: {
    backgroundColor: colors.greenDot,
  },
  tileCode: {
    ...type.codeSmall,
    textAlign: "center",
    fontSize: 18,
    lineHeight: 22,
  },
  tileTextCode: {
    fontFamily: font.displayKo,
    fontSize: 13,
    lineHeight: 17,
    letterSpacing: -0.4,
  },
  packBottom: {
    width: 70,
    alignItems: "center",
    gap: spacing[1],
  },
  priceText: {
    ...type.tinyMono,
    color: colors.ink,
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
    position: "relative",
    overflow: "hidden",
  },
  detailContent: {
    gap: spacing[6],
  },
  detailDecor: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.48,
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
  detailSlotGrid: {
    flexDirection: "row",
    gap: spacing[5],
    alignItems: "flex-start",
  },
  detailBlock: {
    flex: 1,
    minWidth: 0,
    gap: spacing[4],
  },
  detailBlockFull: {
    gap: spacing[4],
  },
  detailMediaStack: {
    gap: spacing[5],
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
    flex: 1,
    minWidth: 0,
    height: 74,
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    borderRadius: radius.control,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.22)",
    paddingVertical: spacing[2],
    gap: spacing[1],
  },
  emoteBoxSchool: {
    backgroundColor: "rgba(255, 231, 184, 0.58)",
    borderColor: "#C7A06A",
  },
  emoteBoxCherry: {
    backgroundColor: "rgba(255, 232, 235, 0.62)",
    borderColor: "#D9868A",
  },
  emoteBoxPhoto: {
    backgroundColor: "rgba(235, 244, 255, 0.82)",
    borderColor: "#8AA8D7",
  },
  emoteBoxDark: {
    borderColor: "rgba(182, 239, 101, 0.42)",
    backgroundColor: "rgba(182, 239, 101, 0.08)",
  },
  emoteArtSlot: {
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  emoteImage: {
    width: 46,
    height: 44,
  },
  emoteCaption: {
    ...type.tinyMono,
    color: colors.ink,
    fontSize: 8,
    lineHeight: 10,
    letterSpacing: 0.8,
  },
  emoteCaptionDark: {
    color: "#B6EF65",
  },
  emoteMascotAsset: {
    marginTop: -2,
  },
  emotePaperOk: {
    width: 43,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.ink,
    backgroundColor: "#FFF7E6",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    transform: [{ rotate: "-3deg" }],
  },
  emotePaperRule: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 10,
    height: 1,
    backgroundColor: "rgba(10,10,10,0.18)",
  },
  emotePaperOkText: {
    ...type.buttonMono,
    color: colors.ink,
    fontSize: 13,
  },
  emotePaperStamp: {
    position: "absolute",
    right: 4,
    bottom: 3,
    width: 12,
    height: 12,
    borderRadius: 99,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(10,10,10,0.36)",
  },
  emotePaperOpen: {
    width: 44,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  emotePaperDoor: {
    width: 28,
    height: 32,
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: 7,
    backgroundColor: "#FFF7E6",
    transform: [{ rotate: "5deg" }],
  },
  emotePaperSignal: {
    position: "absolute",
    right: 5,
    top: 2,
    width: 14,
    height: 14,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: colors.red,
    borderTopRightRadius: 16,
  },
  emotePaperOpenText: {
    position: "absolute",
    ...type.tinyMono,
    color: colors.ink,
  },
  emoteCamera: {
    width: 44,
    height: 30,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#1C2430",
    backgroundColor: "#F7F3EA",
    alignItems: "center",
    justifyContent: "center",
  },
  emoteCameraTop: {
    position: "absolute",
    top: -7,
    left: 7,
    width: 16,
    height: 8,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    backgroundColor: "#1C2430",
  },
  emoteCameraLens: {
    width: 17,
    height: 17,
    borderRadius: 99,
    borderWidth: 3,
    borderColor: "#1C2430",
    backgroundColor: "#BFD8FF",
  },
  emoteCameraFlash: {
    position: "absolute",
    right: 6,
    top: 6,
    width: 5,
    height: 5,
    borderRadius: 99,
    backgroundColor: colors.red,
  },
  emotePhotoPoseArt: {
    width: 46,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  emotePhotoPoseFrame: {
    width: 34,
    height: 28,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#16345E",
    backgroundColor: "#0D1014",
  },
  emotePhotoPoseText: {
    position: "absolute",
    ...type.buttonMono,
    color: "#F5F1E8",
    fontSize: 15,
  },
  emotePhotoPoseFlash: {
    position: "absolute",
    right: 3,
    top: 3,
    width: 9,
    height: 9,
    borderRadius: 99,
    backgroundColor: "#D9342B",
    borderWidth: 1,
    borderColor: "#16345E",
  },
  emotePhotoSpark: {
    width: 45,
    height: 35,
    alignItems: "center",
    justifyContent: "center",
  },
  emotePhotoCard: {
    position: "absolute",
    width: 33,
    height: 27,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#1C2430",
    backgroundColor: "#111111",
    transform: [{ rotate: "-6deg" }],
  },
  emoteSparkText: {
    ...type.buttonMono,
    color: "#F7F3EA",
    fontSize: 15,
  },
  emoteCherryArt: {
    width: 48,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emoteCherryStem: {
    position: "absolute",
    top: 4,
    width: 20,
    height: 15,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: "#7A6B2E",
    borderTopLeftRadius: 16,
    transform: [{ rotate: "18deg" }],
  },
  emoteCherry: {
    position: "absolute",
    width: 25,
    height: 25,
    borderRadius: 99,
    backgroundColor: "#F06E78",
    borderWidth: 1,
    borderColor: "#9E2115",
    left: 9,
    top: 10,
  },
  emoteCherryHeart: {
    borderTopLeftRadius: 9,
    transform: [{ rotate: "-18deg" }],
  },
  emoteCherrySecond: {
    left: 22,
    top: 7,
    backgroundColor: "#FF9FAB",
  },
  emoteCherryFace: {
    ...type.tinyMono,
    color: "#5F1E17",
    marginTop: 9,
  },
  emoteCherryHeartArt: {
    width: 45,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  emoteHeartLeft: {
    position: "absolute",
    left: 11,
    top: 7,
    width: 18,
    height: 18,
    borderRadius: 99,
    backgroundColor: "#F06E78",
  },
  emoteHeartRight: {
    position: "absolute",
    right: 10,
    top: 7,
    width: 18,
    height: 18,
    borderRadius: 99,
    backgroundColor: "#FF9FAB",
  },
  emoteHeartPoint: {
    position: "absolute",
    top: 15,
    width: 22,
    height: 22,
    borderRadius: 5,
    backgroundColor: "#F06E78",
    transform: [{ rotate: "45deg" }],
  },
  emoteHeartText: {
    ...type.tinyMono,
    color: "#5F1E17",
    marginTop: 7,
  },
  emoteCherryShyArt: {
    alignItems: "center",
    justifyContent: "center",
  },
  emoteCherryShyFace: {
    width: 36,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#9E2115",
    backgroundColor: "#FFD9DF",
  },
  emoteCherryShyEye: {
    position: "absolute",
    left: 9,
    top: 11,
    width: 4,
    height: 4,
    borderRadius: 99,
    backgroundColor: "#5F1E17",
  },
  emoteCherryShyEyeRight: {
    left: 22,
  },
  emoteCherryShyMouth: {
    position: "absolute",
    left: 15,
    top: 20,
    width: 8,
    height: 4,
    borderBottomWidth: 1,
    borderColor: "#5F1E17",
    borderRadius: 8,
  },
  emoteCherryAccent: {
    position: "absolute",
    right: 3,
    top: 3,
    width: 10,
    height: 10,
    borderRadius: 99,
    backgroundColor: "#F06E78",
    borderWidth: 1,
    borderColor: "#9E2115",
  },
  emoteSchoolArt: {
    width: 46,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emoteNoteSheet: {
    width: 32,
    height: 26,
    borderWidth: 1,
    borderColor: "#C7A06A",
    borderRadius: 5,
    backgroundColor: "#FFF3CE",
    overflow: "hidden",
  },
  emoteNoteHole: {
    position: "absolute",
    left: 4,
    top: 4,
    width: 5,
    height: 5,
    borderRadius: 99,
    backgroundColor: "rgba(10,10,10,0.18)",
  },
  emoteNoteRule: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 10,
    height: 1,
    backgroundColor: "rgba(78,142,180,0.36)",
  },
  emoteNoteRuleSecond: {
    top: 18,
  },
  emotePencil: {
    position: "absolute",
    width: 31,
    height: 5,
    borderRadius: 99,
    backgroundColor: "#E8AA3B",
    transform: [{ rotate: "-28deg" }],
  },
  emotePencilTilt: {
    transform: [{ rotate: "22deg" }],
  },
  emotePencilSmall: {
    position: "absolute",
    right: 3,
    bottom: 5,
    width: 22,
    height: 4,
    borderRadius: 99,
    backgroundColor: "#E8AA3B",
    transform: [{ rotate: "-16deg" }],
  },
  emoteSchoolMark: {
    ...type.tinyMono,
    color: "#6B4A18",
    marginTop: 1,
  },
  emoteFocusArt: {
    width: 46,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emoteFocusRing: {
    width: 30,
    height: 30,
    borderRadius: 99,
    borderWidth: 2,
    borderColor: "#6B4A18",
    borderStyle: "dashed",
    backgroundColor: "rgba(255, 243, 206, 0.72)",
  },
  emoteFocusDot: {
    position: "absolute",
    width: 7,
    height: 7,
    borderRadius: 99,
    backgroundColor: colors.red,
  },
  emoteDoneStamp: {
    width: 42,
    height: 28,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#6B4A18",
    backgroundColor: "rgba(255, 243, 206, 0.82)",
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-8deg" }],
  },
  emoteDoneCheck: {
    ...type.buttonMono,
    color: "#6B4A18",
    fontSize: 12,
  },
  emoteNightArt: {
    width: 48,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emoteRadarRing: {
    position: "absolute",
    width: 35,
    height: 35,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: "rgba(182, 239, 101, 0.58)",
  },
  emoteRadarRingSmall: {
    position: "absolute",
    width: 22,
    height: 22,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: "rgba(182, 239, 101, 0.38)",
  },
  emoteRadarDot: {
    width: 7,
    height: 7,
    borderRadius: 99,
    backgroundColor: "#B6EF65",
  },
  emoteNightText: {
    position: "absolute",
    ...type.buttonMono,
    color: "#B6EF65",
  },
  emoteSecretArt: {
    width: 48,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  emoteSecretCard: {
    width: 38,
    height: 26,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(182, 239, 101, 0.62)",
    backgroundColor: "rgba(182, 239, 101, 0.08)",
  },
  emoteSecretBar: {
    position: "absolute",
    left: 8,
    right: 8,
    bottom: 11,
    height: 2,
    backgroundColor: "rgba(182, 239, 101, 0.42)",
  },
  emoteLock: {
    width: 22,
    height: 19,
    borderRadius: 4,
    backgroundColor: "#B6EF65",
    marginTop: 6,
  },
  emoteLockShackle: {
    position: "absolute",
    top: -12,
    left: 4,
    width: 14,
    height: 15,
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
    borderWidth: 3,
    borderBottomWidth: 0,
    borderColor: "#B6EF65",
  },
  beepyMini: {
    width: 38,
    height: 34,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.ink,
    backgroundColor: "#FFF7E6",
    alignItems: "center",
    justifyContent: "center",
  },
  beepyMiniDark: {
    borderColor: "#B6EF65",
    backgroundColor: "#10160A",
  },
  beepyAntenna: {
    position: "absolute",
    top: -8,
    right: 7,
    width: 6,
    height: 6,
    borderRadius: 99,
    backgroundColor: colors.red,
  },
  beepyEyeRow: {
    flexDirection: "row",
    gap: spacing[3],
  },
  beepyEye: {
    width: 4,
    height: 8,
    borderRadius: 99,
    backgroundColor: colors.ink,
  },
  beepyEyeDark: {
    backgroundColor: "#B6EF65",
  },
  beepyMouth: {
    width: 10,
    height: 3,
    borderRadius: 99,
    backgroundColor: colors.red,
    marginTop: spacing[2],
  },
  beepyMouthBlush: {
    width: 13,
  },
  filmStrip: {
    width: "100%",
    minHeight: 76,
    borderRadius: radius.control,
    backgroundColor: colors.ink,
    flexDirection: "row",
    overflow: "hidden",
    gap: spacing[2],
    padding: spacing[2],
  },
  filmStripPaper: {
    backgroundColor: "#F5EBDD",
    borderWidth: 1,
    borderColor: colors.ruleStrong,
  },
  filmStripSchool: {
    backgroundColor: "#FFE7B8",
    borderWidth: 1,
    borderColor: "#C7A06A",
  },
  filmStripCherry: {
    backgroundColor: "#FBE0E4",
    borderWidth: 1,
    borderColor: "#D9868A",
  },
  filmStripPhoto: {
    backgroundColor: "#F7FBFF",
    borderWidth: 1,
    borderColor: "#8AA8D7",
    shadowColor: "#6D8FC0",
    shadowOpacity: 0.16,
    shadowRadius: 7,
  },
  filmStripCompact: {
    minHeight: 48,
    padding: spacing[1],
    gap: spacing[1],
  },
  filmStripDark: {
    backgroundColor: "#040604",
    borderWidth: 1,
    borderColor: "rgba(182, 239, 101, 0.3)",
  },
  filmFrame: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: "rgba(244,239,229,0.34)",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[1],
  },
  filmFramePhoto: {
    minHeight: 66,
    borderRightWidth: 0,
    borderRadius: 6,
    backgroundColor: "#111111",
  },
  filmFrameSchool: {
    minHeight: 66,
    borderRightColor: "#C7A06A",
    backgroundColor: "rgba(255, 244, 214, 0.66)",
  },
  filmFrameCherry: {
    minHeight: 66,
    borderRightColor: "rgba(158, 33, 21, 0.22)",
    backgroundColor: "rgba(255, 246, 248, 0.55)",
  },
  filmFrameLight: {
    backgroundColor: "rgba(247,243,234,0.12)",
  },
  filmFrameDark: {
    borderRightColor: "rgba(182, 239, 101, 0.18)",
    backgroundColor: "rgba(182, 239, 101, 0.04)",
  },
  filmFrameCompact: {
    minHeight: 42,
  },
  frameNum: {
    ...type.tinyMono,
    color: "#F7F3EA",
  },
  frameNumLight: {
    color: colors.ink,
  },
  paperFrameArt: {
    width: 42,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  paperFrameArtCompact: {
    width: 28,
    height: 20,
  },
  paperFrameSlip: {
    position: "absolute",
    width: 34,
    height: 24,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.ink,
    backgroundColor: "#FFF7E6",
    transform: [{ rotate: "-3deg" }],
  },
  paperFrameDot: {
    position: "absolute",
    right: 4,
    top: 3,
    width: 6,
    height: 6,
    borderRadius: 99,
    backgroundColor: colors.red,
  },
  paperFrameDotMuted: {
    backgroundColor: "rgba(10,10,10,0.35)",
  },
  paperFrameGlyph: {
    ...type.tinyMono,
    color: colors.ink,
    fontSize: 10,
  },
  photoFrameArt: {
    width: 42,
    height: 30,
    alignItems: "center",
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  photoFrameArtCompact: {
    width: 28,
    height: 20,
  },
  photoHair: {
    position: "absolute",
    top: 3,
    width: 22,
    height: 15,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    backgroundColor: "#F7F3EA",
    opacity: 0.82,
  },
  photoHead: {
    width: 14,
    height: 14,
    borderRadius: 99,
    backgroundColor: "#D9D9D1",
    marginBottom: -1,
  },
  photoShoulders: {
    width: 34,
    height: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: "#3A3A36",
  },
  photoPose: {
    position: "absolute",
    right: 0,
    bottom: -2,
    ...type.tinyMono,
    color: "#F7F3EA",
    fontSize: 10,
  },
  photoPoseCompact: {
    fontSize: 7,
  },
  schoolFrameArt: {
    width: 38,
    height: 26,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#C7A06A",
    backgroundColor: "#FFF7D8",
    justifyContent: "center",
    overflow: "hidden",
  },
  schoolFrameArtCompact: {
    width: 26,
    height: 18,
  },
  schoolMiniRule: {
    width: "100%",
    height: 1,
    backgroundColor: "rgba(78, 142, 180, 0.32)",
  },
  schoolMiniRuleSecond: {
    marginTop: 6,
  },
  schoolMiniMargin: {
    position: "absolute",
    left: 8,
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: "rgba(208, 68, 46, 0.42)",
  },
  schoolMiniPencil: {
    position: "absolute",
    width: 28,
    height: 4,
    borderRadius: 99,
    backgroundColor: "#E8AA3B",
    transform: [{ rotate: "-18deg" }],
  },
  cherryFrameArt: {
    width: 38,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  cherryFrameArtCompact: {
    width: 26,
    height: 20,
  },
  cherryFrameDot: {
    position: "absolute",
    left: 8,
    width: 19,
    height: 19,
    borderRadius: 99,
    backgroundColor: "#F06E78",
  },
  cherryFrameStem: {
    position: "absolute",
    top: 3,
    width: 18,
    height: 12,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: "#7A6B2E",
    borderTopLeftRadius: 15,
    transform: [{ rotate: "15deg" }],
  },
  cherryFrameDotSecond: {
    position: "absolute",
    right: 7,
    top: 5,
    width: 14,
    height: 14,
    borderRadius: 99,
    backgroundColor: "#FF9FAB",
  },
  cherryFrameFace: {
    ...type.tinyMono,
    color: "#5F1E17",
    fontSize: 8,
  },
  nightFrameArt: {
    width: 42,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  nightFrameArtCompact: {
    width: 28,
    height: 20,
  },
  nightFrameRing: {
    position: "absolute",
    width: 29,
    height: 29,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: "rgba(182, 239, 101, 0.45)",
  },
  nightFrameDot: {
    width: 6,
    height: 6,
    borderRadius: 99,
    backgroundColor: "#B6EF65",
  },
  nightFrameBeam: {
    position: "absolute",
    right: 5,
    top: 6,
    width: 14,
    height: 1,
    backgroundColor: "rgba(182, 239, 101, 0.54)",
    transform: [{ rotate: "-20deg" }],
  },
  nightFrameLock: {
    position: "absolute",
    bottom: 3,
    width: 14,
    height: 10,
    borderRadius: 3,
    backgroundColor: "#B6EF65",
  },
  frameSilhouette: {
    width: 20,
    height: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: "rgba(247,243,234,0.2)",
  },
  frameSilhouettePhoto: {
    width: 25,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(247,243,234,0.28)",
    backgroundColor: "rgba(247,243,234,0.1)",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 3,
  },
  frameSilhouetteCherry: {
    width: 18,
    height: 18,
    borderRadius: 99,
    backgroundColor: "rgba(232, 76, 69, 0.5)",
  },
  frameSilhouetteNight: {
    width: 22,
    height: 14,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: "rgba(182, 239, 101, 0.44)",
    backgroundColor: "rgba(182, 239, 101, 0.07)",
  },
  photoFace: {
    width: 9,
    height: 9,
    borderRadius: 99,
    backgroundColor: "rgba(247,243,234,0.72)",
  },
  photoFaceCompact: {
    width: 6,
    height: 6,
  },
  frameSilhouetteCompact: {
    width: 14,
    height: 10,
  },
  frameMark: {
    color: "#F7F3EA",
    fontSize: 11,
    fontWeight: "700",
  },
  frameMarkLight: {
    color: colors.ink,
  },
  frameMarkCompact: {
    fontSize: 7,
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
    gap: spacing[4],
  },
  toolHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[4],
  },
  toolTitle: {
    ...type.tinyMono,
    color: colors.muted,
    letterSpacing: 1,
  },
  toolHint: {
    ...type.tinyMono,
    color: colors.muted,
  },
  toolGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[3],
  },
  toolButton: {
    width: "48%",
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.ruleStrong,
    borderRadius: radius.button,
    paddingHorizontal: spacing[4],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.paper,
  },
  toolButtonText: {
    ...type.buttonMono,
    fontSize: 12,
  },
  toolArrow: {
    fontFamily: font.mono,
    fontSize: 18,
    lineHeight: 20,
    color: colors.ink,
  },
  darkText: {
    color: "#F3F7D0",
  },
  darkBody: {
    color: "rgba(243, 247, 208, 0.72)",
  },
  darkMuted: {
    color: "rgba(243, 247, 208, 0.62)",
  },
  darkPill: {
    backgroundColor: "rgba(182, 239, 101, 0.08)",
    borderColor: "rgba(182, 239, 101, 0.36)",
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
