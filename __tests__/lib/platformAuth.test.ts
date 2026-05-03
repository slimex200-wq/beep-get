import {
  getPlatformAuthLabel,
  getPlatformAuthProvider,
  getPlatformAuthVariant,
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

  it("defaults web and unknown platforms to Google", () => {
    expect(getPlatformAuthProvider("web")).toBe("google");
    expect(getPlatformAuthProvider("windows")).toBe("google");
    expect(getPlatformAuthProvider("macos")).toBe("google");
  });
});

