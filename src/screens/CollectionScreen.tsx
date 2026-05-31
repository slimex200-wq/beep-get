import React, { useEffect, useMemo } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppSurface } from "@/components/AppSurface";
import { HeaderBar } from "@/components/HeaderBar";
import { IconCard } from "@/components/IconCard";
import { colors, radius, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { useAppPalette } from "@/design/appTheme";
import type { RootStackParamList } from "@/navigation/RootNavigator";
import { getRarityLabel, type CollectionIcon } from "@/services/collectionService";
import { useAuthStore } from "@/stores/authStore";
import { useCollectionStore } from "@/stores/collectionStore";

const DROP_LABELS: Record<string, (value: number) => string> = {
  streak: (days) => `${days}일 연속 사용`,
  friends: (count) => `친구 ${count}명`,
  messages_sent: (count) => `Beep ${count}개 전송`,
};

function formatDropCondition(icon: CollectionIcon): string {
  if (icon.is_default) return "기본 제공";
  if (!icon.drop_condition) return "조건 미정";
  const { type, days, count } = icon.drop_condition;
  const formatter = DROP_LABELS[type];
  if (!formatter) return "특수 조건";
  return formatter(days ?? count ?? 0);
}

export function CollectionScreen() {
  const palette = useAppPalette();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { profile, user } = useAuthStore();
  const {
    allIcons,
    ownedIcons,
    loading,
    fetchAll,
    fetchOwned,
    grant,
    equip,
    isOwned,
  } = useCollectionStore();

  useEffect(() => {
    fetchAll().catch(reportError);
    if (profile) fetchOwned(profile.id).catch(reportError);
  }, [profile?.id, fetchAll, fetchOwned]);

  const ownedCount = ownedIcons.length;
  const totalCount = allIcons.length;
  const activeSlug = profile?.status_icon ?? null;

  const sortedIcons = useMemo(() => {
    const rarityOrder: Record<string, number> = {
      common: 0,
      rare: 1,
      epic: 2,
      legendary: 3,
    };
    return [...allIcons].sort(
      (a, b) => (rarityOrder[a.rarity] ?? 99) - (rarityOrder[b.rarity] ?? 99),
    );
  }, [allIcons]);

  const handleClaim = async (icon: CollectionIcon) => {
    try {
      await grant(icon.slug, user?.id);
      Alert.alert("Unlocked", `${icon.name} (${getRarityLabel(icon.rarity)})`);
    } catch (err: any) {
      Alert.alert("Locked", err?.message ?? "조건을 채우지 못했어요.");
    }
  };

  const handleEquip = async (icon: CollectionIcon) => {
    try {
      await equip(icon.slug);
      Alert.alert("Equipped", `${icon.name} status icon applied.`);
    } catch (err: any) {
      Alert.alert("Equip failed", err?.message ?? "Try again.");
    }
  };

  const close = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate("Main", { screen: "My" });
  };

  return (
    <AppSurface>
      <HeaderBar title="COLLECTION" left="CLOSE" onLeftPress={close} />
      <View style={styles.summary}>
        <Text style={[type.tinyMono, { color: palette.muted }]}>도감</Text>
        <Text style={[styles.counter, { color: palette.text }]}>
          {String(ownedCount).padStart(2, "0")} / {String(totalCount).padStart(2, "0")}
        </Text>
        {loading ? <Text style={[type.bodyMuted, { color: palette.muted }]}>Loading…</Text> : null}
      </View>
      <FlatList
        contentContainerStyle={styles.list}
        data={sortedIcons}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => {
          const owned = isOwned(item.id);
          const equipped = owned && activeSlug === item.status_icon_value;
          return (
            <Pressable
              onPress={() => (owned ? handleEquip(item) : handleClaim(item))}
              style={({ pressed }) => [
                styles.cell,
                pressed && styles.cellPressed,
              ]}
            >
              <IconCard
                name={item.name}
                imageUrl={item.image_url ?? ""}
                rarity={item.rarity}
                isOwned={owned}
              />
              <Text style={[styles.dropText, { color: palette.muted }]} numberOfLines={1}>
                {formatDropCondition(item)}
              </Text>
              {equipped ? (
                <Text style={styles.equippedTag}>EQUIPPED</Text>
              ) : owned ? (
                <Text style={[styles.equipHint, { color: palette.text }]}>TAP TO EQUIP</Text>
              ) : (
                <Text style={[styles.claimHint, { color: palette.muted2 }]}>TAP TO CLAIM</Text>
              )}
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[type.bodyMuted, { color: palette.muted }]}>
              {loading ? "Loading collection..." : "Collection is empty."}
            </Text>
          </View>
        }
      />
    </AppSurface>
  );
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
  summary: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
    gap: spacing[1],
  },
  counter: {
    ...type.codeMedium,
    color: colors.ink,
  },
  list: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[8],
    gap: spacing[3],
  },
  row: {
    gap: spacing[3],
  },
  cell: {
    flex: 1,
    gap: spacing[1],
    paddingBottom: spacing[2],
    borderRadius: radius.control,
  },
  cellPressed: {
    opacity: 0.7,
  },
  dropText: {
    ...type.tinyMono,
    color: colors.muted,
    paddingHorizontal: spacing[2],
  },
  equippedTag: {
    ...type.tinyMono,
    color: colors.red,
    paddingHorizontal: spacing[2],
  },
  equipHint: {
    ...type.tinyMono,
    color: colors.ink,
    paddingHorizontal: spacing[2],
  },
  claimHint: {
    ...type.tinyMono,
    color: colors.faint,
    paddingHorizontal: spacing[2],
  },
  empty: {
    minHeight: 120,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing[6],
  },
});
