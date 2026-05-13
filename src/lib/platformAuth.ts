import type { PlatformOSType } from "react-native";

export type PlatformAuthProvider = "apple" | "google";

type RuntimePlatform = PlatformOSType | string;

export function getPlatformAuthProvider(platform: RuntimePlatform): PlatformAuthProvider {
  return platform === "ios" ? "apple" : "google";
}

export function getPlatformAuthLabel(provider: PlatformAuthProvider): string {
  return provider === "apple" ? "Continue with Apple" : "Continue with Google";
}

export function getPlatformAuthVariant(provider: PlatformAuthProvider): "dark" | "light" {
  return provider === "apple" ? "dark" : "light";
}
