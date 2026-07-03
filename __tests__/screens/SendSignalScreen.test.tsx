import { existsSync, readFileSync } from "fs";
import path from "path";
import {
  buildSignalSlotDeck,
  buildSlotDeck,
  DEFAULT_SLOT_DECK,
} from "@/screens/send/sendSignalHelpers";
import { validateMessage } from "@/services/messageService";

const readSource = (filePath: string) =>
  readFileSync(path.join(process.cwd(), filePath), "utf8");

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

  it("assembles the Send tab from the primitives design system only", () => {
    const source = readSource("src/screens/SendSignalScreen.tsx");
    const controllerSource = readSource("src/screens/send/useSendSignalController.ts");

    // Single component vocabulary: @/ui/primitives.
    expect(source).toContain('from "@/ui/primitives"');
    ["Screen", "SectionLabel", "Segmented", "Chip", "PrimaryButton"].forEach((primitive) => {
      expect(source).toContain(primitive);
    });

    // The absorbed mockup shell is gone — file-level and import-level.
    expect(existsSync(path.join(process.cwd(), "src/components/SendMockupPrimaryScreen.tsx"))).toBe(false);
    expect(existsSync(path.join(process.cwd(), "src/components/SendMockupControls.tsx"))).toBe(false);
    ["SendMockupPrimaryScreen", "SendMockupControls", "KotlinMockupUI", "TodayMockupChrome", "ActionButton"].forEach(
      (legacy) => {
        expect(source).not.toContain(legacy);
      },
    );

    // Structure and copy stay: Send title plus the three Korean section labels.
    ['title="Send"', "받는 사람", "신호 코드", "2초 캡처"].forEach((label) => {
      expect(source).toContain(label);
    });
    expect(source).toContain("SEND BEEP");
    expect(source).toContain("primaryLabel");

    // Colors come from the primitives/palette, never literals.
    expect(source).not.toMatch(/#[0-9a-fA-F]{3,8}/);
    expect(source).not.toContain("colors.");

    // Data wiring stays on the shared controller.
    expect(source).toContain("useSendSignalController");
    expect(source).toContain("onSelect={controller.selectRecipient}");
    expect(source).toContain("onSelectSlot={controller.selectSlot}");
    expect(source).toContain("controller.codeMeaning");
    expect(controllerSource).toContain("createBlinkDraft({ senderId: profile.id, receiverId: recipient.id, videoUri: captured.uri })");
    expect(controllerSource).toContain('params.mode ?? "beep"');

    // No pre-refresh surfaces sneak back in.
    expect(source).not.toContain("SendModeCards");
    expect(source).not.toContain("beepCapturePreview");
    expect(source).not.toContain("BeepMdWidgetPreview");
    expect(source).not.toContain("BeepSignalSquare");
    expect(source).not.toContain("BEEP SLOT");
    expect(source).not.toContain("SLOT DECK");
    expect(source).not.toContain('label="BEEP + BLINK"');
    expect(source).not.toContain("Save camera frame");
    expect(source).not.toContain("takePictureAsync");
    expect(source).not.toContain("Photo saved for later");
  });

  it("matches the Signal Edition renderSend structure: segment first, single-left labels, summary line", () => {
    const source = readSource("src/screens/SendSignalScreen.tsx");
    const controllerSource = readSource("src/screens/send/useSendSignalController.ts");

    // Order: BEEP/BLINK segment on top, then 2s capture, To rail, code deck, summary, SEND.
    const segmentIndex = source.indexOf("<Segmented");
    const blinkCaptureIndex = source.indexOf("2초 캡처");
    const toRailIndex = source.indexOf("받는 사람");
    const deckIndex = source.indexOf("신호 코드");
    const summaryIndex = source.indexOf("친구와 코드를 선택하세요");
    const sendButtonIndex = source.indexOf("handleSendPress}");
    expect(segmentIndex).toBeGreaterThan(-1);
    expect(blinkCaptureIndex).toBeGreaterThan(segmentIndex);
    expect(toRailIndex).toBeGreaterThan(blinkCaptureIndex);
    expect(deckIndex).toBeGreaterThan(toRailIndex);
    expect(summaryIndex).toBeGreaterThan(deckIndex);
    expect(sendButtonIndex).toBeGreaterThan(summaryIndex);

    // The 2s capture section only renders in Blink mode.
    expect(source).toContain('{mode === "blink" ? (');

    // One left label per section: no right hints, no legacy uppercase labels.
    expect(source).not.toContain("hint=");
    ["Choose a friend", "Small codes and notes", "Recent pairings"].forEach((hint) => {
      expect(source).not.toContain(hint);
    });
    expect(source).not.toContain('label="To"');
    expect(source).not.toContain("Signal Slot Deck");

    // Recent Combos stays deleted from the Send surface.
    expect(source).not.toContain("recentCombos");
    expect(controllerSource).not.toContain("buildRecentCombos");
    expect(existsSync(path.join(process.cwd(), "src/components/RecentSignalCombos.tsx"))).toBe(false);

    // Summary line between the deck and SEND: bold name + mono code in ink, muted meaning,
    // Blink capture state appended (sig-colored warning until captured).
    expect(source).toContain("에게{\" \"}");
    expect(source).toContain("summaryName");
    expect(source).toContain("summaryCode");
    expect(source).toContain("+ Blink 2.0s");
    expect(source).toContain("· Blink 캡처 필요");
    expect(source).toContain("<Text style={{ color: palette.sig }}>");
    expect(controllerSource).toContain("codeMeaning");
  });

  it("locks the Signal Edition send accents: ink fills, sig reserved for signal semantics", () => {
    const source = readSource("src/screens/SendSignalScreen.tsx");
    const capturePanelSource = readSource("src/components/SendBlinkCapturePanel.tsx");
    const combinedSource = `${source}\n${capturePanelSource}`;

    // To rail selection = sig ring + sigSoft halo, selected name back to ink.
    expect(source).toContain("selected && { borderWidth: 2, borderColor: palette.sig }");
    expect(source).toContain("selected && { backgroundColor: palette.sigSoft }");
    expect(source).toContain("color: selected ? palette.text : palette.muted");

    // Signal code deck: primitives Chips in a local 3-column grid (ink fill on selection
    // and the sig microdot are enforced inside <Chip/> itself).
    expect(source).toContain("<Chip label={slot} selected={selected === slot}");
    expect(source).toContain('width: "30.8%"');

    // SEND button: PrimaryButton ink fill, only the plane icon carries sig.
    expect(source).toContain("<PrimaryButton");
    expect(source).toContain("<SendPlaneIcon color={palette.sig} />");
    expect(source).not.toContain("<SendPlaneIcon color={palette.primaryText} />");
    // The legacy modal SendBeep/SendBlink screens were deleted with the UI rebuild.
    expect(existsSync(path.join(process.cwd(), "src/screens/SendBeepScreen.tsx"))).toBe(false);
    expect(existsSync(path.join(process.cwd(), "src/screens/SendBlinkScreen.tsx"))).toBe(false);

    // Blink capture REC indicator is sig-tinted and the panel reads the app palette.
    expect(capturePanelSource).toContain("useAppPalette");
    expect(capturePanelSource).toContain("REC 2.0s");
    expect(capturePanelSource).toContain("backgroundColor: palette.sig");

    // No purple/lavender remnants anywhere on the Send surface.
    ["#8F5EC7", "lavender", "#C9B4E4", "colors.lavender"].forEach((legacy) => {
      expect(combinedSource).not.toContain(legacy);
    });
  });

  it("keeps the outgoing summary on the live Send surface after the legacy screens were deleted", () => {
    const source = readSource("src/screens/SendSignalScreen.tsx");

    expect(source).toContain("summaryName");
    expect(source).toContain("summaryCode");
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
    const source = readSource("src/screens/SendSignalScreen.tsx");
    const controllerSource = readSource("src/screens/send/useSendSignalController.ts");

    expect(controllerSource).toContain("const isModalFlow = route.name === \"Send\"");
    expect(source).toContain("controller.isModalFlow");
    expect(source).toContain("controller.goBackToFlow");
    expect(source).not.toContain("SendBeepScreen");
    expect(source).not.toContain("SendBlinkScreen");
    expect(source).not.toContain("activeScreen");
  });

  it("hides the back action on the primary Send tab and keeps it for modal sends", () => {
    const source = readSource("src/screens/SendSignalScreen.tsx");
    const controllerSource = readSource("src/screens/send/useSendSignalController.ts");

    expect(controllerSource).toContain('const isModalFlow = route.name === "Send"');
    expect(source).toContain("{controller.isModalFlow ? (");
    expect(source).toContain('accessibilityLabel="Back"');
    expect(source).toContain("BackLineIcon");
    expect(source).toContain("onPress={controller.goBackToFlow}");
  });

  it("uses a two-phase Blink flow so capture preview happens before upload", () => {
    const source = readSource("src/screens/send/useSendSignalController.ts");
    const helperSource = readSource("src/screens/send/sendSignalHelpers.ts");

    expect(source).toContain("blinkDraft");
    expect(helperSource).toContain("createPreviewBlinkDraft");
    expect(source).toContain("createBlinkDraft");
    expect(source).toContain("createTeaser: async () => blinkDraft.teaser");
    expect(source).toContain("previewFrameUris");
    expect(source).not.toContain("savedFrameUris");
  });

  it("opens a Send settings sheet instead of routing the header gear directly to logs", () => {
    const source = readSource("src/screens/SendSignalScreen.tsx");
    const controllerSource = readSource("src/screens/send/useSendSignalController.ts");
    const settingsSource = readSource("src/components/SendSettingsSheet.tsx");

    expect(source).toContain("SendSettingsSheet");
    expect(source).toContain("onPress={controller.openSendSettings}");
    expect(source).toContain('accessibilityLabel="Send settings"');
    expect(source).toContain("GearLineIcon");
    expect(controllerSource).toContain("flashSentFeedback");
    expect(source).toContain("controller.sentFeedback");
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
    const source = readSource("src/screens/SendSignalScreen.tsx");

    expect(source).toContain("Animated.Value");
    expect(source).toContain("Animated.timing");
    expect(source).toContain("iconFlight");
    expect(source).toContain("handleSendPress");
    expect(source).toContain("<Animated.View");
  });

  it("can open from a Friends shortcut with an initial signal code", () => {
    const source = readSource("src/screens/send/useSendSignalController.ts");
    const navSource = readSource("src/navigation/RootNavigator.tsx");

    expect(navSource).toContain("initialCode?: string");
    expect(source).toContain('useState(params.initialCode ?? "")');
    expect(source).toContain("if (params.initialCode) setCode(params.initialCode)");
  });

  it("wires the signal code deck plus tile to the Codes editor", () => {
    const source = readSource("src/screens/SendSignalScreen.tsx");
    const controllerSource = readSource("src/screens/send/useSendSignalController.ts");

    expect(source).toContain('accessibilityLabel="Add signal slot"');
    expect(source).toContain("onAddSlot={controller.openDictionary}");
    expect(source).toContain("onPress={onAddSlot}");
    expect(controllerSource).toContain('const openDictionary = () => navigation.navigate("Dictionary")');
    expect(controllerSource).toContain("openDictionary,");
  });
});
