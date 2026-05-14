const { supabase, createMockChain } = require("@/lib/supabase");
import * as Notifications from "expo-notifications";
import { registerPushToken, notifySignal } from "@/services/pushService";

beforeEach(() => jest.clearAllMocks());

describe("registerPushToken", () => {
  it("stores the Expo push token for the signed-in user", async () => {
    const chain = createMockChain({ data: null, error: null });
    supabase.from.mockReturnValue(chain);

    await expect(registerPushToken("user-1")).resolves.toBe("ExponentPushToken[test]");

    expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalledWith({
      projectId: "test-project-id",
    });
    expect(supabase.from).toHaveBeenCalledWith("push_tokens");
    expect(chain.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        expo_push_token: "ExponentPushToken[test]",
        enabled: true,
      }),
      { onConflict: "expo_push_token" },
    );
  });
});

describe("notifySignal", () => {
  it("invokes the push Edge Function without blocking send RPCs", async () => {
    await notifySignal("signal-1");

    expect(supabase.functions.invoke).toHaveBeenCalledWith("send-signal-push", {
      body: { signalId: "signal-1" },
    });
  });
});
