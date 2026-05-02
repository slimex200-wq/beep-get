import { create } from "zustand";
import {
  getAllSkins,
  getUserSkins,
  purchaseSkin,
  setActiveSkin,
  getActiveSkinSlug,
} from "@/services/skinService";
import { triggerWidgetReload } from "@/services/widgetService";
import {
  isUiPreviewUser,
  uiPreviewOwnedSkins,
  uiPreviewSkins,
} from "@/lib/uiPreview";
import { isSupabaseConfigured } from "@/lib/supabase";

interface Skin {
  id: string;
  name: string;
  slug: string;
  category: string;
  assets_url: string;
  is_free: boolean;
  price_tier: string | null;
}

interface UserSkin {
  id: string;
  user_id: string;
  skin_id: string;
  acquired_type: string;
  skin: Skin;
}

interface SkinState {
  allSkins: Skin[];
  ownedSkins: UserSkin[];
  activeSkinSlug: string;
  loading: boolean;
  fetchAll: () => Promise<void>;
  fetchOwned: (userId: string) => Promise<void>;
  fetchActiveSkin: (userId: string) => Promise<void>;
  purchase: (userId: string, skinId: string) => Promise<void>;
  apply: (userId: string, skinId: string, slug: string) => Promise<void>;
}

export const useSkinStore = create<SkinState>((set, get) => ({
  allSkins: [],
  ownedSkins: [],
  activeSkinSlug: "neumorphism",
  loading: false,

  fetchAll: async () => {
    if (!isSupabaseConfigured) {
      set({ allSkins: uiPreviewSkins });
      return;
    }
    const allSkins = await getAllSkins();
    set({ allSkins });
  },

  fetchOwned: async (userId) => {
    if (isUiPreviewUser(userId)) {
      set({ ownedSkins: uiPreviewOwnedSkins });
      return;
    }
    const ownedSkins = await getUserSkins(userId);
    set({ ownedSkins });
  },

  fetchActiveSkin: async (userId) => {
    if (isUiPreviewUser(userId)) {
      set({ activeSkinSlug: "neumorphism" });
      return;
    }
    const slug = await getActiveSkinSlug(userId);
    set({ activeSkinSlug: slug });
  },

  purchase: async (userId, skinId) => {
    if (isUiPreviewUser(userId)) {
      const skin = uiPreviewSkins.find((item) => item.id === skinId);
      if (skin) {
        set((state) => ({
          ownedSkins: [
            ...state.ownedSkins,
            {
              id: `owned-${skinId}`,
              user_id: userId,
              skin_id: skinId,
              acquired_type: "preview",
              skin,
            },
          ],
        }));
      }
      return;
    }
    await purchaseSkin(userId, skinId);
    await get().fetchOwned(userId);
  },

  apply: async (userId, skinId, slug) => {
    if (isUiPreviewUser(userId)) {
      set({ activeSkinSlug: slug });
      triggerWidgetReload();
      return;
    }
    await setActiveSkin(userId, skinId);
    set({ activeSkinSlug: slug });
    triggerWidgetReload();
  },
}));
