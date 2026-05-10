import { readFileSync } from "fs";
import path from "path";

describe("PeopleScreen product sections", () => {
  it("renders Close Circuit sections and friend-card actions", () => {
    const peopleSource = readFileSync(path.join(process.cwd(), "src/screens/PeopleScreen.tsx"), "utf8");
    const friendCardSource = readFileSync(path.join(process.cwd(), "src/components/FriendCard.tsx"), "utf8");
    const myBeepIdSource = readFileSync(path.join(process.cwd(), "src/components/MyBeepIdSlip.tsx"), "utf8");

    ["MY BEEP ID", "CLOSE CIRCUIT", "INVITE SLIP"].forEach((label) => {
      expect(peopleSource + friendCardSource + myBeepIdSource).toContain(label);
    });

    ["SEND BEEP", "SEND BLINK", "PIN"].forEach((label) => {
      expect(friendCardSource).toContain(label);
    });
  });
});
