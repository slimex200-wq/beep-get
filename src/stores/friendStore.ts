import { create } from "zustand";
import {
  addFriend,
  findUserByBeepId,
  getFriends,
  getInboundFriends,
  markInboundFriendsSeen,
  removeFriend,
  updateFriendNickname,
  updateVibrationPattern,
  type InboundRelationshipRow,
} from "@/services/friendService";
import {
  isUiPreviewUser,
  uiPreviewFriends,
  uiPreviewInboundFriends,
} from "@/lib/uiPreview";
import { useAuthStore } from "@/stores/authStore";
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

type InboundFriend = InboundRelationshipRow;

interface FriendState {
  friends: Friend[];
  inboundFriends: InboundFriend[];
  loading: boolean;
  reset: () => void;
  fetch: (userId: string) => Promise<void>;
  fetchInbound: (userId: string) => Promise<void>;
  markInboundSeen: () => Promise<void>;
  unseenInboundCount: (inboundSeenAt?: string | null) => number;
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
  inboundFriends: [],
  loading: false,

  reset: () => set({ friends: [], inboundFriends: [], loading: false }),

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

  fetchInbound: async (userId) => {
    if (isUiPreviewUser(userId)) {
      set({ inboundFriends: uiPreviewInboundFriends });
      return;
    }
    const inboundFriends = await getInboundFriends(userId);
    set({ inboundFriends });
  },

  markInboundSeen: async () => {
    const profile = useAuthStore.getState().profile;
    const seenAt = new Date().toISOString();
    if (profile && isUiPreviewUser(profile.id)) {
      useAuthStore.setState({ profile: { ...profile, inbound_seen_at: seenAt } });
      return;
    }
    await markInboundFriendsSeen();
    if (profile) {
      useAuthStore.setState({ profile: { ...profile, inbound_seen_at: seenAt } });
    }
  },

  unseenInboundCount: (inboundSeenAt) => {
    const seenTime = inboundSeenAt ? new Date(inboundSeenAt).getTime() : null;
    return get().inboundFriends.reduce((count, inbound) => {
      if (seenTime === null) return count + 1;
      return new Date(inbound.created_at).getTime() > seenTime ? count + 1 : count;
    }, 0);
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
