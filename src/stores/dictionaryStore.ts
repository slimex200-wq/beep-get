import { create } from "zustand";
import {
  addEntry,
  deleteEntry,
  getDictionary,
  updateEntry,
} from "@/services/dictionaryService";
import { isUiPreviewUser, uiPreviewDictionary } from "@/lib/uiPreview";

interface DictionaryEntry {
  id: string;
  user_id: string;
  code: string;
  meaning: string;
  created_at: string;
}

interface DictionaryState {
  entries: DictionaryEntry[];
  loading: boolean;
  reset: () => void;
  fetch: (userId: string) => Promise<void>;
  add: (userId: string, code: string, meaning: string) => Promise<void>;
  update: (entryId: string, code: string, meaning: string) => Promise<void>;
  remove: (entryId: string) => Promise<void>;
}

export const useDictionaryStore = create<DictionaryState>((set, get) => ({
  entries: [],
  loading: false,

  reset: () => set({ entries: [], loading: false }),

  fetch: async (userId) => {
    if (isUiPreviewUser(userId)) {
      set({ entries: uiPreviewDictionary, loading: false });
      return;
    }
    set({ loading: true });
    const entries = await getDictionary(userId);
    set({ entries, loading: false });
  },

  add: async (userId, code, meaning) => {
    if (isUiPreviewUser(userId)) {
      const entry = {
        id: `preview-code-${Date.now()}`,
        user_id: userId,
        code,
        meaning,
        created_at: new Date().toISOString(),
      };
      set((state) => ({ entries: [entry, ...state.entries] }));
      return;
    }
    const entry = await addEntry(userId, code, meaning);
    set((state) => ({ entries: [entry, ...state.entries] }));
  },

  update: async (entryId, code, meaning) => {
    await updateEntry(entryId, code, meaning);
    set((state) => ({
      entries: state.entries.map((e) =>
        e.id === entryId ? { ...e, code, meaning } : e
      ),
    }));
  },

  remove: async (entryId) => {
    await deleteEntry(entryId);
    set((state) => ({
      entries: state.entries.filter((e) => e.id !== entryId),
    }));
  },
}));
