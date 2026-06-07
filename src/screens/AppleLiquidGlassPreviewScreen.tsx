import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import {
  AppleLiquidGlassControl,
  type LiquidGlassMode,
} from "@/components/appleLiquidGlass/AppleLiquidGlassControl";
import { appleLiquidGlassPreviewItems } from "@/screens/appleLiquidGlassPreview/data";
import {
  PreviewBackgroundSections,
  PreviewHeroCard,
} from "@/screens/appleLiquidGlassPreview/PreviewContent";
import { PreviewControls } from "@/screens/appleLiquidGlassPreview/PreviewControls";
import { appleLiquidGlassPreviewStyles as styles } from "@/screens/appleLiquidGlassPreview/styles";

export function AppleLiquidGlassPreviewScreen() {
  const [mode, setMode] = useState<LiquidGlassMode>("transparent");
  const [selectedIndex, setSelectedIndex] = useState(1);
  const [slowMotion, setSlowMotion] = useState(false);

  return (
    <View testID="apple-liquid-glass-preview" style={styles.stage}>
      <ScrollView
        testID="apple-liquid-glass-scroll-content"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <PreviewHeroCard />
          <PreviewControls
            mode={mode}
            slowMotion={slowMotion}
            selectedIndex={selectedIndex}
            onModeChange={setMode}
            onSelectedIndexChange={setSelectedIndex}
            onSlowMotionChange={setSlowMotion}
          />
        </View>
        <PreviewBackgroundSections />
      </ScrollView>
      <View style={[styles.glassDock, styles.boxNone]}>
        <AppleLiquidGlassControl
          items={appleLiquidGlassPreviewItems}
          selectedIndex={selectedIndex}
          mode={mode}
          slowMotion={slowMotion}
          onSelect={setSelectedIndex}
        />
      </View>
    </View>
  );
}
