import { readFileSync } from "fs";
import path from "path";

describe("SendBlinkScreen draft preview contract", () => {
  const source = () =>
    readFileSync(path.join(process.cwd(), "src/screens/SendBlinkScreen.tsx"), "utf8");

  it("renders captured preview frame URIs in the three-frame strip", () => {
    expect(source()).toContain("frameUris={previewFrameUris}");
  });

  it("does not expose retake as an active control until a Blink draft exists", () => {
    expect(source()).toContain("!hasCapturedBlink");
  });
});
