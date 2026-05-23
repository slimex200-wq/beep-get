import { create } from "zustand";
import {
  equipStatusIcon,
  getAllIcons,
  getUserIcons,
  grantIcon,
  type CollectionIcon,
  type UserCollectionIcon,
} from "@/services/collectionService";
import {
  isUiPreviewUser,
  uiPreviewIcons,
  uiPreviewOwnedIcons,
} from "@/lib/uiPreview";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";

interface CollectionState {
  allIcons: CollectionIcon[];
  ownedIcons: UserCollectionIcon[];
  ownedIconIds: Set<string>;
  loading: boolean;
  fetchAll: () => Promise<void>;
  fetchOwned: (userId: string) => Promise<void>;
  grant: (slug: string, userId?: string) => Promise<void>;
  equip: (slug: string) => Promise<void>;
  isOwned: (iconId: string) => boolean;
}

export const useCollectionStore = create<CollectionState>((set, get) => ({
  allIcons: [],
  ownedIcons: [],
  ownedIconIds: new Set(),
  loading: false,

  fetchAll: async () => {
    if (!isSupabaseConfigured) {
      set({ allIcons: uiPreviewIcons, loading: false });
      return;
    }
    set({ loading: true });
    const allIcons = await getAllIcons();
    set({ allIcons, loading: false });
  },

  fetchOwned: async (userId) => {
    if (isUiPreviewUser(userId)) {
      set({
        ownedIcons: uiPreviewOwnedIcons,
        ownedIconIds: new Set(uiPreviewOwnedIcons.map((ui) => ui.icon_id)),
      });
      return;
    }
    const ownedIcons = await getUserIcons(userId);
    set({ ownedIcons, ownedIconIds: new Set(ownedIcons.map((ui) => ui.icon_id)) });
  },

  grant: async (slug, userId) => {
    if (userId && isUiPreviewUser(userId)) {
      const icon = uiPreviewIcons.find((item) => item.slug === slug);
      if (icon) {
        set((state) => {
          const ownedIcons = [
            ...state.ownedIcons,
            {
              user_id: userId,
              icon_id: icon.id,
              acquired_at: new Date().toISOString(),
              icon,
            },
          ];
          return {
            ownedIcons,
            ownedIconIds: new Set(ownedIcons.map((ui) => ui.icon_id)),
          };
        });
      }
      return;
    }

    await grantIcon(slug);
    const currentUser = userId ?? useAuthStore.getState().user?.id;
    if (currentUser) {
      await get().fetchOwned(currentUser);
    }
  },

  equip: async (slug) => {
    const profile = await equipStatusIcon(slug);
    useAuthStore.setState({ profile });
  },

  isOwned: (iconId) => get().ownedIconIds.has(iconId),
}));
