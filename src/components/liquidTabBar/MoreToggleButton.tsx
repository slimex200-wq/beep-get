import React from "react";
import { Pressable } from "react-native";
import { ChevronRightLineIcon, XLineIcon } from "@/components/MockupLineIcons";
import { liquidTabStyles as styles } from "@/components/liquidTabBar/styles";

type Props = {
  readonly expanded: boolean;
  readonly onPress: () => void;
};

const foreground = "rgba(255,255,255,0.84)";

export function MoreToggleButton({ expanded, onPress }: Props) {
  if (expanded) {
    return (
      <Pressable
        testID="liquid-tab-more-close"
        accessibilityLabel="Close tabs"
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.moreButton, pressed && styles.pressed]}
      >
        <XLineIcon color={foreground} />
      </Pressable>
    );
  }

  return (
    <Pressable
      testID="liquid-tab-more-open"
      accessibilityLabel="More tabs"
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.moreButton, pressed && styles.pressed]}
    >
      <ChevronRightLineIcon color={foreground} />
    </Pressable>
  );
}
