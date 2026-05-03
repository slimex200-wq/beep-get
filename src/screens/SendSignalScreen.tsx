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
  const modeSwitch = (
    <View style={styles.switcher}>
      <ModeButton label="BEEP" active={mode === "beep"} onPress={() => setMode("beep")} />
      <ModeButton label="BLINK" active={mode === "blink"} onPress={() => setMode("blink")} />
    </View>
  );

  return <ActiveScreen modeSwitch={modeSwitch} />;
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
  switcher: {
    alignSelf: "center",
    backgroundColor: "rgba(10,10,10,0.04)",
    borderColor: colors.ruleStrong,
    borderRadius: radius.control,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing[2],
    marginBottom: spacing[4],
    marginHorizontal: spacing[5],
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
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  modeText: {
    color: colors.ink,
  },
  modeTextActive: {
    color: colors.paperWarm,
  },
});
