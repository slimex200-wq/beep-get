import { identityPacks } from "@/design/identityPacks";
import { getOwnedIdentityPackSlugs } from "@/services/purchaseService";
import { isUiPreviewUser } from "@/lib/uiPreview";

export const freePackSlugs = (): string[] =>
  identityPacks.filter((pack) => pack.isFree).map((pack) => pack.slug);

// In UI preview mode the preview user "owns" every pack so the picker is fully
// explorable without a Supabase session.
const previewOwnedPackSlugs = () => identityPacks.map((pack) => pack.slug);

/**
 * Loads the full set of identity packs a user can apply: free packs plus any
 * verified entitlements. UI preview users own everything so the picker is fully
 * explorable without a Supabase session.
 */
export async function loadOwnedIdentityPacks(
  userId: string,
): Promise<ReadonlySet<string>> {
  if (isUiPreviewUser(userId)) {
    return new Set(previewOwnedPackSlugs());
  }
  const entitled = await getOwnedIdentityPackSlugs(userId);
  return new Set([...freePackSlugs(), ...entitled]);
}
