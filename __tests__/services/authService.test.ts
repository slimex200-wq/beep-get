const { supabase } = require("@/lib/supabase");
const Linking = require("expo-linking");
const AppleAuthentication = require("expo-apple-authentication");
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
  it("uses native Apple auth and exchanges the identity token with Supabase", async () => {
    const mockData = { session: { access_token: "session" } };
    supabase.auth.signInWithIdToken.mockResolvedValue({ data: mockData, error: null });

    await expect(signInWithApple()).resolves.toEqual(mockData);
    expect(AppleAuthentication.signInAsync).toHaveBeenCalledWith({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
    expect(supabase.auth.signInWithIdToken).toHaveBeenCalledWith({
      provider: "apple",
      token: "apple-id-token",
    });
    expect(supabase.auth.updateUser).toHaveBeenCalledWith({
      data: {
        full_name: "Beepy Tester",
        name: "Beepy Tester",
      },
    });
    expect(Linking.openURL).not.toHaveBeenCalled();
    expect(supabase.auth.signInWithOAuth).not.toHaveBeenCalled();
  });

  it("does not require Apple fullName because Apple only returns it once", async () => {
    AppleAuthentication.signInAsync.mockResolvedValueOnce({
      identityToken: "apple-id-token",
      fullName: null,
    });
    supabase.auth.signInWithIdToken.mockResolvedValue({ data: {}, error: null });

    await signInWithApple();

    expect(supabase.auth.signInWithIdToken).toHaveBeenCalledWith({
      provider: "apple",
      token: "apple-id-token",
    });
    expect(supabase.auth.updateUser).not.toHaveBeenCalled();
  });

  it("does not fail login when Apple metadata update fails", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => undefined);
    supabase.auth.signInWithIdToken.mockResolvedValue({ data: { session: {} }, error: null });
    supabase.auth.updateUser.mockResolvedValueOnce({
      data: null,
      error: { message: "metadata failed" },
    });

    await expect(signInWithApple()).resolves.toEqual({ session: {} });
    expect(supabase.auth.updateUser).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it("throws on Supabase token exchange error", async () => {
    const err = { message: "apple sign in failed" };
    supabase.auth.signInWithIdToken.mockResolvedValue({ data: null, error: err });

    await expect(signInWithApple()).rejects.toEqual(err);
  });

  it("throws when native Apple sign-in fails", async () => {
    const err = new Error("native cancelled");
    AppleAuthentication.signInAsync.mockRejectedValueOnce(err);

    await expect(signInWithApple()).rejects.toThrow("native cancelled");
    expect(supabase.auth.signInWithIdToken).not.toHaveBeenCalled();
  });

  it("throws when Apple does not return an identity token", async () => {
    AppleAuthentication.signInAsync.mockResolvedValueOnce({
      identityToken: null,
      fullName: null,
    });

    await expect(signInWithApple()).rejects.toThrow("identity token");
    expect(supabase.auth.signInWithIdToken).not.toHaveBeenCalled();
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
  it("creates profile through the v2 RPC and returns the profile row", async () => {
    supabase.rpc.mockResolvedValue({
      data: {
        id: "u1",
        beep_id: "12345678",
        nickname: "nick",
        status_icon: "online",
        active_skin_id: null,
      },
      error: null,
    });

    const result = await createUserProfile("u1", "nick");

    expect(supabase.rpc).toHaveBeenCalledWith("create_profile", {
      p_nickname: "nick",
      p_beep_id: expect.stringMatching(/^\d{8}$/),
    });
    expect(result).toEqual({
      id: "u1",
      beep_id: "12345678",
      nickname: "nick",
      status_icon: "online",
      active_skin_id: null,
    });
  });

  it("retries on duplicate beep_id (23505) and succeeds", async () => {
    supabase.rpc
      .mockResolvedValueOnce({ data: null, error: { code: "23505", message: "dup" } })
      .mockResolvedValueOnce({ data: { beep_id: "99999999" }, error: null });

    await expect(createUserProfile("u1", "nick")).resolves.toEqual(
      expect.objectContaining({ beep_id: "99999999" })
    );
    expect(supabase.rpc).toHaveBeenCalledTimes(2);
  });

  it("returns a fallback profile when the RPC returns no object", async () => {
    supabase.rpc
      .mockResolvedValueOnce({ data: null, error: null })
      .mockResolvedValueOnce({
        data: {
          id: "u1",
          beep_id: "12345678",
          nickname: "nick",
          status_icon: "online",
          active_skin_id: null,
        },
        error: null,
      });

    await expect(createUserProfile("u1", "nick")).resolves.toEqual(
      expect.objectContaining({
        id: "u1",
        beep_id: "12345678",
        nickname: "nick",
      })
    );
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
  it("returns profile from the own-profile RPC", async () => {
    const profile = {
      id: "u1",
      nickname: "test",
      beep_id: "12345678",
      status_icon: "online",
      active_skin_id: null,
    };
    supabase.rpc.mockResolvedValue({ data: profile, error: null });

    const result = await getUserProfile("u1");

    expect(supabase.rpc).toHaveBeenCalledWith("get_own_profile");
    expect(result).toEqual(profile);
  });

  it("throws on error", async () => {
    supabase.rpc.mockResolvedValue({ data: null, error: { message: "not found" } });

    await expect(getUserProfile("u1")).rejects.toEqual({ message: "not found" });
  });

  it("throws when no profile row is returned", async () => {
    supabase.rpc.mockResolvedValue({ data: null, error: null });

    await expect(getUserProfile("u1")).rejects.toThrow("Profile not found");
  });

  it("throws when the row exists but nickname is blank", async () => {
    supabase.rpc.mockResolvedValue({
      data: {
        id: "u1",
        beep_id: "12345678",
        nickname: "   ",
        status_icon: "online",
        active_skin_id: null,
      },
      error: null,
    });

    await expect(getUserProfile("u1")).rejects.toThrow("Profile incomplete");
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
