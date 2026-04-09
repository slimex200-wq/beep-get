const { supabase, createMockChain } = require("@/lib/supabase");
import {
  getCurrentSeason,
  getSeasonIcons,
  getSeasonSkins,
} from "@/services/seasonService";

beforeEach(() => jest.clearAllMocks());

describe("getCurrentSeason", () => {
  it("returns current season when found", async () => {
    const season = { id: "s1", name: "Spring", starts_at: "2026-03-01", ends_at: "2026-06-01" };
    const chain = createMockChain({ data: season, error: null });
    supabase.from.mockReturnValue(chain);

    const result = await getCurrentSeason();
    expect(supabase.from).toHaveBeenCalledWith("seasons");
    expect(chain.select).toHaveBeenCalledWith("*");
    expect(chain.single).toHaveBeenCalled();
    expect(result).toEqual(season);
  });

  it("returns null on error", async () => {
    const chain = createMockChain({ data: null, error: { message: "not found" } });
    supabase.from.mockReturnValue(chain);

    const result = await getCurrentSeason();
    expect(result).toBeNull();
  });

  it("returns null when no season matches", async () => {
    const chain = createMockChain({ data: null, error: { code: "PGRST116", message: "no rows" } });
    supabase.from.mockReturnValue(chain);

    const result = await getCurrentSeason();
    expect(result).toBeNull();
  });
});

describe("getSeasonIcons", () => {
  it("returns icons for season", async () => {
    const icons = [
      { id: "i1", name: "Star", season_id: "s1", rarity: "common" },
      { id: "i2", name: "Moon", season_id: "s1", rarity: "rare" },
    ];
    const chain = createMockChain({ data: icons, error: null });
    supabase.from.mockReturnValue(chain);

    const result = await getSeasonIcons("s1");
    expect(supabase.from).toHaveBeenCalledWith("icons");
    expect(chain.eq).toHaveBeenCalledWith("season_id", "s1");
    expect(result).toEqual(icons);
  });

  it("returns empty array when data is null", async () => {
    const chain = createMockChain({ data: null, error: null });
    supabase.from.mockReturnValue(chain);

    const result = await getSeasonIcons("s1");
    expect(result).toEqual([]);
  });

  it("throws on error", async () => {
    const chain = createMockChain({ data: null, error: { message: "fail" } });
    supabase.from.mockReturnValue(chain);

    await expect(getSeasonIcons("s1")).rejects.toEqual({ message: "fail" });
  });
});

describe("getSeasonSkins", () => {
  it("returns skins for season", async () => {
    const skins = [{ id: "sk1", name: "Neon", season_id: "s1" }];
    const chain = createMockChain({ data: skins, error: null });
    supabase.from.mockReturnValue(chain);

    const result = await getSeasonSkins("s1");
    expect(supabase.from).toHaveBeenCalledWith("skins");
    expect(chain.eq).toHaveBeenCalledWith("season_id", "s1");
    expect(result).toEqual(skins);
  });

  it("returns empty array when data is null", async () => {
    const chain = createMockChain({ data: null, error: null });
    supabase.from.mockReturnValue(chain);

    const result = await getSeasonSkins("s1");
    expect(result).toEqual([]);
  });

  it("throws on error", async () => {
    const chain = createMockChain({ data: null, error: { message: "fail" } });
    supabase.from.mockReturnValue(chain);

    await expect(getSeasonSkins("s1")).rejects.toEqual({ message: "fail" });
  });
});
