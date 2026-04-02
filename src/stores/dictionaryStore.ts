import { create } from "zustand";
import {
  addEntry,
  deleteEntry,
  getDictionary,
  updateEntry,
} from "@/services/dictionaryService";

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
  fetch: (userId: string) => Promise<void>;
  add: (userId: string, code: string, meaning: string) => Promise<void>;
  update: (entryId: string, code: string, meaning: string) => Promise<void>;
  remove: (entryId: string) => Promise<void>;
}

export const useDictionaryStore = create<DictionaryState>((set, get) => ({
  entries: [],
  loading: false,

  fetch: async (userId) => {
    set({ loading: true });
    const entries = await getDictionary(userId);
    set({ entries, loading: false });
  },

  add: async (userId, code, meaning) => {
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
