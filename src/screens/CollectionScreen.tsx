import React, { useEffect } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { IconCard } from "@/components/IconCard";
import { useAuthStore } from "@/stores/authStore";
import { useCollectionStore } from "@/stores/collectionStore";

export function CollectionScreen() {
  const theme = useTheme();
  const { profile } = useAuthStore();
  const { allIcons, ownedIcons, fetchAll, fetchOwned, isOwned } =
    useCollectionStore();

  useEffect(() => {
    fetchAll();
    if (profile) fetchOwned(profile.id);
  }, [profile?.id]);

  const ownedCount = ownedIcons.length;
  const totalCount = allIcons.length;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.header, { color: theme.colors.textSecondary }]}>
        COLLECTION
      </Text>
      <Text style={[styles.counter, { color: theme.colors.primary }]}>
        {ownedCount}/{totalCount}
      </Text>
      <FlatList
        data={allIcons}
        keyExtractor={(item) => item.id}
        numColumns={3}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <IconCard
            name={item.name}
            imageUrl={item.image_url}
            rarity={item.rarity}
            isOwned={isOwned(item.id)}
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
    marginBottom: 4,
    marginTop: 32,
  },
  counter: {
    fontFamily: "Pretendard",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 16,
  },
  row: { justifyContent: "space-between" },
});
