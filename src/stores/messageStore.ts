import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import {
  type LegacyMessage,
  getReceivedMessages,
  getSavedMessages,
  markAsRead,
  saveMessage,
  sendMessage,
} from "@/services/messageService";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { syncWidgetData } from "@/services/widgetService";
import { isUiPreviewUser, uiPreviewMessages } from "@/lib/uiPreview";

type Message = LegacyMessage;

interface MessageState {
  received: Message[];
  saved: Message[];
  loading: boolean;
  channel: RealtimeChannel | null;
  fetchReceived: (userId: string, friends?: any[]) => Promise<void>;
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

  fetchReceived: async (userId, friends?) => {
    if (isUiPreviewUser(userId)) {
      set({ received: uiPreviewMessages, loading: false });
      syncWidgetData(uiPreviewMessages, friends ?? []);
      return;
    }
    set({ loading: true });
    const received = await getReceivedMessages(userId);
    set({ received, loading: false });
    syncWidgetData(received, friends ?? []);
  },

  fetchSaved: async (userId) => {
    if (isUiPreviewUser(userId)) {
      set({ saved: uiPreviewMessages.filter((message) => message.is_saved) });
      return;
    }
    const saved = await getSavedMessages(userId);
    set({ saved });
  },

  send: async (fromId, toId, code, memo) => {
    if (isUiPreviewUser(fromId)) {
      const message = {
        id: `preview-sent-${Date.now()}`,
        from_user: fromId,
        to_user: toId,
        number_code: code,
        memo: memo ?? null,
        is_read: true,
        is_saved: false,
        expires_at: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
        created_at: new Date().toISOString(),
        from_user_profile: { nickname: "YOU", beep_id: "48624862" },
      };
      set((state) => ({ saved: [message, ...state.saved] }));
      return;
    }
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
    if (isUiPreviewUser(userId)) return;
    const channel = supabase
      .channel(`signals:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "signals",
          filter: `receiver_id=eq.${userId}`,
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
