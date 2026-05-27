import { readFileSync } from "fs";
import path from "path";

describe("SendSignalScreen product sections", () => {
  it("renders the Kotlin mockup send flow labels", () => {
    const source = readFileSync(path.join(process.cwd(), "src/screens/SendSignalScreen.tsx"), "utf8");
    ["TO:", "SIGNAL TYPE", "SIGNAL DECK"].forEach((label) => {
      expect(source).toContain(label);
    });
    expect(source).not.toContain("RECENT COMBOS");
    expect(source).not.toContain("SLOT DECK");
  });

  it("summarizes the outgoing code on Beep and Blink screens", () => {
    const beepSource = readFileSync(path.join(process.cwd(), "src/screens/SendBeepScreen.tsx"), "utf8");
    const blinkSource = readFileSync(path.join(process.cwd(), "src/screens/SendBlinkScreen.tsx"), "utf8");

    expect(beepSource).toContain("Will send code");
    expect(blinkSource).toContain("Will send code");
    expect(blinkSource).toContain("CAPTURED FRAMES");
  });

  it("does not duplicate capture sections when the mockup deck owns the Send header", () => {
    const blinkSource = readFileSync(path.join(process.cwd(), "src/screens/SendBlinkScreen.tsx"), "utf8");

    expect(blinkSource).toContain("const shouldRenderCameraCard = !deckHeader");
    expect(blinkSource).toContain("const shouldRenderCaptureFrames = !deckHeader");
  });

  it("hides the back action on the primary Send tab and keeps it for modal sends", () => {
    const source = readFileSync(path.join(process.cwd(), "src/screens/SendSignalScreen.tsx"), "utf8");
    const beepSource = readFileSync(path.join(process.cwd(), "src/screens/SendBeepScreen.tsx"), "utf8");
    const blinkSource = readFileSync(path.join(process.cwd(), "src/screens/SendBlinkScreen.tsx"), "utf8");

    expect(source).toContain('const isModalFlow = route.name === "Send"');
    expect(source).toContain("showBackAction={isModalFlow}");
    expect(beepSource).toContain("showBackAction = true");
    expect(blinkSource).toContain("showBackAction = true");
  });

  it("uses a two-phase Blink flow so capture preview happens before upload", () => {
    const source = readFileSync(path.join(process.cwd(), "src/screens/SendSignalScreen.tsx"), "utf8");

    expect(source).toContain("blinkDraft");
    expect(source).toContain("createBlinkDraft");
    expect(source).toContain("createTeaser: async () => blinkDraft.teaser");
  });
});
