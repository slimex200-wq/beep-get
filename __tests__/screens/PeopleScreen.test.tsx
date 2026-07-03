import { readFileSync } from "fs";
import path from "path";

describe("PeopleScreen product sections", () => {
  it("keeps People focused on MY BEEP ID, close friends, and compact friend signals", () => {
    const peopleSource = readFileSync(path.join(process.cwd(), "src/screens/PeopleScreen.tsx"), "utf8");
    const statusSource = readFileSync(path.join(process.cwd(), "src/screens/people/peopleSignalStatus.ts"), "utf8");
    const combinedSource = `${peopleSource}\n${statusSource}`;

    ["MY BEEP ID", "ID나 이름 검색", "친구 추가", "친구 정보 입력"].forEach((label) => {
      expect(peopleSource).toContain(label);
    });
    ["FavoriteSignalCard", "SEND BLINK", "NEW", "initialCode", "featuredBlink.imageUri"].forEach((label) => {
      expect(peopleSource).toContain(label);
    });
    [
      "Widget seen",
      "uses code often",
      "frequent code 486",
      "quiet receiving",
      "2 sec Blink",
      "favoriteSignalCode",
    ].forEach((label) => {
      expect(peopleSource).not.toContain(label);
    });
    expect(combinedSource).toContain("조용해요");
    expect(combinedSource).toContain("Blink 받음");
    expect(combinedSource).toContain("마지막 Beep");
    expect(peopleSource).toContain("의 최근 Blink");
    expect(peopleSource).not.toContain('label="Discover"');
    expect(peopleSource).not.toContain("CloseCircuitMap");
    expect(peopleSource).not.toContain("circuitFriends");
    expect(combinedSource).toContain("quiet");
    expect(combinedSource).toContain("BEEP");
    expect(combinedSource).toContain("BLINK");
    // The ID card renders the mockup grammar: mono label + big mono beep id, no nickname/avatar.
    expect(peopleSource).toContain('"--------"');
    expect(peopleSource).not.toContain("formatOwnNo");
    expect(peopleSource).not.toContain("BEEP-{");
    expect(peopleSource).not.toContain("profileName");
    expect(peopleSource).not.toContain("profileHandle");
    // No English descriptive copy remains on the People surface.
    [
      "Search ID or name",
      "Invite Friend",
      "Configure Friend Info",
      "Optional nickname",
      "8-digit Beep ID",
      'label="Cancel"',
      'label="Add"',
      "Add a friend by Beep ID",
      "Latest Blink from",
      "added you",
    ].forEach((label) => {
      expect(peopleSource).not.toContain(label);
    });
    ["No signals yet", "Received Blink", "Last Beep"].forEach((label) => {
      expect(combinedSource).not.toContain(label);
    });
    expect(peopleSource).toContain('placeholder="8자리 Beep ID"');
    expect(peopleSource).toContain('label="취소"');
    expect(peopleSource).toContain('label="추가"');
    expect(peopleSource).not.toContain("WIDGET CIRCLE");
    expect(peopleSource).not.toContain('label="WIDGET"');
    expect(peopleSource).toContain("FriendRow");
    expect(peopleSource).toContain("isValidBeepId");
    expect(peopleSource).toContain("KeyboardAvoidingView");
    // Copy affordance is a quiet outline pill with the shared-state a11y contract.
    expect(peopleSource).toContain('label={copyFeedback ? "복사됨" : "복사"}');
    expect(peopleSource).toContain('copyFeedback ? "Beep ID shared" : "Copy Beep ID"');
    expect(peopleSource).toContain("copyFeedback");
    expect(peopleSource).toContain("AddPersonLineIcon");
    expect(peopleSource).toContain("SearchLineIcon");
    expect(peopleSource).not.toContain("GearLineIcon");
    expect(peopleSource).not.toContain("People settings");
    expect(peopleSource).not.toContain('navigation.navigate("Account")');
    expect(peopleSource).toContain("friend.avatarUri");
    expect(peopleSource).toContain("friendAvatarUri");
    expect(peopleSource).toContain("Haptics.selectionAsync");
  });

  it("uses a Friends header with mono count and left-only sig-tick section labels (Signal Edition IA)", () => {
    const peopleSource = readFileSync(path.join(process.cwd(), "src/screens/PeopleScreen.tsx"), "utf8");

    // Header: shared Screen shell renders the title with a mono friend count, no legacy chrome header.
    expect(peopleSource).toContain('<Screen title="Friends"');
    expect(peopleSource).toContain("side={`${friends.length}명`}");
    expect(peopleSource).not.toContain("KotlinHeader");
    expect(peopleSource).not.toContain('title="People"');

    // Every section label is a single left label rendered through the shared sig-tick primitive.
    [
      "<SectionLabel>친구 추가</SectionLabel>",
      "<SectionLabel>가까운 친구</SectionLabel>",
      "<SectionLabel>나를 추가한 친구</SectionLabel>",
      "<SectionLabel>최근 Blink</SectionLabel>",
    ].forEach((label) => {
      expect(peopleSource).toContain(label);
    });

    // Sections keep their order: 친구 추가 → 가까운 친구 → 나를 추가한 친구 → 최근 Blink.
    const order = [
      "<SectionLabel>친구 추가</SectionLabel>",
      "<SectionLabel>가까운 친구</SectionLabel>",
      "<SectionLabel>나를 추가한 친구</SectionLabel>",
      "<SectionLabel>최근 Blink</SectionLabel>",
    ].map((label) => peopleSource.indexOf(label));
    expect([...order].sort((a, b) => a - b)).toEqual(order);

    // No right-side hints, dual labels, or concept-noun section titles remain.
    expect(peopleSource).not.toContain("MockupSection");
    expect(peopleSource).not.toContain("hint=");
    expect(peopleSource).not.toContain('label="My Beep ID"');
    expect(peopleSource).not.toContain('label="Close Circuit"');
    expect(peopleSource).not.toContain('label="Added You"');
    expect(peopleSource).not.toContain("Close Circuit starts");
  });

  it("does not fabricate friend signal status from friend list position", () => {
    const peopleSource = readFileSync(path.join(process.cwd(), "src/screens/PeopleScreen.tsx"), "utf8");

    expect(peopleSource).toContain("buildFriendSignalSummaries(received)");
    expect(peopleSource).not.toContain("statusByIndex");
    expect(peopleSource).not.toContain("friendStatusBadge");
    expect(peopleSource).not.toContain("index === 0 ? colors.red");
  });

  it("assembles the surface from the primitives design system without legacy mockup chrome", () => {
    const peopleSource = readFileSync(path.join(process.cwd(), "src/screens/PeopleScreen.tsx"), "utf8");

    expect(peopleSource).toContain('from "@/ui/primitives"');
    [
      "<Screen ",
      "<SectionLabel>",
      "<Card",
      "<ListRow",
      "<RowChevron />",
      "<PillButton",
      "<PrimaryButton",
      "<MonoValue",
      "<StatusDot",
    ].forEach((primitive) => {
      expect(peopleSource).toContain(primitive);
    });

    // Legacy mockup chrome and shell plumbing are gone; the Screen primitive owns the scroll shell.
    [
      "KotlinMockupUI",
      "TodayMockupChrome",
      "TodaySectionHeader",
      "SendMockupControls",
      "SendMockupPrimaryScreen",
      "ActionButton",
      "MockupCard",
      "IconButton",
      "NameDot",
      "AppSurface",
      "ScrollView",
      "LIQUID_TAB",
      "scrollerFrame",
    ].forEach((legacy) => {
      expect(peopleSource).not.toContain(legacy);
    });
  });

  it("uses ink/signal palette tokens with pill inputs (Signal Edition)", () => {
    const peopleSource = readFileSync(path.join(process.cwd(), "src/screens/PeopleScreen.tsx"), "utf8");

    ["#8F5EC7", "#A56AD8", "#FF7FA3", "lavender"].forEach((legacyColor) => {
      expect(peopleSource).not.toContain(legacyColor);
    });
    // Palette flows through primitives — no colors.* token reaches this screen.
    expect(peopleSource).not.toContain("colors.");

    // New-signal semantics carry the signal color through primitives; quiet rows stay muted.
    expect(peopleSource).toContain('summary.circuitStatus !== "quiet"');
    expect(peopleSource).toContain('<StatusDot kind={hasNewSignal ? "new" : "on"} />');
    expect(peopleSource).toContain("sig={hasNewSignal} dim={!hasNewSignal}");
    expect(peopleSource).toContain("palette.sigSoft");

    // Signal color never fills action buttons; inputs/buttons are pills on card surfaces.
    expect(peopleSource).not.toContain("backgroundColor: palette.sig }");
    expect(peopleSource).toContain("? palette.text : palette.rule");
    ["searchPanel: {", "dialogInput: {", "newBadge: {"].forEach((styleBlock) => {
      const start = peopleSource.indexOf(styleBlock);
      const block = peopleSource.slice(start, peopleSource.indexOf("},", start));
      expect(block).toContain("borderRadius: radius.pill");
    });
  });

  it("presents 친구 추가 as a bottom sheet, not a centered fade dialog", () => {
    const peopleSource = readFileSync(path.join(process.cwd(), "src/screens/PeopleScreen.tsx"), "utf8");

    // Transient-UI grammar: select/settings work uses a bottom sheet (scrim + bottom-pinned panel).
    expect(peopleSource).toContain('animationType="slide"');
    expect(peopleSource).not.toContain('animationType="fade"');
    expect(peopleSource).not.toContain("dialogOverlay");
    expect(peopleSource).not.toContain('justifyContent: "center",\n    padding: spacing[8]');

    // Sheet contract: bottom alignment, functional scrim, tap-to-dismiss backdrop, grab bar, top-only radius.
    const sheetOverlayStart = peopleSource.indexOf("sheetOverlay: {");
    const sheetOverlayBlock = peopleSource.slice(sheetOverlayStart, peopleSource.indexOf("},", sheetOverlayStart));
    expect(sheetOverlayBlock).toContain('justifyContent: "flex-end"');
    expect(sheetOverlayBlock).toContain("// functional scrim, not a palette color");
    expect(peopleSource).toContain("sheetBackdrop");
    expect(peopleSource).toContain('accessibilityLabel="Close add friend"');
    expect(peopleSource).toContain("grabBar");
    expect(peopleSource).toContain("borderTopLeftRadius: 22");
    expect(peopleSource).toContain("borderTopRightRadius: 22");

    // Web branch mirrors MyScreen's webSheetHost pattern; native keeps Modal + onRequestClose.
    expect(peopleSource).toContain("webSheetHost");
    expect(peopleSource).toContain('onRequestClose={() => setAddDialogVisible(false)}');

    // Keyboard behavior and the add flow survive the presentation swap.
    expect(peopleSource).toContain("KeyboardAvoidingView");
    expect(peopleSource).toContain('placeholder="닉네임 (선택)"');
    expect(peopleSource).toContain('placeholder="8자리 Beep ID"');
    expect(peopleSource).toContain('label="취소"');
    expect(peopleSource).toContain('label="추가"');
    expect(peopleSource).toContain("disabled={!canAddFriend}");
  });
});
