const { supabase } = require("@/lib/supabase");
import { readFileSync } from "fs";
import path from "path";
import {
  checkDropCondition,
  equipStatusIcon,
  getAllIcons,
  getRarityColor,
  getRarityLabel,
  getUserIcons,
  grantIcon,
} from "@/services/collectionService";

beforeEach(() => jest.clearAllMocks());

describe("checkDropCondition", () => {
  const stats = { streakDays: 7, friendCount: 3, messagesSent: 50 };

  it("handles streak conditions", () => {
    expect(checkDropCondition({ type: "streak", days: 7 }, stats)).toBe(true);
    expect(checkDropCondition({ type: "streak", days: 14 }, stats)).toBe(false);
    expect(checkDropCondition({ type: "streak" }, stats)).toBe(true);
  });

  it("handles friends conditions", () => {
    expect(checkDropCondition({ type: "friends", count: 3 }, stats)).toBe(true);
    expect(checkDropCondition({ type: "friends", count: 10 }, stats)).toBe(false);
    expect(checkDropCondition({ type: "friends" }, stats)).toBe(true);
  });

  it("handles messages_sent conditions", () => {
    expect(checkDropCondition({ type: "messages_sent", count: 50 }, stats)).toBe(true);
    expect(checkDropCondition({ type: "messages_sent", count: 100 }, stats)).toBe(false);
  });

  it("unknown type returns false", () => {
    expect(checkDropCondition({ type: "unknown" as any }, stats)).toBe(false);
  });
});

describe("getRarityLabel", () => {
  it("returns label values", () => {
    expect(getRarityLabel("common")).toBeTruthy();
    expect(getRarityLabel("rare")).toBeTruthy();
    expect(getRarityLabel("epic")).toBeTruthy();
    expect(getRarityLabel("legendary")).toBeTruthy();
  });

  it("returns original for unknown", () => {
    expect(getRarityLabel("unknown")).toBe("unknown");
  });
});

describe("getRarityColor", () => {
  it("returns color for each rarity", () => {
    expect(getRarityColor("common")).toBe("#8A8A9A");
    expect(getRarityColor("rare")).toBe("#4A90D9");
    expect(getRarityColor("epic")).toBe("#A855F7");
    expect(getRarityColor("legendary")).toBe("#FFD600");
  });

  it("returns default color for unknown", () => {
    expect(getRarityColor("unknown")).toBe("#8A8A9A");
  });
});

describe("collection RPC layer", () => {
  it("returns icons catalog from the v2 schema", async () => {
    const row = {
      id: "icon-1",
      slug: "online",
      name: "Online",
      image_url: null,
      rarity: "common",
      drop_condition: null,
      is_default: true,
      status_icon_value: "online",
    };
    const order2 = jest.fn().mockResolvedValue({ data: [row], error: null });
    const order1 = jest.fn().mockReturnValue({ order: order2 });
    const select = jest.fn().mockReturnValue({ order: order1 });
    supabase.from.mockReturnValueOnce({ select });

    const result = await getAllIcons();

    expect(supabase.from).toHaveBeenCalledWith("icons");
    expect(result).toEqual([
      {
        id: "icon-1",
        slug: "online",
        name: "Online",
        image_url: null,
        rarity: "common",
        drop_condition: null,
        is_default: true,
        status_icon_value: "online",
      },
    ]);
  });

  it("joins user_icons with the icon row", async () => {
    const eq = jest.fn().mockResolvedValue({
      data: [
        {
          user_id: "u1",
          icon_id: "icon-1",
          acquired_at: "2026-05-24T00:00:00Z",
          icon: {
            id: "icon-1",
            slug: "online",
            name: "Online",
            image_url: null,
            rarity: "common",
            drop_condition: null,
            is_default: true,
            status_icon_value: "online",
          },
        },
      ],
      error: null,
    });
    const select = jest.fn().mockReturnValue({ eq });
    supabase.from.mockReturnValueOnce({ select });

    const result = await getUserIcons("u1");

    expect(supabase.from).toHaveBeenCalledWith("user_icons");
    expect(eq).toHaveBeenCalledWith("user_id", "u1");
    expect(result[0].icon.slug).toBe("online");
  });

  it("calls grant_icon RPC with the slug", async () => {
    supabase.rpc.mockResolvedValue({ data: null, error: null });

    await grantIcon("streak-3");

    expect(supabase.rpc).toHaveBeenCalledWith("grant_icon", { p_slug: "streak-3" });
  });

  it("surfaces grant_icon RPC errors", async () => {
    const err = { code: "42501", message: "Streak not met: 1 < 3" };
    supabase.rpc.mockResolvedValue({ data: null, error: err });

    await expect(grantIcon("streak-3")).rejects.toEqual(err);
  });

  it("equips a status icon through the equip_status_icon RPC", async () => {
    const updated = {
      id: "u1",
      beep_id: "12345678",
      nickname: "Mina",
      status_icon: "focus",
      active_skin_id: null,
    };
    supabase.rpc.mockResolvedValue({ data: updated, error: null });

    const result = await equipStatusIcon("focus");

    expect(supabase.rpc).toHaveBeenCalledWith("equip_status_icon", { p_slug: "focus" });
    expect(result.status_icon).toBe("focus");
  });

  it("surfaces equip_status_icon RPC errors", async () => {
    const err = { code: "42501", message: "Icon not owned: streak-3" };
    supabase.rpc.mockResolvedValue({ data: null, error: err });

    await expect(equipStatusIcon("streak-3")).rejects.toEqual(err);
  });
});

describe("collection table grants", () => {
  it("keeps icon Data API tables reachable only to authenticated users and service_role", () => {
    const migration = readFileSync(
      path.join(process.cwd(), "supabase/migrations/20260527150000_grant_icons_table_access.sql"),
      "utf8",
    ).toLowerCase();
    const sourceMigration = readFileSync(
      path.join(process.cwd(), "supabase/migrations/20260524100000_icons_collection.sql"),
      "utf8",
    ).toLowerCase();

    expect(migration).toContain("grant select on table public.icons to authenticated");
    expect(migration).toContain("grant select on table public.user_icons to authenticated");
    expect(migration).toContain("grant all privileges on table public.icons to service_role");
    expect(migration).toContain("grant all privileges on table public.user_icons to service_role");
    expect(migration).toContain("revoke all privileges on table public.icons from anon");
    expect(migration).toContain("revoke all privileges on table public.user_icons from anon");
    expect(migration).not.toMatch(/grant\s+.+\s+to\s+anon/);
    expect(sourceMigration).toContain("grant execute on function public.grant_icon(text) to authenticated");
    expect(sourceMigration).toContain("grant execute on function public.equip_status_icon(text) to authenticated");
  });
});
