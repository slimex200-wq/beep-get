import { UI_PREVIEW_USER_ID } from "@/lib/uiPreview";
import { useSkinStore } from "@/stores/skinStore";

const { supabase, createMockChain } = require("@/lib/supabase");

beforeEach(() => {
  jest.clearAllMocks();
  useSkinStore.getState().reset();
});

describe("skinStore identity pack state", () => {
  it("defaults the active identity pack to classic-paper", () => {
    expect(useSkinStore.getState().activeIdentityPackSlug).toBe("classic-paper");
  });

  it("setLocalActiveIdentityPack derives the matching palette skin", () => {
    useSkinStore.getState().setLocalActiveIdentityPack("night-signal");

    const state = useSkinStore.getState();
    expect(state.activeIdentityPackSlug).toBe("night-signal");
    // Palette must follow the identity pack so useAppPalette() keeps rendering.
    expect(state.activeSkinSlug).toBe("cyber-neon");
  });

  it("applyIdentityPack calls the RPC and mirrors the palette skin locally", async () => {
    supabase.rpc.mockResolvedValue({ data: null, error: null });

    await useSkinStore.getState().applyIdentityPack("user-1", "school-desk");

    expect(supabase.rpc).toHaveBeenCalledWith("set_active_identity_pack", {
      p_pack_slug: "school-desk",
    });
    const state = useSkinStore.getState();
    expect(state.activeIdentityPackSlug).toBe("school-desk");
    expect(state.activeSkinSlug).toBe("neumorphism");
  });

  it("applyIdentityPack stays local for the UI preview user", async () => {
    await useSkinStore.getState().applyIdentityPack(UI_PREVIEW_USER_ID, "cherry-dot");

    expect(supabase.rpc).not.toHaveBeenCalled();
    const state = useSkinStore.getState();
    expect(state.activeIdentityPackSlug).toBe("cherry-dot");
    expect(state.activeSkinSlug).toBe("glassmorphism");
  });

  it("fetchActiveIdentityPack reads the stored pack from the profile", async () => {
    const chain = createMockChain({
      data: { active_identity_pack: "photo-booth-blink", active_skin: { slug: "retro-future" } },
      error: null,
    });
    supabase.from.mockReturnValue(chain);

    await useSkinStore.getState().fetchActiveIdentityPack("user-1");

    expect(useSkinStore.getState().activeIdentityPackSlug).toBe("photo-booth-blink");
  });

  it("fetchActiveIdentityPack returns the default pack for the UI preview user", async () => {
    await useSkinStore.getState().fetchActiveIdentityPack(UI_PREVIEW_USER_ID);

    expect(supabase.from).not.toHaveBeenCalled();
    expect(useSkinStore.getState().activeIdentityPackSlug).toBe("classic-paper");
  });

  it("reset restores the default identity pack", () => {
    useSkinStore.getState().setLocalActiveIdentityPack("night-signal");
    useSkinStore.getState().reset();

    expect(useSkinStore.getState().activeIdentityPackSlug).toBe("classic-paper");
  });
});
