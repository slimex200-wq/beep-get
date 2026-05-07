import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { createUserProfile, getUserProfile } from "@/services/authService";
import type { UserProfile } from "@/services/authService";
import type { Session, User } from "@supabase/supabase-js";
import {
  createUiPreviewSession,
  uiPreviewFriends,
  uiPreviewMessages,
  uiPreviewProfile,
} from "@/lib/uiPreview";
import { syncWidgetData } from "@/services/widgetService";

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  setSession: (session: Session | null) => void;
  enterPreviewMode: () => void;
  fetchProfile: () => Promise<void>;
  initProfile: (nickname: string) => Promise<string>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  loading: true,

  setSession: (session) => {
    set({
      session,
      user: session?.user ?? null,
      profile: session ? get().profile : null,
      loading: false,
    });
  },

  enterPreviewMode: () => {
    const session = createUiPreviewSession();
    syncWidgetData(uiPreviewMessages, uiPreviewFriends);
    set({
      session,
      user: session.user,
      profile: uiPreviewProfile,
      loading: false,
    });
  },

  fetchProfile: async () => {
    const user = get().user;
    if (!user) return;
    try {
      const profile = await getUserProfile(user.id);
      set({ profile });
    } catch {
      set({ profile: null });
    }
  },

  initProfile: async (nickname: string) => {
    const user = get().user;
    if (!user) throw new Error("Not authenticated");
    const profile = await createUserProfile(user.id, nickname);
    set({ profile });
    return profile.beep_id;
  },
}));
