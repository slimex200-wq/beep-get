import { create } from "zustand";
import {
  addEntry,
  deleteEntry,
  getDictionary,
  type DictionaryEntry,
  type DictionaryEntryOptions,
  updateEntry,
} from "@/services/dictionaryService";
import { isUiPreviewUser, uiPreviewDictionary } from "@/lib/uiPreview";

let previewDictionaryEntries: DictionaryEntry[] = [...uiPreviewDictionary];
let previewEntryCounter = 0;

interface DictionaryState {
  entries: DictionaryEntry[];
  loading: boolean;
  reset: () => void;
  fetch: (userId: string) => Promise<void>;
  add: (
    userId: string,
    code: string,
    meaning: string,
    options?: DictionaryEntryOptions,
  ) => Promise<void>;
  update: (
    entryId: string,
    code: string,
    meaning: string,
    options?: DictionaryEntryOptions,
  ) => Promise<void>;
  remove: (entryId: string) => Promise<void>;
}

export const useDictionaryStore = create<DictionaryState>((set, get) => ({
  entries: [],
  loading: false,

  reset: () => {
    previewDictionaryEntries = [...uiPreviewDictionary];
    previewEntryCounter = 0;
    set({ entries: [], loading: false });
  },

  fetch: async (userId) => {
    if (isUiPreviewUser(userId)) {
      set({ entries: previewDictionaryEntries, loading: false });
      return;
    }
    set({ loading: true });
    const entries = await getDictionary(userId);
    set({ entries, loading: false });
  },

  add: async (userId, code, meaning, options = {}) => {
    if (isUiPreviewUser(userId)) {
      const entry = {
        id: `preview-code-${Date.now()}-${previewEntryCounter++}`,
        user_id: userId,
        code,
        meaning,
        created_at: new Date().toISOString(),
        sort_order: options.sortOrder ?? 0,
        is_widget_slot: options.isWidgetSlot ?? false,
      };
      previewDictionaryEntries = [entry, ...previewDictionaryEntries];
      set({ entries: previewDictionaryEntries });
      return;
    }
    const entry = await addEntry(userId, code, meaning, options);
    set((state) => ({ entries: [entry, ...state.entries] }));
  },

  update: async (entryId, code, meaning, options = {}) => {
    const previewEntry = get().entries.find((entry) => entry.id === entryId);
    if (previewEntry && isUiPreviewUser(previewEntry.user_id)) {
      previewDictionaryEntries = previewDictionaryEntries.map((entry) =>
        entry.id === entryId
          ? {
              ...entry,
              code,
              meaning,
              sort_order: options.sortOrder ?? entry.sort_order,
              is_widget_slot: options.isWidgetSlot ?? entry.is_widget_slot,
            }
          : entry,
      );
      set({ entries: previewDictionaryEntries });
      return;
    }

    await updateEntry(entryId, code, meaning, options);
    set((state) => ({
      entries: state.entries.map((e) =>
        e.id === entryId
          ? {
              ...e,
              code,
              meaning,
              sort_order: options.sortOrder ?? e.sort_order,
              is_widget_slot: options.isWidgetSlot ?? e.is_widget_slot,
            }
          : e
      ),
    }));
  },

  remove: async (entryId) => {
    const previewEntry = get().entries.find((entry) => entry.id === entryId);
    if (previewEntry && isUiPreviewUser(previewEntry.user_id)) {
      previewDictionaryEntries = previewDictionaryEntries.filter((entry) => entry.id !== entryId);
      set({ entries: previewDictionaryEntries });
      return;
    }

    await deleteEntry(entryId);
    set((state) => ({
      entries: state.entries.filter((e) => e.id !== entryId),
    }));
  },
}));
