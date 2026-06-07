import { readFileSync } from "fs";
import path from "path";

describe("DictionaryScreen settings surface", () => {
  it("uses the current Kotlin card shell for the Signal Code Dictionary", () => {
    const source = readFileSync(path.join(process.cwd(), "src/screens/DictionaryScreen.tsx"), "utf8");

    ["Signal Code Dictionary", "Add Signal Code", "My Signal Codes", "Register Signal Code"].forEach((label) => {
      expect(source).toContain(label);
    });
    expect(source).toContain("Private meanings");
    expect(source).toContain("isQuickReplySlotEntry");
    expect(source).toContain("visibleEntries");
    expect(source).toContain(".filter((entry) => !isQuickReplySlotEntry(entry))");
    expect(source).toContain("KotlinHeader");
    expect(source).toContain("MockupCard");
    expect(source).toContain("MockupSection");
    expect(source).toContain("AppSurface backgroundColor=\"#F8F6F1\"");
    expect(source).toContain("SIGNAL CODE");
    expect(source).toContain("PRIVATE MEANING");
    expect(source).toContain("Delete");
    expect(source).not.toContain("Signal Tokens");
    expect(source).not.toContain("Add Signal Token");
    expect(source).not.toContain("My Signal Dictionary");
    expect(source).not.toContain("setCode(value.replace(/[^0-9]/g, \"\"))");
    expect(source).not.toContain("HeaderBar");
    expect(source).not.toContain("backgroundColor: colors.ink");
    expect(source).not.toContain("CODES");
  });

  it("explains empty-input requirements before the register CTA becomes enabled", () => {
    const source = readFileSync(path.join(process.cwd(), "src/screens/DictionaryScreen.tsx"), "utf8");

    expect(source).toContain("const canRegister");
    expect(source).toContain("registerRequirementCopy");
    expect(source).toContain("Enter both a signal code and private meaning to register.");
    expect(source).toContain("accessibilityHint={registerRequirementCopy}");
    expect(source).toContain("disabled={!canRegister || loading}");
  });
});
