import { readFileSync } from "fs";
import path from "path";

describe("SendSignalScreen product sections", () => {
  it("renders the Kotlin mockup send flow labels", () => {
    const source = readFileSync(path.join(process.cwd(), "src/screens/SendSignalScreen.tsx"), "utf8");
    ["TO:", "SIGNAL DECK"].forEach((label) => {
      expect(source).toContain(label);
    });
    expect(source).toContain("CaptureReticlePanel");
    expect(source).toContain("CaptureFrameStrip");
    expect(source).toContain("SmBeepWidgetPreview");
    expect(source).toContain("BlinkMdWidgetPreview");
    expect(source).toContain("SM WIDGET PREVIEW");
    expect(source).toContain("MD WIDGET PREVIEW");
    expect(source).toContain("SIGNAL SLOTS");
    expect(source).toContain("2.0s - MUTE");
    expect(source).toContain("3 frames extracted from 2s Blink");
    expect(source).toContain("onAddPress={openPeople}");
    expect(source).toContain("onSelect={selectRecipient}");
    expect(source).toContain("onSelect={selectSlot}");
    expect(source).toContain("<SignalSlotRail compact");
    expect(source).toContain('params.mode ?? "beep"');
    expect(source).toContain('label="BEEP"');
    expect(source).toContain('label="BLINK"');
    expect(source).toContain("beepCapturePreview");
    expect(source).not.toContain("BeepMdWidgetPreview");
    expect(source).not.toContain("BeepSignalSquare");
    expect(source).not.toContain("BEEP SLOT");
    expect(source).not.toContain("RECENT COMBOS");
    expect(source).not.toContain("SLOT DECK");
    expect(source).not.toContain('label="BEEP + BLINK"');
    expect(source).not.toContain("Save camera frame");
    expect(source).not.toContain("takePictureAsync");
    expect(source).not.toContain("Photo saved for later");
  });

  it("summarizes the outgoing code on Beep and Blink screens", () => {
    const beepSource = readFileSync(path.join(process.cwd(), "src/screens/SendBeepScreen.tsx"), "utf8");
    const blinkSource = readFileSync(path.join(process.cwd(), "src/screens/SendBlinkScreen.tsx"), "utf8");

    expect(beepSource).toContain("Will send signal");
    expect(blinkSource).toContain("Will send signal");
    expect(blinkSource).toContain("CAPTURED FRAMES");
  });

  it("does not duplicate capture sections when the mockup deck owns the Send header", () => {
    const beepSource = readFileSync(path.join(process.cwd(), "src/screens/SendBeepScreen.tsx"), "utf8");
    const blinkSource = readFileSync(path.join(process.cwd(), "src/screens/SendBlinkScreen.tsx"), "utf8");

    expect(beepSource).toContain("const shouldRenderStandalonePreview = !deckHeader");
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
    expect(source).toContain("previewFrameUris");
    expect(source).not.toContain("savedFrameUris");
  });

  it("opens a Send settings sheet instead of routing the header gear directly to logs", () => {
    const source = readFileSync(path.join(process.cwd(), "src/screens/SendSignalScreen.tsx"), "utf8");
    const beepSource = readFileSync(path.join(process.cwd(), "src/screens/SendBeepScreen.tsx"), "utf8");
    const blinkSource = readFileSync(path.join(process.cwd(), "src/screens/SendBlinkScreen.tsx"), "utf8");

    expect(source).toContain("SendSettingsSheet");
    expect(source).toContain("flashSentFeedback");
    expect(source).toContain("sentFeedback={sentFeedback}");
    expect(beepSource).toContain("SendPlaneIcon");
    expect(beepSource).toContain("animateIconOnPress");
    expect(source).toContain("Default Send");
    expect(source).toContain("Beep sends code. Blink sends the code with a 2s video.");
    expect(source).toContain("Blink Draft Frames");
    expect(source).toContain("KotlinHeader");
    expect(blinkSource).toContain("GearLineIcon");
    expect(blinkSource).toContain("SendPlaneIcon");
    expect(blinkSource).toContain("animateIconOnPress");
    expect(blinkSource).toContain("onOpenSettings");
    expect(blinkSource).toContain("Capture Blink");
    expect(blinkSource).not.toContain("hasSavedFrames");
    expect(source).not.toContain("AvatarPickerSheet");
    expect(source).not.toContain("Profile Avatar");
    expect(source).not.toContain("Header Avatar");
    expect(blinkSource).not.toContain("onPress: onOpenLogs");
    expect(source).not.toContain("Diagnostics");
  });

  it("can open from a Friends shortcut with an initial signal code", () => {
    const source = readFileSync(path.join(process.cwd(), "src/screens/SendSignalScreen.tsx"), "utf8");
    const navSource = readFileSync(path.join(process.cwd(), "src/navigation/RootNavigator.tsx"), "utf8");

    expect(navSource).toContain("initialCode?: string");
    expect(source).toContain('useState(params.initialCode ?? "")');
    expect(source).toContain("if (params.initialCode) setCode(params.initialCode)");
  });
});
