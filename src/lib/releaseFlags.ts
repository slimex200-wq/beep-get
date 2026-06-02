export function isPublicFlagEnabled(value: string | undefined): boolean {
  const normalized = value?.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
}

export function readPublicHttpsUrl(value: string | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed || !trimmed.startsWith("https://")) return null;
  return trimmed;
}

export const isGoogleAuthEnabled = isPublicFlagEnabled(
  process.env.EXPO_PUBLIC_ENABLE_GOOGLE_AUTH,
);

export const isKakaoAuthEnabled = isPublicFlagEnabled(
  process.env.EXPO_PUBLIC_ENABLE_KAKAO_AUTH,
);

export const isIdentityPackStoreEnabled = isPublicFlagEnabled(
  process.env.EXPO_PUBLIC_ENABLE_IAP_STORE,
);

export const privacyPolicyUrl = readPublicHttpsUrl(process.env.EXPO_PUBLIC_PRIVACY_URL);

export const accountDeletionUrl = readPublicHttpsUrl(
  process.env.EXPO_PUBLIC_ACCOUNT_DELETION_URL,
);

export const supportUrl = readPublicHttpsUrl(process.env.EXPO_PUBLIC_SUPPORT_URL);
