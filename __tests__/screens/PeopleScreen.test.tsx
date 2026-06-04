import { readFileSync } from "fs";
import path from "path";

describe("PeopleScreen product sections", () => {
  it("keeps Friends focused on search, Beep ID, close friends, and the add dialog", () => {
    const peopleSource = readFileSync(path.join(process.cwd(), "src/screens/PeopleScreen.tsx"), "utf8");

    ["KotlinHeader", "MY ID", "Search ID or name", "Add Friend", "Close Friends", "Configure Friend Info"].forEach((label) => {
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
    expect(peopleSource).toContain("No signals yet");
    expect(peopleSource).toContain("Latest Blink from");
    expect(peopleSource).not.toContain('label="Discover"');
    expect(peopleSource).not.toContain("CLOSE CIRCUIT");
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
    expect(peopleSource).toContain("GearLineIcon");
    expect(peopleSource).toContain("SearchLineIcon");
    expect(peopleSource).toContain("Friends settings");
    expect(peopleSource).toContain('navigation.navigate("Account")');
    expect(peopleSource).toContain("friend.avatarUri");
    expect(peopleSource).toContain("friendAvatarUri");
    expect(peopleSource).toContain("Haptics.selectionAsync");
  });
});
