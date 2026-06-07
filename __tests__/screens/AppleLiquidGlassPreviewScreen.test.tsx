import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { readFileSync } from "fs";
import path from "path";
import { isAppleLiquidGlassPreviewRequested } from "@/lib/appleLiquidGlassPreview";
import { AppleLiquidGlassPreviewScreen } from "@/screens/AppleLiquidGlassPreviewScreen";

const readSource = (relativePath: string) =>
  readFileSync(path.join(process.cwd(), relativePath), "utf8");

describe("AppleLiquidGlassPreviewScreen", () => {
  it("renders an isolated Apple-style glass preview with transparent and tinted modes", () => {
    const { getAllByLabelText, getByLabelText } = render(<AppleLiquidGlassPreviewScreen />);

    expect(getByLabelText("Transparent glass mode")).toBeTruthy();
    expect(getByLabelText("Tinted glass mode")).toBeTruthy();
    expect(getByLabelText("Slow motion glass animation")).toBeTruthy();

    fireEvent.press(getByLabelText("Tinted glass mode"));
    expect(getByLabelText("Tinted glass mode")).toBeTruthy();

    fireEvent.press(getByLabelText("Transparent glass mode"));
    expect(getByLabelText("Transparent glass mode")).toBeTruthy();

    fireEvent.press(getAllByLabelText("Select Send preview action")[0]);
    expect(getAllByLabelText("Select Send preview action")).toHaveLength(2);
  });

  it("keeps the preview out of production navigation and out of the old circular lens direction", () => {
    const rootNavigatorSource = readSource("src/navigation/RootNavigator.tsx");
    const controlSource = readSource("src/components/appleLiquidGlass/AppleLiquidGlassControl.tsx");
    const controlStylesSource = readSource("src/components/appleLiquidGlass/styles.ts");
    const tokensSource = readSource("src/components/appleLiquidGlass/tokens.ts");
    const screenSource = readSource("src/screens/AppleLiquidGlassPreviewScreen.tsx");
    const previewContentSource = readSource("src/screens/appleLiquidGlassPreview/PreviewContent.tsx");
    const previewControlsSource = readSource("src/screens/appleLiquidGlassPreview/PreviewControls.tsx");
    const previewDataSource = readSource("src/screens/appleLiquidGlassPreview/data.ts");
    const combinedSource = [
      controlSource,
      controlStylesSource,
      tokensSource,
      screenSource,
      previewContentSource,
      previewControlsSource,
      previewDataSource,
    ].join("\n");

    expect(rootNavigatorSource).not.toContain("AppleLiquidGlassPreview");
    expect(rootNavigatorSource).not.toContain("AppleLiquidGlassPreviewScreen");
    expect(combinedSource).toContain("LiquidGlassMode");
    expect(combinedSource).toContain("transparent");
    expect(combinedSource).toContain("tinted");
    expect(combinedSource).toContain("BEEP GET");
    expect(combinedSource).toContain("8282");
    expect(combinedSource).toContain("apple-liquid-glass-lobe");
    expect(controlSource).not.toContain("styles.lobeHighlight");
    expect(controlSource).not.toContain("styles.lobeDepth");
    expect(controlStylesSource).not.toContain("lobeHighlight");
    expect(controlStylesSource).not.toContain("lobeDepth");
    expect(tokensSource).not.toContain("highlight");
    expect(combinedSource).not.toContain("convexLens");
    expect(combinedSource).not.toContain("useConvexTabLens");
    expect(combinedSource).not.toContain("rgba(16,16,18,0.46)");
    expect(combinedSource).not.toContain("darkGlassBackground");
    expect(combinedSource).not.toContain("duplicate-rail");
  });

  it("allows direct preview entry without registering a navigation screen", () => {
    const previousFlag = process.env.EXPO_PUBLIC_APPLE_LIQUID_GLASS_PREVIEW;
    process.env.EXPO_PUBLIC_APPLE_LIQUID_GLASS_PREVIEW = "1";

    expect(isAppleLiquidGlassPreviewRequested()).toBe(true);

    if (previousFlag === undefined) {
      delete process.env.EXPO_PUBLIC_APPLE_LIQUID_GLASS_PREVIEW;
    } else {
      process.env.EXPO_PUBLIC_APPLE_LIQUID_GLASS_PREVIEW = previousFlag;
    }
  });
});
