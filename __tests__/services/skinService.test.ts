const { supabase, createMockChain } = require("@/lib/supabase");
import {
  getActiveSkinSlug,
  getActiveIdentityPackSlug,
  getAllSkins,
  getUserSkins,
  purchaseSkin,
  setActiveSkin,
  setActiveIdentityPack,
} from "@/services/skinService";

beforeEach(() => jest.clearAllMocks());

describe("getAllSkins", () => {
  it("returns all skins ordered by created_at", async () => {
    const skins = [
      { id: "s1", name: "Classic Paper", slug: "swiss-paper" },
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
    const userSkins = [{ id: "us1", user_id: "u1", skin: { id: "s1", name: "Classic Paper" } }];
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
    supabase.rpc.mockResolvedValue({ data: null, error: null });

    await setActiveSkin("u1", "s1");

    expect(supabase.rpc).toHaveBeenCalledWith("set_active_skin", { p_skin_id: "s1" });
  });

  it("throws on error", async () => {
    supabase.rpc.mockResolvedValue({ data: null, error: { message: "fail" } });

    await expect(setActiveSkin("u1", "s1")).rejects.toEqual({ message: "fail" });
  });

  it("documents the restricted profile write surface migration", () => {
    const source = require("fs").readFileSync(
      require("path").join(
        process.cwd(),
        "supabase/migrations/20260529113000_tighten_profile_update_surface.sql"
      ),
      "utf8"
    );

    expect(source).toContain("revoke update on table public.profiles from authenticated");
    expect(source).toContain("grant update (avatar_url) on table public.profiles to authenticated");
    expect(source).toContain("create or replace function public.set_active_skin");
    expect(source).toContain("where user_id = v_user_id");
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

describe("setActiveIdentityPack", () => {
  it("calls the entitlement-checking RPC with the pack slug", async () => {
    supabase.rpc.mockResolvedValue({ data: null, error: null });

    await setActiveIdentityPack("school-desk");

    expect(supabase.rpc).toHaveBeenCalledWith("set_active_identity_pack", {
      p_pack_slug: "school-desk",
    });
  });

  it("throws on error", async () => {
    supabase.rpc.mockResolvedValue({ data: null, error: { message: "fail" } });

    await expect(setActiveIdentityPack("school-desk")).rejects.toEqual({
      message: "fail",
    });
  });

  it("documents the active_identity_pack migration and entitlement check", () => {
    const source = require("fs").readFileSync(
      require("path").join(
        process.cwd(),
        "supabase/migrations/20260531140000_active_identity_pack.sql"
      ),
      "utf8"
    );

    expect(source).toContain("add column if not exists active_identity_pack text");
    expect(source).toContain("create or replace function public.set_active_identity_pack");
    expect(source).toContain("from public.identity_pack_entitlements e");
    expect(source).toContain("Identity pack not owned");
    expect(source).toContain("active_skin_id = coalesce(v_skin_id, active_skin_id)");
    expect(source).toContain(
      "grant execute on function public.set_active_identity_pack(text) to authenticated"
    );
  });

  it("documents the migration that drops the palette mirror but keeps the column", () => {
    const source = require("fs").readFileSync(
      require("path").join(
        process.cwd(),
        "supabase/migrations/20260531160000_drop_identity_palette_mirror.sql"
      ),
      "utf8"
    );

    expect(source).toContain("create or replace function public.set_active_identity_pack");
    // Mirror into active_skin_id is removed.
    expect(source).not.toContain("active_skin_id = coalesce(v_skin_id, active_skin_id)");
    expect(source).not.toContain("from public.skins");
    // The column itself must NOT be dropped (deferred to M4).
    expect(source).not.toContain("drop column");
    // Entitlement check, auth guard, and grant are preserved.
    expect(source).toContain("from public.identity_pack_entitlements e");
    expect(source).toContain("Identity pack not owned");
    expect(source).toContain("set active_identity_pack = p_pack_slug");
    expect(source).toContain(
      "grant execute on function public.set_active_identity_pack(text) to authenticated"
    );
  });
});

describe("getActiveIdentityPackSlug", () => {
  it("returns the stored active identity pack when present", async () => {
    const chain = createMockChain({
      data: { active_identity_pack: "night-signal", active_skin: { slug: "cyber-neon" } },
      error: null,
    });
    supabase.from.mockReturnValue(chain);

    const result = await getActiveIdentityPackSlug("u1");

    expect(supabase.from).toHaveBeenCalledWith("profiles");
    expect(result).toBe("night-signal");
  });

  it("derives the pack from the legacy palette skin when no pack is stored", async () => {
    const chain = createMockChain({
      data: { active_identity_pack: null, active_skin: { slug: "neumorphism" } },
      error: null,
    });
    supabase.from.mockReturnValue(chain);

    await expect(getActiveIdentityPackSlug("u1")).resolves.toBe("school-desk");
  });

  it("falls back to classic-paper on error", async () => {
    const chain = createMockChain({ data: null, error: { message: "fail" } });
    supabase.from.mockReturnValue(chain);

    await expect(getActiveIdentityPackSlug("u1")).resolves.toBe("classic-paper");
  });
});
