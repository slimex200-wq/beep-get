import { create } from "zustand";
import {
  getAllSkins,
  getUserSkins,
  purchaseSkin,
  setActiveIdentityPack,
  getActiveIdentityPackSlug,
} from "@/services/skinService";
import { triggerWidgetReload } from "@/services/widgetService";
import {
  isUiPreviewUser,
  uiPreviewOwnedSkins,
  uiPreviewSkins,
} from "@/lib/uiPreview";
import { isSupabaseConfigured } from "@/lib/supabase";
import { DEFAULT_IDENTITY_PACK_SLUG } from "@/design/identityPacks";

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
  activeIdentityPackSlug: string;
  loading: boolean;
  reset: () => void;
  fetchAll: () => Promise<void>;
  fetchOwned: (userId: string) => Promise<void>;
  fetchActiveIdentityPack: (userId: string) => Promise<void>;
  purchase: (userId: string, skinId: string) => Promise<void>;
  applyIdentityPack: (userId: string, packSlug: string) => Promise<void>;
  setLocalActiveIdentityPack: (packSlug: string) => void;
}

export const useSkinStore = create<SkinState>((set, get) => ({
  allSkins: [],
  ownedSkins: [],
  activeIdentityPackSlug: DEFAULT_IDENTITY_PACK_SLUG,
  loading: false,

  reset: () =>
    set({
      allSkins: [],
      ownedSkins: [],
      activeIdentityPackSlug: DEFAULT_IDENTITY_PACK_SLUG,
      loading: false,
    }),

  fetchAll: async () => {
    if (!isSupabaseConfigured) {
      set({ allSkins: uiPreviewSkins });
      return;
    }
    const allSkins = await getAllSkins();
    set({ allSkins });
  },

  setLocalActiveIdentityPack: (packSlug) => {
    set({ activeIdentityPackSlug: packSlug });
    triggerWidgetReload();
  },

  fetchOwned: async (userId) => {
    if (isUiPreviewUser(userId)) {
      set({ ownedSkins: uiPreviewOwnedSkins });
      return;
    }
    const ownedSkins = await getUserSkins(userId);
    set({ ownedSkins });
  },

  fetchActiveIdentityPack: async (userId) => {
    if (isUiPreviewUser(userId)) {
      set({ activeIdentityPackSlug: DEFAULT_IDENTITY_PACK_SLUG });
      return;
    }
    const packSlug = await getActiveIdentityPackSlug(userId);
    set({ activeIdentityPackSlug: packSlug });
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

  applyIdentityPack: async (userId, packSlug) => {
    if (isUiPreviewUser(userId)) {
      set({ activeIdentityPackSlug: packSlug });
      triggerWidgetReload();
      return;
    }
    await setActiveIdentityPack(packSlug);
    set({ activeIdentityPackSlug: packSlug });
    triggerWidgetReload();
  },
}));
