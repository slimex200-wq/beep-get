import React, { useEffect, useMemo } from "react";
import { View, Text, FlatList, StyleSheet, Alert } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { SkinPreview } from "@/components/SkinPreview";
import { useAuthStore } from "@/stores/authStore";
import { useSkinStore } from "@/stores/skinStore";

export function SkinShopScreen() {
  const theme = useTheme();
  const { profile } = useAuthStore();
  const { allSkins, ownedSkins, activeSkinSlug, fetchAll, fetchOwned, purchase, apply } =
    useSkinStore();

  useEffect(() => {
    fetchAll();
    if (profile) fetchOwned(profile.id);
  }, [profile?.id]);

  const ownedSkinIds = useMemo(
    () => new Set(ownedSkins.map((os) => os.skin_id)),
    [ownedSkins]
  );
  const isOwned = (skinId: string) => ownedSkinIds.has(skinId);

  const handlePress = async (skin: any) => {
    if (!profile) return;

    if (isOwned(skin.id) || skin.is_free) {
      await apply(profile.id, skin.id, skin.slug);
      Alert.alert("적용 완료", `${skin.name} 스킨이 적용되었습니다`);
    } else {
      Alert.alert(
        "구매",
        `${skin.name} 스킨을 구매하시겠습니까?`,
        [
          { text: "취소", style: "cancel" },
          {
            text: "구매",
            onPress: async () => {
              try {
                await purchase(profile.id, skin.id);
                await apply(profile.id, skin.id, skin.slug);
                Alert.alert("구매 완료");
              } catch (err: any) {
                Alert.alert("오류", err.message);
              }
            },
          },
        ]
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.header, { color: theme.colors.textSecondary }]}>
        SKINS
      </Text>
      <FlatList
        data={allSkins}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <SkinPreview
            slug={item.slug}
            name={item.name}
            isOwned={isOwned(item.id) || item.is_free}
            isActive={activeSkinSlug === item.slug}
            isFree={item.is_free}
            onPress={() => handlePress(item)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: {
    fontFamily: "Pretendard-SemiBold",
    fontSize: 14,
    letterSpacing: 2,
    textAlign: "center",
    marginBottom: 16,
    marginTop: 32,
  },
  row: { justifyContent: "space-between" },
});
