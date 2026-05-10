const { supabase, createMockChain } = require("@/lib/supabase");
import {
  addEntry,
  deleteEntry,
  getDictionary,
  updateEntry,
  validateDictionaryEntry,
} from "@/services/dictionaryService";

beforeEach(() => jest.clearAllMocks());

describe("validateDictionaryEntry", () => {
  it("accepts valid entry", () => {
    expect(validateDictionaryEntry("012486", "love")).toEqual({ valid: true });
    expect(validateDictionaryEntry("배고픔", "hungry")).toEqual({ valid: true });
  });

  it("rejects invalid entries", () => {
    expect(validateDictionaryEntry("", "meaning").valid).toBe(false);
    expect(validateDictionaryEntry("123456789012345678901", "meaning").valid).toBe(false);
    expect(validateDictionaryEntry("https://example.com", "meaning").valid).toBe(false);
    expect(validateDictionaryEntry("012486", "").valid).toBe(false);
    expect(validateDictionaryEntry("012486", "a".repeat(51)).valid).toBe(false);
  });

  it("accepts boundary lengths", () => {
    expect(validateDictionaryEntry("012486", "a".repeat(50))).toEqual({ valid: true });
    expect(validateDictionaryEntry("12345678901234567890", "meaning")).toEqual({
      valid: true,
    });
  });
});

describe("getDictionary", () => {
  it("returns code presets mapped to dictionary entries", async () => {
    const presets = [
      {
        id: "e1",
        owner_id: "u1",
        code: "1234",
        label: "test",
        created_at: "2026-05-03T00:00:00.000Z",
      },
    ];
    const chain = createMockChain({ data: presets, error: null });
    supabase.from.mockReturnValue(chain);

    const result = await getDictionary("u1");

    expect(supabase.from).toHaveBeenCalledWith("code_presets");
    expect(chain.eq).toHaveBeenCalledWith("owner_id", "u1");
    expect(result).toEqual([
      {
        id: "e1",
        user_id: "u1",
        code: "1234",
        meaning: "test",
        created_at: "2026-05-03T00:00:00.000Z",
      },
    ]);
  });

  it("returns empty array when data is null", async () => {
    const chain = createMockChain({ data: null, error: null });
    supabase.from.mockReturnValue(chain);

    await expect(getDictionary("u1")).resolves.toEqual([]);
  });

  it("throws on error", async () => {
    const chain = createMockChain({ data: null, error: { message: "fail" } });
    supabase.from.mockReturnValue(chain);

    await expect(getDictionary("u1")).rejects.toEqual({ message: "fail" });
  });
});

describe("addEntry", () => {
  it("adds code preset and maps it to dictionary shape", async () => {
    const preset = {
      id: "e1",
      owner_id: "u1",
      code: "1234",
      label: "test",
      created_at: "2026-05-03T00:00:00.000Z",
    };
    const chain = createMockChain({ data: preset, error: null });
    supabase.from.mockReturnValue(chain);

    const result = await addEntry("u1", "1234", "test");

    expect(supabase.from).toHaveBeenCalledWith("code_presets");
    expect(chain.insert).toHaveBeenCalledWith({
      owner_id: "u1",
      code: "1234",
      label: "test",
      is_widget_slot: false,
    });
    expect(chain.single).toHaveBeenCalled();
    expect(result.meaning).toBe("test");
  });

  it("throws on validation failure", async () => {
    await expect(addEntry("u1", "", "test")).rejects.toThrow();
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("throws on database error", async () => {
    const chain = createMockChain({ data: null, error: { message: "db error" } });
    supabase.from.mockReturnValue(chain);

    await expect(addEntry("u1", "1234", "test")).rejects.toEqual({
      message: "db error",
    });
  });
});

describe("updateEntry", () => {
  it("updates code preset successfully", async () => {
    const chain = createMockChain({ data: null, error: null });
    supabase.from.mockReturnValue(chain);

    await updateEntry("e1", "5678", "new meaning");

    expect(supabase.from).toHaveBeenCalledWith("code_presets");
    expect(chain.update).toHaveBeenCalledWith({ code: "5678", label: "new meaning" });
    expect(chain.eq).toHaveBeenCalledWith("id", "e1");
  });

  it("throws on validation failure", async () => {
    await expect(updateEntry("e1", "", "meaning")).rejects.toThrow();
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("throws on database error", async () => {
    const chain = createMockChain({ data: null, error: { message: "fail" } });
    supabase.from.mockReturnValue(chain);

    await expect(updateEntry("e1", "1234", "m")).rejects.toEqual({ message: "fail" });
  });
});

describe("deleteEntry", () => {
  it("deletes code preset successfully", async () => {
    const chain = createMockChain({ data: null, error: null });
    supabase.from.mockReturnValue(chain);

    await deleteEntry("e1");

    expect(supabase.from).toHaveBeenCalledWith("code_presets");
    expect(chain.delete).toHaveBeenCalled();
    expect(chain.eq).toHaveBeenCalledWith("id", "e1");
  });

  it("throws on error", async () => {
    const chain = createMockChain({ data: null, error: { message: "fail" } });
    supabase.from.mockReturnValue(chain);

    await expect(deleteEntry("e1")).rejects.toEqual({ message: "fail" });
  });
});
