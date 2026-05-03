const { supabase, createMockChain } = require("@/lib/supabase");
import {
  getReceivedMessages,
  getSavedMessages,
  markAsRead,
  saveMessage,
  sendQuickReplyToMessage,
  sendMessage,
  validateMessage,
} from "@/services/messageService";

beforeEach(() => jest.clearAllMocks());

const signal = {
  id: "m1",
  kind: "beep",
  sender_id: "u1",
  receiver_id: "u2",
  code: "1234",
  memo: "hello",
  status: "sent",
  is_saved: false,
  expires_at: "2026-05-04T00:00:00.000Z",
  created_at: "2026-05-03T00:00:00.000Z",
  from_user_profile: { nickname: "A", beep_id: "12345678" },
};

describe("validateMessage", () => {
  it("accepts valid number code", () => {
    expect(validateMessage("012486")).toEqual({ valid: true });
  });

  it("accepts code with memo", () => {
    expect(validateMessage("012486", "memo")).toEqual({ valid: true });
  });

  it("rejects empty code", () => {
    expect(validateMessage("").valid).toBe(false);
  });

  it("rejects code over 20 chars", () => {
    expect(validateMessage("123456789012345678901").valid).toBe(false);
  });

  it("rejects non-numeric code", () => {
    expect(validateMessage("abc123").valid).toBe(false);
  });

  it("rejects memo over 30 chars", () => {
    expect(validateMessage("012486", "a".repeat(31)).valid).toBe(false);
  });
});

describe("sendMessage", () => {
  it("sends a beep through the v2 RPC and maps it to the legacy UI shape", async () => {
    supabase.rpc.mockResolvedValue({ data: signal, error: null });

    const result = await sendMessage("u1", "u2", "1234", "hello");

    expect(supabase.rpc).toHaveBeenCalledWith("send_beep", {
      p_receiver_id: "u2",
      p_code: "1234",
      p_memo: "hello",
    });
    expect(result).toEqual({
      id: "m1",
      from_user: "u1",
      to_user: "u2",
      number_code: "1234",
      memo: "hello",
      is_read: false,
      is_saved: false,
      expires_at: "2026-05-04T00:00:00.000Z",
      created_at: "2026-05-03T00:00:00.000Z",
      kind: "beep",
      from_user_profile: { nickname: "A", beep_id: "12345678" },
      media: null,
    });
  });

  it("passes null memo when memo is omitted", async () => {
    supabase.rpc.mockResolvedValue({
      data: { ...signal, memo: null },
      error: null,
    });

    const result = await sendMessage("u1", "u2", "1234");

    expect(supabase.rpc).toHaveBeenCalledWith(
      "send_beep",
      expect.objectContaining({ p_memo: null })
    );
    expect(result.memo).toBeNull();
  });

  it("throws on invalid code without calling the backend", async () => {
    await expect(sendMessage("u1", "u2", "")).rejects.toThrow();
    expect(supabase.rpc).not.toHaveBeenCalled();
  });

  it("throws on backend error", async () => {
    supabase.rpc.mockResolvedValue({ data: null, error: { message: "db error" } });

    await expect(sendMessage("u1", "u2", "1234")).rejects.toEqual({
      message: "db error",
    });
  });
});

describe("sendQuickReplyToMessage", () => {
  it("sends a Beep back to the source sender", async () => {
    supabase.rpc.mockResolvedValue({
      data: { ...signal, sender_id: "u2", receiver_id: "u1", code: "8282" },
      error: null,
    });

    await sendQuickReplyToMessage(
      "u2",
      {
        id: "source-1",
        from_user: "u1",
        to_user: "u2",
        number_code: "486",
        memo: null,
        is_read: false,
        is_saved: false,
        expires_at: "2026-05-04T00:00:00.000Z",
        created_at: "2026-05-03T00:00:00.000Z",
      },
      "8282"
    );

    expect(supabase.rpc).toHaveBeenCalledWith("send_beep", {
      p_receiver_id: "u1",
      p_code: "8282",
      p_memo: null,
    });
  });

  it("rejects replying to another user's signal", async () => {
    await expect(
      sendQuickReplyToMessage(
        "u3",
        {
          id: "source-1",
          from_user: "u1",
          to_user: "u2",
          number_code: "486",
          memo: null,
          is_read: false,
          is_saved: false,
          expires_at: "2026-05-04T00:00:00.000Z",
          created_at: "2026-05-03T00:00:00.000Z",
        },
        "8282"
      )
    ).rejects.toThrow("Cannot reply");

    expect(supabase.rpc).not.toHaveBeenCalled();
  });
});

