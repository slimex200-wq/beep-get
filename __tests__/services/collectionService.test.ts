const { supabase, createMockChain } = require("@/lib/supabase");
import {
  checkDropCondition,
  getRarityLabel,
  getRarityColor,
  getAllIcons,
  getUserIcons,
  grantIcon,
} from "@/services/collectionService";

beforeEach(() => jest.clearAllMocks());

describe("checkDropCondition", () => {
  const stats = { streakDays: 7, friendCount: 3, messagesSent: 50 };

  it("streak condition met", () => {
    expect(checkDropCondition({ type: "streak", days: 7 }, stats)).toBe(true);
  });

  it("streak condition not met", () => {
    expect(checkDropCondition({ type: "streak", days: 14 }, stats)).toBe(false);
  });

  it("streak defaults to 0 when days undefined", () => {
    expect(checkDropCondition({ type: "streak" }, stats)).toBe(true);
  });

  it("friends condition met", () => {
    expect(checkDropCondition({ type: "friends", count: 3 }, stats)).toBe(true);
  });

  it("friends condition not met", () => {
    expect(checkDropCondition({ type: "friends", count: 10 }, stats)).toBe(false);
  });

  it("friends defaults to 0 when count undefined", () => {
    expect(checkDropCondition({ type: "friends" }, stats)).toBe(true);
  });

  it("messages_sent condition met", () => {
    expect(checkDropCondition({ type: "messages_sent", count: 50 }, stats)).toBe(true);
  });

  it("messages_sent condition not met", () => {
    expect(checkDropCondition({ type: "messages_sent", count: 100 }, stats)).toBe(false);
  });

  it("unknown type returns false", () => {
    expect(checkDropCondition({ type: "unknown" as any }, stats)).toBe(false);
  });
});

describe("getRarityLabel", () => {
  it("returns Korean label", () => {
    expect(getRarityLabel("common")).toBe("커먼");
    expect(getRarityLabel("rare")).toBe("레어");
    expect(getRarityLabel("epic")).toBe("에픽");
    expect(getRarityLabel("legendary")).toBe("레전더리");
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

describe("getAllIcons", () => {
  it("returns all icons ordered by rarity", async () => {
    const icons = [
      { id: "i1", name: "Star", rarity: "common" },
      { id: "i2", name: "Moon", rarity: "rare" },
    ];
    const chain = createMockChain({ data: icons, error: null });
    supabase.from.mockReturnValue(chain);

    const result = await getAllIcons();
    expect(supabase.from).toHaveBeenCalledWith("icons");
    expect(chain.select).toHaveBeenCalledWith("*");
    expect(result).toEqual(icons);
  });

  it("returns empty array when data is null", async () => {
    const chain = createMockChain({ data: null, error: null });
    supabase.from.mockReturnValue(chain);

    const result = await getAllIcons();
    expect(result).toEqual([]);
  });

  it("throws on error", async () => {
    const chain = createMockChain({ data: null, error: { message: "fail" } });
    supabase.from.mockReturnValue(chain);

    await expect(getAllIcons()).rejects.toEqual({ message: "fail" });
  });
});

describe("getUserIcons", () => {
  it("returns user icons with icon details", async () => {
    const userIcons = [
      { id: "ui1", user_id: "u1", icon: { id: "i1", name: "Star" } },
    ];
    const chain = createMockChain({ data: userIcons, error: null });
    supabase.from.mockReturnValue(chain);

    const result = await getUserIcons("u1");
    expect(supabase.from).toHaveBeenCalledWith("user_icons");
    expect(chain.eq).toHaveBeenCalledWith("user_id", "u1");
    expect(result).toEqual(userIcons);
  });

  it("returns empty array when data is null", async () => {
    const chain = createMockChain({ data: null, error: null });
    supabase.from.mockReturnValue(chain);

    const result = await getUserIcons("u1");
    expect(result).toEqual([]);
  });

  it("throws on error", async () => {
    const chain = createMockChain({ data: null, error: { message: "fail" } });
    supabase.from.mockReturnValue(chain);

    await expect(getUserIcons("u1")).rejects.toEqual({ message: "fail" });
  });
});

describe("grantIcon", () => {
  it("inserts icon grant successfully", async () => {
    const chain = createMockChain({ data: null, error: null });
    supabase.from.mockReturnValue(chain);

    await grantIcon("u1", "i1");
    expect(supabase.from).toHaveBeenCalledWith("user_icons");
    expect(chain.insert).toHaveBeenCalledWith({
      user_id: "u1",
      icon_id: "i1",
    });
  });

  it("silently ignores duplicate (23505)", async () => {
    const chain = createMockChain({ data: null, error: { code: "23505", message: "dup" } });
    supabase.from.mockReturnValue(chain);

    await expect(grantIcon("u1", "i1")).resolves.toBeUndefined();
  });

  it("throws on other errors", async () => {
    const dbError = { code: "42000", message: "db error" };
    const chain = createMockChain({ data: null, error: dbError });
    supabase.from.mockReturnValue(chain);

    await expect(grantIcon("u1", "i1")).rejects.toEqual(dbError);
  });
});
