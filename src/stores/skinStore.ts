import { create } from "zustand";
import {
  getAllSkins,
  getUserSkins,
  purchaseSkin,
  setActiveSkin,
  getActiveSkinSlug,
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
import {
  DEFAULT_IDENTITY_PACK_SLUG,
  getSkinSlugForIdentity,
} from "@/design/identityPacks";

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
  activeIdentityPackSlug: string;
  loading: boolean;
  reset: () => void;
  fetchAll: () => Promise<void>;
  fetchOwned: (userId: string) => Promise<void>;
  fetchActiveSkin: (userId: string) => Promise<void>;
  fetchActiveIdentityPack: (userId: string) => Promise<void>;
  purchase: (userId: string, skinId: string) => Promise<void>;
  apply: (userId: string, skinId: string, slug: string) => Promise<void>;
  applyIdentityPack: (userId: string, packSlug: string) => Promise<void>;
  setLocalActiveSkin: (slug: string) => void;
  setLocalActiveIdentityPack: (packSlug: string) => void;
}

export const useSkinStore = create<SkinState>((set, get) => ({
  allSkins: [],
  ownedSkins: [],
  activeSkinSlug: "swiss-paper",
  activeIdentityPackSlug: DEFAULT_IDENTITY_PACK_SLUG,
  loading: false,

  reset: () =>
    set({
      allSkins: [],
      ownedSkins: [],
      activeSkinSlug: "swiss-paper",
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

  setLocalActiveSkin: (slug) => {
    set({ activeSkinSlug: slug });
    triggerWidgetReload();
  },

  setLocalActiveIdentityPack: (packSlug) => {
    set({
      activeIdentityPackSlug: packSlug,
      activeSkinSlug: getSkinSlugForIdentity(packSlug),
    });
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

  fetchActiveSkin: async (userId) => {
    if (isUiPreviewUser(userId)) {
      set({ activeSkinSlug: "swiss-paper" });
      return;
    }
    const slug = await getActiveSkinSlug(userId);
    set({ activeSkinSlug: slug });
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

  applyIdentityPack: async (userId, packSlug) => {
    const skinSlug = getSkinSlugForIdentity(packSlug);
    if (isUiPreviewUser(userId)) {
      set({ activeIdentityPackSlug: packSlug, activeSkinSlug: skinSlug });
      triggerWidgetReload();
      return;
    }
    await setActiveIdentityPack(packSlug);
    // The RPC also mirrors the matching palette skin into active_skin_id; mirror
    // the same derive locally so useAppPalette() updates without a refetch.
    set({ activeIdentityPackSlug: packSlug, activeSkinSlug: skinSlug });
    triggerWidgetReload();
  },
}));
