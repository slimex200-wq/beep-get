import {
  buildQuickReplySlots,
  getConfiguredQuickReplyEntries,
  isQuickReplySlotEntry,
} from "@/lib/quickReplySlots";

describe("quickReplySlots", () => {
  it("uses configured widget slots in saved order before defaults", () => {
    const entries = [
      {
        code: "1004",
        meaning: "집 도착",
        sort_order: 0,
        is_widget_slot: false,
      },
      {
        code: "집중중 🔕",
        meaning: "Quick reply slot 3",
        sort_order: 3,
        is_widget_slot: true,
      },
      {
        code: "Done",
        meaning: "Quick reply slot 1",
        sort_order: 1,
        is_widget_slot: true,
      },
      {
        code: "8282",
        meaning: "Quick reply slot 2",
        sort_order: 2,
        is_widget_slot: true,
      },
    ];

    expect(buildQuickReplySlots(entries)).toEqual(["Done", "8282", "집중중 🔕"]);
  });

  it("keeps legacy slot labels working before rows have widget metadata", () => {
    const entries = [
      {
        code: "486",
        meaning: "Quick reply slot 2",
        sort_order: 0,
        is_widget_slot: false,
      },
    ];

    expect(isQuickReplySlotEntry(entries[0])).toBe(true);
    expect(getConfiguredQuickReplyEntries(entries).map((entry) => entry.code)).toEqual(["486"]);
  });
});
