describe("Supabase client configuration", () => {
  const originalEnv = process.env;
  const originalLocalStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      EXPO_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      EXPO_PUBLIC_SUPABASE_ANON_KEY: "test-anon-key",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
    jest.dontMock("@supabase/supabase-js");
    jest.dontMock("react-native");
    if (originalLocalStorage) {
      Object.defineProperty(globalThis, "localStorage", originalLocalStorage);
    } else {
      Reflect.deleteProperty(globalThis, "localStorage");
    }
  });

  it("uses PKCE because mobile OAuth callbacks exchange auth codes", () => {
    const createClient = jest.fn(() => ({ auth: {} }));
    jest.doMock("@supabase/supabase-js", () => ({ createClient }));

    require("../../src/lib/supabase");

    expect(createClient).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "test-anon-key",
      expect.objectContaining({
        auth: expect.objectContaining({
          detectSessionInUrl: false,
          flowType: "pkce",
          persistSession: true,
        }),
      }),
    );
  });

  it("chunks large auth session values before writing to SecureStore", async () => {
    const store = new Map<string, string>();
    const { Platform } = require("react-native");
    jest.replaceProperty(Platform, "OS", "ios");
    const SecureStore = require("expo-secure-store");
    SecureStore.getItemAsync.mockImplementation(async (key: string) => store.get(key) ?? null);
    SecureStore.setItemAsync.mockImplementation(async (key: string, value: string) => {
      store.set(key, value);
    });
    SecureStore.deleteItemAsync.mockImplementation(async (key: string) => {
      store.delete(key);
    });

    const createClient = jest.fn(() => ({ auth: {} }));
    jest.doMock("@supabase/supabase-js", () => ({ createClient }));

    require("../../src/lib/supabase");

    const storage = (createClient as jest.Mock).mock.calls[0][2].auth.storage;
    const sessionValue = "x".repeat(4500);

    await storage.setItem("session", sessionValue);

    expect(store.get("session")).toMatch(/^__beepget_chunked_v1__:3$/);
    expect(store.get("session.__chunk.0")).toHaveLength(1800);
    expect(store.get("session.__chunk.1")).toHaveLength(1800);
    expect(store.get("session.__chunk.2")).toHaveLength(900);
    await expect(storage.getItem("session")).resolves.toBe(sessionValue);

    await storage.removeItem("session");

    expect(store.size).toBe(0);
  });

  it("uses web storage instead of SecureStore on web previews", async () => {
    const store = new Map<string, string>();
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => store.set(key, value),
        removeItem: (key: string) => store.delete(key),
      },
    });

    const { Platform } = require("react-native");
    jest.replaceProperty(Platform, "OS", "web");
    const SecureStore = require("expo-secure-store");
    SecureStore.getItemAsync.mockImplementation(() => {
      throw new Error("SecureStore should not be used on web");
    });
    SecureStore.setItemAsync.mockImplementation(() => {
      throw new Error("SecureStore should not be used on web");
    });
    SecureStore.deleteItemAsync.mockImplementation(() => {
      throw new Error("SecureStore should not be used on web");
    });

    const createClient = jest.fn(() => ({ auth: {} }));
    jest.doMock("@supabase/supabase-js", () => ({ createClient }));

    require("../../src/lib/supabase");

    const storage = (createClient as jest.Mock).mock.calls[0][2].auth.storage;
    await storage.setItem("session", "web-session");

    expect(store.get("session")).toBe("web-session");
    await expect(storage.getItem("session")).resolves.toBe("web-session");

    await storage.removeItem("session");

    expect(store.has("session")).toBe(false);
  });
});
