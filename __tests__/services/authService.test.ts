import { generateBeepId, isValidBeepId } from "@/services/authService";

describe("generateBeepId", () => {
  it("generates an 8-digit numeric string", () => {
    const id = generateBeepId();
    expect(id).toHaveLength(8);
    expect(/^\d{8}$/.test(id)).toBe(true);
  });

  it("does not start with 0", () => {
    for (let i = 0; i < 100; i++) {
      const id = generateBeepId();
      expect(id[0]).not.toBe("0");
    }
  });
});

describe("isValidBeepId", () => {
  it("returns true for valid 8-digit string", () => {
    expect(isValidBeepId("12345678")).toBe(true);
  });

  it("returns false for too short", () => {
    expect(isValidBeepId("1234567")).toBe(false);
  });

  it("returns false for non-numeric", () => {
    expect(isValidBeepId("1234567a")).toBe(false);
  });

  it("returns false for empty", () => {
    expect(isValidBeepId("")).toBe(false);
  });
});
