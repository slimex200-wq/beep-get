import type { ImageSourcePropType } from "react-native";
import { getAvatarPresetSource } from "@/design/avatarPresets";

export type AvatarProfile = {
  readonly avatar_url?: string | null;
  readonly nickname?: string | null;
  readonly beep_id?: string | null;
};

export function normalizeAvatarUri(uri?: string | null): string | undefined {
  const trimmed = uri?.trim();
  return trimmed ? trimmed : undefined;
}

export function getAvatarImageSource(uri?: string | null): ImageSourcePropType | undefined {
  const normalizedUri = normalizeAvatarUri(uri);
  if (!normalizedUri) return undefined;
  return getAvatarPresetSource(normalizedUri) ?? { uri: normalizedUri };
}

export function getAvatarLabel(profile?: AvatarProfile | null, fallback = "ME"): string {
  return profile?.nickname?.trim() || profile?.beep_id?.trim() || fallback;
}
