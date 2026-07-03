import { existsSync, readFileSync } from "fs";
import path from "path";

function readSource(relativePath: string) {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("MyScreen Signal Edition structure", () => {
  it("is assembled from the primitives design system with no legacy mockup chrome", () => {
    const source = readSource("src/screens/MyScreen.tsx");

    expect(source).toContain('from "@/ui/primitives"');
    ["Screen", "SectionLabel", "Card", "ListRow", "RowChevron", "Chip", "PillButton"].forEach(
      (primitive) => {
        expect(source).toContain(primitive);
      },
    );

    // Forbidden legacy shell imports/components.
    [
      "KotlinMockupUI",
      "KotlinHeader",
      "MockupCard",
      "MockupSection",
      "IconButton",
      "TodayMockupChrome",
      "TodayMockupHeader",
      "TodaySectionHeader",
      "SendMockupControls",
      "SendMockupPrimaryScreen",
      "ActionButton",
    ].forEach((legacy) => {
      expect(source).not.toContain(legacy);
    });

    // Screen StyleSheet owns no palette colors: primitives enforce them.
    expect(source).not.toContain("colors.");

    // The old standalone card files are absorbed into the screen, not orphaned.
    expect(existsSync(path.join(process.cwd(), "src/components/my/MyProfileCard.tsx"))).toBe(false);
    expect(existsSync(path.join(process.cwd(), "src/components/my/SkinPackCard.tsx"))).toBe(false);
  });

  it("renders the mockup renderMy order: profile → 스킨 팩 → 시그널 컬러 → 퀵 리플라이 슬롯 → 설정", () => {
    const source = readSource("src/screens/MyScreen.tsx");

    // Left-aligned "My" title on the shared Screen shell.
    expect(source).toContain('<Screen title="My">');

    // Section labels come from the mockup verbatim, rendered with the shared
    // sig-tick section label and no right-side hints.
    expect(source).toContain(">스킨 팩</SectionLabel>");
    expect(source).toContain(">시그널 컬러</SectionLabel>");
    expect(source).toContain(">퀵 리플라이 슬롯</SectionLabel>");
    expect(source).toContain(">설정</SectionLabel>");
    expect(source).not.toContain("hint=");

    expect(source.indexOf("<MyProfileCard")).toBeLessThan(source.indexOf(">스킨 팩</SectionLabel>"));
    expect(source.indexOf(">스킨 팩</SectionLabel>")).toBeLessThan(source.indexOf(">시그널 컬러</SectionLabel>"));
    expect(source.indexOf(">시그널 컬러</SectionLabel>")).toBeLessThan(
      source.indexOf(">퀵 리플라이 슬롯</SectionLabel>"),
    );
    expect(source.indexOf(">퀵 리플라이 슬롯</SectionLabel>")).toBeLessThan(source.indexOf(">설정</SectionLabel>"));
  });

  it("drops the room-concept shell: no My Beep Room, Room Style, Photo Avatar, or widget mirror surfaces", () => {
    const source = readSource("src/screens/MyScreen.tsx");

    [
      "My Beep Room",
      "Room Style",
      "Photo Avatar",
      "Widget Preview",
      "WIDGET FIRST",
      "result mirror",
      "Room Tools",
      "room face",
      "skin controls",
      "signal accent",
      "widget mood first",
      "Decorate Photo",
    ].forEach((label) => {
      expect(source).not.toContain(label);
    });
    expect(source).not.toContain("WidgetPreviewPanel");

    // The old card files are gone, not orphaned.
    expect(existsSync(path.join(process.cwd(), "src/components/my/PhotoAvatarCard.tsx"))).toBe(false);
    expect(existsSync(path.join(process.cwd(), "src/components/my/RoomStyleCard.tsx"))).toBe(false);
    expect(existsSync(path.join(process.cwd(), "src/components/my/MyRoomToolsCard.tsx"))).toBe(false);
  });

  it("opens the profile card into the existing avatar sheet through the 편집 pill", () => {
    const source = readSource("src/screens/MyScreen.tsx");

    expect(source).toContain("onEdit={() => setAvatarSheetVisible(true)}");
    expect(source).toContain('label="편집"');
    expect(source).toContain('accessibilityLabel="프로필 편집"');
    expect(source).toContain("`@${handle}`");
    expect(source).toContain("metaMono");

    // Avatar sheet logic is preserved untouched.
    expect(source).toContain("AvatarPickerSheet");
    expect(source).toContain("updateAvatar");
    expect(source).toContain("AVATAR_PRESETS");
    expect(source).toContain("chooseAvatar");
  });

  it("keeps the skin pack purchase/apply flow behind a single 스킨 팩 row card", () => {
    const source = readSource("src/screens/MyScreen.tsx");

    expect(source).toContain("<SkinPackCard activePack={activePack} onPress={() => setSkinSheetVisible(true)} />");
    expect(source).toContain('label="변경"');
    expect(source).toContain('accessibilityLabel="Open Skin Pack picker"');

    // Row card copy is the fixed Korean surface list, never the English pack shortCopy.
    const rowCardSource = source.slice(
      source.indexOf("function SkinPackCard"),
      source.indexOf("function SkinPackSheet"),
    );
    expect(rowCardSource).toContain("위젯 · Send 카드 · 아바타 프레임");
    expect(rowCardSource).not.toContain("shortCopy");
    expect(rowCardSource).toContain("getPackVisual");

    // Purchase/apply logic is preserved untouched.
    expect(source).toContain("SkinPackSheet");
    expect(source).toContain("chooseSkinPack");
    expect(source).toContain("setLocalActiveIdentityPack");
    expect(source).toContain("applyIdentityPack");
    expect(source).toContain("isIdentityPackStoreEnabled");
    expect(source).toContain("Skin Pack Preview");
    expect(source).toContain("WidgetSkinPackCard");
    expect(source).toContain("skinPackPreviewName");
    expect(source).toContain("previewFrom={skinPackPreviewName}");
  });

  it("offers the Signal Edition signal-color picker with ink-only action semantics", () => {
    const source = readSource("src/screens/MyScreen.tsx");

    // Options come from the design layer, selection persists through the theme store.
    expect(source).toContain("SIGNAL_COLOR_OPTIONS");
    expect(source).toContain('from "@/design/appTheme"');
    expect(source).toContain("useThemeStore((state) => state.signalColor)");
    expect(source).toContain("useThemeStore((state) => state.setSignalColor)");
    expect(source).toContain("setSignalColor(key)");

    // Swatch per option; selected halo uses sigSoft while the border is ink
    // text — never a sig-filled button.
    expect(source).toContain("backgroundColor: option.light.sig");
    expect(source).toContain("borderColor: selected ? palette.text : palette.rule");
    expect(source).toContain("backgroundColor: selected ? palette.sigSoft : palette.input");
    expect(source).not.toMatch(/backgroundColor:\s*palette\.sig[,\s}]/);
    expect(source).toContain("accessibilityState={{ selected }}");

    // Microcopy: signal color only retints signal semantics, actions stay ink.
    expect(source).toContain("LED · Incoming · Selection only");
  });

  it("shows the three quick reply slot chips with a sig 슬롯 설정 link into the existing configure flow", () => {
    const source = readSource("src/screens/MyScreen.tsx");

    expect(source).toContain("replySlots.map");
    expect(source).toContain("buildQuickReplySlots");
    expect(source).toContain("<Chip key={`${slot}-${index}`} label={slot} flex />");
    expect(source).toContain('accessibilityLabel="슬롯 설정"');
    expect(source).toContain("onPress={openQuickReplyDialog}");
    expect(source).toContain("{ color: palette.sig }");

    // Mockup slot-card footer: muted 12px caption on the left, sig 슬롯 설정 link on the right, one row.
    expect(source).toContain("위젯과 Today에서 한 번에 답할 때 쓰는 3칸");
    expect(source).toContain("styles.slotMetaRow");
    expect(source.indexOf("위젯과 Today에서 한 번에 답할 때 쓰는 3칸")).toBeLessThan(
      source.indexOf(">슬롯 설정</Text>"),
    );
    const metaRowStyle = source.slice(source.indexOf("slotMetaRow: {"), source.indexOf("slotCaption: {"));
    expect(metaRowStyle).toContain('flexDirection: "row"');
    expect(metaRowStyle).toContain('justifyContent: "space-between"');
    const captionStyle = source.slice(source.indexOf("slotCaption: {"), source.indexOf("slotConfigureLink: {"));
    expect(captionStyle).toContain("fontSize: 12");
    expect(source).toContain("styles.slotCaption, { color: palette.muted }");

    // Existing configure-slots logic is preserved untouched inside the sheet.
    expect(source).toContain("quickReplyDrafts");
    expect(source).toContain("saveQuickReplySlots");
    expect(source).toContain("getQuickReplySlotOrder");
    expect(source).toContain("KeyboardAvoidingView");
  });

  it("presents quick reply, skin pack, and avatar surfaces as bottom sheets through one local SheetShell", () => {
    const source = readSource("src/screens/MyScreen.tsx");

    // Transient-UI grammar: select/settings work uses a bottom sheet (scrim + bottom-pinned panel),
    // never a centered fade dialog.
    expect(source).toContain('animationType="slide"');
    expect(source).not.toContain('animationType="fade"');
    expect(source).not.toContain("dialogOverlay");

    // One shared local shell hosts all three sheets; the Modal/webSheetHost branch lives only there.
    expect(source).toContain("function SheetShell(");
    expect(source.match(/<SheetShell/g)).toHaveLength(3);
    expect(source.match(/animationType="slide"/g)).toHaveLength(1);
    expect(source).toContain("webSheetHost");
    expect(source).toContain("KeyboardAvoidingView");

    // Sheet contract: bottom alignment, functional scrim, tap-to-dismiss backdrop, grab bar, top-only radius.
    const sheetOverlayStart = source.indexOf("sheetOverlay: {");
    const sheetOverlayBlock = source.slice(sheetOverlayStart, source.indexOf("},", sheetOverlayStart));
    expect(sheetOverlayBlock).toContain('justifyContent: "flex-end"');
    expect(sheetOverlayBlock).toContain("// functional scrim, not a palette color");
    expect(source).toContain("sheetBackdrop");
    expect(source).toContain("grabBar");
    expect(source).toContain("borderTopLeftRadius: 22");
    expect(source).toContain("borderTopRightRadius: 22");

    // Existing a11y labels survive the sheet conversion; each sheet labels its own scrim.
    expect(source).toContain('accessibilityLabel="Close skin packs"');
    expect(source).toContain('scrimLabel="Close skin packs"');
    expect(source).toContain('scrimLabel="Close avatar picker"');
    expect(source).toContain('scrimLabel="슬롯 설정 닫기"');
  });

  it("hosts the 설정 list rows with RowChevron for Dictionary, Logs, and Account", () => {
    const source = readSource("src/screens/MyScreen.tsx");

    expect(source).toContain('title="신호 코드 사전"');
    expect(source).toContain('navigation.navigate("Dictionary")');
    expect(source).toContain('title="저장한 Blink"');
    expect(source).toContain('navigation.navigate("Logs")');
    expect(source).toContain('title="계정"');
    expect(source).toContain('meta="테마 · 개인정보 · 로그아웃"');
    expect(source).toContain('navigation.navigate("Account")');
    expect(source).toContain("right={<RowChevron />}");
    expect(source).not.toContain("ChevronRightLineIcon");
    expect(source).not.toContain('navigation.navigate("Collection")');
    expect(source).not.toContain("SettingsActionRow");
  });
});
