import React from "react";
import { Pressable, Text, View } from "react-native";
import type { LiquidGlassMode } from "@/components/appleLiquidGlass/AppleLiquidGlassControl";
import {
  appleLiquidGlassPreviewItems,
  liquidGlassModeOptions,
} from "@/screens/appleLiquidGlassPreview/data";
import { appleLiquidGlassPreviewStyles as styles } from "@/screens/appleLiquidGlassPreview/styles";

type Props = {
  readonly mode: LiquidGlassMode;
  readonly slowMotion: boolean;
  readonly selectedIndex: number;
  readonly onModeChange: (mode: LiquidGlassMode) => void;
  readonly onSelectedIndexChange: (index: number) => void;
  readonly onSlowMotionChange: (enabled: boolean) => void;
};

export function PreviewControls({
  mode,
  slowMotion,
  selectedIndex,
  onModeChange,
  onSelectedIndexChange,
  onSlowMotionChange,
}: Props) {
  return (
    <View style={styles.controls}>
      <View style={styles.segmentedControl}>
        {liquidGlassModeOptions.map((option) => {
          const active = mode === option;
          const label = option === "transparent" ? "Transparent glass mode" : "Tinted glass mode";

          return (
            <Pressable
              key={option}
              testID={`apple-liquid-glass-mode-${option}`}
              accessibilityRole="button"
              accessibilityLabel={label}
              accessibilityState={{ selected: active }}
              onPress={() => onModeChange(option)}
              style={[styles.segment, active && styles.segmentActive]}
            >
              <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                {option.toUpperCase()}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.iconSelector}>
        {appleLiquidGlassPreviewItems.map((item, index) => {
          const focused = selectedIndex === index;

          return (
            <Pressable
              key={item.key}
              accessibilityRole="button"
              accessibilityLabel={item.accessibilityLabel}
              accessibilityState={{ selected: focused }}
              onPress={() => onSelectedIndexChange(index)}
              style={[styles.selectorButton, focused && styles.selectorButtonActive]}
            >
              <item.Icon color={focused ? "#FFFFFF" : "rgba(255,255,255,0.70)"} size={20} />
            </Pressable>
          );
        })}
        <Pressable
          accessibilityRole="switch"
          accessibilityLabel="Slow motion glass animation"
          accessibilityState={{ checked: slowMotion }}
          onPress={() => onSlowMotionChange(!slowMotion)}
          style={[styles.slowButton, slowMotion && styles.selectorButtonActive]}
        >
          <Text style={styles.slowButtonText}>SLOW</Text>
        </Pressable>
      </View>
    </View>
  );
}
