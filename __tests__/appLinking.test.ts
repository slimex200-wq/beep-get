import { readFileSync } from "fs";
import path from "path";

describe("App deep links", () => {
  it("does not expose preview-only widget tooling through public links", () => {
    const source = readFileSync(path.join(process.cwd(), "App.tsx"), "utf8");

    expect(source).not.toContain('WidgetStates: "widget-states"');
  });
});
