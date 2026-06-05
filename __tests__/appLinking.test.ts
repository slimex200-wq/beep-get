import { readFileSync } from "fs";
import path from "path";

describe("App deep links", () => {
  it("maps public tab URLs to the current four-tab product model", () => {
    const source = readFileSync(path.join(process.cwd(), "App.tsx"), "utf8");

    expect(source).toContain('Today: "today"');
    expect(source).toContain('Compose: "send"');
    expect(source).toContain('People: "people"');
    expect(source).toContain('My: "my"');
    expect(source).toContain("normalizeWebTabPath()");
    expect(source).not.toContain('Logs: "logs"');
    expect(source).not.toContain('Settings: "settings"');
    expect(source).not.toContain('FirstRun: "first-run"');
  });

  it("does not expose preview-only widget tooling through public links", () => {
    const source = readFileSync(path.join(process.cwd(), "App.tsx"), "utf8");

    expect(source).not.toContain('WidgetStates: "widget-states"');
  });
});
