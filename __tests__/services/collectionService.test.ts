import {
  checkDropCondition,
  getAllIcons,
  getRarityColor,
  getRarityLabel,
  getUserIcons,
  grantIcon,
} from "@/services/collectionService";

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

describe("v2 collection compatibility", () => {
  it("returns no production icons while icon collections are not in the v2 schema", async () => {
    await expect(getAllIcons()).resolves.toEqual([]);
    await expect(getUserIcons("u1")).resolves.toEqual([]);
  });

  it("keeps icon grants as a no-op until the rewards schema returns", async () => {
    await expect(grantIcon("u1", "i1")).resolves.toBeUndefined();
  });
});
