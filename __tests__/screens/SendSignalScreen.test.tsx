import { readFileSync } from "fs";
import path from "path";

describe("SendSignalScreen product sections", () => {
  it("renders Signal Deck section labels", () => {
    const source = readFileSync(path.join(process.cwd(), "src/screens/SendSignalScreen.tsx"), "utf8");
    ["TO STRIP", "SIGNAL TYPE", "SLOT DECK", "RECENT COMBOS"].forEach((label) => {
      expect(source).toContain(label);
    });
  });
});
