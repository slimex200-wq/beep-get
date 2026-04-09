const Haptics = require("expo-haptics");
import {
  parseVibrationPattern,
  isValidVibrationPattern,
  playVibrationPattern,
  playDefaultVibration,
  VIBRATION_PRESETS,
} from "@/services/hapticService";

beforeEach(() => jest.clearAllMocks());

describe("parseVibrationPattern", () => {
  it("parses simple pattern", () => {
    expect(parseVibrationPattern("S,S")).toEqual(["S", "S"]);
  });

  it("parses mixed pattern", () => {
    expect(parseVibrationPattern("L,S,P,L")).toEqual(["L", "S", "P", "L"]);
  });

  it("handles whitespace", () => {
    expect(parseVibrationPattern("S, L, S")).toEqual(["S", "L", "S"]);
  });

  it("filters invalid segments", () => {
    expect(parseVibrationPattern("S,X,L")).toEqual(["S", "L"]);
  });

  it("case insensitive", () => {
    expect(parseVibrationPattern("s,l,p")).toEqual(["S", "L", "P"]);
  });

  it("returns empty array for all invalid segments", () => {
    expect(parseVibrationPattern("X,Y,Z")).toEqual([]);
  });

  it("returns empty array for empty string", () => {
    expect(parseVibrationPattern("")).toEqual([]);
  });
});

describe("isValidVibrationPattern", () => {
  it("valid pattern", () => {
    expect(isValidVibrationPattern("S,S,L")).toBe(true);
  });

  it("empty pattern is invalid", () => {
    expect(isValidVibrationPattern("")).toBe(false);
  });

  it("too long pattern (>10) is invalid", () => {
    expect(isValidVibrationPattern("S,S,S,S,S,S,S,S,S,S,S")).toBe(false);
  });

  it("exactly 10 segments is valid", () => {
    expect(isValidVibrationPattern("S,S,S,S,S,S,S,S,S,S")).toBe(true);
  });

  it("single segment is valid", () => {
    expect(isValidVibrationPattern("S")).toBe(true);
  });

  it("all invalid segments is invalid", () => {
    expect(isValidVibrationPattern("X,Y")).toBe(false);
  });
});

describe("playVibrationPattern", () => {
  it("plays S segment with Light impact", async () => {
    await playVibrationPattern("S");
    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
  });

  it("plays L segment with Heavy impact", async () => {
    await playVibrationPattern("L");
    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Heavy);
  });

  it("plays P segment without haptic call", async () => {
    await playVibrationPattern("P");
    expect(Haptics.impactAsync).not.toHaveBeenCalled();
  });

  it("plays mixed pattern in order", async () => {
    await playVibrationPattern("S,L");
    expect(Haptics.impactAsync).toHaveBeenCalledTimes(2);
    expect(Haptics.impactAsync).toHaveBeenNthCalledWith(1, Haptics.ImpactFeedbackStyle.Light);
    expect(Haptics.impactAsync).toHaveBeenNthCalledWith(2, Haptics.ImpactFeedbackStyle.Heavy);
  });

  it("handles empty pattern without errors", async () => {
    await playVibrationPattern("");
    expect(Haptics.impactAsync).not.toHaveBeenCalled();
  });
});

describe("playDefaultVibration", () => {
  it("plays success notification", async () => {
    await playDefaultVibration();
    expect(Haptics.notificationAsync).toHaveBeenCalledWith(
      Haptics.NotificationFeedbackType.Success
    );
  });
});

describe("VIBRATION_PRESETS", () => {
  it("contains 7 presets", () => {
    expect(VIBRATION_PRESETS).toHaveLength(7);
  });

  it("each preset has name and pattern", () => {
    for (const preset of VIBRATION_PRESETS) {
      expect(preset).toHaveProperty("name");
      expect(preset).toHaveProperty("pattern");
      expect(typeof preset.name).toBe("string");
      expect(typeof preset.pattern).toBe("string");
    }
  });

  it("all preset patterns are valid", () => {
    for (const preset of VIBRATION_PRESETS) {
      expect(isValidVibrationPattern(preset.pattern)).toBe(true);
    }
  });
});
