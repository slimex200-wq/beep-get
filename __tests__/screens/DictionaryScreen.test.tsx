import { readFileSync } from "fs";
import path from "path";

describe("DictionaryScreen settings surface", () => {
  it("uses the current Kotlin card shell for Signal Codes", () => {
    const source = readFileSync(path.join(process.cwd(), "src/screens/DictionaryScreen.tsx"), "utf8");

    ["Signal Tokens", "Add Signal Token", "My Signal Dictionary", "Register Signal", "집중중 🔕"].forEach((label) => {
      expect(source).toContain(label);
    });
    expect(source).toContain("KotlinHeader");
    expect(source).toContain("MockupCard");
    expect(source).toContain("Delete");
    expect(source).not.toContain("setCode(value.replace(/[^0-9]/g, \"\"))");
    expect(source).not.toContain("HeaderBar");
    expect(source).not.toContain("CODES");
  });
});
