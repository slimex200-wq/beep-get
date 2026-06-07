import {
  DEFAULT_IDENTITY_PACK_SLUG,
  getIdentityPack,
} from "@/design/identityPacks";
import { getPackVisual } from "@/design/widgetSkinVisuals";
import type { WidgetSkinPayload } from "../../modules/beep-widget";

export function buildWidgetSkinPayload(
  packSlug: string = DEFAULT_IDENTITY_PACK_SLUG,
): WidgetSkinPayload {
  const pack = getIdentityPack(packSlug);
  const visual = getPackVisual(pack);

  return {
    slug: pack.slug,
    paper: visual.surface,
    paperWarm: visual.chip,
    ink: visual.text,
    muted: visual.muted,
    rule: visual.border.startsWith("#") ? visual.border : visual.muted,
    accent: visual.accent,
  };
}
