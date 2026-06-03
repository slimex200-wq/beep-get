import type { ImageSourcePropType } from "react-native";

export const AVATAR_PRESET_SOURCES = {
  "beepget-avatar://classic-paper/basic-beepy": require("../../assets/brand/emotes/classic-paper/classic-paper__basic-beepy.png"),
  "beepget-avatar://classic-paper/ping": require("../../assets/brand/emotes/classic-paper/classic-paper__ping.png"),
  "beepget-avatar://cherry-dot/heart-ping": require("../../assets/brand/emotes/cherry-dot/cherry-dot__heart-ping.png"),
  "beepget-avatar://school-desk/focus-mode": require("../../assets/brand/emotes/school-desk/school-desk__focus-mode.png"),
} as const satisfies Record<string, ImageSourcePropType>;

export const AVATAR_PRESETS = Object.keys(AVATAR_PRESET_SOURCES);
export const DEFAULT_AVATAR_URI = AVATAR_PRESETS[0] ?? "";

export function getAvatarPresetSource(uri: string): ImageSourcePropType | undefined {
  return AVATAR_PRESET_SOURCES[uri as keyof typeof AVATAR_PRESET_SOURCES];
}
