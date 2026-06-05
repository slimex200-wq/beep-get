import { existsSync, readFileSync } from "fs";
import path from "path";
import { DEFAULT_SLOT_DECK } from "@/screens/send/sendSignalHelpers";
import { validateMessage } from "@/services/messageService";

describe("SendSignalScreen product sections", () => {
  it("renders the image mockup Send tab layout", () => {
    const source = readFileSync(path.join(process.cwd(), "src/screens/SendSignalScreen.tsx"), "utf8");
    const controllerSource = readFileSync(path.join(process.cwd(), "src/screens/send/useSendSignalController.ts"), "utf8");
    const helperSource = readFileSync(path.join(process.cwd(), "src/screens/send/sendSignalHelpers.ts"), "utf8");
    const mockupSource = readFileSync(path.join(process.cwd(), "src/components/SendMockupPrimaryScreen.tsx"), "utf8");
    const controlsSource = readFileSync(path.join(process.cwd(), "src/components/SendMockupControls.tsx"), "utf8");
    const combinedSource = `${source}\n${controllerSource}\n${helperSource}\n${mockupSource}\n${controlsSource}`;

    ["SEND", "To", "Signal Slot Deck", "Recent Combos"].forEach((label) => {
      expect(mockupSource).toContain(label);
    });
    expect(source).toContain("SendMockupPrimaryScreen");
    expect(mockupSource).toContain("SendModeToggle");
    expect(mockupSource).toContain("SendMockupSlotGrid");
    expect(mockupSource).toContain("SendRecipientStrip");
    expect(controlsSource).toContain("width: \"30.8%\"");
    expect(mockupSource).toContain("primaryLabel");
    expect(mockupSource).toContain("SEND BEEP");
    expect(combinedSource).toContain('accessibilityLabel="Choose Beep"');
    expect(combinedSource).toContain('accessibilityLabel="Choose Blink"');
    expect(controllerSource).toContain("createBlinkDraft({ senderId: profile.id, receiverId: recipient.id, videoUri: captured.uri })");
    expect(source).toContain("onSelect={controller.selectRecipient}");
    expect(source).toContain("onSelectSlot={controller.selectSlot}");
    expect(source).toContain("onSelectCombo={controller.selectRecentCombo}");
    expect(controllerSource).toContain('params.mode ?? "beep"');
    expect(source).not.toContain("SendModeCards");
    expect(source).not.toContain("beepCapturePreview");
    expect(mockupSource).not.toContain("BEEP SEND PREVIEW");
    expect(mockupSource).not.toContain("BLINK SEND PREVIEW");
    expect(source).not.toContain("BeepMdWidgetPreview");
    expect(source).not.toContain("BeepSignalSquare");
    expect(source).not.toContain("BEEP SLOT");
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

  it("does not keep the obsolete card-based Send mode surface", () => {
    expect(existsSync(path.join(process.cwd(), "src/components/SendModeCards.tsx"))).toBe(false);
  });

  it("only shows send slots that the real send service accepts", () => {
    expect(DEFAULT_SLOT_DECK.every((slot) => validateMessage(slot).valid)).toBe(true);
  });

  it("does not duplicate capture sections when the mockup deck owns the Send header", () => {
    const source = readFileSync(path.join(process.cwd(), "src/screens/SendSignalScreen.tsx"), "utf8");
    const controllerSource = readFileSync(path.join(process.cwd(), "src/screens/send/useSendSignalController.ts"), "utf8");
    const beepSource = readFileSync(path.join(process.cwd(), "src/screens/SendBeepScreen.tsx"), "utf8");
    const blinkSource = readFileSync(path.join(process.cwd(), "src/screens/SendBlinkScreen.tsx"), "utf8");

    expect(controllerSource).toContain("const isModalFlow = route.name === \"Send\"");
    expect(source).toContain("!controller.isModalFlow || !controller.recipient ? (");
    expect(source).not.toContain(") : !controller.recipient ? (");
    expect(source).toContain("<SendMockupPrimaryScreen");
    expect(beepSource).toContain("const shouldRenderStandalonePreview = !deckHeader");
    expect(blinkSource).toContain("const shouldRenderCameraCard = !deckHeader");
    expect(blinkSource).toContain("const shouldRenderCaptureFrames = !deckHeader");
  });

  it("hides the back action on the primary Send tab and keeps it for modal sends", () => {
    const source = readFileSync(path.join(process.cwd(), "src/screens/SendSignalScreen.tsx"), "utf8");
    const controllerSource = readFileSync(path.join(process.cwd(), "src/screens/send/useSendSignalController.ts"), "utf8");
    const beepSource = readFileSync(path.join(process.cwd(), "src/screens/SendBeepScreen.tsx"), "utf8");
    const blinkSource = readFileSync(path.join(process.cwd(), "src/screens/SendBlinkScreen.tsx"), "utf8");

    expect(controllerSource).toContain('const isModalFlow = route.name === "Send"');
    expect(source).toContain("showBackAction={controller.isModalFlow}");
    expect(beepSource).toContain("showBackAction = true");
    expect(blinkSource).toContain("showBackAction = true");
  });

  it("uses a two-phase Blink flow so capture preview happens before upload", () => {
    const source = readFileSync(path.join(process.cwd(), "src/screens/send/useSendSignalController.ts"), "utf8");
    const helperSource = readFileSync(path.join(process.cwd(), "src/screens/send/sendSignalHelpers.ts"), "utf8");

    expect(source).toContain("blinkDraft");
    expect(helperSource).toContain("createPreviewBlinkDraft");
    expect(source).toContain("createBlinkDraft");
    expect(source).toContain("createTeaser: async () => blinkDraft.teaser");
    expect(source).toContain("previewFrameUris");
    expect(source).not.toContain("savedFrameUris");
  });

  it("opens a Send settings sheet instead of routing the header gear directly to logs", () => {
    const source = readFileSync(path.join(process.cwd(), "src/screens/SendSignalScreen.tsx"), "utf8");
    const controllerSource = readFileSync(path.join(process.cwd(), "src/screens/send/useSendSignalController.ts"), "utf8");
    const settingsSource = readFileSync(path.join(process.cwd(), "src/components/SendSettingsSheet.tsx"), "utf8");
    const beepSource = readFileSync(path.join(process.cwd(), "src/screens/SendBeepScreen.tsx"), "utf8");
    const blinkSource = readFileSync(path.join(process.cwd(), "src/screens/SendBlinkScreen.tsx"), "utf8");

    expect(source).toContain("SendSettingsSheet");
    expect(controllerSource).toContain("flashSentFeedback");
    expect(source).toContain("sentFeedback={controller.sentFeedback}");
    expect(controllerSource).toContain("await send(profile.id, recipient.id, code, memo || undefined)");
    expect(controllerSource).toContain('await send(profileIdArg, recipientId, code, memo || "Blink")');
    expect(beepSource).toContain("SendPlaneIcon");
    expect(beepSource).toContain("animateIconOnPress");
    expect(settingsSource).toContain("Default Send");
    expect(settingsSource).toContain("Beep sends code. Blink sends the code with a 2s video.");
    expect(settingsSource).toContain("Blink Draft Frames");
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
    const source = readFileSync(path.join(process.cwd(), "src/screens/send/useSendSignalController.ts"), "utf8");
    const navSource = readFileSync(path.join(process.cwd(), "src/navigation/RootNavigator.tsx"), "utf8");

    expect(navSource).toContain("initialCode?: string");
    expect(source).toContain('useState(params.initialCode ?? "")');
    expect(source).toContain("if (params.initialCode) setCode(params.initialCode)");
  });
});
