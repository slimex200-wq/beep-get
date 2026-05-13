import { readFileSync } from "fs";
import path from "path";

describe("App widget deep-link handling", () => {
  const source = readFileSync(path.join(process.cwd(), "App.tsx"), "utf8");

  it("defers Android widget actions until app navigation and auth state are ready", () => {
    ["pendingWidgetUrl", "navigationReady", "canHandleWidgetActions"].forEach((token) => {
      expect(source).toContain(token);
    });
  });

  it("routes completed widget actions into the Reply Room", () => {
    expect(source).toContain('navigationRef.current?.navigate("ReplyRoom"');
    expect(source).toContain("Widget action failed");
  });
});
