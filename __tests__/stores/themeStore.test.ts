import * as SecureStore from "expo-secure-store";
import {
  THEME_PREFERENCE_STORAGE_KEY,
  useThemeStore,
} from "@/stores/themeStore";

const mockGetItem = SecureStore.getItemAsync as jest.Mock;
const mockSetItem = SecureStore.setItemAsync as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockGetItem.mockReset();
  mockSetItem.mockReset();
  mockSetItem.mockResolvedValue(undefined);
  // The store has no reset() (the theme preference is a device-level setting that
  // persists across logout/account switch). Restore the initial state directly
  // for test isolation.
  useThemeStore.setState({ themePreference: "system", hydrated: false });
});

describe("themeStore", () => {
  it("defaults to the system preference and unhydrated", () => {
    const state = useThemeStore.getState();
    expect(state.themePreference).toBe("system");
    expect(state.hydrated).toBe(false);
  });

  it("does not expose a reset() (theme preference is device-level, persists across logout)", () => {
    expect(
      (useThemeStore.getState() as unknown as Record<string, unknown>).reset,
    ).toBeUndefined();
  });

  it("hydrate loads a persisted preference", async () => {
    mockGetItem.mockResolvedValue("dark");

    await useThemeStore.getState().hydrate();

    expect(mockGetItem).toHaveBeenCalledWith(THEME_PREFERENCE_STORAGE_KEY);
    const state = useThemeStore.getState();
    expect(state.themePreference).toBe("dark");
    expect(state.hydrated).toBe(true);
  });

  it("hydrate ignores an invalid stored value and keeps the default", async () => {
    mockGetItem.mockResolvedValue("solar-flare");

    await useThemeStore.getState().hydrate();

    const state = useThemeStore.getState();
    expect(state.themePreference).toBe("system");
    expect(state.hydrated).toBe(true);
  });

  it("hydrate stays on the default when nothing is stored", async () => {
    mockGetItem.mockResolvedValue(null);

    await useThemeStore.getState().hydrate();

    expect(useThemeStore.getState().themePreference).toBe("system");
    expect(useThemeStore.getState().hydrated).toBe(true);
  });

  it("hydrate is a no-op once already hydrated", async () => {
    mockGetItem.mockResolvedValue("light");
    await useThemeStore.getState().hydrate();
    mockGetItem.mockClear();

    await useThemeStore.getState().hydrate();

    expect(mockGetItem).not.toHaveBeenCalled();
  });

  it("hydrate survives a storage read failure", async () => {
    mockGetItem.mockRejectedValue(new Error("secure store unavailable"));

    await expect(useThemeStore.getState().hydrate()).resolves.toBeUndefined();

    const state = useThemeStore.getState();
    expect(state.themePreference).toBe("system");
    expect(state.hydrated).toBe(true);
  });

  it("setThemePreference updates state and persists the value", async () => {
    await useThemeStore.getState().setThemePreference("dark");

    expect(useThemeStore.getState().themePreference).toBe("dark");
    expect(mockSetItem).toHaveBeenCalledWith(THEME_PREFERENCE_STORAGE_KEY, "dark");
  });

  it("setThemePreference keeps the chosen value even if persistence fails", async () => {
    mockSetItem.mockRejectedValue(new Error("disk full"));

    await expect(
      useThemeStore.getState().setThemePreference("light"),
    ).resolves.toBeUndefined();

    expect(useThemeStore.getState().themePreference).toBe("light");
  });
});
