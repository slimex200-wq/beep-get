const { supabase, createMockChain } = require("@/lib/supabase");
import {
  getOwnedIdentityPackSlugs,
  identityPackProducts,
  verifyIdentityPackPurchase,
} from "@/services/purchaseService";

beforeEach(() => jest.clearAllMocks());

describe("getOwnedIdentityPackSlugs", () => {
  it("loads owned identity packs from entitlements", async () => {
    const chain = createMockChain({
      data: [{ pack_slug: "school-desk" }, { pack_slug: "night-signal" }],
      error: null,
    });
    supabase.from.mockReturnValue(chain);

    const owned = await getOwnedIdentityPackSlugs("user-1");

    expect(supabase.from).toHaveBeenCalledWith("identity_pack_entitlements");
    expect(chain.eq).toHaveBeenCalledWith("user_id", "user-1");
    expect([...owned]).toEqual(["school-desk", "night-signal"]);
  });
});

describe("verifyIdentityPackPurchase", () => {
  it("sends store purchase data to the verifier Edge Function", async () => {
    await verifyIdentityPackPurchase("school-desk", {
      productId: identityPackProducts["school-desk"],
      purchaseToken: "token-1",
      transactionId: "tx-1",
    });

    expect(supabase.functions.invoke).toHaveBeenCalledWith("verify-iap", {
      body: expect.objectContaining({
        packSlug: "school-desk",
        productId: "beepget.pack.school_desk",
        platform: "android",
        transactionId: "tx-1",
        purchaseToken: "token-1",
      }),
    });
  });
});
