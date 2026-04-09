const { supabase, createMockChain } = require("@/lib/supabase");
import {
  STATUS_PRESETS,
  setMyStatus,
  getMyStatus,
  getFriendStatuses,
} from "@/services/statusService";

beforeEach(() => jest.clearAllMocks());

describe("STATUS_PRESETS", () => {
  it("contains 8 presets", () => {
    expect(STATUS_PRESETS).toHaveLength(8);
  });

  it("each preset has icon and label", () => {
    for (const preset of STATUS_PRESETS) {
      expect(preset).toHaveProperty("icon");
      expect(preset).toHaveProperty("label");
      expect(typeof preset.icon).toBe("string");
      expect(typeof preset.label).toBe("string");
    }
  });

  it("includes online preset", () => {
    expect(STATUS_PRESETS.find((p: { icon: string }) => p.icon === "online")).toBeDefined();
  });
});

describe("setMyStatus", () => {
  it("upserts status and updates user", async () => {
    const chain1 = createMockChain({ data: null, error: null });
    const chain2 = createMockChain({ data: null, error: null });
    let callCount = 0;
    supabase.from.mockImplementation(() => {
      callCount++;
      return callCount === 1 ? chain1 : chain2;
    });

    await setMyStatus("u1", "study", "studying");
    expect(supabase.from).toHaveBeenCalledWith("status_broadcasts");
    expect(supabase.from).toHaveBeenCalledWith("users");
    expect(chain1.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "u1",
        status_icon: "study",
        label: "studying",
      }),
      { onConflict: "user_id" }
    );
    expect(chain2.update).toHaveBeenCalledWith({ status_icon: "study" });
  });

  it("sets label to null when not provided", async () => {
    const chain1 = createMockChain({ data: null, error: null });
    const chain2 = createMockChain({ data: null, error: null });
    let callCount = 0;
    supabase.from.mockImplementation(() => {
      callCount++;
      return callCount === 1 ? chain1 : chain2;
    });

    await setMyStatus("u1", "online");
    expect(chain1.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ label: null }),
      { onConflict: "user_id" }
    );
  });

  it("throws when upsert fails", async () => {
    const chain = createMockChain({ data: null, error: { message: "upsert fail" } });
    supabase.from.mockReturnValue(chain);

    await expect(setMyStatus("u1", "study")).rejects.toEqual({ message: "upsert fail" });
  });

  it("throws when user update fails", async () => {
    const chain1 = createMockChain({ data: null, error: null });
    const chain2 = createMockChain({ data: null, error: { message: "user update fail" } });
    let callCount = 0;
    supabase.from.mockImplementation(() => {
      callCount++;
      return callCount === 1 ? chain1 : chain2;
    });

    await expect(setMyStatus("u1", "study")).rejects.toEqual({ message: "user update fail" });
  });
});

describe("getMyStatus", () => {
  it("returns status when found", async () => {
    const status = { user_id: "u1", status_icon: "online", label: null };
    const chain = createMockChain({ data: status, error: null });
    supabase.from.mockReturnValue(chain);

    const result = await getMyStatus("u1");
    expect(supabase.from).toHaveBeenCalledWith("status_broadcasts");
    expect(chain.eq).toHaveBeenCalledWith("user_id", "u1");
    expect(chain.single).toHaveBeenCalled();
    expect(result).toEqual(status);
  });

  it("returns null on error", async () => {
    const chain = createMockChain({ data: null, error: { message: "not found" } });
    supabase.from.mockReturnValue(chain);

    const result = await getMyStatus("u1");
    expect(result).toBeNull();
  });
});

describe("getFriendStatuses", () => {
  it("returns statuses for given friend ids", async () => {
    const statuses = [
      { user_id: "f1", status_icon: "study" },
      { user_id: "f2", status_icon: "online" },
    ];
    const chain = createMockChain({ data: statuses, error: null });
    supabase.from.mockReturnValue(chain);

    const result = await getFriendStatuses(["f1", "f2"]);
    expect(supabase.from).toHaveBeenCalledWith("status_broadcasts");
    expect(chain.in).toHaveBeenCalledWith("user_id", ["f1", "f2"]);
    expect(result).toEqual(statuses);
  });

  it("returns empty array for empty friendIds", async () => {
    const result = await getFriendStatuses([]);
    expect(supabase.from).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it("returns empty array when data is null", async () => {
    const chain = createMockChain({ data: null, error: null });
    supabase.from.mockReturnValue(chain);

    const result = await getFriendStatuses(["f1"]);
    expect(result).toEqual([]);
  });

  it("throws on error", async () => {
    const chain = createMockChain({ data: null, error: { message: "fail" } });
    supabase.from.mockReturnValue(chain);

    await expect(getFriendStatuses(["f1"])).rejects.toEqual({ message: "fail" });
  });
});
