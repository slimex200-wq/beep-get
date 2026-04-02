import { generateInviteLink, generateShareText } from "@/services/contactService";

describe("generateInviteLink", () => {
  it("generates deeplink with beep_id", () => {
    expect(generateInviteLink("12345678")).toBe("beepget://add/12345678");
  });
});

describe("generateShareText", () => {
  it("includes nickname and beep_id", () => {
    const text = generateShareText("12345678", "테스터");
    expect(text).toContain("테스터");
    expect(text).toContain("12345678");
    expect(text).toContain("beepget://add/12345678");
  });
});
