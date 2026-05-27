import { readFileSync } from "fs";
import path from "path";

describe("PeopleScreen product sections", () => {
  it("keeps Friends focused on search, Beep ID, close friends, and the add dialog", () => {
    const peopleSource = readFileSync(path.join(process.cwd(), "src/screens/PeopleScreen.tsx"), "utf8");

    ["My Beep ID", "Search ID or name", "Add new friends", "Close Friends", "Configure Friend Info"].forEach((label) => {
      expect(peopleSource).toContain(label);
    });
    expect(peopleSource).not.toContain("CLOSE CIRCUIT");
    expect(peopleSource).not.toContain("WIDGET CIRCLE");
    expect(peopleSource).not.toContain('label="WIDGET"');
    expect(peopleSource).toContain("FriendRow");
  });
});
