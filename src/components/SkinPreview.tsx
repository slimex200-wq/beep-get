import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { getSkinTheme } from "@/theme/ThemeProvider";
import { useTheme } from "@/theme/ThemeProvider";

interface SkinPreviewProps {
  slug: string;
  name: string;
  isOwned: boolean;
  isActive: boolean;
  isFree: boolean;
  onPress: () => void;
}

export function SkinPreview({
  slug,
  name,
  isOwned,
  isActive,
  isFree,
  onPress,
}: SkinPreviewProps) {
  const currentTheme = useTheme();
  const previewTheme = getSkinTheme(slug);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`스킨: ${name}${isActive ? ", 적용중" : ""}${!isOwned && !isFree ? ", 프리미엄" : ""}`}
      onPress={onPress}
      style={styles.container}
    >
      {/* Mini LCD preview */}
      <View
        style={[
          styles.preview,
          { backgroundColor: previewTheme.colors.lcdBackground },
        ]}
      >
        <Text
          style={[
            styles.previewCode,
            { color: previewTheme.colors.lcdText },
          ]}
        >
          012486
        </Text>
        <Text
          style={[
            styles.previewSub,
            { color: previewTheme.colors.lcdSubtext },
          ]}
        >
          FROM: BEEP
        </Text>
      </View>

      <Text style={[styles.name, { color: currentTheme.colors.textPrimary }]}>
        {name}
      </Text>

      <View style={styles.badges}>
        {isActive && (
          <Text
            style={[styles.badge, { color: currentTheme.colors.primary }]}
          >
            적용중
          </Text>
        )}
        {!isOwned && !isFree && (
          <Text style={[styles.badge, { color: currentTheme.colors.accent }]}>
            프리미엄
          </Text>
        )}
        {isFree && (
          <Text
            style={[styles.badge, { color: currentTheme.colors.secondary }]}
          >
            무료
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "48%",
    marginBottom: 16,
  },
  preview: {
    borderRadius: 8,
    padding: 12,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  previewCode: {
    fontFamily: "Pretendard",
    fontSize: 24,
    letterSpacing: 2,
  },
  previewSub: {
    fontFamily: "Pretendard",
    fontSize: 10,
    marginTop: 4,
  },
  name: {
    fontFamily: "Pretendard-SemiBold",
    fontSize: 11,
    marginTop: 8,
    textAlign: "center",
  },
  badges: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
    marginTop: 4,
  },
  badge: {
    fontFamily: "Pretendard",
    fontSize: 11,
  },
});
