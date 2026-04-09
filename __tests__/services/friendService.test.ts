const { supabase, createMockChain } = require("@/lib/supabase");
import {
  findUserByBeepId,
  addFriend,
  removeFriend,
  getFriends,
  updateFriendNickname,
  updateVibrationPattern,
} from "@/services/friendService";
import { isValidBeepId } from "@/services/authService";

beforeEach(() => jest.clearAllMocks());

describe("findUserByBeepId", () => {
  it("returns user when found", async () => {
    supabase.rpc.mockResolvedValue({
      data: [{ id: "user-1", beep_id: "12345678", nickname: "test" }],
      error: null,
    });

    const result = await findUserByBeepId("12345678");
    expect(supabase.rpc).toHaveBeenCalledWith("find_user_by_beep_id", {
      target_beep_id: "12345678",
    });
    expect(result).toEqual({ id: "user-1", beep_id: "12345678", nickname: "test" });
  });

  it("returns null when no user found", async () => {
    supabase.rpc.mockResolvedValue({ data: [], error: null });

    const result = await findUserByBeepId("12345678");
    expect(result).toBeNull();
  });

  it("returns null on error", async () => {
    supabase.rpc.mockResolvedValue({ data: null, error: { message: "err" } });

    const result = await findUserByBeepId("12345678");
    expect(result).toBeNull();
  });

  it("returns null for invalid beep_id without calling rpc", async () => {
    const result = await findUserByBeepId("abc");
    expect(supabase.rpc).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it("returns null for empty beep_id", async () => {
    const result = await findUserByBeepId("");
    expect(supabase.rpc).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });
});

describe("addFriend", () => {
  it("inserts friendship successfully", async () => {
    const chain = createMockChain({ data: null, error: null });
    supabase.from.mockReturnValue(chain);

    await addFriend("user-1", "user-2", "best");
    expect(supabase.from).toHaveBeenCalledWith("friendships");
    expect(chain.insert).toHaveBeenCalledWith({
      user_id: "user-1",
      friend_id: "user-2",
      nickname: "best",
    });
  });

  it("inserts with null nickname when not provided", async () => {
    const chain = createMockChain({ data: null, error: null });
    supabase.from.mockReturnValue(chain);

    await addFriend("user-1", "user-2");
    expect(chain.insert).toHaveBeenCalledWith({
      user_id: "user-1",
      friend_id: "user-2",
      nickname: null,
    });
  });

  it("throws when adding self", async () => {
    await expect(addFriend("user-1", "user-1")).rejects.toThrow(
      "자기 자신을 친구로 추가할 수 없습니다"
    );
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("throws duplicate error for code 23505", async () => {
    const chain = createMockChain({ data: null, error: { code: "23505", message: "dup" } });
    supabase.from.mockReturnValue(chain);

    await expect(addFriend("user-1", "user-2")).rejects.toThrow("이미 친구입니다");
  });

  it("throws original error for other codes", async () => {
    const dbError = { code: "42000", message: "db error" };
    const chain = createMockChain({ data: null, error: dbError });
    supabase.from.mockReturnValue(chain);

    await expect(addFriend("user-1", "user-2")).rejects.toEqual(dbError);
  });
});

describe("removeFriend", () => {
  it("deletes friendship successfully", async () => {
    const chain = createMockChain({ data: null, error: null });
    supabase.from.mockReturnValue(chain);

    await removeFriend("user-1", "user-2");
    expect(supabase.from).toHaveBeenCalledWith("friendships");
    expect(chain.delete).toHaveBeenCalled();
    expect(chain.eq).toHaveBeenCalledWith("user_id", "user-1");
    expect(chain.eq).toHaveBeenCalledWith("friend_id", "user-2");
  });

  it("throws on error", async () => {
    const chain = createMockChain({ data: null, error: { message: "fail" } });
    supabase.from.mockReturnValue(chain);

    await expect(removeFriend("user-1", "user-2")).rejects.toEqual({ message: "fail" });
  });
});

describe("getFriends", () => {
  it("returns friends list", async () => {
    const friends = [
      { id: "f1", user_id: "user-1", friend_id: "user-2", friend: { nickname: "A" } },
    ];
    const chain = createMockChain({ data: friends, error: null });
    supabase.from.mockReturnValue(chain);

    const result = await getFriends("user-1");
    expect(supabase.from).toHaveBeenCalledWith("friendships");
    expect(chain.select).toHaveBeenCalled();
    expect(chain.eq).toHaveBeenCalledWith("user_id", "user-1");
    expect(result).toEqual(friends);
  });

  it("returns empty array when data is null", async () => {
    const chain = createMockChain({ data: null, error: null });
    supabase.from.mockReturnValue(chain);

    const result = await getFriends("user-1");
    expect(result).toEqual([]);
  });

  it("throws on error", async () => {
    const chain = createMockChain({ data: null, error: { message: "fail" } });
    supabase.from.mockReturnValue(chain);

    await expect(getFriends("user-1")).rejects.toEqual({ message: "fail" });
  });
});

describe("updateFriendNickname", () => {
  it("updates nickname successfully", async () => {
    const chain = createMockChain({ data: null, error: null });
    supabase.from.mockReturnValue(chain);

    await updateFriendNickname("user-1", "user-2", "new name");
    expect(supabase.from).toHaveBeenCalledWith("friendships");
    expect(chain.update).toHaveBeenCalledWith({ nickname: "new name" });
  });

  it("throws on error", async () => {
    const chain = createMockChain({ data: null, error: { message: "fail" } });
    supabase.from.mockReturnValue(chain);

    await expect(updateFriendNickname("u1", "u2", "n")).rejects.toEqual({ message: "fail" });
  });
});

describe("updateVibrationPattern", () => {
  it("updates pattern successfully", async () => {
    const chain = createMockChain({ data: null, error: null });
    supabase.from.mockReturnValue(chain);

    await updateVibrationPattern("user-1", "user-2", "S,L,S");
    expect(supabase.from).toHaveBeenCalledWith("friendships");
    expect(chain.update).toHaveBeenCalledWith({ vibration_pattern: "S,L,S" });
  });

  it("throws on error", async () => {
    const chain = createMockChain({ data: null, error: { message: "fail" } });
    supabase.from.mockReturnValue(chain);

    await expect(updateVibrationPattern("u1", "u2", "S")).rejects.toEqual({ message: "fail" });
  });
});
