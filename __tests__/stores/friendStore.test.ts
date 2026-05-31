import { UI_PREVIEW_USER_ID, uiPreviewInboundFriends } from "@/lib/uiPreview";
import { useAuthStore } from "@/stores/authStore";
import { useFriendStore } from "@/stores/friendStore";

const { supabase } = require("@/lib/supabase");

const baseProfile = {
  id: "user-1",
  beep_id: "44444444",
  nickname: "Real",
  status_icon: "online",
  active_skin_id: null,
};

const previewProfile = {
  id: UI_PREVIEW_USER_ID,
  beep_id: "33333333",
  nickname: "Preview",
  status_icon: "online",
  active_skin_id: null,
};

beforeEach(() => {
  jest.clearAllMocks();
  useFriendStore.getState().reset();
  useAuthStore.setState({ session: null, user: null, profile: null, loading: false });
});

describe("friendStore inbound friends", () => {
  it("loads the preview inbound mock for the UI preview user", async () => {
    await useFriendStore.getState().fetchInbound(UI_PREVIEW_USER_ID);

    expect(useFriendStore.getState().inboundFriends).toEqual(uiPreviewInboundFriends);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("counts every inbound friend as unseen when inbound_seen_at is null", async () => {
    await useFriendStore.getState().fetchInbound(UI_PREVIEW_USER_ID);

    expect(useFriendStore.getState().unseenInboundCount(null)).toBe(
      uiPreviewInboundFriends.length,
    );
  });

  it("only counts inbound friends created after inbound_seen_at", () => {
    useFriendStore.setState({
      inboundFriends: [
        {
          id: "old",
          owner_id: "o1",
          friend_id: "user-1",
          created_at: "2026-05-30T00:00:00.000Z",
          owner: { id: "o1", beep_id: "11111111", nickname: "Old", status_icon: "online" },
        },
        {
          id: "new",
          owner_id: "o2",
          friend_id: "user-1",
          created_at: "2026-05-31T12:00:00.000Z",
          owner: { id: "o2", beep_id: "22222222", nickname: "New", status_icon: "online" },
        },
      ],
    });

    expect(
      useFriendStore.getState().unseenInboundCount("2026-05-31T00:00:00.000Z"),
    ).toBe(1);
  });

  it("marks inbound seen locally for the preview user without calling the rpc", async () => {
    useAuthStore.setState({ profile: previewProfile });
    await useFriendStore.getState().fetchInbound(UI_PREVIEW_USER_ID);

    expect(useFriendStore.getState().unseenInboundCount(null)).toBeGreaterThan(0);

    await useFriendStore.getState().markInboundSeen();

    const seenAt = useAuthStore.getState().profile?.inbound_seen_at ?? null;
    expect(seenAt).toEqual(expect.any(String));
    expect(supabase.rpc).not.toHaveBeenCalled();
    expect(useFriendStore.getState().unseenInboundCount(seenAt)).toBe(0);
  });

  it("calls the rpc and stamps inbound_seen_at for a real user", async () => {
    supabase.rpc.mockResolvedValue({ data: null, error: null });
    useAuthStore.setState({ profile: baseProfile });

    await useFriendStore.getState().markInboundSeen();

    expect(supabase.rpc).toHaveBeenCalledWith("mark_inbound_friends_seen");
    expect(useAuthStore.getState().profile?.inbound_seen_at).toEqual(expect.any(String));
  });
});
