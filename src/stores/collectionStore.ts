import { create } from "zustand";
import { getAllIcons, getUserIcons, grantIcon } from "@/services/collectionService";

interface Icon {
  id: string;
  name: string;
  image_url: string;
  rarity: string;
  drop_condition: any;
  season_id: string | null;
}

interface UserIcon {
  id: string;
  user_id: string;
  icon_id: string;
  acquired_at: string;
  icon: Icon;
}

interface CollectionState {
  allIcons: Icon[];
  ownedIcons: UserIcon[];
  ownedIconIds: Set<string>;
  loading: boolean;
  fetchAll: () => Promise<void>;
  fetchOwned: (userId: string) => Promise<void>;
  grant: (userId: string, iconId: string) => Promise<void>;
  isOwned: (iconId: string) => boolean;
}

export const useCollectionStore = create<CollectionState>((set, get) => ({
  allIcons: [],
  ownedIcons: [],
  ownedIconIds: new Set(),
  loading: false,

  fetchAll: async () => {
    set({ loading: true });
    const allIcons = await getAllIcons();
    set({ allIcons, loading: false });
  },

  fetchOwned: async (userId) => {
    const ownedIcons = await getUserIcons(userId);
    set({ ownedIcons, ownedIconIds: new Set(ownedIcons.map((ui) => ui.icon_id)) });
  },

  grant: async (userId, iconId) => {
    await grantIcon(userId, iconId);
    await get().fetchOwned(userId);
  },

  isOwned: (iconId) => {
    return get().ownedIconIds.has(iconId);
  },
}));
