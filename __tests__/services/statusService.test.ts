const { supabase, createMockChain } = require("@/lib/supabase");
import {
  getFriendStatuses,
  getMyStatus,
  setMyStatus,
  STATUS_PRESETS,
} from "@/services/statusService";

beforeEach(() => jest.clearAllMocks());

describe("STATUS_PRESETS", () => {
  it("contains the default owned icon presets", () => {
    expect(STATUS_PRESETS.map((preset) => preset.icon)).toEqual([
      "online",
      "busy",
      "focus",
      "away",
      "sleeping",
    ]);
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
  it("updates profile status", async () => {
    supabase.rpc.mockResolvedValue({ data: null, error: null });

    await setMyStatus("u1", "focus", "studying");

    expect(supabase.rpc).toHaveBeenCalledWith("equip_status_icon", { p_slug: "focus" });
  });

  it("throws when update fails", async () => {
    supabase.rpc.mockResolvedValue({ data: null, error: { message: "update fail" } });

    await expect(setMyStatus("u1", "focus")).rejects.toEqual({
      message: "update fail",
    });
  });
});

describe("getMyStatus", () => {
  it("returns profile status mapped to legacy status shape", async () => {
    const chain = createMockChain({
      data: {
        id: "u1",
        status_icon: "online",
        updated_at: "2026-05-03T00:00:00.000Z",
      },
      error: null,
    });
    supabase.from.mockReturnValue(chain);

    const result = await getMyStatus("u1");

    expect(supabase.from).toHaveBeenCalledWith("profiles");
    expect(chain.eq).toHaveBeenCalledWith("id", "u1");
    expect(chain.single).toHaveBeenCalled();
    expect(result).toEqual({
      user_id: "u1",
      status_icon: "online",
      label: null,
      updated_at: "2026-05-03T00:00:00.000Z",
    });
  });

  it("returns null on error", async () => {
    const chain = createMockChain({ data: null, error: { message: "not found" } });
    supabase.from.mockReturnValue(chain);

    await expect(getMyStatus("u1")).resolves.toBeNull();
  });
});

describe("getFriendStatuses", () => {
  it("returns statuses for given friend ids", async () => {
    const chain = createMockChain({
      data: [
        { id: "f1", status_icon: "study", updated_at: "2026-05-03T00:00:00.000Z" },
        { id: "f2", status_icon: "online", updated_at: "2026-05-03T00:00:00.000Z" },
      ],
      error: null,
    });
    supabase.from.mockReturnValue(chain);

    const result = await getFriendStatuses(["f1", "f2"]);

    expect(supabase.from).toHaveBeenCalledWith("profiles");
    expect(chain.in).toHaveBeenCalledWith("id", ["f1", "f2"]);
    expect(result).toEqual([
      {
        user_id: "f1",
        status_icon: "study",
        label: null,
        updated_at: "2026-05-03T00:00:00.000Z",
      },
      {
        user_id: "f2",
        status_icon: "online",
        label: null,
        updated_at: "2026-05-03T00:00:00.000Z",
      },
    ]);
  });

  it("returns empty array for empty friendIds", async () => {
    await expect(getFriendStatuses([])).resolves.toEqual([]);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("returns empty array when data is null", async () => {
    const chain = createMockChain({ data: null, error: null });
    supabase.from.mockReturnValue(chain);

    await expect(getFriendStatuses(["f1"])).resolves.toEqual([]);
  });

  it("throws on error", async () => {
    const chain = createMockChain({ data: null, error: { message: "fail" } });
    supabase.from.mockReturnValue(chain);

    await expect(getFriendStatuses(["f1"])).rejects.toEqual({ message: "fail" });
  });
});
