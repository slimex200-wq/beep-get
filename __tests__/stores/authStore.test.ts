import { useAuthStore } from "@/stores/authStore";

const { createMockChain, supabase } = require("@/lib/supabase");

describe("authStore session/profile boundary", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({
      session: null,
      user: null,
      profile: null,
      loading: true,
    });
  });

  it("clears a stale profile when a different user session is set", () => {
    useAuthStore.setState({
      profile: {
        id: "old-user",
        beep_id: "11111111",
        nickname: "Old",
        status_icon: "online",
        active_skin_id: null,
      },
    });

    useAuthStore.getState().setSession({
      user: { id: "new-user" },
    } as any);

    expect(useAuthStore.getState().profile).toBeNull();
    expect(useAuthStore.getState().user?.id).toBe("new-user");
  });

  it("keeps the profile when the same user session refreshes", () => {
    useAuthStore.setState({
      profile: {
        id: "same-user",
        beep_id: "22222222",
        nickname: "Same",
        status_icon: "online",
        active_skin_id: null,
      },
    });

    useAuthStore.getState().setSession({
      user: { id: "same-user" },
    } as any);

    expect(useAuthStore.getState().profile?.nickname).toBe("Same");
  });

  it("updates the preview avatar locally", async () => {
    useAuthStore.setState({
      profile: {
        id: "ui-preview-user",
        beep_id: "33333333",
        nickname: "Preview",
        status_icon: "online",
        active_skin_id: null,
      },
    });

    await useAuthStore.getState().updateAvatar("preview-avatar-uri");

    expect(useAuthStore.getState().profile?.avatar_url).toBe("preview-avatar-uri");
  });

  it("persists the selected avatar during profile initialization", async () => {
    const createdProfile = {
      id: "user-1",
      beep_id: "44444444",
      nickname: "New",
      status_icon: "online",
      active_skin_id: null,
      avatar_url: null,
    };
    const updatedProfile = {
      ...createdProfile,
      avatar_url: "selected-avatar-uri",
    };

    supabase.rpc.mockResolvedValue({ data: createdProfile, error: null });
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
    supabase.from.mockReturnValue(createMockChain({ data: updatedProfile, error: null }));
    useAuthStore.setState({
      session: { user: { id: "user-1" } } as any,
      user: { id: "user-1" } as any,
    });

    const beepId = await useAuthStore
      .getState()
      .initProfile("New", " selected-avatar-uri ");

    const updateChain = supabase.from.mock.results[0].value;
    expect(beepId).toBe("44444444");
    expect(supabase.rpc).toHaveBeenCalledWith("create_profile", {
      p_nickname: "New",
      p_beep_id: expect.any(String),
    });
    expect(updateChain.update).toHaveBeenCalledWith({
      avatar_url: "selected-avatar-uri",
    });
    expect(useAuthStore.getState().profile?.avatar_url).toBe("selected-avatar-uri");
  });
});
