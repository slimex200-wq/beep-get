import { readFileSync } from "fs";
import path from "path";

describe("AuthScreen profile completion", () => {
  it("uses official provider labels and an animated send preview on the login slip", () => {
    const source = readFileSync(path.join(process.cwd(), "src/screens/AuthScreen.tsx"), "utf8");

    expect(source).toContain("AuthSignalDemo");
    expect(source).toContain("LIVE BEEP SEND");
    expect(source).toContain("authBeepyFrames");
    expect(source).toContain("classic-paper__waiting.png");
    expect(source).toContain("classic-paper__open-signal.png");
    expect(source).toContain("ProviderLogo");
    expect(source).toContain("Sign in once. Your private Beep ID comes next.");
    expect(source).toContain("AppleAuthenticationButton");
    expect(source).not.toContain("Join / Continue");
    expect(source).not.toContain("demoFacePlate");
    expect(source).not.toContain("demoAwakeEye");
  });

  it("collects an avatar before finishing onboarding", () => {
    const source = readFileSync(path.join(process.cwd(), "src/screens/AuthScreen.tsx"), "utf8");

    expect(source).toContain("AVATAR_PRESETS");
    expect(source).toContain("mockupPhotoUris.profile");
    expect(source).toContain("PROFILE PHOTO");
    expect(source).toContain("accessibilityState={{ selected: active }}");
    expect(source).toContain("initProfile(trimmed, avatarUri)");
    expect(source).toContain("FINISH PROFILE");
  });
});
