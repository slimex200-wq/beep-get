import { validateMessage } from "@/services/messageService";

describe("validateMessage", () => {
  it("accepts valid number code", () => {
    expect(validateMessage("012486")).toEqual({ valid: true });
  });

  it("accepts code with memo", () => {
    expect(validateMessage("012486", "사랑해")).toEqual({ valid: true });
  });

  it("rejects empty code", () => {
    expect(validateMessage("")).toEqual({
      valid: false,
      error: "숫자 코드를 입력하세요",
    });
  });

  it("rejects code over 20 chars", () => {
    expect(validateMessage("123456789012345678901")).toEqual({
      valid: false,
      error: "숫자 코드는 20자리 이하여야 합니다",
    });
  });

  it("rejects non-numeric code", () => {
    expect(validateMessage("abc123")).toEqual({
      valid: false,
      error: "숫자만 입력 가능합니다",
    });
  });

  it("rejects memo over 30 chars", () => {
    const longMemo = "a".repeat(31);
    expect(validateMessage("012486", longMemo)).toEqual({
      valid: false,
      error: "메모는 30자 이하여야 합니다",
    });
  });
});
