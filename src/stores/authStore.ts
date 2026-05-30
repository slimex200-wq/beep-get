import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { createUserProfile, getUserProfile, updateProfileAvatar } from "@/services/authService";
import type { UserProfile } from "@/services/authService";
import type { Session, User } from "@supabase/supabase-js";
import {
  createUiPreviewSession,
  isUiPreviewUser,
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
  initProfile: (nickname: string, avatarUrl?: string) => Promise<string>;
  updateAvatar: (avatarUrl: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  loading: true,

  setSession: (session) => {
    const nextUser = session?.user ?? null;
    const currentProfile = get().profile;
    const shouldKeepProfile = Boolean(
      nextUser && currentProfile && currentProfile.id === nextUser.id
    );

    set({
      session,
      user: nextUser,
      profile: shouldKeepProfile ? currentProfile : null,
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

  initProfile: async (nickname: string, avatarUrl?: string) => {
    const user = get().user;
    if (!user) throw new Error("Not authenticated");
    const profile = await createUserProfile(user.id, nickname);
    const trimmedAvatarUrl = avatarUrl?.trim();
    set({ profile });

    if (!trimmedAvatarUrl || profile.avatar_url === trimmedAvatarUrl) {
      return profile.beep_id;
    }

    const nextProfile = await updateProfileAvatar(trimmedAvatarUrl);
    set({ profile: nextProfile });
    return nextProfile.beep_id;
  },

  updateAvatar: async (avatarUrl) => {
    const profile = get().profile;
    if (!profile) throw new Error("Profile not found");

    if (isUiPreviewUser(profile.id)) {
      set({ profile: { ...profile, avatar_url: avatarUrl } });
      return;
    }

    const nextProfile = await updateProfileAvatar(avatarUrl);
    set({ profile: nextProfile });
  },
}));
