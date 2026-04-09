const { supabase, createMockChain } = require("@/lib/supabase");
import {
  validateMessage,
  sendMessage,
  getReceivedMessages,
  markAsRead,
  saveMessage,
  getSavedMessages,
} from "@/services/messageService";

beforeEach(() => jest.clearAllMocks());

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

describe("sendMessage", () => {
  it("sends message successfully", async () => {
    const msg = { id: "m1", number_code: "1234", from_user: "u1", to_user: "u2" };
    const chain = createMockChain({ data: msg, error: null });
    supabase.from.mockReturnValue(chain);

    const result = await sendMessage("u1", "u2", "1234", "hello");
    expect(supabase.from).toHaveBeenCalledWith("messages");
    expect(chain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        from_user: "u1",
        to_user: "u2",
        number_code: "1234",
        memo: "hello",
      })
    );
    expect(chain.select).toHaveBeenCalled();
    expect(chain.single).toHaveBeenCalled();
    expect(result).toEqual(msg);
  });

  it("sends message without memo", async () => {
    const msg = { id: "m1", number_code: "1234" };
    const chain = createMockChain({ data: msg, error: null });
    supabase.from.mockReturnValue(chain);

    const result = await sendMessage("u1", "u2", "1234");
    expect(chain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ memo: null })
    );
    expect(result).toEqual(msg);
  });

  it("throws on invalid code", async () => {
    await expect(sendMessage("u1", "u2", "")).rejects.toThrow("숫자 코드를 입력하세요");
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("throws on non-numeric code", async () => {
    await expect(sendMessage("u1", "u2", "abc")).rejects.toThrow("숫자만 입력 가능합니다");
  });

  it("throws on database error", async () => {
    const chain = createMockChain({ data: null, error: { message: "db error" } });
    supabase.from.mockReturnValue(chain);

    await expect(sendMessage("u1", "u2", "1234")).rejects.toEqual({ message: "db error" });
  });

  it("includes expires_at in insert payload", async () => {
    const chain = createMockChain({ data: { id: "m1" }, error: null });
    supabase.from.mockReturnValue(chain);

    await sendMessage("u1", "u2", "1234");
    const insertCall = chain.insert.mock.calls[0][0];
    expect(insertCall).toHaveProperty("expires_at");
    expect(typeof insertCall.expires_at).toBe("string");
  });
});

describe("getReceivedMessages", () => {
  it("returns received messages", async () => {
    const messages = [
      { id: "m1", number_code: "1234", to_user: "u1", from_user_profile: { nickname: "A" } },
    ];
    const chain = createMockChain({ data: messages, error: null });
    supabase.from.mockReturnValue(chain);

    const result = await getReceivedMessages("u1");
    expect(supabase.from).toHaveBeenCalledWith("messages");
    expect(chain.eq).toHaveBeenCalledWith("to_user", "u1");
    expect(result).toEqual(messages);
  });

  it("returns empty array when data is null", async () => {
    const chain = createMockChain({ data: null, error: null });
    supabase.from.mockReturnValue(chain);

    const result = await getReceivedMessages("u1");
    expect(result).toEqual([]);
  });

  it("throws on error", async () => {
    const chain = createMockChain({ data: null, error: { message: "fail" } });
    supabase.from.mockReturnValue(chain);

    await expect(getReceivedMessages("u1")).rejects.toEqual({ message: "fail" });
  });
});

describe("markAsRead", () => {
  it("marks message as read", async () => {
    const chain = createMockChain({ data: null, error: null });
    supabase.from.mockReturnValue(chain);

    await markAsRead("m1");
    expect(supabase.from).toHaveBeenCalledWith("messages");
    expect(chain.update).toHaveBeenCalledWith({ is_read: true });
    expect(chain.eq).toHaveBeenCalledWith("id", "m1");
  });

  it("throws on error", async () => {
    const chain = createMockChain({ data: null, error: { message: "fail" } });
    supabase.from.mockReturnValue(chain);

    await expect(markAsRead("m1")).rejects.toEqual({ message: "fail" });
  });
});

describe("saveMessage", () => {
  it("saves message", async () => {
    const chain = createMockChain({ data: null, error: null });
    supabase.from.mockReturnValue(chain);

    await saveMessage("m1");
    expect(supabase.from).toHaveBeenCalledWith("messages");
    expect(chain.update).toHaveBeenCalledWith({ is_saved: true });
    expect(chain.eq).toHaveBeenCalledWith("id", "m1");
  });

  it("throws on error", async () => {
    const chain = createMockChain({ data: null, error: { message: "fail" } });
    supabase.from.mockReturnValue(chain);

    await expect(saveMessage("m1")).rejects.toEqual({ message: "fail" });
  });
});

describe("getSavedMessages", () => {
  it("returns saved messages", async () => {
    const messages = [{ id: "m1", is_saved: true }];
    const chain = createMockChain({ data: messages, error: null });
    supabase.from.mockReturnValue(chain);

    const result = await getSavedMessages("u1");
    expect(supabase.from).toHaveBeenCalledWith("messages");
    expect(chain.eq).toHaveBeenCalledWith("to_user", "u1");
    expect(chain.eq).toHaveBeenCalledWith("is_saved", true);
    expect(result).toEqual(messages);
  });

  it("returns empty array when data is null", async () => {
    const chain = createMockChain({ data: null, error: null });
    supabase.from.mockReturnValue(chain);

    const result = await getSavedMessages("u1");
    expect(result).toEqual([]);
  });

  it("throws on error", async () => {
    const chain = createMockChain({ data: null, error: { message: "fail" } });
    supabase.from.mockReturnValue(chain);

    await expect(getSavedMessages("u1")).rejects.toEqual({ message: "fail" });
  });
});
