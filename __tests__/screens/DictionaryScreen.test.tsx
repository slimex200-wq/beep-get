import { readFileSync } from "fs";
import path from "path";

describe("DictionaryScreen settings surface", () => {
  it("rebuilds the Signal Code Dictionary on the primitives vocabulary", () => {
    const source = readFileSync(path.join(process.cwd(), "src/screens/DictionaryScreen.tsx"), "utf8");

    ["Signal Code Dictionary", "Add Signal Code", "My Signal Codes", "Register Signal Code"].forEach((label) => {
      expect(source).toContain(label);
    });
    expect(source).toContain("isQuickReplySlotEntry");
    expect(source).toContain("visibleEntries");
    expect(source).toContain(".filter((entry) => !isQuickReplySlotEntry(entry))");
    expect(source).toContain('from "@/ui/primitives"');
    expect(source).toContain('title="Signal Codes"');
    expect(source).toContain("<SectionLabel>");
    expect(source).toContain("<Card");
    expect(source).toContain("<ListRow");
    expect(source).toContain("<MonoValue");
    expect(source).toContain("<PrimaryButton");
    // Drill-in from a My chevron row: pushed with a back affordance, not a modal X.
    expect(source).toContain('backAccessibilityLabel="Back to My"');
    expect(source).toContain("onBack={close}");
    expect(source).not.toContain("XLineIcon");
    expect(source).toContain("SIGNAL CODE");
    expect(source).toContain("PRIVATE MEANING");
    expect(source).toContain("Delete");
    expect(source).not.toContain("KotlinMockupUI");
    expect(source).not.toContain("KotlinHeader");
    expect(source).not.toContain("MockupCard");
    expect(source).not.toContain("MockupSection");
    expect(source).not.toContain("TodayMockupChrome");
    expect(source).not.toContain("ActionButton");
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
    expect(source).toContain("{registerRequirementCopy}");
    expect(source).toContain("disabled={!canRegister || loading}");
  });
});
