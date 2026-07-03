import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  Card,
  Chip,
  ListRow,
  PillButton,
  RowChevron,
  Screen,
  SectionLabel,
} from "@/ui/primitives";
import { radius, spacing } from "@/design/tokens";
import { font, type } from "@/design/typography";
import { SIGNAL_COLOR_OPTIONS, useAppPalette, type SignalColor } from "@/design/appTheme";
import { AVATAR_PRESETS } from "@/design/avatarPresets";
import { getAvatarImageSource, getAvatarLabel, normalizeAvatarUri } from "@/lib/avatarSource";
import {
  identityPacks,
  getIdentityPack,
  type IdentityPack,
} from "@/design/identityPacks";
import {
  WidgetSkinPackCard,
  getPackVisual,
} from "@/components/WidgetSkinPackCard";
import type { RootStackParamList } from "@/navigation/RootNavigator";
import { freePackSlugs, loadOwnedIdentityPacks } from "@/lib/identityPackOwnership";
import { useAuthStore } from "@/stores/authStore";
import { useDictionaryStore } from "@/stores/dictionaryStore";
import { useSkinStore } from "@/stores/skinStore";
import { useThemeStore } from "@/stores/themeStore";
import { isIdentityPackStoreEnabled } from "@/lib/releaseFlags";
import { purchaseIdentityPack } from "@/services/purchaseService";
import {
  DEFAULT_QUICK_REPLY_SLOTS,
  buildQuickReplySlots,
  getConfiguredQuickReplyEntries,
  getQuickReplySlotLabel,
  getQuickReplySlotOrder,
} from "@/lib/quickReplySlots";

