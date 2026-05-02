const { supabase, createMockChain } = require("@/lib/supabase");
import {
  getActiveSkinSlug,
  getAllSkins,
  getUserSkins,
  purchaseSkin,
  setActiveSkin,
} from "@/services/skinService";

beforeEach(() => jest.clearAllMocks());

describe("getAllSkins", () => {
  it("returns all skins ordered by created_at", async () => {
    const skins = [
      { id: "s1", name: "Swiss Paper", slug: "swiss-paper" },
      { id: "s2", name: "Pixel Pager", slug: "pixel-pager" },
    ];
    const chain = createMockChain({ data: skins, error: null });
    supabase.from.mockReturnValue(chain);

    const result = await getAllSkins();

    expect(supabase.from).toHaveBeenCalledWith("skins");
    expect(chain.select).toHaveBeenCalledWith("*");
    expect(result).toEqual(skins);
  });

  it("returns empty array when data is null", async () => {
    const chain = createMockChain({ data: null, error: null });
    supabase.from.mockReturnValue(chain);

    await expect(getAllSkins()).resolves.toEqual([]);
  });

  it("throws on error", async () => {
    const chain = createMockChain({ data: null, error: { message: "fail" } });
    supabase.from.mockReturnValue(chain);

    await expect(getAllSkins()).rejects.toEqual({ message: "fail" });
  });
});

describe("getUserSkins", () => {
  it("returns user skins with skin details", async () => {
    const userSkins = [{ id: "us1", user_id: "u1", skin: { id: "s1", name: "Swiss Paper" } }];
    const chain = createMockChain({ data: userSkins, error: null });
    supabase.from.mockReturnValue(chain);

    const result = await getUserSkins("u1");

    expect(supabase.from).toHaveBeenCalledWith("user_skins");
    expect(chain.eq).toHaveBeenCalledWith("user_id", "u1");
    expect(result).toEqual(userSkins);
  });

  it("returns empty array when data is null", async () => {
    const chain = createMockChain({ data: null, error: null });
    supabase.from.mockReturnValue(chain);

    await expect(getUserSkins("u1")).resolves.toEqual([]);
  });

  it("throws on error", async () => {
    const chain = createMockChain({ data: null, error: { message: "fail" } });
    supabase.from.mockReturnValue(chain);

    await expect(getUserSkins("u1")).rejects.toEqual({ message: "fail" });
  });
});

describe("purchaseSkin", () => {
  it("inserts skin purchase successfully", async () => {
    const chain = createMockChain({ data: null, error: null });
    supabase.from.mockReturnValue(chain);

    await purchaseSkin("u1", "s1");

    expect(supabase.from).toHaveBeenCalledWith("user_skins");
    expect(chain.insert).toHaveBeenCalledWith({
      user_id: "u1",
      skin_id: "s1",
      acquired_type: "purchase",
    });
  });

  it("throws duplicate error for code 23505", async () => {
    const chain = createMockChain({ data: null, error: { code: "23505", message: "dup" } });
    supabase.from.mockReturnValue(chain);

    await expect(purchaseSkin("u1", "s1")).rejects.toThrow();
  });

  it("throws original error for other codes", async () => {
    const dbError = { code: "42000", message: "db error" };
    const chain = createMockChain({ data: null, error: dbError });
    supabase.from.mockReturnValue(chain);

    await expect(purchaseSkin("u1", "s1")).rejects.toEqual(dbError);
  });
});

describe("setActiveSkin", () => {
  it("updates profile active skin successfully", async () => {
    const chain = createMockChain({ data: null, error: null });
    supabase.from.mockReturnValue(chain);

    await setActiveSkin("u1", "s1");

    expect(supabase.from).toHaveBeenCalledWith("profiles");
    expect(chain.update).toHaveBeenCalledWith({ active_skin_id: "s1" });
    expect(chain.eq).toHaveBeenCalledWith("id", "u1");
  });

  it("throws on error", async () => {
    const chain = createMockChain({ data: null, error: { message: "fail" } });
    supabase.from.mockReturnValue(chain);

    await expect(setActiveSkin("u1", "s1")).rejects.toEqual({ message: "fail" });
  });
});

describe("getActiveSkinSlug", () => {
  it("returns skin slug when profile has active skin", async () => {
    const chain = createMockChain({
      data: { active_skin_id: "s1", active_skin: { slug: "pixel-pager" } },
      error: null,
    });
    supabase.from.mockReturnValue(chain);

    const result = await getActiveSkinSlug("u1");

    expect(supabase.from).toHaveBeenCalledWith("profiles");
    expect(chain.single).toHaveBeenCalled();
    expect(result).toBe("pixel-pager");
  });

  it("returns swiss-paper when no active skin data", async () => {
    const chain = createMockChain({
      data: { active_skin_id: null, active_skin: null },
      error: null,
    });
    supabase.from.mockReturnValue(chain);

    await expect(getActiveSkinSlug("u1")).resolves.toBe("swiss-paper");
  });

  it("returns swiss-paper on error", async () => {
    const chain = createMockChain({ data: null, error: { message: "fail" } });
    supabase.from.mockReturnValue(chain);

    await expect(getActiveSkinSlug("u1")).resolves.toBe("swiss-paper");
  });
});
