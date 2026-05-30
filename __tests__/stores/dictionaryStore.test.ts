import { UI_PREVIEW_USER_ID } from "@/lib/uiPreview";
import { useDictionaryStore } from "@/stores/dictionaryStore";

describe("dictionaryStore preview quick replies", () => {
  beforeEach(() => {
    useDictionaryStore.getState().reset();
  });

  it("keeps preview quick reply slots editable across preview fetches", async () => {
    const store = useDictionaryStore.getState();

    await store.fetch(UI_PREVIEW_USER_ID);
    await store.add(UI_PREVIEW_USER_ID, "Done", "Quick reply slot 1", {
      isWidgetSlot: true,
      sortOrder: 1,
    });

    const slot = useDictionaryStore
      .getState()
      .entries.find((entry) => entry.meaning === "Quick reply slot 1");

    expect(slot?.code).toBe("Done");

    await useDictionaryStore.getState().update(slot!.id, "View", "Quick reply slot 1", {
      isWidgetSlot: true,
      sortOrder: 1,
    });
    await useDictionaryStore.getState().fetch(UI_PREVIEW_USER_ID);

    expect(
      useDictionaryStore
        .getState()
        .entries.find((entry) => entry.meaning === "Quick reply slot 1"),
    ).toMatchObject({
      code: "View",
      is_widget_slot: true,
      sort_order: 1,
    });
  });
});
