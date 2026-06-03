import {
  getAvatarImageSource,
  getAvatarLabel,
  normalizeAvatarUri,
} from "@/lib/avatarSource";
import { DEFAULT_AVATAR_URI } from "@/design/avatarPresets";

describe("avatarSource", () => {
  it("normalizes valid registered avatar URLs", () => {
    expect(normalizeAvatarUri(" https://example.com/a.png ")).toBe("https://example.com/a.png");
    expect(getAvatarImageSource(" https://example.com/a.png ")).toEqual({
      uri: "https://example.com/a.png",
    });
  });

  it("returns undefined for blank avatar values instead of substituting mock media", () => {
    expect(normalizeAvatarUri(null)).toBeUndefined();
    expect(normalizeAvatarUri(undefined)).toBeUndefined();
    expect(normalizeAvatarUri("   ")).toBeUndefined();
    expect(getAvatarImageSource(" ")).toBeUndefined();
  });

  it("maps built-in avatar preset IDs to bundled image sources", () => {
    expect(DEFAULT_AVATAR_URI).toContain("beepget-avatar://");
    expect(getAvatarImageSource(DEFAULT_AVATAR_URI)).toBeDefined();
    expect(getAvatarImageSource(DEFAULT_AVATAR_URI)).not.toEqual({ uri: DEFAULT_AVATAR_URI });
  });

  it("derives a readable fallback label from nickname, Beep ID, or explicit fallback", () => {
    expect(getAvatarLabel({ nickname: " Alex ", beep_id: "12031997" })).toBe("Alex");
    expect(getAvatarLabel({ nickname: " ", beep_id: " 12031997 " })).toBe("12031997");
    expect(getAvatarLabel(null, "ID")).toBe("ID");
  });
});
