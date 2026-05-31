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
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppSurface } from "@/components/AppSurface";
import {
  Avatar,
  KotlinHeader,
  MockupCard,
  MockupSection,
} from "@/components/KotlinMockupUI";
import { colors, radius, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { useAppPalette } from "@/design/appTheme";
import { AVATAR_PRESETS } from "@/design/avatarPresets";
import { mockupPhotoUris } from "@/design/mockupPhotos";
import {
  identityPacks,
  getIdentityPack,
  type IdentityPack,
} from "@/design/identityPacks";
import {
  WidgetSkinPackCard,
  getPackVisual,
} from "@/components/WidgetSkinPackCard";
import { BlinkPersonStrip } from "@/components/BlinkPersonStrip";
import { freePackSlugs, loadOwnedIdentityPacks } from "@/lib/identityPackOwnership";
import {
  ChevronRightLineIcon,
  GearLineIcon,
} from "@/components/MockupLineIcons";
import type { RootStackParamList } from "@/navigation/RootNavigator";
import { useAuthStore } from "@/stores/authStore";
import { useDictionaryStore } from "@/stores/dictionaryStore";
import { useSkinStore } from "@/stores/skinStore";
import { MAX_CODE_LENGTH } from "@/lib/constants";
import {
  DEFAULT_QUICK_REPLY_SLOTS,
  buildQuickReplySlots,
  getConfiguredQuickReplyEntries,
  getQuickReplySlotLabel,
  getQuickReplySlotOrder,
  isQuickReplySlotEntry,
} from "@/lib/quickReplySlots";

const DEFAULT_CODES = [
  { code: "8282", meaning: "빨리 와줘" },
  { code: "486", meaning: "보고 싶어" },
  { code: "1004", meaning: "집 도착" },
  { code: "7942", meaning: "친구사이" },
  { code: "0404", meaning: "영원히 사랑해" },
];

export function MyScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
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
  const [addCodeDialogVisible, setAddCodeDialogVisible] = useState(false);
  const [draftCode, setDraftCode] = useState("");
  const [draftMeaning, setDraftMeaning] = useState("");

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

  const signalCodes = useMemo(() => {
    const saved = entries
      .filter((entry) => !isQuickReplySlotEntry(entry))
      .map((entry) => ({ code: entry.code, meaning: entry.meaning }));
    const byCode = new Map([...DEFAULT_CODES, ...saved].map((entry) => [entry.code, entry]));
    return Array.from(byCode.values()).slice(0, 6);
  }, [entries]);

  const activePack = getIdentityPack(activeIdentityPackSlug);
  const avatarUri = profile?.avatar_url?.trim() ? profile.avatar_url : mockupPhotoUris.profile;

  const chooseSkinPack = async (pack: IdentityPack) => {
    const isOwned = ownedPackSlugs.has(pack.slug);

    try {
      if (!isOwned) {
        Alert.alert(
          "Skin Pack Store",
          `${pack.name} unlocks as a full set for the app, Send cards, widgets, avatar frame, and emotes.`,
        );
        return;
      }

      if (!profile) {
        setLocalActiveIdentityPack(pack.slug);
        setSkinSheetVisible(false);
        return;
      }
      await applyIdentityPack(profile.id, pack.slug);
      setSkinSheetVisible(false);
    } catch (err: any) {
      Alert.alert("Skin pack failed", err?.message ?? "Try again.");
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
    } catch (err: any) {
      Alert.alert("Avatar failed", err?.message ?? "Try again.");
    }
  };

  const registerCode = async () => {
    if (!profile || !draftCode.trim() || !draftMeaning.trim()) return;
    try {
      await add(profile.id, draftCode.trim(), draftMeaning.trim());
      setDraftCode("");
      setDraftMeaning("");
      setAddCodeDialogVisible(false);
    } catch (err: any) {
      Alert.alert("Code failed", err?.message ?? "Try again.");
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
      Alert.alert("Slots need text", "Each quick reply slot needs a short code or word.");
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
    } catch (err: any) {
      Alert.alert("Slots failed", err?.message ?? "Try again.");
    }
  };

  return (
    <AppSurface backgroundColor="#F8F6F1">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <KotlinHeader
          title="My Settings"
          centered
          avatarSource={{ uri: avatarUri }}
          avatarAccessibilityLabel="Open skin packs"
          onAvatarPress={() => setSkinSheetVisible(true)}
          actions={[
            {
              label: "Settings",
              icon: <GearLineIcon />,
              accessibilityLabel: "Account settings",
              onPress: () => navigation.navigate("Account"),
            },
          ]}
        />

        <MockupSection label="Profile" hint="Avatar lives here" style={styles.standaloneSection} />
        <Pressable
          accessibilityLabel="Edit Profile Avatar"
          accessibilityRole="button"
          onPress={() => setAvatarSheetVisible(true)}
          style={({ pressed }) => [
            styles.profileCard,
            { backgroundColor: palette.card, borderColor: palette.rule },
            pressed && styles.pressed,
          ]}
        >
          <Avatar label={profile?.nickname ?? "Me"} source={{ uri: avatarUri }} size={54} />
          <View style={styles.flexCopy}>
            <Text style={[styles.rowTitle, { color: palette.text }]}>
              {profile?.nickname ?? "Profile Avatar"}
            </Text>
            <Text style={[type.bodyMuted, { color: palette.muted }]}>
              {profile?.beep_id ? `@${profile.beep_id}` : "Choose the face shown across My, Friends, and Send headers."}
            </Text>
          </View>
          <View style={[styles.profileActionPill, { borderColor: palette.rule }]}>
            <Text style={[styles.profileActionText, { color: palette.text }]}>Edit Avatar</Text>
          </View>
        </Pressable>

        <MockupSection label="Personalize" hint="Header opens Skin Packs" style={styles.standaloneSection} />
        <Pressable
          accessibilityLabel="Open Skin Pack picker"
          accessibilityRole="button"
          onPress={() => setSkinSheetVisible(true)}
          style={({ pressed }) => [
            styles.currentPackCard,
            { backgroundColor: palette.card, borderColor: palette.rule },
            pressed && styles.pressed,
          ]}
        >
          <View
            style={[
              styles.currentPackPreview,
              { backgroundColor: getPackVisual(activePack).surface },
            ]}
          >
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.6}
              style={[styles.currentPackCode, { color: getPackVisual(activePack).text }]}
            >
              {activePack.code}
            </Text>
            <View style={[styles.currentPackAccent, { backgroundColor: getPackVisual(activePack).accent }]} />
          </View>
          <View style={styles.flexCopy}>
            <Text style={[styles.rowTitle, { color: palette.text }]}>{activePack.name}</Text>
            <Text style={[type.bodyMuted, { color: palette.muted }]}>
              Widget skin, avatar frame, and emote pack.
            </Text>
          </View>
          <View style={[styles.packBadge, { borderColor: palette.rule }]}>
            <Text style={[styles.packBadgeText, { color: palette.muted }]}>OPEN</Text>
          </View>
        </Pressable>

        <MockupSection label="Widget Skins" hint="Preview each pack on SM and MD" style={styles.standaloneSection} />
        <View style={styles.widgetLayoutGrid}>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate("WidgetStates", { size: "small" })}
            style={({ pressed }) => [
              styles.widgetPreviewCard,
              { backgroundColor: palette.card, borderColor: palette.rule },
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.widgetPreviewLabel, { color: palette.muted }]}>SM Widget</Text>
            <View style={[styles.smallWidgetPreview, { backgroundColor: palette.input }]}>
              <Text style={[styles.previewCode, { color: palette.text }]}>8282</Text>
            </View>
            <View style={styles.widgetPreviewFooter}>
              <Text style={styles.activePreviewText}>+ active preview</Text>
            </View>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate("WidgetStates", { size: "medium" })}
            style={({ pressed }) => [
              styles.widgetPreviewCard,
              { backgroundColor: palette.card, borderColor: palette.rule },
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.widgetPreviewLabel, { color: palette.muted }]}>MD List Widget</Text>
            <View style={styles.mediumWidgetPreview}>
              <View style={[styles.previewLineLong, { backgroundColor: palette.ruleStrong }]} />
              <View style={[styles.previewLineShort, { backgroundColor: palette.rule }]} />
            </View>
            <View style={styles.widgetPreviewFooter}>
              <Text style={[styles.widgetMetaText, { color: palette.muted }]}>3 queued slots</Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.sectionActionRow}>
          <MockupSection label="Quick Replies" />
          <Pressable
            accessibilityLabel="Configure quick reply slots"
            accessibilityRole="button"
            onPress={openQuickReplyDialog}
            style={[styles.blackPill, { backgroundColor: palette.primary }]}
          >
            <Text style={[styles.blackPillText, { color: palette.primaryText }]}>Configure Slots</Text>
          </Pressable>
        </View>
        <MockupCard style={styles.replyCard}>
          {replySlots.map((slot) => (
            <View key={slot} style={[styles.replySlot, { borderColor: palette.rule, backgroundColor: palette.card }]}>
              <Text style={[styles.replyText, { color: palette.text }]}>{slot}</Text>
            </View>
          ))}
        </MockupCard>

        <View style={styles.sectionActionRow}>
          <MockupSection label="Signal Directory (On-Demand)" />
          <Pressable
            accessibilityLabel="Add new signal token"
            accessibilityRole="button"
            onPress={() => setAddCodeDialogVisible(true)}
            style={[styles.blackPill, { backgroundColor: palette.primary }]}
          >
            <Text style={[styles.blackPillText, { color: palette.primaryText }]}>+ Add New</Text>
          </Pressable>
        </View>
        <MockupCard style={styles.codeList}>
          {signalCodes.map((entry) => (
            <Pressable
              key={entry.code}
              accessibilityRole="button"
              onPress={() => navigation.navigate("Dictionary")}
              style={({ pressed }) => [styles.codeRow, pressed && styles.pressed]}
            >
              <View style={[styles.codeBadge, { backgroundColor: palette.input }]}>
                <Text numberOfLines={1} style={[styles.codeBadgeText, { color: palette.text }]}>{entry.code}</Text>
              </View>
              <Text numberOfLines={1} style={[styles.codeMeaning, { color: palette.text }]}>{entry.meaning}</Text>
              <ChevronRightLineIcon color={palette.muted} />
            </Pressable>
          ))}
        </MockupCard>
      </ScrollView>

      <Modal transparent visible={quickReplyDialogVisible} animationType="fade" onRequestClose={() => setQuickReplyDialogVisible(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.dialogOverlay}
        >
          <View style={[styles.dialog, { backgroundColor: palette.card }]}>
            <Text style={[styles.dialogTitle, { color: palette.text }]}>Configure Quick Replies</Text>
            {quickReplyDrafts.map((slot, index) => (
              <View key={`${slot}-${index}`} style={styles.slotEditBlock}>
                <Text style={[type.tinyMono, { color: palette.muted }]}>Reply Slot {index + 1}</Text>
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

      <Modal transparent visible={addCodeDialogVisible} animationType="fade" onRequestClose={() => setAddCodeDialogVisible(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.dialogOverlay}
        >
          <View style={[styles.dialog, { backgroundColor: palette.card }]}>
            <Text style={[styles.dialogTitle, { color: palette.text }]}>Define New Signal Token</Text>
            <TextInput
              value={draftCode}
              onChangeText={setDraftCode}
              autoCapitalize="none"
              maxLength={MAX_CODE_LENGTH}
              placeholder="8282 / 집중중 🔕"
              placeholderTextColor={palette.muted2}
              style={[styles.dialogInput, { color: palette.text, borderColor: palette.rule, backgroundColor: palette.input }]}
            />
            <TextInput
              value={draftMeaning}
              onChangeText={setDraftMeaning}
              placeholder="Interpretation / Message Meaning"
              placeholderTextColor={palette.muted2}
              maxLength={50}
              style={[styles.dialogInput, styles.meaningInput, { color: palette.text, borderColor: palette.rule, backgroundColor: palette.input }]}
            />
            <View style={styles.dialogActions}>
              <ActionPill label="Cancel" onPress={() => setAddCodeDialogVisible(false)} />
              <ActionPill label="Register" dark onPress={registerCode} disabled={!draftCode || !draftMeaning} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <SkinPackSheet
        visible={skinSheetVisible}
        activePackSlug={activeIdentityPackSlug}
        ownedPackSlugs={ownedPackSlugs}
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
  onClose,
  onSelect,
}: {
  visible: boolean;
  activePackSlug: string;
  ownedPackSlugs: ReadonlySet<string>;
  onClose: () => void;
  onSelect: (pack: IdentityPack) => void;
}) {
  const palette = useAppPalette();
  if (!visible) return null;

  const activePack = getIdentityPack(activePackSlug);

  return (
    <Modal transparent visible animationType="fade" onRequestClose={onClose}>
      <View style={styles.sheetOverlay}>
        <Pressable accessibilityLabel="Close skin packs" onPress={onClose} style={styles.sheetBackdrop} />
        <View style={[styles.sheetPanel, { backgroundColor: palette.card, borderColor: palette.rule }]}>
          <View style={styles.sheetHeader}>
            <View>
              <Text style={[styles.sheetTitle, { color: palette.text }]}>Skin Packs</Text>
              <Text style={[type.bodyMuted, { color: palette.muted }]}>
                Widget skin, avatar frame, and emote pack as one set.
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
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.skinSheetScroll}>
            <IdentityPackPreview pack={activePack} />
            <View style={styles.skinPackGrid}>
              {identityPacks.map((pack) => (
                <WidgetSkinPackCard
                  key={pack.slug}
                  skin={pack}
                  size="small"
                  active={pack.slug === activePackSlug}
                  owned={ownedPackSlugs.has(pack.slug)}
                  onPress={() => onSelect(pack)}
                />
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function IdentityPackPreview({ pack }: { pack: IdentityPack }) {
  const palette = useAppPalette();
  const emotes = pack.expressions.filter((expression) => expression.asset).slice(0, 6);

  return (
    <View style={[styles.identityPreview, { borderColor: palette.rule }]}>
      <View style={styles.identityPreviewHead}>
        <Text style={[styles.rowTitle, { color: palette.text }]}>{pack.name}</Text>
        <Text style={[type.tinyMono, { color: getPackVisual(pack).accent }]}>
          {pack.isFree ? "FREE" : pack.priceLabel}
        </Text>
      </View>
      <Text numberOfLines={2} style={[type.bodyMuted, { color: palette.muted }]}>
        {pack.shortCopy}
      </Text>
      <View style={styles.identityEmoteRow}>
        {emotes.map((expression) => (
          <View
            key={expression.id}
            style={[styles.identityEmoteCell, { backgroundColor: palette.input, borderColor: palette.rule }]}
          >
            {expression.asset ? (
              <Image source={expression.asset} style={styles.identityEmoteImage} resizeMode="contain" />
            ) : null}
          </View>
        ))}
      </View>
      <BlinkPersonStrip compact />
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
    <Modal transparent visible animationType="fade" onRequestClose={onClose}>
      <View style={styles.sheetOverlay}>
        <Pressable accessibilityLabel="Close avatar picker" onPress={onClose} style={styles.sheetBackdrop} />
        <View style={[styles.sheetPanel, { backgroundColor: palette.card, borderColor: palette.rule }]}>
          <View style={styles.sheetHeader}>
            <View>
              <Text style={[styles.sheetTitle, { color: palette.text }]}>Profile Avatar</Text>
              <Text style={[type.bodyMuted, { color: palette.muted }]}>
                Shown across My, Friends, and Send headers.
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
                  <Image source={{ uri }} style={styles.avatarChoiceImage} resizeMode="cover" />
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
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
  flexCopy: {
    flex: 1,
    gap: spacing[1],
  },
  rowTitle: {
    ...type.metaValue,
    fontSize: 13,
  },
  standaloneSection: {
    marginHorizontal: spacing[5],
  },
  profileCard: {
    minHeight: 78,
    marginHorizontal: spacing[5],
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[4],
    padding: spacing[4],
    borderWidth: 1,
    borderRadius: 12,
  },
  profileActionPill: {
    minHeight: 30,
    justifyContent: "center",
    paddingHorizontal: spacing[3],
    borderWidth: 1,
    borderRadius: radius.pill,
  },
  profileActionText: {
    ...type.tinyMono,
    fontSize: 8,
  },
  currentPackCard: {
    minHeight: 86,
    marginHorizontal: spacing[5],
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[4],
    padding: spacing[4],
    borderWidth: 1,
    borderRadius: 12,
  },
  currentPackPreview: {
    width: 66,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    overflow: "hidden",
  },
  currentPackCode: {
    ...type.codeSmall,
    fontSize: 20,
    lineHeight: 24,
  },
  currentPackAccent: {
    position: "absolute",
    right: 8,
    top: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  packBadge: {
    minHeight: 28,
    justifyContent: "center",
    paddingHorizontal: spacing[3],
    borderWidth: 1,
    borderRadius: radius.pill,
  },
  packBadgeText: {
    ...type.tinyMono,
    fontSize: 8,
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
  widgetLayoutGrid: {
    flexDirection: "row",
    gap: spacing[4],
    paddingHorizontal: spacing[5],
  },
  widgetPreviewCard: {
    flex: 1,
    minHeight: 126,
    justifyContent: "space-between",
    gap: spacing[3],
    padding: spacing[4],
    borderWidth: 1,
    borderRadius: 12,
  },
  widgetPreviewLabel: {
    ...type.tinyMono,
    fontSize: 9,
    lineHeight: 12,
  },
  smallWidgetPreview: {
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  mediumWidgetPreview: {
    minHeight: 42,
    justifyContent: "center",
    gap: spacing[3],
  },
  widgetPreviewFooter: {
    minHeight: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[2],
  },
  activePreviewText: {
    ...type.tinyMono,
    color: "#4CAB61",
  },
  widgetMetaText: {
    ...type.tinyMono,
  },
  previewCode: {
    ...type.codeSmall,
    fontSize: 20,
    lineHeight: 25,
  },
  previewLineLong: {
    width: "72%",
    height: 4,
    borderRadius: 4,
  },
  previewLineShort: {
    width: "56%",
    height: 4,
    borderRadius: 4,
  },
  sectionActionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[3],
    paddingHorizontal: spacing[5],
  },
  blackPill: {
    minHeight: 24,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing[4],
    borderRadius: 10,
  },
  blackPillText: {
    ...type.tinyMono,
  },
  replyCard: {
    minHeight: 72,
    flexDirection: "row",
    gap: spacing[3],
    marginHorizontal: spacing[5],
    padding: spacing[4],
    borderRadius: 12,
  },
  replySlot: {
    flex: 1,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: radius.control,
  },
  replyText: {
    ...type.button,
  },
  codeList: {
    marginHorizontal: spacing[5],
    paddingVertical: spacing[2],
  },
  codeRow: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[4],
    paddingHorizontal: spacing[4],
  },
  codeBadge: {
    minWidth: 38,
    maxWidth: 116,
    minHeight: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.control,
    paddingHorizontal: spacing[3],
  },
  codeBadgeText: {
    ...type.buttonMono,
    fontSize: 10,
  },
  codeMeaning: {
    flex: 1,
    ...type.body,
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
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetPanel: {
    maxHeight: "82%",
    gap: spacing[4],
    padding: spacing[5],
    paddingBottom: spacing[8],
    borderTopWidth: 1,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
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
  meaningInput: {
    minHeight: 70,
    textAlignVertical: "top",
    paddingTop: spacing[4],
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
  miniToggle: {
    width: 46,
    height: 27,
    justifyContent: "center",
    alignItems: "flex-start",
    padding: 2,
    borderWidth: 1,
    borderColor: "rgba(10,10,10,0.20)",
    borderRadius: 13,
    backgroundColor: "rgba(10,10,10,0.10)",
  },
  miniToggleActive: {
    backgroundColor: colors.ink,
    borderColor: "rgba(10,10,10,0.24)",
  },
  miniToggleKnob: {
    width: 21,
    height: 21,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
  },
  miniToggleKnobActive: {
    transform: [{ translateX: 19 }],
  },
});
