import type { PlatformOSType } from "react-native";

export type PlatformAuthProvider = "google" | "apple" | "kakao";

type RuntimePlatform = PlatformOSType | string;

const AUTH_PROVIDER_ORDER: PlatformAuthProvider[] = ["apple", "google", "kakao"];

export function getPlatformAuthProvider(platform: RuntimePlatform): PlatformAuthProvider {
  return platform === "ios" ? "apple" : "google";
}

export function getPlatformAuthProviders(
  _platform: RuntimePlatform
): PlatformAuthProvider[] {
  return [...AUTH_PROVIDER_ORDER];
}

export function shouldUseNativeAppleSignIn(
  provider: PlatformAuthProvider,
  platform: RuntimePlatform
): boolean {
  return provider === "apple" && platform === "ios";
}

export function getPlatformAuthLabel(provider: PlatformAuthProvider): string {
  switch (provider) {
    case "apple":
      return "Sign in with Apple";
    case "kakao":
      return "Log in with Kakao";
    case "google":
      return "Sign in with Google";
  }
}

export function getPlatformAuthVariant(
  provider: PlatformAuthProvider
): "dark" | "light" | "kakao" {
  switch (provider) {
    case "apple":
      return "dark";
    case "kakao":
      return "kakao";
    case "google":
      return "light";
  }
}
