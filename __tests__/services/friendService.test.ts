const { supabase, createMockChain } = require("@/lib/supabase");
import {
  addFriend,
  findUserByBeepId,
  getFriends,
  getInboundFriends,
  markInboundFriendsSeen,
  removeFriend,
  updateFriendNickname,
  updateVibrationPattern,
} from "@/services/friendService";

beforeEach(() => jest.clearAllMocks());

describe("findUserByBeepId", () => {
  it("returns profile when found", async () => {
    supabase.rpc.mockResolvedValue({
      data: [{ id: "user-1", beep_id: "12345678", nickname: "test" }],
      error: null,
    });

    const result = await findUserByBeepId("12345678");

    expect(supabase.rpc).toHaveBeenCalledWith("find_profile_by_beep_id", {
      target_beep_id: "12345678",
    });
    expect(result).toEqual({ id: "user-1", beep_id: "12345678", nickname: "test" });
  });

  it("returns null when no profile found", async () => {
    supabase.rpc.mockResolvedValue({ data: [], error: null });

    await expect(findUserByBeepId("12345678")).resolves.toBeNull();
  });

  it("returns null on error", async () => {
    supabase.rpc.mockResolvedValue({ data: null, error: { message: "err" } });

    await expect(findUserByBeepId("12345678")).resolves.toBeNull();
  });

  it("returns null for invalid beep_id without calling rpc", async () => {
    await expect(findUserByBeepId("abc")).resolves.toBeNull();
    expect(supabase.rpc).not.toHaveBeenCalled();
  });
});

