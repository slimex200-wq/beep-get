import Constants from "expo-constants";

export type RuntimePlatform = "ios" | "android" | "web";

export function getRuntimePlatform(): RuntimePlatform {
  const platform = Constants.platform;
  if (platform?.ios) return "ios";
  if (platform?.android) return "android";
  return "web";
}
