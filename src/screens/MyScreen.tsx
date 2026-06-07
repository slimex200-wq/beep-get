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
} from "react-native";
import { AppSurface } from "@/components/AppSurface";
import { KotlinHeader, MockupSection } from "@/components/KotlinMockupUI";
import { colors, radius, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { useAppPalette } from "@/design/appTheme";
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
import { WidgetPreviewPanel } from "@/components/WidgetPreviewPanel";
import { PhotoAvatarCard } from "@/components/my/PhotoAvatarCard";
import { RoomStyleCard } from "@/components/my/RoomStyleCard";
import { MyRoomToolsCard } from "@/components/my/MyRoomToolsCard";
import { freePackSlugs, loadOwnedIdentityPacks } from "@/lib/identityPackOwnership";
import { useAuthStore } from "@/stores/authStore";
import { useDictionaryStore } from "@/stores/dictionaryStore";
import { useSkinStore } from "@/stores/skinStore";
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
  const { profile, updateAvatar } = useAuthStore();
  const { entries, fetch: fetchDictionary, add, update } = useDictionaryStore();
  const palette = useAppPalette();
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
  const displayName = profile?.nickname?.trim() || "Photo Avatar";
  const handle = profile?.beep_id?.trim() ?? "";
  const skinPackPreviewName = profile?.nickname?.trim() || profile?.beep_id?.trim() || "You";
  const skinPackPriorityCopy = "widget mood first, then avatar frame and emotes.";

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
    <AppSurface backgroundColor={palette.background}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <KotlinHeader
          title="My Beep Room"
          centered
          avatarLabel={avatarLabel}
          avatarSource={avatarSource}
          avatarAccessibilityLabel="Decorate Photo Avatar"
          onAvatarPress={() => setAvatarSheetVisible(true)}
        />

        <View style={styles.roomSection}>
          <WidgetPreviewPanel
            title="Widget Preview"
            subtitle="나만의 비프 공간"
            code={activePack.code}
            from={skinPackPreviewName}
            medium
            skin={activePack}
          />
        </View>

        <MockupSection label="Photo Avatar" hint="personal room face" style={styles.standaloneSection} />
        <PhotoAvatarCard
          avatarLabel={avatarLabel}
          avatarSource={avatarSource}
          displayName={displayName}
          handle={handle}
          activePackName={activePack.name}
          onPress={() => setAvatarSheetVisible(true)}
        />

        <MockupSection label="Room Style" hint="skin pack" style={styles.standaloneSection} />
        <RoomStyleCard activePack={activePack} onPress={() => setSkinSheetVisible(true)} />

        <MockupSection label="Room Tools" hint="widget replies" style={styles.standaloneSection} />
        <MyRoomToolsCard replySlots={replySlots} onEditReplies={openQuickReplyDialog} />
      </ScrollView>

      <Modal transparent visible={quickReplyDialogVisible} animationType="fade" onRequestClose={() => setQuickReplyDialogVisible(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.dialogOverlay}
        >
          <View style={[styles.dialog, { backgroundColor: palette.card }]}>
            <Text style={[styles.dialogTitle, { color: palette.text }]}>Configure Widget Quick Replies</Text>
            {quickReplyDrafts.map((slot, index) => (
              <View key={`${slot}-${index}`} style={styles.slotEditBlock}>
                <Text style={[type.tinyMono, { color: palette.muted }]}>Widget Reply {index + 1}</Text>
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
          </View>
        </KeyboardAvoidingView>
      </Modal>

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
    </AppSurface>
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

  const sheet = (
      <View style={styles.sheetOverlay}>
        <Pressable accessibilityLabel="Close skin packs" onPress={onClose} style={styles.sheetBackdrop} />
        <View style={[styles.sheetPanel, Platform.OS === "web" && styles.webSheetPanel, { backgroundColor: activeVisual.surface, borderColor: activeVisual.border }]}>
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
        </View>
      </View>
  );

  if (Platform.OS === "web") {
    return <View style={styles.webSheetHost}>{sheet}</View>;
  }

  return (
    <Modal transparent visible animationType="fade" onRequestClose={onClose}>
      {sheet}
    </Modal>
  );
}

function IdentityPackPreview({ pack, previewFrom }: { pack: IdentityPack; previewFrom: string }) {
  const emotes = pack.expressions.filter((expression) => expression.asset).slice(0, 6);
  const visual = getPackVisual(pack);

  return (
    <View style={[styles.identityPreview, { backgroundColor: visual.chip, borderColor: visual.border }]}>
      <View style={styles.identityPreviewHead}>
        <Text style={[styles.rowTitle, { color: visual.text }]}>{pack.name}</Text>
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

  const sheet = (
      <View style={styles.sheetOverlay}>
        <Pressable accessibilityLabel="Close avatar picker" onPress={onClose} style={styles.sheetBackdrop} />
        <View style={[styles.sheetPanel, Platform.OS === "web" && styles.webSheetPanel, { backgroundColor: palette.card, borderColor: palette.rule }]}>
          <View style={styles.sheetHeader}>
            <View>
              <Text style={[styles.sheetTitle, { color: palette.text }]}>Photo Avatar</Text>
              <Text style={[type.bodyMuted, { color: palette.muted }]}>
                Shown across My, People, and Send headers.
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
        </View>
      </View>
  );

  if (Platform.OS === "web") {
    return <View style={styles.webSheetHost}>{sheet}</View>;
  }

  return (
    <Modal transparent visible animationType="fade" onRequestClose={onClose}>
      {sheet}
    </Modal>
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
  content: {
    paddingBottom: 96,
    gap: spacing[4],
  },
  rowTitle: {
    ...type.metaValue,
    fontSize: 13,
  },
  roomSection: {
    marginHorizontal: spacing[5],
  },
  standaloneSection: {
    marginHorizontal: spacing[5],
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
  dialogOverlay: {
    flex: 1,
    justifyContent: "center",
    padding: spacing[8],
    backgroundColor: "rgba(0,0,0,0.58)",
  },
  sheetOverlay: {
    flex: 1,
    justifyContent: "flex-end",
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
    marginHorizontal: spacing[3],
    marginBottom: spacing[3],
    padding: spacing[5],
    paddingBottom: spacing[8],
    borderWidth: 1,
    borderRadius: 16,
    shadowColor: colors.ink,
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: -6 },
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
    backgroundColor: "#ECE8E1",
  },
  sheetCloseText: {
    ...type.tinyMono,
    color: colors.ink,
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
  dialog: {
    gap: spacing[5],
    padding: spacing[6],
    borderRadius: 14,
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
