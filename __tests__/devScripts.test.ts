import { readFileSync } from "fs";
import path from "path";

describe("development scripts", () => {
  it("keeps default Expo preview scripts offline to avoid Node 24 doctor startup failures", () => {
    const packageJson = JSON.parse(
      readFileSync(path.join(process.cwd(), "package.json"), "utf8")
    );

    expect(packageJson.scripts.start).toBe("expo start --dev-client --offline");
    expect(packageJson.scripts.web).toBe("expo start --web --offline");
    expect(packageJson.scripts["start:online"]).toBe("expo start --dev-client");
    expect(packageJson.scripts["web:online"]).toBe("expo start --web");
  });
});
