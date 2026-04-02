import { validateDictionaryEntry } from "@/services/dictionaryService";

describe("validateDictionaryEntry", () => {
  it("accepts valid entry", () => {
    expect(validateDictionaryEntry("012486", "영원히 사랑해")).toEqual({ valid: true });
  });

  it("rejects empty code", () => {
    expect(validateDictionaryEntry("", "의미")).toEqual({
      valid: false,
      error: "숫자 코드를 입력하세요",
    });
  });

  it("rejects empty meaning", () => {
    expect(validateDictionaryEntry("012486", "")).toEqual({
      valid: false,
      error: "의미를 입력하세요",
    });
  });

  it("rejects meaning over 50 chars", () => {
    expect(validateDictionaryEntry("012486", "a".repeat(51))).toEqual({
      valid: false,
      error: "의미는 50자 이하여야 합니다",
    });
  });
});
