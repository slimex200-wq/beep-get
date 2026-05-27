import { readFileSync } from "fs";
import path from "path";

describe("PeopleScreen product sections", () => {
  it("keeps Friends focused on search, Beep ID, close friends, and invite slip", () => {
    const peopleSource = readFileSync(path.join(process.cwd(), "src/screens/PeopleScreen.tsx"), "utf8");
    const friendCardSource = readFileSync(path.join(process.cwd(), "src/components/FriendCard.tsx"), "utf8");
    const myBeepIdSource = readFileSync(path.join(process.cwd(), "src/components/MyBeepIdSlip.tsx"), "utf8");

    ["MY BEEP ID", "Search ID or name", "Add new friends", "CLOSE FRIENDS", "INVITE SLIP"].forEach((label) => {
      expect(peopleSource + friendCardSource + myBeepIdSource).toContain(label);
    });
    expect(peopleSource).not.toContain("CLOSE CIRCUIT");
    expect(peopleSource).not.toContain("WIDGET CIRCLE");
    expect(peopleSource).not.toContain('label="WIDGET"');

    ["SEND BEEP", "SEND BLINK"].forEach((label) => {
      expect(friendCardSource).toContain(label);
    });
    expect(friendCardSource).toContain("onPin ? (");
  });
});
