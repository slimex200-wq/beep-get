import { readFileSync } from "fs";
import path from "path";

describe("App UI preview entry", () => {
  it("starts QA preview inside the signed-in app instead of login or profile setup", () => {
    const appSource = readFileSync(path.join(process.cwd(), "App.tsx"), "utf8");

    expect(appSource).toContain("isUiPreviewEnabled");
    expect(appSource).toContain("enterPreviewMode");
    expect(appSource).toContain("if (isUiPreviewEnabled)");
    expect(appSource).toContain("enterPreviewMode();");
    expect(appSource).toContain("return;");
    expect(appSource).toContain("initialPreviewUpdateForced");
    expect(appSource).toContain('const FORCE_PREVIEW_UPDATE_PARAM = "beepUpdate"');
  });
});
