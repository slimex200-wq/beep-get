const { supabase, createMockChain } = require("@/lib/supabase");
import {
  generateBeepId,
  isValidBeepId,
  signInWithGoogle,
  signInWithApple,
  createUserProfile,
  getUserProfile,
  signOut,
} from "@/services/authService";

beforeEach(() => jest.clearAllMocks());

describe("generateBeepId", () => {
  it("generates an 8-digit numeric string", () => {
    const id = generateBeepId();
    expect(id).toHaveLength(8);
    expect(/^\d{8}$/.test(id)).toBe(true);
  });

  it("does not start with 0", () => {
    for (let i = 0; i < 100; i++) {
      const id = generateBeepId();
      expect(id[0]).not.toBe("0");
    }
  });
});

describe("isValidBeepId", () => {
  it("returns true for valid 8-digit string", () => {
    expect(isValidBeepId("12345678")).toBe(true);
  });

  it("returns false for too short", () => {
    expect(isValidBeepId("1234567")).toBe(false);
  });

  it("returns false for non-numeric", () => {
    expect(isValidBeepId("1234567a")).toBe(false);
  });

  it("returns false for empty", () => {
    expect(isValidBeepId("")).toBe(false);
  });
});

describe("signInWithGoogle", () => {
  it("calls signInWithOAuth and returns data", async () => {
    const mockData = { url: "https://google.com/auth" };
    supabase.auth.signInWithOAuth.mockResolvedValue({ data: mockData, error: null });

    const result = await signInWithGoogle();
    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({ provider: "google" });
    expect(result).toEqual(mockData);
  });

  it("throws on error", async () => {
    const err = { message: "oauth failed" };
    supabase.auth.signInWithOAuth.mockResolvedValue({ data: null, error: err });

    await expect(signInWithGoogle()).rejects.toEqual(err);
  });
});

describe("signInWithApple", () => {
  it("calls signInWithIdToken and returns data", async () => {
    const mockData = { session: { access_token: "tok" } };
    supabase.auth.signInWithIdToken.mockResolvedValue({ data: mockData, error: null });

    const result = await signInWithApple();
    expect(supabase.auth.signInWithIdToken).toHaveBeenCalledWith({
      provider: "apple",
      token: "",
    });
    expect(result).toEqual(mockData);
  });

  it("throws on error", async () => {
    const err = { message: "apple sign in failed" };
    supabase.auth.signInWithIdToken.mockResolvedValue({ data: null, error: err });

    await expect(signInWithApple()).rejects.toEqual(err);
  });
});

describe("createUserProfile", () => {
  it("creates profile on first attempt", async () => {
    supabase.rpc.mockResolvedValue({ data: "12345678", error: null });

    const result = await createUserProfile("u1", "nick");
    expect(supabase.rpc).toHaveBeenCalledWith("create_user_profile", {
      p_nickname: "nick",
      p_beep_id: expect.stringMatching(/^\d{8}$/),
    });
    expect(result).toBe("12345678");
  });

  it("retries on duplicate beep_id (23505) and succeeds", async () => {
    supabase.rpc
      .mockResolvedValueOnce({ data: null, error: { code: "23505", message: "dup" } })
      .mockResolvedValueOnce({ data: null, error: { code: "23505", message: "dup" } })
      .mockResolvedValueOnce({ data: "99999999", error: null });

    const result = await createUserProfile("u1", "nick");
    expect(supabase.rpc).toHaveBeenCalledTimes(3);
    expect(result).toBe("99999999");
  });

  it("throws after max retries exceeded", async () => {
    supabase.rpc.mockResolvedValue({ data: null, error: { code: "23505", message: "dup" } });

    await expect(createUserProfile("u1", "nick")).rejects.toThrow(
      "beep_id 생성 실패: 최대 재시도 횟수 초과"
    );
    expect(supabase.rpc).toHaveBeenCalledTimes(5); // MAX_BEEP_ID_RETRIES = 5
  });

  it("throws immediately on non-duplicate error", async () => {
    const dbError = { code: "42000", message: "syntax error" };
    supabase.rpc.mockResolvedValue({ data: null, error: dbError });

    await expect(createUserProfile("u1", "nick")).rejects.toEqual(dbError);
    expect(supabase.rpc).toHaveBeenCalledTimes(1);
  });
});

describe("getUserProfile", () => {
  it("returns user profile", async () => {
    const profile = { id: "u1", nickname: "test", beep_id: "12345678" };
    const chain = createMockChain({ data: profile, error: null });
    supabase.from.mockReturnValue(chain);

    const result = await getUserProfile("u1");
    expect(supabase.from).toHaveBeenCalledWith("users");
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
