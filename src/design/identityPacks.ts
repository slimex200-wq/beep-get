import type { ImageSourcePropType } from "react-native";
import { beepyEmotePackAssets } from "./beepyEmoteAssets.generated";

export type IdentityPackTone = "paper" | "school" | "cherry" | "photo" | "night";

export type IdentityPackLayout =
  | "classic-slip"
  | "school-note"
  | "cherry-sticker"
  | "photo-booth"
  | "night-signal";

export type IdentityPackExpression = {
  id: string;
  label: string;
  artFamily: "canonical-beepy" | "pack-native";
  source: "placeholder" | "asset";
  asset?: ImageSourcePropType;
};

export type IdentityPack = {
  slug: string;
  index: string;
  name: string;
  badge: string;
  priceLabel: string;
  tone: IdentityPackTone;
  layout: IdentityPackLayout;
  title: string;
  code: string;
  from: string;
  time: string;
  slots: string[];
  emotes: string[];
  expressions: IdentityPackExpression[];
  shortCopy: string;
  isFree?: boolean;
};

// Maps the legacy palette-skin slug back to its identity-pack slug. This survives
// the M3 palette collapse because `skinService.getActiveIdentityPackSlug` still
// derives a pack from any profile whose `active_skin_id` predates
// `active_identity_pack` (the column is dropped later in M4).
export const SKIN_TO_IDENTITY_SLUG: Record<string, string> = {
  "swiss-paper": "classic-paper",
  "pixel-pager": "classic-paper",
  neumorphism: "school-desk",
  glassmorphism: "cherry-dot",
  "retro-future": "photo-booth-blink",
  "cyber-neon": "night-signal",
};

export const DEFAULT_IDENTITY_PACK_SLUG = "classic-paper";

export function getIdentitySlugForSkin(skinSlug: string): string {
  return SKIN_TO_IDENTITY_SLUG[skinSlug] ?? skinSlug;
}

export function getIdentityPack(slug: string): IdentityPack {
  return identityPacks.find((pack) => pack.slug === slug) ?? identityPacks[0];
}

const expression = (
  id: string,
  label: string,
  artFamily: IdentityPackExpression["artFamily"] = "pack-native",
): IdentityPackExpression => ({
  id,
  label,
  artFamily,
  source: "placeholder",
});

const hydrateAssetExpressions = (
  packSlug: string,
  expressions: IdentityPackExpression[],
): IdentityPackExpression[] => {
  const packAssets = beepyEmotePackAssets.find((pack) => pack.slug === packSlug);

  if (!packAssets) {
    return expressions;
  }

  return expressions.map((item) => {
    const assetExpression = packAssets.expressions.find((asset) => asset.id === item.id);

    if (!assetExpression) {
      return item;
    }

    return {
      ...item,
      label: assetExpression.label,
      artFamily: packAssets.artFamily,
      source: assetExpression.source,
      asset: assetExpression.asset,
    };
  });
};

const classicPaperExpressions = hydrateAssetExpressions("classic-paper", [
  expression("basic-beepy", "Basic Beepy", "canonical-beepy"),
  expression("ok-slip", "OK slip", "canonical-beepy"),
  expression("open-signal", "Open signal", "canonical-beepy"),
  expression("save", "Save", "canonical-beepy"),
  expression("ping", "Ping", "canonical-beepy"),
  expression("waiting", "Waiting", "canonical-beepy"),
]);

const schoolDeskExpressions = hydrateAssetExpressions("school-desk", [
  expression("hungry", "Hungry"),
  expression("focus-mode", "Focus mode"),
  expression("cafe-study", "Cafe study"),
  expression("done-after-class", "Done after class"),
  expression("sleepy", "Sleepy"),
  expression("exam-panic", "Exam panic"),
]);

const cherryDotExpressions = hydrateAssetExpressions("cherry-dot", [
  expression("like", "Like"),
  expression("waiting", "Waiting"),
  expression("sulking", "Sulking"),
  expression("come-out", "Come out"),
  expression("heart-ping", "Heart ping"),
  expression("shy-yes", "Shy yes"),
]);

const photoBoothBlinkExpressions = hydrateAssetExpressions("photo-booth-blink", [
  expression("pose", "Pose"),
  expression("v-sign", "V sign"),
  expression("retake", "Retake"),
  expression("bff", "BFF"),
  expression("camera-flash", "Camera flash"),
  expression("photo-saved", "Photo saved"),
]);

const nightSignalExpressions = hydrateAssetExpressions("night-signal", [
  expression("secret", "Secret"),
  expression("private", "Private"),
  expression("lock", "Lock"),
  expression("radar-detected", "Radar detected"),
  expression("do-not-disturb", "Do not disturb"),
  expression("open-quietly", "Open quietly"),
]);

export const identityPacks: IdentityPack[] = [
  {
    slug: "classic-paper",
    index: "01",
    name: "Classic Paper",
    badge: "NEW",
    priceLabel: "FREE",
    tone: "paper",
    layout: "classic-slip",
    title: "Incoming Beep",
    code: "8282",
    from: "Mina",
    time: "14:52",
    slots: ["OK", "8282", "OPEN"],
    emotes: classicPaperExpressions.slice(0, 3).map((item) => item.label),
    expressions: classicPaperExpressions,
    shortCopy: "Cream ticket, thin rules, tiny Beepy mark.",
    isFree: true,
  },
  {
    slug: "school-desk",
    index: "02",
    name: "School Desk",
    badge: "HOT",
    priceLabel: "₩1,500",
    tone: "school",
    layout: "school-note",
    title: "도착한 Beep",
    code: "배고픔",
    from: "YOU",
    time: "14:56",
    slots: ["배고픔", "집중중", "끝나고"],
    emotes: schoolDeskExpressions.slice(0, 3).map((item) => item.label),
    expressions: schoolDeskExpressions,
    shortCopy: "Ruled note paper with binder holes and pencil scribbles.",
  },
  {
    slug: "cherry-dot",
    index: "03",
    name: "Cherry Dot",
    badge: "HOT",
    priceLabel: "₩1,500",
    tone: "cherry",
    layout: "cherry-sticker",
    title: "Incoming Beep",
    code: "1004",
    from: "유나",
    time: "15:34",
    slots: ["나와", "기다림", "좋아!"],
    emotes: cherryDotExpressions.slice(0, 3).map((item) => item.label),
    expressions: cherryDotExpressions,
    shortCopy: "Pink sticker slip with soft dots and cherry doodles.",
  },
  {
    slug: "photo-booth-blink",
    index: "04",
    name: "Photo Booth Blink",
    badge: "NEW",
    priceLabel: "₩1,500",
    tone: "photo",
    layout: "photo-booth",
    title: "Blink arrived",
    code: "0825",
    from: "민아",
    time: "16:20",
    slots: ["3 CUTS", "OPEN", "REPLY"],
    emotes: photoBoothBlinkExpressions.slice(0, 3).map((item) => item.label),
    expressions: photoBoothBlinkExpressions,
    shortCopy: "Blue grid paper, tape, and a three-cut photo strip.",
  },
  {
    slug: "night-signal",
    index: "05",
    name: "Night Signal",
    badge: "RARE",
    priceLabel: "₩2,500",
    tone: "night",
    layout: "night-signal",
    title: "Secret Signal",
    code: "2020",
    from: "J",
    time: "00:12",
    slots: ["PRIVATE", "OK", "OPEN"],
    emotes: nightSignalExpressions.slice(0, 3).map((item) => item.label),
    expressions: nightSignalExpressions,
    shortCopy: "Dark pager glow with green scan lines and secret chips.",
  },
];
