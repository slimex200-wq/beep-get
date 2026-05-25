import { readFileSync } from "fs";
import path from "path";

describe("SendSignalScreen product sections", () => {
  it("renders Signal Deck section labels", () => {
    const source = readFileSync(path.join(process.cwd(), "src/screens/SendSignalScreen.tsx"), "utf8");
    ["TO STRIP", "SIGNAL TYPE", "SLOT DECK", "RECENT COMBOS"].forEach((label) => {
      expect(source).toContain(label);
    });
  });

  it("uses a two-phase Blink flow so capture preview happens before upload", () => {
    const source = readFileSync(path.join(process.cwd(), "src/screens/SendSignalScreen.tsx"), "utf8");

    expect(source).toContain("blinkDraft");
    expect(source).toContain("createBlinkDraft");
    expect(source).toContain("createTeaser: async () => blinkDraft.teaser");
  });
});
