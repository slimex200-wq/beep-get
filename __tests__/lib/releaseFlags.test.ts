import { isPublicFlagEnabled, readPublicHttpsUrl } from "@/lib/releaseFlags";

describe("release flags", () => {
  it("accepts explicit public truthy flags only", () => {
    expect(isPublicFlagEnabled("1")).toBe(true);
    expect(isPublicFlagEnabled("true")).toBe(true);
    expect(isPublicFlagEnabled("YES")).toBe(true);
    expect(isPublicFlagEnabled("0")).toBe(false);
    expect(isPublicFlagEnabled("")).toBe(false);
    expect(isPublicFlagEnabled(undefined)).toBe(false);
  });

  it("requires production public links to be configured as https URLs", () => {
    expect(readPublicHttpsUrl("https://example.com/privacy")).toBe(
      "https://example.com/privacy",
    );
    expect(readPublicHttpsUrl(" http://example.com/privacy ")).toBeNull();
    expect(readPublicHttpsUrl("")).toBeNull();
    expect(readPublicHttpsUrl(undefined)).toBeNull();
  });
});
