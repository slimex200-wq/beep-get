import { isValidBeepId } from "@/services/authService";

describe("friend lookup validation", () => {
  it("accepts valid beep_id for friend search", () => {
    expect(isValidBeepId("12345678")).toBe(true);
  });

  it("rejects invalid beep_id", () => {
    expect(isValidBeepId("abc")).toBe(false);
    expect(isValidBeepId("")).toBe(false);
    expect(isValidBeepId("123")).toBe(false);
  });
});
