import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { setMyStatus, getMyStatus, getFriendStatuses } from "@/services/statusService";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface StatusBroadcast {
  user_id: string;
  status_icon: string;
  label: string | null;
  updated_at: string;
}

interface StatusState {
  myStatus: StatusBroadcast | null;
  friendStatuses: Map<string, StatusBroadcast>;
  channel: RealtimeChannel | null;
  setStatus: (userId: string, icon: string, label?: string) => Promise<void>;
  fetchMyStatus: (userId: string) => Promise<void>;
  fetchFriendStatuses: (friendIds: string[]) => Promise<void>;
  subscribeRealtime: () => void;
  unsubscribeRealtime: () => void;
}

export const useStatusStore = create<StatusState>((set, get) => ({
  myStatus: null,
  friendStatuses: new Map(),
  channel: null,

  setStatus: async (userId, icon, label) => {
    await setMyStatus(userId, icon, label);
    set({
      myStatus: {
        user_id: userId,
        status_icon: icon,
        label: label ?? null,
        updated_at: new Date().toISOString(),
      },
    });
  },

  fetchMyStatus: async (userId) => {
    const status = await getMyStatus(userId);
    set({ myStatus: status });
  },

  fetchFriendStatuses: async (friendIds) => {
    const statuses = await getFriendStatuses(friendIds);
    const map = new Map<string, StatusBroadcast>();
    for (const s of statuses) {
      map.set(s.user_id, s);
    }
    set({ friendStatuses: map });
  },

  subscribeRealtime: () => {
    const channel = supabase
      .channel("status_broadcasts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "status_broadcasts" },
        (payload) => {
          const updated = payload.new as StatusBroadcast;
          if (updated) {
            set((state) => {
              const map = new Map(state.friendStatuses);
              map.set(updated.user_id, updated);
              return { friendStatuses: map };
            });
          }
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
