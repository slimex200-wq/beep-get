import { readFileSync } from "fs";
import path from "path";

describe("ActionButton motion affordances", () => {
  it("supports animated icon feedback for primary send actions", () => {
    const source = readFileSync(path.join(process.cwd(), "src/components/ActionButton.tsx"), "utf8");

    expect(source).toContain("animateIconOnPress");
    expect(source).toContain("Animated.timing");
    expect(source).toContain("translateX");
    expect(source).toContain("rotate");
    expect(source).toContain('accessibilityRole="button"');
    expect(source).toContain("accessibilityState={{ disabled: isDisabled }}");
  });
});
