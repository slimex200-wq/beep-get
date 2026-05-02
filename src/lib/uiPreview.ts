import type { Session, User } from "@supabase/supabase-js";

export const UI_PREVIEW_USER_ID = "ui-preview-user";
export const isUiPreviewEnabled = process.env.EXPO_PUBLIC_UI_PREVIEW === "1";
export const isUiPreviewUser = (userId?: string | null) => userId === UI_PREVIEW_USER_ID;

export const uiPreviewProfile = {
  id: UI_PREVIEW_USER_ID,
  beep_id: "48624862",
  nickname: "BEEP TESTER",
  status_icon: "online",
  active_skin_id: "skin-swiss-paper",
};

export function createUiPreviewSession(): Session {
  const user = {
    id: UI_PREVIEW_USER_ID,
    aud: "authenticated",
    role: "authenticated",
    email: "preview@beep-get.local",
    app_metadata: {},
    user_metadata: {},
    created_at: new Date(0).toISOString(),
  } as User;

  return {
    access_token: "ui-preview-token",
    refresh_token: "ui-preview-refresh",
    expires_in: 3600,
    token_type: "bearer",
    user,
  } as Session;
}

export const uiPreviewMessages = [
  {
    id: "preview-message-1",
    from_user: "friend-1",
    to_user: UI_PREVIEW_USER_ID,
    number_code: "8282",
    memo: "lunch?",
    is_read: false,
    is_saved: false,
    expires_at: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
    created_at: new Date().toISOString(),
    from_user_profile: { nickname: "Mina", beep_id: "12031997" },
  },
  {
    id: "preview-message-2",
    from_user: "friend-2",
    to_user: UI_PREVIEW_USER_ID,
    number_code: "1004",
    memo: "home safe",
    is_read: true,
    is_saved: true,
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 11).toISOString(),
    from_user_profile: { nickname: "Joon", beep_id: "01012026" },
  },
];

export const uiPreviewFriends = [
  {
    id: "preview-friendship-1",
    user_id: UI_PREVIEW_USER_ID,
    friend_id: "friend-1",
    nickname: "Mina",
    vibration_pattern: "short-short-long",
    friend: {
      id: "friend-1",
      beep_id: "12031997",
      nickname: "Mina",
      status_icon: "busy",
    },
  },
  {
    id: "preview-friendship-2",
    user_id: UI_PREVIEW_USER_ID,
    friend_id: "friend-2",
    nickname: null,
    vibration_pattern: "long",
    friend: {
      id: "friend-2",
      beep_id: "01012026",
      nickname: "Joon",
      status_icon: "online",
    },
  },
];

export const uiPreviewDictionary = [
  {
    id: "preview-code-1",
    user_id: UI_PREVIEW_USER_ID,
    code: "8282",
    meaning: "call me now",
    created_at: new Date().toISOString(),
  },
  {
    id: "preview-code-2",
    user_id: UI_PREVIEW_USER_ID,
    code: "1004",
    meaning: "made it home",
    created_at: new Date().toISOString(),
  },
  {
    id: "preview-code-3",
    user_id: UI_PREVIEW_USER_ID,
    code: "486",
    meaning: "thinking of you",
    created_at: new Date().toISOString(),
  },
];

export const uiPreviewSkins = [
  {
    id: "skin-swiss-paper",
    name: "Swiss Paper",
    slug: "swiss-paper",
    category: "editorial",
    assets_url: "",
    is_free: true,
    price_tier: null,
  },
  {
    id: "skin-neumorphism",
    name: "Soft Pager",
    slug: "neumorphism",
    category: "classic",
    assets_url: "",
    is_free: true,
    price_tier: null,
  },
  {
    id: "skin-cyber",
    name: "Cyber Neon",
    slug: "cyber-neon",
    category: "premium",
    assets_url: "",
    is_free: false,
    price_tier: "premium",
  },
  {
    id: "skin-retro",
    name: "Retro Future",
    slug: "retro-future",
    category: "premium",
    assets_url: "",
    is_free: false,
    price_tier: "premium",
  },
  {
    id: "skin-glass",
    name: "Glass Mode",
    slug: "glassmorphism",
    category: "free",
    assets_url: "",
    is_free: true,
    price_tier: null,
  },
];

export const uiPreviewOwnedSkins = [
  {
    id: "owned-skin-swiss-paper",
    user_id: UI_PREVIEW_USER_ID,
    skin_id: "skin-swiss-paper",
    acquired_type: "default",
    skin: uiPreviewSkins[0],
  },
  {
    id: "owned-skin-neumorphism",
    user_id: UI_PREVIEW_USER_ID,
    skin_id: "skin-neumorphism",
    acquired_type: "default",
    skin: uiPreviewSkins[1],
  },
  {
    id: "owned-skin-glass",
    user_id: UI_PREVIEW_USER_ID,
    skin_id: "skin-glass",
    acquired_type: "preview",
    skin: uiPreviewSkins[4],
  },
];

export const uiPreviewIcons = [
  {
    id: "icon-heart",
    name: "Heart",
    image_url: "https://dummyimage.com/80x80/e7e4df/6e6b8f.png&text=486",
    rarity: "common",
    drop_condition: {},
    season_id: null,
  },
  {
    id: "icon-star",
    name: "Star",
    image_url: "https://dummyimage.com/80x80/e7e4df/6e6b8f.png&text=8282",
    rarity: "rare",
    drop_condition: {},
    season_id: null,
  },
  {
    id: "icon-moon",
    name: "Moon",
    image_url: "https://dummyimage.com/80x80/e7e4df/6e6b8f.png&text=1004",
    rarity: "epic",
    drop_condition: {},
    season_id: null,
  },
  {
    id: "icon-lock",
    name: "Secret",
    image_url: "https://dummyimage.com/80x80/e7e4df/6e6b8f.png&text=0000",
    rarity: "legendary",
    drop_condition: {},
    season_id: null,
  },
];

export const uiPreviewOwnedIcons = [
  {
    id: "owned-icon-heart",
    user_id: UI_PREVIEW_USER_ID,
    icon_id: "icon-heart",
    acquired_at: new Date().toISOString(),
    icon: uiPreviewIcons[0],
  },
  {
    id: "owned-icon-star",
    user_id: UI_PREVIEW_USER_ID,
    icon_id: "icon-star",
    acquired_at: new Date().toISOString(),
    icon: uiPreviewIcons[1],
  },
];

export const uiPreviewStatus = {
  user_id: UI_PREVIEW_USER_ID,
  status_icon: "online",
  label: "available",
  updated_at: new Date().toISOString(),
};
