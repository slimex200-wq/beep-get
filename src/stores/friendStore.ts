import { create } from "zustand";
import {
  addFriend,
  findUserByBeepId,
  getFriends,
  removeFriend,
  updateFriendNickname,
  updateVibrationPattern,
} from "@/services/friendService";
import { isUiPreviewUser, uiPreviewFriends } from "@/lib/uiPreview";
import { buildDemoFriend, DEMO_FRIEND_ID, isDemoFriend } from "@/lib/demoFriend";

interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  nickname: string | null;
  vibration_pattern: string | null;
  friend: {
    id: string;
    beep_id: string;
    nickname: string;
    status_icon: string;
  };
}

interface FriendState {
  friends: Friend[];
  loading: boolean;
  reset: () => void;
  fetch: (userId: string) => Promise<void>;
  add: (
    userId: string,
    friendBeepId: string,
    nickname?: string,
    relationshipPreset?: string
  ) => Promise<void>;
  remove: (userId: string, friendId: string) => Promise<void>;
  updateNickname: (userId: string, friendId: string, nickname: string) => Promise<void>;
  updateVibration: (userId: string, friendId: string, pattern: string) => Promise<void>;
}

export const useFriendStore = create<FriendState>((set, get) => ({
  friends: [],
  loading: false,

  reset: () => set({ friends: [], loading: false }),

  fetch: async (userId) => {
    if (isUiPreviewUser(userId)) {
      set({ friends: uiPreviewFriends, loading: false });
      return;
    }
    set({ loading: true });
    const remote = await getFriends(userId);
    const friends = [buildDemoFriend(userId), ...remote];
    set({ friends, loading: false });
  },

  add: async (userId, friendBeepId, nickname, relationshipPreset) => {
    if (isUiPreviewUser(userId)) {
      const friend = {
        id: `preview-friendship-${Date.now()}`,
        user_id: userId,
        friend_id: `preview-friend-${friendBeepId}`,
        nickname: nickname ?? null,
        vibration_pattern: relationshipPreset ?? "CLOSE FRIEND",
        friend: {
          id: `preview-friend-${friendBeepId}`,
          beep_id: friendBeepId,
          nickname: nickname || "New friend",
          status_icon: "online",
        },
      };
      set((state) => ({ friends: [friend, ...state.friends] }));
      return;
    }
    const found = await findUserByBeepId(friendBeepId);
    if (!found) throw new Error("존재하지 않는 삐삐 번호입니다");
    await addFriend(userId, found.id, nickname, relationshipPreset);
    await get().fetch(userId);
  },

  remove: async (userId, friendId) => {
    if (isDemoFriend(friendId)) {
      set((state) => ({
        friends: state.friends.filter((f) => f.friend_id !== friendId),
      }));
      return;
    }
    await removeFriend(userId, friendId);
    set((state) => ({
      friends: state.friends.filter((f) => f.friend_id !== friendId),
    }));
  },

  updateNickname: async (userId, friendId, nickname) => {
    await updateFriendNickname(userId, friendId, nickname);
    set((state) => ({
      friends: state.friends.map((f) =>
        f.friend_id === friendId ? { ...f, nickname } : f
      ),
    }));
  },

  updateVibration: async (userId, friendId, pattern) => {
    await updateVibrationPattern(userId, friendId, pattern);
    set((state) => ({
      friends: state.friends.map((f) =>
        f.friend_id === friendId ? { ...f, vibration_pattern: pattern } : f
      ),
    }));
  },
}));
