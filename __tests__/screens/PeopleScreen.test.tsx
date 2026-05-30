import { readFileSync } from "fs";
import path from "path";

describe("PeopleScreen product sections", () => {
  it("keeps Friends focused on search, Beep ID, close friends, and the add dialog", () => {
    const peopleSource = readFileSync(path.join(process.cwd(), "src/screens/PeopleScreen.tsx"), "utf8");

    ["KotlinHeader", "MY ID", "Search ID or name", "Add Friend", "Close Friends", "Configure Friend Info"].forEach((label) => {
      expect(peopleSource).toContain(label);
    });
    ["FavoriteSignalCard", "Send Blink", "NEW", "favoriteSignalCode", "initialCode", "featuredBlink.imageUri"].forEach((label) => {
      expect(peopleSource).toContain(label);
    });
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
    expect(peopleSource).toContain("getMockupFriendPhotoUri");
    expect(peopleSource).toContain("Haptics.selectionAsync");
  });
});
