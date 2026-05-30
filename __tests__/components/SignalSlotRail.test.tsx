import { readFileSync } from "fs";
import path from "path";

describe("SignalSlotRail", () => {
  it("deduplicates compact slots and wires chip presses to the selected token", () => {
    const railSource = readFileSync(path.join(process.cwd(), "src/components/SignalSlotRail.tsx"), "utf8");
    const chipSource = readFileSync(path.join(process.cwd(), "src/components/SignalSlotChip.tsx"), "utf8");

    expect(railSource).toContain("Array.from(new Set");
    expect(railSource).toContain("slots.map((slot) => slot.trim()).filter(Boolean)");
    expect(railSource).toContain("onPress={() => onSelect(slot)}");
    expect(railSource).toContain("confirmedSlot");
    expect(chipSource).toContain("confirmed ? \"Done\" : label");
    expect(railSource).toContain("compact={compact}");
    expect(railSource).toContain("compact && styles.compactRail");
    expect(chipSource).toContain('accessibilityRole="button"');
    expect(chipSource).toContain("accessibilityState={{ selected, disabled }}");
    expect(chipSource).toContain("compact && styles.compactBase");
    expect(chipSource).toContain("styles.compactContent");
    expect(chipSource).toContain("styles.compactDot");
    expect(chipSource).toContain("height: 31");
    expect(chipSource).toContain("minWidth: 64");
    expect(chipSource).toContain("width: 3.5");
    expect(chipSource).toContain("fontSize: 9");
  });
});
