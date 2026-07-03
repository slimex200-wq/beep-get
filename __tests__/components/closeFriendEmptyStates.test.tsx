import { existsSync, readFileSync } from "fs";
import path from "path";

describe("close friend empty states", () => {
  it("drops the CloseCircuitMap so the friend list is the single close-friend surface", () => {
    expect(existsSync(path.join(process.cwd(), "src/components/CloseCircuitMap.tsx"))).toBe(false);

    const peopleSource = readFileSync(path.join(process.cwd(), "src/screens/PeopleScreen.tsx"), "utf8");
    expect(peopleSource).not.toContain("CloseCircuitMap");
    expect(peopleSource).not.toContain("CircuitFriend");
    expect(peopleSource).not.toContain("No close friends yet");

    // The friend-list empty state stays: mono label + Korean helper copy.
    expect(peopleSource).toContain("NO FRIENDS YET");
    expect(peopleSource).toContain("NO MATCHES");
    expect(peopleSource).toContain("Beep ID로 친구를 추가해 보세요.");
  });
});
