import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import {
  type LegacyMessage,
  getReceivedMessages,
  getMessageById,
  getSavedMessages,
  markAsRead,
  saveMessage,
  sendQuickReplyToMessage,
  sendMessage,
} from "@/services/messageService";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { syncWidgetData } from "@/services/widgetService";
import { isUiPreviewUser, uiPreviewMessages } from "@/lib/uiPreview";
import { buildQuickReplyActionKey } from "@/lib/widgetActions";
import {
  buildDemoBlinkMessage,
  buildDemoWelcomeMessage,
  DEMO_BLINK_SIGNAL_ID,
  DEMO_WELCOME_SIGNAL_ID,
  isDemoSignal,
} from "@/lib/demoFriend";
import { useFriendStore } from "./friendStore";

type Message = LegacyMessage;

interface MessageState {
  received: Message[];
  saved: Message[];
  loading: boolean;
  channel: RealtimeChannel | null;
  quickReplyActionKeys: string[];
  fetchReceived: (userId: string, friends?: any[]) => Promise<void>;
  fetchSaved: (userId: string) => Promise<void>;
  send: (fromId: string, toId: string, code: string, memo?: string) => Promise<void>;
  quickReply: (messageId: string, code: string) => Promise<void>;
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
  quickReplyActionKeys: [],

  fetchReceived: async (userId, friends?) => {
    if (isUiPreviewUser(userId)) {
      set({ received: uiPreviewMessages, loading: false });
      syncWidgetData(uiPreviewMessages, friends ?? []);
      return;
    }
    set({ loading: true });
    const remote = await getReceivedMessages(userId);
    const previous = get().received;
    const localBlink = previous.find((m) => m.id === DEMO_BLINK_SIGNAL_ID);
    const localBeep = previous.find((m) => m.id === DEMO_WELCOME_SIGNAL_ID);
    const demoBlink = localBlink ?? buildDemoBlinkMessage(userId);
    const demoBeep = localBeep ?? buildDemoWelcomeMessage(userId);
    // Blink first so the widget's latestMessage shows the 3-frame strip demo.
    const received = [demoBlink as Message, demoBeep as Message, ...remote];
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

  quickReply: async (messageId, code) => {
    let sourceMessage =
      get().received.find((m) => m.id === messageId) ??
      uiPreviewMessages.find((m) => m.id === messageId);
    if (!sourceMessage) {
      sourceMessage = await getMessageById(messageId);
      set((state) => ({
        received: state.received.some((m) => m.id === sourceMessage!.id)
          ? state.received
          : [sourceMessage!, ...state.received],
      }));
    }
    if (!sourceMessage) throw new Error("Signal is not available for quick reply");

    if (isDemoSignal(messageId)) {
      set((state) => ({
        received: state.received.map((m) =>
          m.id === messageId ? { ...m, is_read: true } : m
        ),
      }));
      syncWidgetData(get().received, useFriendStore.getState().friends);
      return;
    }

    const actionKey = buildQuickReplyActionKey(messageId, code);
    if (get().quickReplyActionKeys.includes(actionKey)) return;

    set((state) => ({
      quickReplyActionKeys: [...state.quickReplyActionKeys, actionKey],
    }));

    try {
      if (isUiPreviewUser(sourceMessage.to_user)) {
        const sentAt = new Date().toISOString();
        const previewReply = {
          id: `preview-${actionKey}`,
          from_user: sourceMessage.to_user,
          to_user: sourceMessage.from_user,
          number_code: code,
          memo: null,
          is_read: true,
          is_saved: false,
          expires_at: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
          created_at: sentAt,
          from_user_profile: { nickname: "YOU", beep_id: "48624862" },
        };
        set((state) => ({
          received: state.received.map((m) =>
            m.id === messageId ? { ...m, is_read: true } : m
          ),
          saved: state.saved.some((m) => m.id === previewReply.id)
            ? state.saved
            : [previewReply, ...state.saved],
        }));
        return;
      }

      await sendQuickReplyToMessage(sourceMessage.to_user, sourceMessage, code);
      await markAsRead(messageId);
      set((state) => ({
        received: state.received.map((m) =>
          m.id === messageId ? { ...m, is_read: true } : m
        ),
      }));
    } catch (error) {
      set((state) => ({
        quickReplyActionKeys: state.quickReplyActionKeys.filter((key) => key !== actionKey),
      }));
      throw error;
    }
  },

  read: async (messageId) => {
    const msg = get().received.find((m) => m.id === messageId);
    if (isDemoSignal(messageId) || (msg && isUiPreviewUser(msg.to_user))) {
      set((state) => ({
        received: state.received.map((m) =>
          m.id === messageId ? { ...m, is_read: true } : m
        ),
      }));
      syncWidgetData(get().received, useFriendStore.getState().friends);
      return;
    }

    await markAsRead(messageId);
    set((state) => ({
      received: state.received.map((m) =>
        m.id === messageId ? { ...m, is_read: true } : m
      ),
    }));
    syncWidgetData(get().received, useFriendStore.getState().friends);
  },

  save: async (messageId) => {
    const msg = get().received.find((m) => m.id === messageId);
    if (isDemoSignal(messageId) || (msg && isUiPreviewUser(msg.to_user))) {
      const target = msg ?? { ...buildDemoWelcomeMessage(""), is_saved: true };
      set((state) => ({
        received: state.received.map((m) =>
          m.id === messageId ? { ...m, is_saved: true } : m
        ),
        saved: state.saved.some((m) => m.id === messageId)
          ? state.saved
          : [{ ...target, is_saved: true }, ...state.saved],
      }));
      syncWidgetData(get().received, useFriendStore.getState().friends);
      return;
    }

    await saveMessage(messageId);
    if (msg) {
      set((state) => ({
        received: state.received.map((m) =>
          m.id === messageId ? { ...m, is_saved: true } : m
        ),
        saved: [{ ...msg, is_saved: true }, ...state.saved],
      }));
      syncWidgetData(get().received, useFriendStore.getState().friends);
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
