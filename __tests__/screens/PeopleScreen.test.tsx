import { readFileSync } from "fs";
import path from "path";

describe("PeopleScreen product sections", () => {
  it("keeps People focused on My Beep ID, Close Circuit, and compact friend signals", () => {
    const peopleSource = readFileSync(path.join(process.cwd(), "src/screens/PeopleScreen.tsx"), "utf8");
    const statusSource = readFileSync(path.join(process.cwd(), "src/screens/people/peopleSignalStatus.ts"), "utf8");
    const combinedSource = `${peopleSource}\n${statusSource}`;

    ["KotlinHeader", "My Beep ID", "Search ID or name", "Invite Friend", "Close Circuit", "Configure Friend Info"].forEach((label) => {
      expect(peopleSource).toContain(label);
    });
    ["FavoriteSignalCard", "Send Blink", "NEW", "initialCode", "featuredBlink.imageUri"].forEach((label) => {
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
    expect(combinedSource).toContain("No signals yet");
    expect(peopleSource).toContain("Latest Blink from");
    expect(peopleSource).not.toContain('label="Discover"');
    expect(peopleSource).toContain("CloseCircuitMap");
    expect(combinedSource).toContain("quiet");
    expect(combinedSource).toContain("BEEP");
    expect(combinedSource).toContain("BLINK");
    expect(peopleSource).not.toContain("WIDGET CIRCLE");
    expect(peopleSource).not.toContain('label="WIDGET"');
    expect(peopleSource).toContain("FriendRow");
    expect(peopleSource).toContain("isValidBeepId");
    expect(peopleSource).toContain("KeyboardAvoidingView");
    expect(peopleSource).toContain("CopyLineIcon");
    expect(peopleSource).toContain("CheckCircleLineIcon");
    expect(peopleSource).toContain("copyFeedback");
    expect(peopleSource).toContain("AddPersonLineIcon");
    expect(peopleSource).toContain("ChevronRightLineIcon");
    expect(peopleSource).toContain("SearchLineIcon");
    expect(peopleSource).not.toContain("GearLineIcon");
    expect(peopleSource).not.toContain("People settings");
    expect(peopleSource).not.toContain('navigation.navigate("Account")');
    expect(peopleSource).toContain("friend.avatarUri");
    expect(peopleSource).toContain("friendAvatarUri");
    expect(peopleSource).toContain("Haptics.selectionAsync");
  });

  it("does not fabricate friend signal status from friend list position", () => {
    const peopleSource = readFileSync(path.join(process.cwd(), "src/screens/PeopleScreen.tsx"), "utf8");

    expect(peopleSource).toContain("buildFriendSignalSummaries(received)");
    expect(peopleSource).not.toContain("statusByIndex");
    expect(peopleSource).not.toContain("friendStatusBadge");
    expect(peopleSource).not.toContain("index === 0 ? colors.red");
  });

  it("reserves tab-aware bottom space so the liquid tab does not cover People content", () => {
    const peopleSource = readFileSync(path.join(process.cwd(), "src/screens/PeopleScreen.tsx"), "utf8");
    const contentBlock = peopleSource.slice(
      peopleSource.indexOf("content: {"),
      peopleSource.indexOf("searchPanel: {"),
    );
    const scrollerFrameBlock = peopleSource.slice(
      peopleSource.indexOf("scrollerFrame: {"),
      peopleSource.indexOf("scroller: {"),
    );

    expect(peopleSource).toContain("LIQUID_TAB_SAFE_BOTTOM");
    expect(peopleSource).toContain("LIQUID_TAB_VIEWPORT_BOTTOM_INSET");
    expect(peopleSource).toContain("style={styles.scrollerFrame}");
    expect(peopleSource).toContain("style={styles.scroller}");
    expect(scrollerFrameBlock).toContain("marginBottom: LIQUID_TAB_VIEWPORT_BOTTOM_INSET");
    expect(scrollerFrameBlock).toContain('overflow: "hidden"');
    expect(contentBlock).toContain("paddingBottom: LIQUID_TAB_SAFE_BOTTOM");
    expect(contentBlock).not.toContain("paddingBottom: 96");
  });
});
