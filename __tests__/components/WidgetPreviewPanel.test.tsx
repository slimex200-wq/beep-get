import { readFileSync } from "fs";
import path from "path";

describe("WidgetPreviewPanel theme frame", () => {
  it("uses the actual small/medium widget preview renderer instead of a separate color-card mock", () => {
    const source = readFileSync(path.join(process.cwd(), "src/components/WidgetPreviewPanel.tsx"), "utf8");

    expect(source).toContain("ActualWidgetPreview");
    expect(source).toContain("backgroundColor: palette.input");
    expect(source).toContain("borderColor: palette.rule");
    expect(source).toContain('size={medium ? "medium" : "small"}');
    expect(source).toContain('kind={kind ?? (medium ? "blink" : "beep")}');
    expect(source).toContain("skin={widgetSkin}");
    expect(source).not.toContain("toneVisuals");
    expect(source).not.toContain("actionRow");
  });
});
