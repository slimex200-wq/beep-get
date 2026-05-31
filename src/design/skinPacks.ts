export type SkinPackItem = {
  id?: string;
  name: string;
  slug: string;
  category?: string;
  is_free?: boolean;
  price_tier?: string | null;
};

export type SkinPackMeta = {
  slug: string;
  name: string;
  shortName: string;
  badge: string;
  priceLabel: string;
  description: string;
  accent: string;
  previewBackground: string;
  previewText: string;
};

export const SKIN_PACK_PRESETS: SkinPackItem[] = [
  {
    id: "skin-swiss-paper",
    name: "Classic Paper",
    slug: "swiss-paper",
    category: "starter",
    is_free: true,
    price_tier: null,
  },
  {
    id: "skin-neumorphism",
    name: "Soft Pager",
    slug: "neumorphism",
    category: "starter",
    is_free: true,
    price_tier: null,
  },
  {
    id: "skin-cyber",
    name: "Cyber Neon",
    slug: "cyber-neon",
    category: "premium",
    is_free: false,
    price_tier: "premium",
  },
  {
    id: "skin-retro",
    name: "Retro Future",
    slug: "retro-future",
    category: "premium",
    is_free: false,
    price_tier: "premium",
  },
  {
    id: "skin-glass",
    name: "Glass Mode",
    slug: "glassmorphism",
    category: "starter",
    is_free: true,
    price_tier: null,
  },
] as const;

const PACK_META: Record<string, SkinPackMeta> = {
  "swiss-paper": {
    slug: "swiss-paper",
    name: "Classic Paper",
    shortName: "Paper",
    badge: "FREE",
    priceLabel: "OWNED",
    description: "Cream cards, black ink, classic Beep and widget surfaces.",
    accent: "#0A0A0A",
    previewBackground: "#F8F6F1",
    previewText: "#0A0A0A",
  },
  neumorphism: {
    slug: "neumorphism",
    name: "Soft Pager",
    shortName: "Soft",
    badge: "FREE",
    priceLabel: "OWNED",
    description: "Soft raised controls for app, Send cards, and widgets.",
    accent: "#8B8175",
    previewBackground: "#ECE8E1",
    previewText: "#141414",
  },
  "cyber-neon": {
    slug: "cyber-neon",
    name: "Cyber Neon",
    shortName: "Neon",
    badge: "PACK",
    priceLabel: "PREMIUM",
    description: "Dark pager shell, glowing widget glass, avatar frame, status tint.",
    accent: "#7EA05E",
    previewBackground: "#11100E",
    previewText: "#F8F2E8",
  },
  "retro-future": {
    slug: "retro-future",
    name: "Retro Future",
    shortName: "Retro",
    badge: "PACK",
    priceLabel: "PREMIUM",
    description: "Warm display panels, chunky Send cards, matching widget skin.",
    accent: "#D8361E",
    previewBackground: "#241D18",
    previewText: "#FFF5E4",
  },
  glassmorphism: {
    slug: "glassmorphism",
    name: "Glass Mode",
    shortName: "Glass",
    badge: "BONUS",
    priceLabel: "OWNED",
    description: "Light translucent cards across the app and widget previews.",
    accent: "#6F8762",
    previewBackground: "#F7F9F8",
    previewText: "#0A0A0A",
  },
};

export function getSkinPackCatalog(items: SkinPackItem[]): SkinPackItem[] {
  return items.length ? items : [...SKIN_PACK_PRESETS];
}

export function getSkinPackMeta(item: SkinPackItem | string): SkinPackMeta {
  const slug = typeof item === "string" ? item : item.slug;
  const fallbackName = typeof item === "string" ? item : item.name;
  const meta = PACK_META[slug];
  if (meta) return meta;

  return {
    slug,
    name: fallbackName,
    shortName: fallbackName.split(" ")[0] ?? "Skin",
    badge: "PACK",
    priceLabel: "PREMIUM",
    description: "Applies to app surfaces, Send cards, widgets, avatar frame, and status tint.",
    accent: "#6F8762",
    previewBackground: "#F8F6F1",
    previewText: "#0A0A0A",
  };
}
