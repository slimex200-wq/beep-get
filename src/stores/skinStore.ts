import { create } from "zustand";
import {
  getAllSkins,
  getUserSkins,
  purchaseSkin,
  setActiveSkin,
  getActiveSkinSlug,
} from "@/services/skinService";
import { triggerWidgetReload } from "@/services/widgetService";

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
    const allSkins = await getAllSkins();
    set({ allSkins });
  },

  fetchOwned: async (userId) => {
    const ownedSkins = await getUserSkins(userId);
    set({ ownedSkins });
  },

  fetchActiveSkin: async (userId) => {
    const slug = await getActiveSkinSlug(userId);
    set({ activeSkinSlug: slug });
  },

  purchase: async (userId, skinId) => {
    await purchaseSkin(userId, skinId);
    await get().fetchOwned(userId);
  },

  apply: async (userId, skinId, slug) => {
    await setActiveSkin(userId, skinId);
    set({ activeSkinSlug: slug });
    triggerWidgetReload();
  },
}));
