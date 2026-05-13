import { useAuthStore } from "@/stores/authStore";

describe("authStore session/profile boundary", () => {
  beforeEach(() => {
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
});
