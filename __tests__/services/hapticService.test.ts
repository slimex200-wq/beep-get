import { parseVibrationPattern, isValidVibrationPattern } from "@/services/hapticService";

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
});
