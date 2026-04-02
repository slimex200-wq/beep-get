import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { getRarityLabel, getRarityColor } from "@/services/collectionService";

interface IconCardProps {
  name: string;
  imageUrl: string;
  rarity: string;
  isOwned: boolean;
}

export function IconCard({ name, imageUrl, rarity, isOwned }: IconCardProps) {
  const theme = useTheme();
  const rarityColor = getRarityColor(rarity);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: isOwned ? rarityColor : theme.colors.border,
          borderWidth: isOwned ? 2 : 1,
          opacity: isOwned ? 1 : 0.5,
        },
      ]}
    >
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        resizeMode="contain"
      />
      <Text
        style={[styles.name, { color: theme.colors.textPrimary }]}
        numberOfLines={1}
      >
        {name}
      </Text>
      <Text style={[styles.rarity, { color: rarityColor }]}>
        {getRarityLabel(rarity)}
      </Text>
      {!isOwned && (
        <View style={styles.lockOverlay}>
          <Text style={styles.lockIcon}>?</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "30%",
    borderRadius: 8,
    padding: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  image: {
    width: 40,
    height: 40,
    marginBottom: 4,
  },
  name: {
    fontFamily: "VT323",
    fontSize: 12,
    textAlign: "center",
  },
  rarity: {
    fontFamily: "Silkscreen",
    fontSize: 8,
    marginTop: 2,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  lockIcon: {
    fontFamily: "VT323",
    fontSize: 24,
    color: "#FFFFFF",
  },
});
