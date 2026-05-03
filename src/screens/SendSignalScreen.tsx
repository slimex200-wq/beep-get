import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { SendBeepScreen } from "@/screens/SendBeepScreen";
import { SendBlinkScreen } from "@/screens/SendBlinkScreen";

type SendMode = "beep" | "blink";

export function SendSignalScreen() {
  const [mode, setMode] = useState<SendMode>("beep");
  const ActiveScreen = mode === "beep" ? SendBeepScreen : SendBlinkScreen;

  return (
    <View style={styles.container}>
      <View style={styles.switcher}>
        <ModeButton label="BEEP" active={mode === "beep"} onPress={() => setMode("beep")} />
        <ModeButton label="BLINK" active={mode === "blink"} onPress={() => setMode("blink")} />
      </View>
      <ActiveScreen />
    </View>
  );
}

function ModeButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.modeButton, active && styles.modeButtonActive]}
    >
      <Text style={[type.tinyMono, styles.modeText, active && styles.modeTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.stage,
  },
  switcher: {
    alignSelf: "center",
    backgroundColor: colors.stageSoft,
    borderColor: "rgba(247,243,234,0.18)",
    borderRadius: radius.control,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing[2],
    marginBottom: spacing[4],
    marginTop: spacing[4],
    padding: spacing[2],
    width: "92%",
    maxWidth: 430,
  },
  modeButton: {
    alignItems: "center",
    borderColor: "rgba(247,243,234,0.16)",
    borderRadius: radius.button,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 34,
  },
  modeButtonActive: {
    backgroundColor: colors.paperWarm,
    borderColor: colors.paperWarm,
  },
  modeText: {
    color: colors.white,
  },
  modeTextActive: {
    color: colors.ink,
  },
});
