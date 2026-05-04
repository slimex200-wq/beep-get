const { supabase, createMockChain } = require("@/lib/supabase");
const Linking = require("expo-linking");
import {
  createUserProfile,
  exchangeOAuthCodeFromUrl,
  generateBeepId,
  getUserProfile,
  isValidBeepId,
  signInWithApple,
  signInWithGoogle,
  signOut,
} from "@/services/authService";

jest.mock("expo-linking", () => ({
  createURL: jest.fn(() => "beepget://auth/callback"),
  openURL: jest.fn().mockResolvedValue(true),
  parse: jest.fn((url: string) => {
    const query = url.split("?")[1] ?? "";
    const params = new URLSearchParams(query);
    return {
      queryParams: Object.fromEntries(params.entries()),
    };
  }),
}));

beforeEach(() => jest.clearAllMocks());

describe("generateBeepId", () => {
  it("generates an 8-digit numeric string", () => {
    const id = generateBeepId();
    expect(id).toHaveLength(8);
    expect(/^\d{8}$/.test(id)).toBe(true);
  });

  it("does not start with 0", () => {
    for (let i = 0; i < 100; i++) {
      expect(generateBeepId()[0]).not.toBe("0");
    }
  });
});

describe("isValidBeepId", () => {
  it("returns true for valid 8-digit string", () => {
    expect(isValidBeepId("12345678")).toBe(true);
  });

  it("returns false for invalid ids", () => {
    expect(isValidBeepId("1234567")).toBe(false);
    expect(isValidBeepId("1234567a")).toBe(false);
    expect(isValidBeepId("")).toBe(false);
  });
});

describe("signInWithGoogle", () => {
  it("calls signInWithOAuth and returns data", async () => {
    const mockData = { url: "https://google.com/auth" };
    supabase.auth.signInWithOAuth.mockResolvedValue({ data: mockData, error: null });

    await expect(signInWithGoogle()).resolves.toEqual(mockData);
    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: {
        redirectTo: "beepget://auth/callback",
        skipBrowserRedirect: true,
      },
    });
    expect(Linking.openURL).toHaveBeenCalledWith("https://google.com/auth");
  });

  it("throws on error", async () => {
    const err = { message: "oauth failed" };
    supabase.auth.signInWithOAuth.mockResolvedValue({ data: null, error: err });

    await expect(signInWithGoogle()).rejects.toEqual(err);
  });
});

describe("signInWithApple", () => {
  it("calls signInWithOAuth and returns data", async () => {
    const mockData = { url: "https://appleid.apple.com/auth" };
    supabase.auth.signInWithOAuth.mockResolvedValue({ data: mockData, error: null });

    await expect(signInWithApple()).resolves.toEqual(mockData);
    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: "apple",
      options: {
        redirectTo: "beepget://auth/callback",
        skipBrowserRedirect: true,
      },
    });
    expect(Linking.openURL).toHaveBeenCalledWith("https://appleid.apple.com/auth");
  });

  it("throws on error", async () => {
    const err = { message: "apple sign in failed" };
    supabase.auth.signInWithOAuth.mockResolvedValue({ data: null, error: err });

    await expect(signInWithApple()).rejects.toEqual(err);
  });
});

describe("exchangeOAuthCodeFromUrl", () => {
  it("exchanges a PKCE callback code for a session", async () => {
    await expect(exchangeOAuthCodeFromUrl("beepget://auth/callback?code=abc")).resolves.toBe(true);

    expect(supabase.auth.exchangeCodeForSession).toHaveBeenCalledWith("abc");
  });

  it("ignores non-auth callback URLs", async () => {
    await expect(exchangeOAuthCodeFromUrl("beepget://reply/signal-1")).resolves.toBe(false);

    expect(supabase.auth.exchangeCodeForSession).not.toHaveBeenCalled();
  });
});

describe("createUserProfile", () => {
  it("creates profile through the v2 RPC and returns beep_id", async () => {
    supabase.rpc.mockResolvedValue({
      data: { id: "u1", beep_id: "12345678", nickname: "nick" },
      error: null,
    });

    const result = await createUserProfile("u1", "nick");

    expect(supabase.rpc).toHaveBeenCalledWith("create_profile", {
      p_nickname: "nick",
      p_beep_id: expect.stringMatching(/^\d{8}$/),
    });
    expect(result).toBe("12345678");
  });

  it("retries on duplicate beep_id (23505) and succeeds", async () => {
    supabase.rpc
      .mockResolvedValueOnce({ data: null, error: { code: "23505", message: "dup" } })
      .mockResolvedValueOnce({ data: { beep_id: "99999999" }, error: null });

    await expect(createUserProfile("u1", "nick")).resolves.toBe("99999999");
    expect(supabase.rpc).toHaveBeenCalledTimes(2);
  });

  it("returns the generated beep_id when the RPC returns no object", async () => {
    supabase.rpc.mockResolvedValue({ data: null, error: null });

    await expect(createUserProfile("u1", "nick")).resolves.toMatch(/^\d{8}$/);
  });

  it("throws after max retries exceeded", async () => {
    supabase.rpc.mockResolvedValue({ data: null, error: { code: "23505", message: "dup" } });

    await expect(createUserProfile("u1", "nick")).rejects.toThrow();
    expect(supabase.rpc).toHaveBeenCalledTimes(5);
  });

  it("throws immediately on non-duplicate error", async () => {
    const dbError = { code: "42000", message: "syntax error" };
    supabase.rpc.mockResolvedValue({ data: null, error: dbError });

    await expect(createUserProfile("u1", "nick")).rejects.toEqual(dbError);
    expect(supabase.rpc).toHaveBeenCalledTimes(1);
  });
});

describe("getUserProfile", () => {
  it("returns profile from the v2 profiles table", async () => {
    const profile = { id: "u1", nickname: "test", beep_id: "12345678" };
    const chain = createMockChain({ data: profile, error: null });
    supabase.from.mockReturnValue(chain);

    const result = await getUserProfile("u1");

    expect(supabase.from).toHaveBeenCalledWith("profiles");
    expect(chain.eq).toHaveBeenCalledWith("id", "u1");
    expect(chain.single).toHaveBeenCalled();
    expect(result).toEqual(profile);
  });

  it("throws on error", async () => {
    const chain = createMockChain({ data: null, error: { message: "not found" } });
    supabase.from.mockReturnValue(chain);

    await expect(getUserProfile("u1")).rejects.toEqual({ message: "not found" });
  });
});

describe("signOut", () => {
  it("signs out successfully", async () => {
    supabase.auth.signOut.mockResolvedValue({ error: null });

    await signOut();

    expect(supabase.auth.signOut).toHaveBeenCalled();
  });

  it("throws on error", async () => {
    const err = { message: "sign out failed" };
    supabase.auth.signOut.mockResolvedValue({ error: err });

    await expect(signOut()).rejects.toEqual(err);
  });
});
