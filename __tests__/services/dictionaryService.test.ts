const { supabase, createMockChain } = require("@/lib/supabase");
import {
  validateDictionaryEntry,
  getDictionary,
  addEntry,
  updateEntry,
  deleteEntry,
} from "@/services/dictionaryService";

beforeEach(() => jest.clearAllMocks());

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

  it("rejects code over max length", () => {
    expect(validateDictionaryEntry("123456789012345678901", "의미")).toEqual({
      valid: false,
      error: "숫자 코드는 20자리 이하여야 합니다",
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

  it("accepts meaning at exactly 50 chars", () => {
    expect(validateDictionaryEntry("012486", "a".repeat(50))).toEqual({ valid: true });
  });

  it("accepts code at exactly 20 chars", () => {
    expect(validateDictionaryEntry("12345678901234567890", "의미")).toEqual({ valid: true });
  });
});

describe("getDictionary", () => {
  it("returns dictionary entries", async () => {
    const entries = [
      { id: "e1", user_id: "u1", code: "1234", meaning: "test" },
    ];
    const chain = createMockChain({ data: entries, error: null });
    supabase.from.mockReturnValue(chain);

    const result = await getDictionary("u1");
    expect(supabase.from).toHaveBeenCalledWith("code_dictionary");
    expect(chain.eq).toHaveBeenCalledWith("user_id", "u1");
    expect(result).toEqual(entries);
  });

  it("returns empty array when data is null", async () => {
    const chain = createMockChain({ data: null, error: null });
    supabase.from.mockReturnValue(chain);

    const result = await getDictionary("u1");
    expect(result).toEqual([]);
  });

  it("throws on error", async () => {
    const chain = createMockChain({ data: null, error: { message: "fail" } });
    supabase.from.mockReturnValue(chain);

    await expect(getDictionary("u1")).rejects.toEqual({ message: "fail" });
  });
});

describe("addEntry", () => {
  it("adds entry successfully", async () => {
    const entry = { id: "e1", user_id: "u1", code: "1234", meaning: "test" };
    const chain = createMockChain({ data: entry, error: null });
    supabase.from.mockReturnValue(chain);

    const result = await addEntry("u1", "1234", "test");
    expect(supabase.from).toHaveBeenCalledWith("code_dictionary");
    expect(chain.insert).toHaveBeenCalledWith({
      user_id: "u1",
      code: "1234",
      meaning: "test",
    });
    expect(chain.single).toHaveBeenCalled();
    expect(result).toEqual(entry);
  });

  it("throws on validation failure (empty code)", async () => {
    await expect(addEntry("u1", "", "test")).rejects.toThrow("숫자 코드를 입력하세요");
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("throws on validation failure (empty meaning)", async () => {
    await expect(addEntry("u1", "1234", "")).rejects.toThrow("의미를 입력하세요");
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("throws on database error", async () => {
    const chain = createMockChain({ data: null, error: { message: "db error" } });
    supabase.from.mockReturnValue(chain);

    await expect(addEntry("u1", "1234", "test")).rejects.toEqual({ message: "db error" });
  });
});

describe("updateEntry", () => {
  it("updates entry successfully", async () => {
    const chain = createMockChain({ data: null, error: null });
    supabase.from.mockReturnValue(chain);

    await updateEntry("e1", "5678", "new meaning");
    expect(supabase.from).toHaveBeenCalledWith("code_dictionary");
    expect(chain.update).toHaveBeenCalledWith({ code: "5678", meaning: "new meaning" });
    expect(chain.eq).toHaveBeenCalledWith("id", "e1");
  });

  it("throws on validation failure", async () => {
    await expect(updateEntry("e1", "", "meaning")).rejects.toThrow("숫자 코드를 입력하세요");
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("throws on database error", async () => {
    const chain = createMockChain({ data: null, error: { message: "fail" } });
    supabase.from.mockReturnValue(chain);

    await expect(updateEntry("e1", "1234", "m")).rejects.toEqual({ message: "fail" });
  });
});

describe("deleteEntry", () => {
  it("deletes entry successfully", async () => {
    const chain = createMockChain({ data: null, error: null });
    supabase.from.mockReturnValue(chain);

    await deleteEntry("e1");
    expect(supabase.from).toHaveBeenCalledWith("code_dictionary");
    expect(chain.delete).toHaveBeenCalled();
    expect(chain.eq).toHaveBeenCalledWith("id", "e1");
  });

  it("throws on error", async () => {
    const chain = createMockChain({ data: null, error: { message: "fail" } });
    supabase.from.mockReturnValue(chain);

    await expect(deleteEntry("e1")).rejects.toEqual({ message: "fail" });
  });
});
