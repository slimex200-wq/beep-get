import { readFileSync } from "fs";
import path from "path";

describe("SignalSlotRail", () => {
  it("deduplicates compact slots and wires chip presses to the selected token", () => {
    const railSource = readFileSync(path.join(process.cwd(), "src/components/SignalSlotRail.tsx"), "utf8");
    const chipSource = readFileSync(path.join(process.cwd(), "src/components/SignalSlotChip.tsx"), "utf8");

    expect(railSource).toContain("Array.from(new Set");
    expect(railSource).toContain("slots.map((slot) => slot.trim()).filter(Boolean)");
    expect(railSource).toContain("onPress={() => onSelect(slot)}");
    expect(chipSource).toContain('accessibilityRole="button"');
    expect(chipSource).toContain("accessibilityState={{ selected, disabled }}");
  });
});
