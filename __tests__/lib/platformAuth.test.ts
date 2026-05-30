import {
  getPlatformAuthLabel,
  getPlatformAuthProvider,
  getPlatformAuthProviders,
  getPlatformAuthVariant,
  shouldUseNativeAppleSignIn,
} from "@/lib/platformAuth";

describe("platform auth", () => {
  it("uses Apple sign-in on iOS", () => {
    const provider = getPlatformAuthProvider("ios");

    expect(provider).toBe("apple");
    expect(getPlatformAuthLabel(provider)).toContain("Apple");
    expect(getPlatformAuthVariant(provider)).toBe("dark");
  });

  it("uses Google sign-in on Android", () => {
    const provider = getPlatformAuthProvider("android");

    expect(provider).toBe("google");
    expect(getPlatformAuthLabel(provider)).toContain("Google");
    expect(getPlatformAuthVariant(provider)).toBe("light");
  });

  it("lists Apple first, then Google and Kakao in the launch login order", () => {
    const providers = getPlatformAuthProviders("ios");

    expect(providers).toEqual(["apple", "google", "kakao"]);
    expect(providers.map(getPlatformAuthLabel)).toEqual([
      "Sign in with Apple",
      "Sign in with Google",
      "Log in with Kakao",
    ]);
    expect(getPlatformAuthVariant("kakao")).toBe("kakao");
  });

  it("uses native Apple sign-in only on iOS", () => {
    expect(shouldUseNativeAppleSignIn("apple", "ios")).toBe(true);
    expect(shouldUseNativeAppleSignIn("apple", "android")).toBe(false);
    expect(shouldUseNativeAppleSignIn("google", "ios")).toBe(false);
    expect(shouldUseNativeAppleSignIn("kakao", "ios")).toBe(false);
  });

  it("defaults web and unknown platforms to Google", () => {
    expect(getPlatformAuthProvider("web")).toBe("google");
    expect(getPlatformAuthProvider("windows")).toBe("google");
    expect(getPlatformAuthProvider("macos")).toBe("google");
  });
});

