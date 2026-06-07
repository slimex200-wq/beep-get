export const APPLE_LIQUID_GLASS_PREVIEW_PATH = "/AppleLiquidGlassPreview";
export const APPLE_LIQUID_GLASS_PREVIEW_PARAM = "AppleLiquidGlassPreview";

export function isAppleLiquidGlassPreviewRequested(): boolean {
  if (process.env.EXPO_PUBLIC_APPLE_LIQUID_GLASS_PREVIEW === "1") {
    return true;
  }

  const location = typeof window === "undefined" ? undefined : window.location;

  if (!location) {
    return false;
  }

  return (
    location.pathname === APPLE_LIQUID_GLASS_PREVIEW_PATH ||
    new URLSearchParams(location.search).has(APPLE_LIQUID_GLASS_PREVIEW_PARAM)
  );
}
