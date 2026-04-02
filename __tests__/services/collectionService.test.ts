import {
  checkDropCondition,
  getRarityLabel,
  getRarityColor,
} from "@/services/collectionService";

describe("checkDropCondition", () => {
  const stats = { streakDays: 7, friendCount: 3, messagesSent: 50 };

  it("streak condition met", () => {
    expect(checkDropCondition({ type: "streak", days: 7 }, stats)).toBe(true);
  });

  it("streak condition not met", () => {
    expect(checkDropCondition({ type: "streak", days: 14 }, stats)).toBe(false);
  });

  it("friends condition met", () => {
    expect(checkDropCondition({ type: "friends", count: 3 }, stats)).toBe(true);
  });

  it("friends condition not met", () => {
    expect(checkDropCondition({ type: "friends", count: 10 }, stats)).toBe(false);
  });

  it("messages_sent condition met", () => {
    expect(checkDropCondition({ type: "messages_sent", count: 50 }, stats)).toBe(true);
  });

  it("messages_sent condition not met", () => {
    expect(checkDropCondition({ type: "messages_sent", count: 100 }, stats)).toBe(false);
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
    expect(getRarityColor("legendary")).toBe("#FFD600");
  });
});