export function MyScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { profile, updateAvatar } = useAuthStore();
  const { entries, fetch: fetchDictionary, add, update } = useDictionaryStore();
  const palette = useAppPalette();
  const signalColor = useThemeStore((state) => state.signalColor);
  const setSignalColor = useThemeStore((state) => state.setSignalColor);
  const {
    activeIdentityPackSlug,
    fetchActiveIdentityPack,
    fetchAll: fetchSkins,
    applyIdentityPack,
    setLocalActiveIdentityPack,
  } = useSkinStore();
  const [ownedPackSlugs, setOwnedPackSlugs] = useState<ReadonlySet<string>>(
    () => new Set(freePackSlugs()),
  );
  const [quickReplyDialogVisible, setQuickReplyDialogVisible] = useState(false);
  const [skinSheetVisible, setSkinSheetVisible] = useState(false);
  const [avatarSheetVisible, setAvatarSheetVisible] = useState(false);
  const [quickReplyDrafts, setQuickReplyDrafts] = useState(DEFAULT_QUICK_REPLY_SLOTS);

  useEffect(() => {
    if (!profile) return;
    fetchDictionary(profile.id).catch(reportError);
  }, [profile?.id, fetchDictionary]);

  useEffect(() => {
    fetchSkins().catch(reportError);
  }, [fetchSkins]);

  useEffect(() => {
    if (!profile) return;
    fetchActiveIdentityPack(profile.id).catch(reportError);
    loadOwnedIdentityPacks(profile.id).then(setOwnedPackSlugs).catch(reportError);
  }, [fetchActiveIdentityPack, profile?.id]);

  const quickReplyEntries = useMemo(
    () => getConfiguredQuickReplyEntries(entries),
    [entries],
  );

  const replySlots = useMemo(
    () => buildQuickReplySlots(entries, DEFAULT_QUICK_REPLY_SLOTS),
    [entries],
  );

  const activePack = getIdentityPack(activeIdentityPackSlug);
  const avatarUri = normalizeAvatarUri(profile?.avatar_url) ?? "";
  const avatarSource = getAvatarImageSource(avatarUri);
  const avatarLabel = getAvatarLabel(profile, "ME");
  const displayName = profile?.nickname?.trim() || "You";
  const handle = profile?.beep_id?.trim() ?? "";
  const skinPackPreviewName = profile?.beep_id?.trim() || profile?.nickname?.trim() || "You";
  const skinPackPriorityCopy = "스킨 팩은 위젯과 Send 카드 표면만 바꿉니다.";

  const chooseSkinPack = async (pack: IdentityPack) => {
    const isOwned = ownedPackSlugs.has(pack.slug);

    try {
      if (!isOwned) {
        if (!isIdentityPackStoreEnabled) {
          Alert.alert(
            "Skin Pack Preview",
            `${pack.name} is part of the upcoming paid skin set. The first iOS release only lets you preview locked packs.`,
          );
          return;
        }

        if (!profile) {
          Alert.alert("Sign in needed", "Sign in before unlocking a skin pack.");
          return;
        }

        await purchaseIdentityPack(pack.slug);
        setOwnedPackSlugs((current) => new Set([...current, pack.slug]));
        await applyIdentityPack(profile.id, pack.slug);
        setSkinSheetVisible(false);
        return;
      }

      if (!profile) {
        setLocalActiveIdentityPack(pack.slug);
        setSkinSheetVisible(false);
        return;
      }
      await applyIdentityPack(profile.id, pack.slug);
      setSkinSheetVisible(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        Alert.alert("Skin pack failed", err.message);
        return;
      }
      throw err;
    }
  };

  const chooseAvatar = async (uri: string) => {
    try {
      if (profile?.avatar_url === uri) {
        setAvatarSheetVisible(false);
        return;
      }
      await updateAvatar(uri);
      setAvatarSheetVisible(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        Alert.alert("Avatar failed", err.message);
        return;
      }
      throw err;
    }
  };

  const openQuickReplyDialog = () => {
    setQuickReplyDrafts(replySlots);
    setQuickReplyDialogVisible(true);
  };

  const updateQuickReplyDraft = (index: number, value: string) => {
    setQuickReplyDrafts((current) => {
      const next = [...current];
      next[index] = value.slice(0, 20);
      return next;
    });
  };

  const saveQuickReplySlots = async () => {
    if (!profile) return;
    const cleanedSlots = quickReplyDrafts.map((slot) => slot.trim()).slice(0, 3);
    if (cleanedSlots.some((slot) => !slot)) {
      Alert.alert("Replies need text", "Each widget quick reply needs a short code or word.");
      return;
    }

    try {
      for (const [index, slot] of cleanedSlots.entries()) {
        const meaning = getQuickReplySlotLabel(index);
        const sortOrder = index + 1;
        const existing =
          quickReplyEntries.find((entry) => getQuickReplySlotOrder(entry) === sortOrder) ??
          quickReplyEntries[index];
        if (existing) {
          if (
            existing.code !== slot ||
            existing.meaning !== meaning ||
            !existing.is_widget_slot ||
            existing.sort_order !== sortOrder
          ) {
            await update(existing.id, slot, meaning, {
              isWidgetSlot: true,
              sortOrder,
            });
          }
        } else {
          await add(profile.id, slot, meaning, {
            isWidgetSlot: true,
            sortOrder,
          });
        }
      }
      setQuickReplyDrafts(cleanedSlots);
      setQuickReplyDialogVisible(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        Alert.alert("Slots failed", err.message);
        return;
      }
      throw err;
    }
  };

  return (
    <>
      <Screen title="My">
        <MyProfileCard
          avatarLabel={avatarLabel}
          avatarSource={avatarSource}
          displayName={displayName}
          handle={handle}
          onEdit={() => setAvatarSheetVisible(true)}
        />

        <SectionLabel>스킨 팩</SectionLabel>
        <SkinPackCard activePack={activePack} onPress={() => setSkinSheetVisible(true)} />

        <SectionLabel>시그널 컬러</SectionLabel>
        <Card style={styles.signalColorCard}>
          <View style={styles.signalColorRow}>
            {(Object.keys(SIGNAL_COLOR_OPTIONS) as SignalColor[]).map((key) => {
              const option = SIGNAL_COLOR_OPTIONS[key];
              const selected = signalColor === key;
              return (
                <Pressable
                  key={key}
                  accessibilityLabel={`Use ${option.label} signal color`}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => void setSignalColor(key)}
                  style={({ pressed }) => [
                    styles.signalColorOption,
                    {
                      borderColor: selected ? palette.text : palette.rule,
                      backgroundColor: selected ? palette.sigSoft : palette.input,
                    },
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={[styles.signalColorSwatch, { backgroundColor: option.light.sig }]} />
                  <Text style={[styles.signalColorLabel, { color: palette.text }]}>{option.label}</Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={[type.tinyMono, { color: palette.muted }]}>LED · Incoming · Selection only</Text>
        </Card>

        <SectionLabel>퀵 리플라이 슬롯</SectionLabel>
        <Card style={styles.slotsCard}>
          <View style={styles.slotChipRow}>
            {replySlots.map((slot, index) => (
              <Chip key={`${slot}-${index}`} label={slot} flex />
            ))}
          </View>
          <View style={styles.slotMetaRow}>
            <Text style={[styles.slotCaption, { color: palette.muted }]}>
              위젯과 Today에서 한 번에 답할 때 쓰는 3칸
            </Text>
            <Pressable
              accessibilityLabel="슬롯 설정"
              accessibilityRole="button"
              onPress={openQuickReplyDialog}
              style={({ pressed }) => [styles.slotConfigureLink, pressed && styles.pressed]}
            >
              <Text style={[styles.slotConfigureText, { color: palette.sig }]}>슬롯 설정</Text>
            </Pressable>
          </View>
        </Card>

        <SectionLabel>설정</SectionLabel>
        <Card>
          <ListRow
            title="신호 코드 사전"
            right={<RowChevron />}
            onPress={() => navigation.navigate("Dictionary")}
          />
          <ListRow
            title="저장한 Blink"
            right={<RowChevron />}
            onPress={() => navigation.navigate("Logs")}
          />
          <ListRow
            title="계정"
            meta="테마 · 개인정보 · 로그아웃"
            right={<RowChevron />}
            isLast
            onPress={() => navigation.navigate("Account")}
          />
        </Card>
      </Screen>

      {quickReplyDialogVisible ? (
        <SheetShell scrimLabel="슬롯 설정 닫기" onClose={() => setQuickReplyDialogVisible(false)}>
          <Text style={[styles.dialogTitle, { color: palette.text }]}>위젯 퀵 리플라이 설정</Text>
          {quickReplyDrafts.map((slot, index) => (
            <View key={`${slot}-${index}`} style={styles.slotEditBlock}>
              <Text style={[type.tinyMono, { color: palette.muted }]}>WIDGET REPLY {index + 1}</Text>
              <TextInput
                value={slot}
                onChangeText={(value) => updateQuickReplyDraft(index, value)}
                maxLength={20}
                placeholder={`Slot ${index + 1}`}
                placeholderTextColor={palette.muted2}
                style={[styles.dialogInput, { color: palette.text, borderColor: palette.rule, backgroundColor: palette.input }]}
              />
            </View>
          ))}
          <View style={styles.dialogActions}>
            <ActionPill label="Cancel" onPress={() => setQuickReplyDialogVisible(false)} />
            <ActionPill label="Save" dark onPress={saveQuickReplySlots} />
          </View>
        </SheetShell>
      ) : null}

      <SkinPackSheet
        visible={skinSheetVisible}
        activePackSlug={activeIdentityPackSlug}
        ownedPackSlugs={ownedPackSlugs}
        previewFrom={skinPackPreviewName}
        priorityCopy={skinPackPriorityCopy}
        onClose={() => setSkinSheetVisible(false)}
        onSelect={chooseSkinPack}
      />

      <AvatarPickerSheet
        visible={avatarSheetVisible}
        avatarUri={avatarUri}
        onClose={() => setAvatarSheetVisible(false)}
        onSelect={chooseAvatar}
      />
    </>
  );
}

function MyProfileCard({
  avatarLabel,
  avatarSource,
  displayName,
  handle,
  onEdit,
}: {
  readonly avatarLabel: string;
  readonly avatarSource?: ImageSourcePropType;
  readonly displayName: string;
  readonly handle: string;
  readonly onEdit: () => void;
}) {
  return (
    <Card>
      <ListRow
        isLast
        left={<ProfileAvatar label={avatarLabel} source={avatarSource} />}
        title={displayName}
        meta={handle ? `@${handle}` : undefined}
        metaMono
        right={<PillButton label="편집" accessibilityLabel="프로필 편집" onPress={onEdit} />}
      />
    </Card>
  );
}

function ProfileAvatar({
  label,
  source,
}: {
  readonly label: string;
  readonly source?: ImageSourcePropType;
}) {
  const palette = useAppPalette();
  return (
    <View
      style={[
        styles.avatar,
        { borderColor: palette.ruleStrong, backgroundColor: palette.input },
      ]}
    >
      {source ? (
        <Image source={source} style={styles.avatarImage} resizeMode="cover" />
      ) : (
        <Text style={[styles.avatarLabel, { color: palette.text }]}>{label.slice(0, 2)}</Text>
      )}
    </View>
  );
}

function SkinPackCard({
  activePack,
  onPress,
}: {
  readonly activePack: IdentityPack;
  readonly onPress: () => void;
}) {
  const visual = getPackVisual(activePack);
  return (
    <Card>
      <ListRow
        isLast
        accessibilityLabel="Open Skin Pack picker"
        onPress={onPress}
        left={
          <View style={[styles.packSwatch, { backgroundColor: visual.surface, borderColor: visual.border }]}>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.6}
              style={[styles.packSwatchCode, { color: visual.text }]}
            >
              {activePack.code}
            </Text>
            <View style={[styles.packSwatchAccent, { backgroundColor: visual.accent }]} />
          </View>
        }
        title={activePack.name}
        meta="위젯 · Send 카드 · 아바타 프레임"
        right={<PillButton label="변경" onPress={onPress} />}
      />
    </Card>
  );
}

function SheetShell({
  scrimLabel,
  onClose,
  panelStyle,
  children,
}: {
  scrimLabel: string;
  onClose: () => void;
  panelStyle?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}) {
  const palette = useAppPalette();

  const sheet = (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.sheetOverlay}
    >
      <Pressable accessibilityLabel={scrimLabel} onPress={onClose} style={styles.sheetBackdrop} />
      <View
        style={[
          styles.sheetPanel,
          Platform.OS === "web" && styles.webSheetPanel,
          { backgroundColor: palette.card, borderColor: palette.rule },
          panelStyle,
        ]}
      >
        <View style={[styles.grabBar, { backgroundColor: palette.rule }]} />
        {children}
      </View>
    </KeyboardAvoidingView>
  );

  if (Platform.OS === "web") {
    return <View style={styles.webSheetHost}>{sheet}</View>;
  }

  return (
    <Modal transparent visible animationType="slide" onRequestClose={onClose}>
      {sheet}
    </Modal>
  );
}

function SkinPackSheet({
  visible,
  activePackSlug,
  ownedPackSlugs,
  previewFrom,
  priorityCopy,
  onClose,
  onSelect,
}: {
  visible: boolean;
  activePackSlug: string;
  ownedPackSlugs: ReadonlySet<string>;
  previewFrom: string;
  priorityCopy: string;
  onClose: () => void;
  onSelect: (pack: IdentityPack) => void;
}) {
  if (!visible) return null;

  const activePack = getIdentityPack(activePackSlug);
  const activeVisual = getPackVisual(activePack);
  const lockedSkinLabel = isIdentityPackStoreEnabled ? undefined : "PREVIEW";

  return (
    <SheetShell
      scrimLabel="Close skin packs"
      onClose={onClose}
      panelStyle={{ backgroundColor: activeVisual.surface, borderColor: activeVisual.border }}
    >
      <View style={styles.sheetHeader}>
        <View>
          <Text style={[styles.sheetTitle, { color: activeVisual.text }]}>Skin Packs</Text>
          <Text style={[type.bodyMuted, { color: activeVisual.muted }]}>
            {priorityCopy}
          </Text>
        </View>
        <Pressable
          accessibilityLabel="Close skin packs"
          accessibilityRole="button"
          onPress={onClose}
          style={[styles.sheetClose, { backgroundColor: activeVisual.chip, borderColor: activeVisual.border }]}
        >
          <Text style={[styles.sheetCloseText, { color: activeVisual.text }]}>Close</Text>
        </Pressable>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.skinSheetScroll}>
        <IdentityPackPreview pack={activePack} previewFrom={previewFrom} />
        <View style={styles.skinPackGrid}>
          {identityPacks.map((pack) => (
            <WidgetSkinPackCard
              key={pack.slug}
              skin={pack}
              size="small"
              active={pack.slug === activePackSlug}
              owned={ownedPackSlugs.has(pack.slug)}
              lockedLabel={lockedSkinLabel}
              previewFrom={previewFrom}
              onPress={() => onSelect(pack)}
            />
          ))}
        </View>
      </ScrollView>
    </SheetShell>
  );
}

function IdentityPackPreview({ pack, previewFrom }: { pack: IdentityPack; previewFrom: string }) {
  const emotes = pack.expressions.filter((expression) => expression.asset).slice(0, 6);
  const visual = getPackVisual(pack);

  return (
    <View style={[styles.identityPreview, { backgroundColor: visual.chip, borderColor: visual.border }]}>
      <View style={styles.identityPreviewHead}>
        <Text style={[styles.previewTitle, { color: visual.text }]}>{pack.name}</Text>
        <Text style={[type.tinyMono, { color: getPackVisual(pack).accent }]}>
          {pack.isFree ? "FREE" : isIdentityPackStoreEnabled ? pack.priceLabel : "PREVIEW"}
        </Text>
      </View>
      <Text numberOfLines={2} style={[type.bodyMuted, { color: visual.muted }]}>
        {pack.shortCopy}
      </Text>
      <View style={styles.identityEmoteRow}>
        {emotes.map((expression) => (
          <View
            key={expression.id}
            style={[styles.identityEmoteCell, { backgroundColor: visual.surface, borderColor: visual.border }]}
          >
            {expression.asset ? (
              <Image source={expression.asset} style={styles.identityEmoteImage} resizeMode="contain" />
            ) : null}
          </View>
        ))}
      </View>
      <Text numberOfLines={1} style={[type.tinyMono, { color: visual.muted }]}>
        FROM {previewFrom}
      </Text>
    </View>
  );
}

function AvatarPickerSheet({
  visible,
  avatarUri,
  onClose,
  onSelect,
}: {
  visible: boolean;
  avatarUri: string;
  onClose: () => void;
  onSelect: (uri: string) => void;
}) {
  const palette = useAppPalette();
  if (!visible) return null;

  return (
    <SheetShell scrimLabel="Close avatar picker" onClose={onClose}>
      <View style={styles.sheetHeader}>
        <View>
          <Text style={[styles.sheetTitle, { color: palette.text }]}>프로필 사진</Text>
          <Text style={[type.bodyMuted, { color: palette.muted }]}>
            My · People · Send 헤더에 함께 표시됩니다.
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={onClose}
          style={[styles.sheetClose, { backgroundColor: palette.chip, borderColor: palette.rule }]}
        >
          <Text style={[styles.sheetCloseText, { color: palette.text }]}>Close</Text>
        </Pressable>
      </View>
      <View style={styles.avatarGrid}>
        {AVATAR_PRESETS.map((uri, index) => {
          const active = avatarUri === uri;
          const avatarSource = getAvatarImageSource(uri);
          return (
            <Pressable
              key={uri}
              accessibilityLabel={`Choose profile avatar ${index + 1}`}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => onSelect(uri)}
              style={({ pressed }) => [
                styles.avatarChoice,
                {
                  borderColor: active ? palette.primary : palette.rule,
                  backgroundColor: active ? palette.chip : palette.input,
                },
                pressed && styles.pressed,
              ]}
            >
              {avatarSource ? (
                <Image source={avatarSource} style={styles.avatarChoiceImage} resizeMode="cover" />
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </SheetShell>
  );
}

function ActionPill({
  label,
  dark = false,
  disabled = false,
  onPress,
}: {
  label: string;
  dark?: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  const palette = useAppPalette();
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionPill,
        dark ? { backgroundColor: palette.primary } : { backgroundColor: palette.chip },
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.actionPillText, { color: dark ? palette.primaryText : palette.text }]}>{label}</Text>
    </Pressable>
  );
}

function reportError(err: unknown) {
  const message = err instanceof Error ? err.message : "Unexpected error";
  Alert.alert("BEEP-GET", message);
}

const styles = StyleSheet.create({
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarLabel: {
    ...type.metaValue,
    fontSize: 13,
  },
  packSwatch: {
    width: 72,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 13,
    overflow: "hidden",
  },
  packSwatchCode: {
    ...type.codeSmall,
    fontSize: 20,
    lineHeight: 24,
  },
  packSwatchAccent: {
    position: "absolute",
    right: 8,
    top: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  previewTitle: {
    fontFamily: font.sansBold,
    fontSize: 13,
  },
  signalColorCard: {
    padding: spacing[4],
    gap: spacing[3],
  },
  signalColorRow: {
    flexDirection: "row",
    gap: spacing[3],
  },
  signalColorOption: {
    flex: 1,
    alignItems: "center",
    gap: spacing[2],
    paddingVertical: spacing[4],
    borderWidth: 1,
    borderRadius: 12,
  },
  signalColorSwatch: {
    width: 34,
    height: 34,
    borderRadius: 10,
  },
  signalColorLabel: {
    ...type.metaValue,
    fontSize: 12,
  },
  slotsCard: {
    padding: spacing[4],
    gap: spacing[3],
  },
  slotChipRow: {
    flexDirection: "row",
    gap: spacing[2],
  },
  slotMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[3],
  },
  slotCaption: {
    ...type.bodyMuted,
    flex: 1,
    minWidth: 0,
    fontSize: 12,
    lineHeight: 16,
  },
  slotConfigureLink: {
    minHeight: 24,
    justifyContent: "center",
  },
  slotConfigureText: {
    ...type.button,
    fontSize: 12,
  },
  skinSheetScroll: {
    gap: spacing[4],
    paddingTop: spacing[1],
  },
  identityPreview: {
    gap: spacing[3],
    padding: spacing[4],
    borderWidth: 1,
    borderRadius: 12,
  },
  identityPreviewHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[3],
  },
  identityEmoteRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[2],
  },
  identityEmoteCell: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 10,
    overflow: "hidden",
  },
  identityEmoteImage: {
    width: 36,
    height: 36,
  },
  skinPackGrid: {
    gap: spacing[3],
  },
  sheetOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    // functional scrim, not a palette color
    backgroundColor: "rgba(0,0,0,0.52)",
  },
  webSheetHost: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    elevation: 20,
  },
  webSheetPanel: {
    marginBottom: 86,
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetPanel: {
    maxHeight: "76%",
    gap: spacing[4],
    padding: spacing[5],
    paddingBottom: spacing[8],
    borderWidth: 1,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: -6 },
  },
  grabBar: {
    alignSelf: "center",
    width: 44,
    height: 4,
    borderRadius: radius.pill,
  },
  sheetHeader: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing[4],
  },
  sheetTitle: {
    ...type.slipTitle,
    fontSize: 19,
    lineHeight: 24,
  },
  sheetClose: {
    minHeight: 30,
    justifyContent: "center",
    paddingHorizontal: spacing[4],
    borderWidth: 1,
    borderRadius: 10,
  },
  sheetCloseText: {
    ...type.tinyMono,
  },
  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[3],
  },
  avatarChoice: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    padding: 3,
  },
  avatarChoiceImage: {
    width: "100%",
    height: "100%",
    borderRadius: 33,
  },
  dialogTitle: {
    ...type.screenTitle,
    fontSize: 20,
    lineHeight: 26,
  },
  slotEditBlock: {
    gap: spacing[2],
  },
  dialogInput: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: radius.control,
    paddingHorizontal: spacing[4],
    ...type.body,
  },
  dialogActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing[3],
  },
  actionPill: {
    minHeight: 36,
    justifyContent: "center",
    paddingHorizontal: spacing[5],
    borderRadius: 12,
  },
  actionPillText: {
    ...type.button,
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ translateY: 1 }],
  },
});
