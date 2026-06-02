import type { PlatformOSType } from "react-native";
import { isGoogleAuthEnabled, isKakaoAuthEnabled } from "@/lib/releaseFlags";

export type PlatformAuthProvider = "google" | "apple" | "kakao";

type RuntimePlatform = PlatformOSType | string;

const addProvider = (
  providers: PlatformAuthProvider[],
  provider: PlatformAuthProvider,
) => {
  if (!providers.includes(provider)) providers.push(provider);
};

export function getPlatformAuthProvider(platform: RuntimePlatform): PlatformAuthProvider {
  return platform === "ios" ? "apple" : "google";
}

export function getPlatformAuthProviders(
  platform: RuntimePlatform
): PlatformAuthProvider[] {
  const providers: PlatformAuthProvider[] = [getPlatformAuthProvider(platform)];

  if (platform === "ios") {
    if (isGoogleAuthEnabled) addProvider(providers, "google");
  } else {
    addProvider(providers, "google");
  }
  if (isKakaoAuthEnabled) addProvider(providers, "kakao");

  return providers;
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
