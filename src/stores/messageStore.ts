import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import {
  getReceivedMessages,
  getSavedMessages,
  markAsRead,
  saveMessage,
  sendMessage,
} from "@/services/messageService";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { syncWidgetData } from "@/services/widgetService";
import { useFriendStore } from "@/stores/friendStore";

interface Message {
  id: string;
  from_user: string;
  to_user: string;
  number_code: string;
  memo: string | null;
  is_read: boolean;
  is_saved: boolean;
  expires_at: string;
  created_at: string;
  from_user_profile?: { nickname: string; beep_id: string };
}

interface MessageState {
  received: Message[];
  saved: Message[];
  loading: boolean;
  channel: RealtimeChannel | null;
  fetchReceived: (userId: string) => Promise<void>;
  fetchSaved: (userId: string) => Promise<void>;
  send: (fromId: string, toId: string, code: string, memo?: string) => Promise<void>;
  read: (messageId: string) => Promise<void>;
  save: (messageId: string) => Promise<void>;
  subscribeRealtime: (userId: string) => void;
  unsubscribeRealtime: () => void;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  received: [],
  saved: [],
  loading: false,
  channel: null,

  fetchReceived: async (userId) => {
    set({ loading: true });
    const received = await getReceivedMessages(userId);
    set({ received, loading: false });
    syncWidgetData(received, useFriendStore.getState().friends);
  },

  fetchSaved: async (userId) => {
    const saved = await getSavedMessages(userId);
    set({ saved });
  },

  send: async (fromId, toId, code, memo) => {
    await sendMessage(fromId, toId, code, memo);
  },

  read: async (messageId) => {
    await markAsRead(messageId);
    set((state) => ({
      received: state.received.map((m) =>
        m.id === messageId ? { ...m, is_read: true } : m
      ),
    }));
  },

  save: async (messageId) => {
    await saveMessage(messageId);
    const msg = get().received.find((m) => m.id === messageId);
    if (msg) {
      set((state) => ({
        received: state.received.map((m) =>
          m.id === messageId ? { ...m, is_saved: true } : m
        ),
        saved: [{ ...msg, is_saved: true }, ...state.saved],
      }));
    }
  },

  subscribeRealtime: (userId) => {
    const channel = supabase
      .channel(`messages:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `to_user=eq.${userId}`,
        },
        async () => {
          await get().fetchReceived(userId);
        }
      )
      .subscribe();
    set({ channel });
  },

  unsubscribeRealtime: () => {
    const { channel } = get();
    if (channel) {
      supabase.removeChannel(channel);
      set({ channel: null });
    }
  },
}));