describe("addFriend", () => {
  it("inserts relationship successfully", async () => {
    const chain = createMockChain({ data: null, error: null });
    supabase.from.mockReturnValue(chain);

    await addFriend("user-1", "user-2", "best");

    expect(supabase.from).toHaveBeenCalledWith("relationships");
    expect(chain.insert).toHaveBeenCalledWith({
      owner_id: "user-1",
      friend_id: "user-2",
      nickname: "best",
      vibration_pattern: null,
    });
  });

  it("persists the selected relationship preset", async () => {
    const chain = createMockChain({ data: null, error: null });
    supabase.from.mockReturnValue(chain);

    await addFriend("user-1", "user-2", undefined, "CLOSE FRIEND");

    expect(chain.insert).toHaveBeenCalledWith({
      owner_id: "user-1",
      friend_id: "user-2",
      nickname: null,
      vibration_pattern: "CLOSE FRIEND",
    });
  });

  it("inserts with null nickname when not provided", async () => {
    const chain = createMockChain({ data: null, error: null });
    supabase.from.mockReturnValue(chain);

    await addFriend("user-1", "user-2");

    expect(chain.insert).toHaveBeenCalledWith({
      owner_id: "user-1",
      friend_id: "user-2",
      nickname: null,
      vibration_pattern: null,
    });
  });

  it("throws when adding self", async () => {
    await expect(addFriend("user-1", "user-1")).rejects.toThrow();
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("throws duplicate error for code 23505", async () => {
    const chain = createMockChain({ data: null, error: { code: "23505", message: "dup" } });
    supabase.from.mockReturnValue(chain);

    await expect(addFriend("user-1", "user-2")).rejects.toThrow();
  });

  it("throws original error for other codes", async () => {
    const dbError = { code: "42000", message: "db error" };
    const chain = createMockChain({ data: null, error: dbError });
    supabase.from.mockReturnValue(chain);

    await expect(addFriend("user-1", "user-2")).rejects.toEqual(dbError);
  });
});

describe("removeFriend", () => {
  it("deletes relationship successfully", async () => {
    const chain = createMockChain({ data: null, error: null });
    supabase.from.mockReturnValue(chain);

    await removeFriend("user-1", "user-2");

    expect(supabase.from).toHaveBeenCalledWith("relationships");
    expect(chain.delete).toHaveBeenCalled();
    expect(chain.eq).toHaveBeenCalledWith("owner_id", "user-1");
    expect(chain.eq).toHaveBeenCalledWith("friend_id", "user-2");
  });

  it("throws on error", async () => {
    const chain = createMockChain({ data: null, error: { message: "fail" } });
    supabase.from.mockReturnValue(chain);

    await expect(removeFriend("user-1", "user-2")).rejects.toEqual({ message: "fail" });
  });
});

describe("getFriends", () => {
  it("returns relationships mapped to the legacy friendship shape", async () => {
    const relationships = [
      {
        id: "r1",
        owner_id: "user-1",
        friend_id: "user-2",
        nickname: "A",
        vibration_pattern: null,
        created_at: "2026-05-03T00:00:00.000Z",
        friend: { id: "user-2", beep_id: "12345678", nickname: "A", status_icon: "online" },
      },
    ];
    const chain = createMockChain({ data: relationships, error: null });
    supabase.from.mockReturnValue(chain);

    const result = await getFriends("user-1");

    expect(supabase.from).toHaveBeenCalledWith("relationships");
    expect(chain.select).toHaveBeenCalled();
    expect(chain.eq).toHaveBeenCalledWith("owner_id", "user-1");
    expect(result[0]).toEqual(expect.objectContaining({ user_id: "user-1" }));
  });

  it("returns empty array when data is null", async () => {
    const chain = createMockChain({ data: null, error: null });
    supabase.from.mockReturnValue(chain);

    await expect(getFriends("user-1")).resolves.toEqual([]);
  });

  it("throws on error", async () => {
    const chain = createMockChain({ data: null, error: { message: "fail" } });
    supabase.from.mockReturnValue(chain);

    await expect(getFriends("user-1")).rejects.toEqual({ message: "fail" });
  });
});

describe("getInboundFriends", () => {
  it("queries relationships by friend_id with the owner profile join", async () => {
    const inbound = [
      {
        id: "r1",
        owner_id: "user-2",
        friend_id: "user-1",
        created_at: "2026-05-31T00:00:00.000Z",
        owner: { id: "user-2", beep_id: "12345678", nickname: "B", status_icon: "online" },
      },
    ];
    const chain = createMockChain({ data: inbound, error: null });
    supabase.from.mockReturnValue(chain);

    const result = await getInboundFriends("user-1");

    expect(supabase.from).toHaveBeenCalledWith("relationships");
    expect(chain.select).toHaveBeenCalledWith(
      "id, owner_id, friend_id, created_at, owner:profiles!relationships_owner_id_fkey(id, beep_id, nickname, status_icon)",
    );
    expect(chain.eq).toHaveBeenCalledWith("friend_id", "user-1");
    expect(chain.order).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(result).toEqual(inbound);
  });

  it("returns empty array when data is null", async () => {
    const chain = createMockChain({ data: null, error: null });
    supabase.from.mockReturnValue(chain);

    await expect(getInboundFriends("user-1")).resolves.toEqual([]);
  });

  it("throws on error", async () => {
    const chain = createMockChain({ data: null, error: { message: "fail" } });
    supabase.from.mockReturnValue(chain);

    await expect(getInboundFriends("user-1")).rejects.toEqual({ message: "fail" });
  });
});

describe("markInboundFriendsSeen", () => {
  it("calls the mark_inbound_friends_seen rpc", async () => {
    supabase.rpc.mockResolvedValue({ data: null, error: null });

    await markInboundFriendsSeen();

    expect(supabase.rpc).toHaveBeenCalledWith("mark_inbound_friends_seen");
  });

  it("throws on error", async () => {
    supabase.rpc.mockResolvedValue({ data: null, error: { message: "fail" } });

    await expect(markInboundFriendsSeen()).rejects.toEqual({ message: "fail" });
  });
});

describe("updateFriendNickname", () => {
  it("updates nickname successfully", async () => {
    const chain = createMockChain({ data: null, error: null });
    supabase.from.mockReturnValue(chain);

    await updateFriendNickname("user-1", "user-2", "new name");

    expect(supabase.from).toHaveBeenCalledWith("relationships");
    expect(chain.update).toHaveBeenCalledWith({ nickname: "new name" });
    expect(chain.eq).toHaveBeenCalledWith("owner_id", "user-1");
  });

  it("throws on error", async () => {
    const chain = createMockChain({ data: null, error: { message: "fail" } });
    supabase.from.mockReturnValue(chain);

    await expect(updateFriendNickname("u1", "u2", "n")).rejects.toEqual({
      message: "fail",
    });
  });
});

describe("updateVibrationPattern", () => {
  it("updates pattern successfully", async () => {
    const chain = createMockChain({ data: null, error: null });
    supabase.from.mockReturnValue(chain);

    await updateVibrationPattern("user-1", "user-2", "S,L,S");

    expect(supabase.from).toHaveBeenCalledWith("relationships");
    expect(chain.update).toHaveBeenCalledWith({ vibration_pattern: "S,L,S" });
    expect(chain.eq).toHaveBeenCalledWith("owner_id", "user-1");
  });

  it("throws on error", async () => {
    const chain = createMockChain({ data: null, error: { message: "fail" } });
    supabase.from.mockReturnValue(chain);

    await expect(updateVibrationPattern("u1", "u2", "S")).rejects.toEqual({
      message: "fail",
    });
  });
});
