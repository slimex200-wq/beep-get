import { create } from "zustand";
import {
  addFriend,
  findUserByBeepId,
  getFriends,
  removeFriend,
  updateFriendNickname,
  updateVibrationPattern,
} from "@/services/friendService";

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
  fetch: (userId: string) => Promise<void>;
  add: (userId: string, friendBeepId: string, nickname?: string) => Promise<void>;
  remove: (userId: string, friendId: string) => Promise<void>;
  updateNickname: (userId: string, friendId: string, nickname: string) => Promise<void>;
  updateVibration: (userId: string, friendId: string, pattern: string) => Promise<void>;
}

export const useFriendStore = create<FriendState>((set, get) => ({
  friends: [],
  loading: false,

  fetch: async (userId) => {
    set({ loading: true });
    const friends = await getFriends(userId);
    set({ friends, loading: false });
  },

  add: async (userId, friendBeepId, nickname) => {
    const found = await findUserByBeepId(friendBeepId);
    if (!found) throw new Error("존재하지 않는 삐삐 번호입니다");
    await addFriend(userId, found.id, nickname);
    await get().fetch(userId);
  },

  remove: async (userId, friendId) => {
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
