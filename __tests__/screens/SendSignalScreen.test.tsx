import { existsSync, readFileSync } from "fs";
import path from "path";
import {
  buildSignalSlotDeck,
  buildSlotDeck,
  DEFAULT_SLOT_DECK,
} from "@/screens/send/sendSignalHelpers";
import { validateMessage } from "@/services/messageService";

describe("SendSignalScreen product sections", () => {
  it("keeps valid user dictionary slots immediately after the core 8282 slot", () => {
    const deck = buildSignalSlotDeck(
      [
        { code: "1212" },
        { code: "486" },
        { code: "3434" },
        { code: "hello\nnow" },
      ],
      DEFAULT_SLOT_DECK,
    );

    expect(deck.slice(0, 4)).toEqual(["8282", "1212", "486", "3434"]);
    expect(deck).toHaveLength(8);
    expect(new Set(deck).size).toBe(deck.length);
    expect(deck.every((slot) => validateMessage(slot).valid)).toBe(true);
    expect(buildSlotDeck([{ code: "1212" }], DEFAULT_SLOT_DECK)).toEqual(
      buildSignalSlotDeck([{ code: "1212" }], DEFAULT_SLOT_DECK),
    );
  });

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
    expect(mockupSource).toContain("useAppPalette");
    expect(controlsSource).toContain("width: \"30.8%\"");
    expect(mockupSource).toContain("primaryLabel");
    expect(mockupSource).toContain("SEND BEEP");
    expect(mockupSource).not.toContain("statusBarStyle=\"dark\"");
    expect(mockupSource).not.toContain("backgroundColor={colors.ivory}");
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

  it("filters custom dictionary slots through the real send contract", () => {
    const slots = buildSignalSlotDeck(
      [
        { code: "OK" },
        { code: "https://bad.example" },
        { code: "hello\nnow" },
      ],
      ["8282"],
    );

    expect(slots).toEqual(["8282", "OK"]);
    expect(slots.every((slot) => validateMessage(slot).valid)).toBe(true);
  });

  it("uses the same Send deck for primary tab and send-back modal entries", () => {
    const source = readFileSync(path.join(process.cwd(), "src/screens/SendSignalScreen.tsx"), "utf8");
    const controllerSource = readFileSync(path.join(process.cwd(), "src/screens/send/useSendSignalController.ts"), "utf8");

    expect(controllerSource).toContain("const isModalFlow = route.name === \"Send\"");
    expect(source).toContain("<SendMockupPrimaryScreen");
    expect(source).toContain("showBackAction={controller.isModalFlow}");
    expect(source).toContain("onBack={controller.goBackToFlow}");
    expect(source).not.toContain("SendBeepScreen");
    expect(source).not.toContain("SendBlinkScreen");
    expect(source).not.toContain("activeScreen");
  });

  it("hides the back action on the primary Send tab and keeps it for modal sends", () => {
    const source = readFileSync(path.join(process.cwd(), "src/screens/SendSignalScreen.tsx"), "utf8");
    const controllerSource = readFileSync(path.join(process.cwd(), "src/screens/send/useSendSignalController.ts"), "utf8");
    const mockupSource = readFileSync(path.join(process.cwd(), "src/components/SendMockupPrimaryScreen.tsx"), "utf8");

    expect(controllerSource).toContain('const isModalFlow = route.name === "Send"');
    expect(source).toContain("showBackAction={controller.isModalFlow}");
    expect(source).toContain("onBack={controller.goBackToFlow}");
    expect(mockupSource).toContain("showBackAction = false");
    expect(mockupSource).toContain('accessibilityLabel: "Back"');
    expect(mockupSource).toContain("BackLineIcon");
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
    const mockupSource = readFileSync(path.join(process.cwd(), "src/components/SendMockupPrimaryScreen.tsx"), "utf8");

    expect(source).toContain("SendSettingsSheet");
    expect(source).toContain("onOpenSettings={controller.openSendSettings}");
    expect(mockupSource).toContain('accessibilityLabel: "Send settings"');
    expect(mockupSource).toContain("GearLineIcon");
    expect(controllerSource).toContain("flashSentFeedback");
    expect(source).toContain("sentFeedback={controller.sentFeedback}");
    expect(controllerSource).toContain("await send(profile.id, recipient.id, code, memo || undefined)");
    expect(controllerSource).toContain('await send(profileIdArg, recipientId, code, memo || "Blink")');
    expect(settingsSource).toContain("Default Send");
    expect(settingsSource).toContain("Beep sends code. Blink sends the code with a 2s video.");
    expect(settingsSource).toContain("Blink Draft Frames");
    expect(source).not.toContain("AvatarPickerSheet");
    expect(source).not.toContain("Profile Avatar");
    expect(source).not.toContain("Header Avatar");
    expect(source).not.toContain("Diagnostics");
  });

  it("keeps the primary Send tab paper-plane press interaction", () => {
    const mockupSource = readFileSync(path.join(process.cwd(), "src/components/SendMockupPrimaryScreen.tsx"), "utf8");

    expect(mockupSource).toContain("Animated.Value");
    expect(mockupSource).toContain("Animated.timing");
    expect(mockupSource).toContain("iconFlight");
    expect(mockupSource).toContain("handleSendPress");
    expect(mockupSource).toContain("<Animated.View");
  });

  it("can open from a Friends shortcut with an initial signal code", () => {
    const source = readFileSync(path.join(process.cwd(), "src/screens/send/useSendSignalController.ts"), "utf8");
    const navSource = readFileSync(path.join(process.cwd(), "src/navigation/RootNavigator.tsx"), "utf8");

    expect(navSource).toContain("initialCode?: string");
    expect(source).toContain('useState(params.initialCode ?? "")');
    expect(source).toContain("if (params.initialCode) setCode(params.initialCode)");
  });

  it("wires the Signal Slot Deck plus tile to the Codes editor", () => {
    const source = readFileSync(path.join(process.cwd(), "src/screens/SendSignalScreen.tsx"), "utf8");
    const controllerSource = readFileSync(path.join(process.cwd(), "src/screens/send/useSendSignalController.ts"), "utf8");
    const mockupSource = readFileSync(path.join(process.cwd(), "src/components/SendMockupPrimaryScreen.tsx"), "utf8");
    const controlsSource = readFileSync(path.join(process.cwd(), "src/components/SendMockupControls.tsx"), "utf8");

    expect(controlsSource).toContain("readonly onAddSlot: () => void");
    expect(controlsSource).toContain('accessibilityLabel="Add signal slot"');
    expect(controlsSource).toContain("onPress={onAddSlot}");
    expect(mockupSource).toContain("onAddSlot={onAddSlot}");
    expect(source).toContain("onAddSlot={controller.openDictionary}");
    expect(controllerSource).toContain('const openDictionary = () => navigation.navigate("Dictionary")');
    expect(controllerSource).toContain("openDictionary,");
  });
});