describe("getReceivedMessages", () => {
  it("returns received v2 signals in the legacy UI shape", async () => {
    const chain = createMockChain({ data: [signal], error: null });
    supabase.from.mockReturnValue(chain);

    const result = await getReceivedMessages("u2");

    expect(supabase.from).toHaveBeenCalledWith("signals");
    expect(chain.eq).toHaveBeenCalledWith("receiver_id", "u2");
    expect(result[0]).toEqual(
      expect.objectContaining({
        from_user: "u1",
        to_user: "u2",
        number_code: "1234",
      })
    );
  });

  it("maps blink media teaser fields", async () => {
    const chain = createMockChain({
      data: [
        {
          ...signal,
          kind: "blink",
          media: [
            {
              duration_ms: 2000,
              status: "processed",
              thumbnail_key: "thumb.jpg",
              strip_keys: ["a.jpg", "b.jpg"],
              object_key: "video.mp4",
            },
          ],
        },
      ],
      error: null,
    });
    supabase.from.mockReturnValue(chain);

    const result = await getReceivedMessages("u2");

    expect(result[0].media).toEqual({
      durationMs: 2000,
      status: "processed",
      thumbnailUri: "thumb.jpg",
      stripFrameUris: ["a.jpg", "b.jpg"],
      playbackUri: "video.mp4",
    });
  });

  it("returns empty array when data is null", async () => {
    const chain = createMockChain({ data: null, error: null });
    supabase.from.mockReturnValue(chain);

    await expect(getReceivedMessages("u1")).resolves.toEqual([]);
  });

  it("throws on error", async () => {
    const chain = createMockChain({ data: null, error: { message: "fail" } });
    supabase.from.mockReturnValue(chain);

    await expect(getReceivedMessages("u1")).rejects.toEqual({ message: "fail" });
  });
});

describe("markAsRead", () => {
  it("marks signal as read through RPC", async () => {
    supabase.rpc.mockResolvedValue({ data: signal, error: null });

    await markAsRead("m1");

    expect(supabase.rpc).toHaveBeenCalledWith("mark_signal_read", {
      p_signal_id: "m1",
    });
  });

  it("throws on error", async () => {
    supabase.rpc.mockResolvedValue({ data: null, error: { message: "fail" } });

    await expect(markAsRead("m1")).rejects.toEqual({ message: "fail" });
  });
});

describe("saveMessage", () => {
  it("saves signal through RPC", async () => {
    supabase.rpc.mockResolvedValue({ data: signal, error: null });

    await saveMessage("m1");

    expect(supabase.rpc).toHaveBeenCalledWith("save_signal", {
      p_signal_id: "m1",
    });
  });

  it("throws on error", async () => {
    supabase.rpc.mockResolvedValue({ data: null, error: { message: "fail" } });

    await expect(saveMessage("m1")).rejects.toEqual({ message: "fail" });
  });
});

describe("getSavedMessages", () => {
  it("returns saved signals", async () => {
    const chain = createMockChain({ data: [{ ...signal, is_saved: true }], error: null });
    supabase.from.mockReturnValue(chain);

    const result = await getSavedMessages("u2");

    expect(supabase.from).toHaveBeenCalledWith("signals");
    expect(chain.eq).toHaveBeenCalledWith("receiver_id", "u2");
    expect(chain.eq).toHaveBeenCalledWith("is_saved", true);
    expect(result[0].is_saved).toBe(true);
  });

  it("returns empty array when data is null", async () => {
    const chain = createMockChain({ data: null, error: null });
    supabase.from.mockReturnValue(chain);

    await expect(getSavedMessages("u1")).resolves.toEqual([]);
  });

  it("throws on error", async () => {
    const chain = createMockChain({ data: null, error: { message: "fail" } });
    supabase.from.mockReturnValue(chain);

    await expect(getSavedMessages("u1")).rejects.toEqual({ message: "fail" });
  });
});
