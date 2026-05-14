import { getRuntimePlatform } from "@/lib/runtimePlatform";
import { supabase } from "@/lib/supabase";
import { identityPacks } from "@/lib/identityPacks";

export const identityPackProducts: Record<string, string> = {
  "school-desk": "beepget.pack.school_desk",
  "cherry-dot": "beepget.pack.cherry_dot",
  "photo-booth-blink": "beepget.pack.photo_booth_blink",
  "night-signal": "beepget.pack.night_signal",
};

type StorePurchase = {
  productId?: string;
  purchaseToken?: string | null;
  transactionId?: string | null;
  environmentIOS?: string | null;
};

export async function getOwnedIdentityPackSlugs(userId: string) {
  const { data, error } = await supabase
    .from("identity_pack_entitlements")
    .select("pack_slug")
    .eq("user_id", userId);

  if (error) throw error;
  return new Set((data ?? []).map((row: { pack_slug: string }) => row.pack_slug));
}

export async function purchaseIdentityPack(packSlug: string) {
  const pack = identityPacks.find((item) => item.slug === packSlug);
  if (!pack) throw new Error("Unknown identity pack.");
  if (pack.isFree) return { packSlug, productId: null, owned: true };

  const productId = identityPackProducts[packSlug];
  if (!productId) throw new Error("No store product is mapped for this pack.");
  const platform = getRuntimePlatform();
  if (platform !== "ios" && platform !== "android") {
    throw new Error("Store purchases are only available on iOS and Android.");
  }

  const iap = await import("expo-iap");
  await iap.initConnection();
  const products = await iap.fetchProducts({ skus: [productId], type: "in-app" });
  if (!(products ?? []).some((product) => product.id === productId)) {
    throw new Error("Store product is not available yet.");
  }

  const purchase = await waitForPurchase(iap, productId, () =>
    iap.requestPurchase({
      request: {
        apple: { sku: productId },
        google: { skus: [productId] },
      },
      type: "in-app",
    }),
  );

  const verification = await verifyIdentityPackPurchase(packSlug, purchase);
  await iap.finishTransaction({ purchase: purchase as any, isConsumable: false });
  return verification;
}

export async function verifyIdentityPackPurchase(
  packSlug: string,
  purchase: StorePurchase,
) {
  const productId = purchase.productId ?? identityPackProducts[packSlug];
  const platform = getRuntimePlatform();
  const { data, error } = await supabase.functions.invoke("verify-iap", {
    body: {
      packSlug,
      productId,
      platform,
      transactionId: purchase.transactionId ?? purchase.purchaseToken,
      purchaseToken: purchase.purchaseToken,
      environment: purchase.environmentIOS === "Sandbox" ? "sandbox" : "production",
      rawPayload: purchase,
    },
  });

  if (error) throw error;
  return data;
}

async function waitForPurchase(
  iap: typeof import("expo-iap"),
  productId: string,
  startPurchase: () => Promise<unknown>,
) {
  return new Promise<StorePurchase>((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => finish(undefined, new Error("Purchase timed out.")), 120000);
    const successSub = iap.purchaseUpdatedListener((purchase) => {
      if (purchase.productId === productId) finish(purchase as StorePurchase);
    });
    const errorSub = iap.purchaseErrorListener((error) => {
      finish(undefined, error instanceof Error ? error : new Error(String(error)));
    });

    const finish = (purchase?: StorePurchase, error?: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      successSub.remove();
      errorSub.remove();
      if (error) reject(error);
      else if (purchase) resolve(purchase);
      else reject(new Error("Purchase did not return a transaction."));
    };

    startPurchase().catch((error) =>
      finish(undefined, error instanceof Error ? error : new Error(String(error))),
    );
  });
}
