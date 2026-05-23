import { readFileSync } from "fs";
import path from "path";

describe("RootNavigator primary tabs", () => {
  it("locks the authenticated four-tab product model", () => {
    const source = readFileSync(path.join(process.cwd(), "src/navigation/RootNavigator.tsx"), "utf8");

    expect(source).toContain('export const primaryTabLabels = ["TODAY", "SEND", "PEOPLE", "MY"] as const');
    expect(source).not.toContain('"LOGS", "STUDIO", "ACCOUNT"');
  });

  it("routes profiles with an empty nickname back to onboarding", () => {
    const source = readFileSync(path.join(process.cwd(), "src/navigation/RootNavigator.tsx"), "utf8");

    expect(source).toContain("profile.nickname?.trim()");
    expect(source).toContain("needsOnboarding");
  });
});
