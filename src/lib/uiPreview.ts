import type { Session, User } from "@supabase/supabase-js";
import type { LegacyMessage } from "@/services/messageService";

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

export const uiPreviewMessages: LegacyMessage[] = [
  {
    id: "preview-message-1",
    from_user: "friend-1",
    to_user: UI_PREVIEW_USER_ID,
    kind: "blink",
    number_code: "8282",
    memo: "2 sec blink",
    is_read: false,
    is_saved: false,
    expires_at: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
    created_at: new Date().toISOString(),
    from_user_profile: { nickname: "Mina", beep_id: "12031997" },
    media: {
      durationMs: 2000,
      status: "processed",
      thumbnailUri: "preview-blink-thumb",
      stripFrameUris: ["preview-strip-1", "preview-strip-2", "preview-strip-3"],
      playbackUri: "preview-private-playback",
    },
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

import type {
  CollectionIcon,
  UserCollectionIcon,
} from "@/services/collectionService";

export const uiPreviewIcons: CollectionIcon[] = [
  {
    id: "icon-online",
    slug: "online",
    name: "Online",
    image_url: "https://dummyimage.com/80x80/e7e4df/6e6b8f.png&text=ON",
    rarity: "common",
    drop_condition: null,
    is_default: true,
    status_icon_value: "online",
  },
  {
    id: "icon-focus",
    slug: "focus",
    name: "Focus",
    image_url: "https://dummyimage.com/80x80/e7e4df/6e6b8f.png&text=FOCUS",
    rarity: "common",
    drop_condition: null,
    is_default: true,
    status_icon_value: "focus",
  },
  {
    id: "icon-streak-3",
    slug: "streak-3",
    name: "Three Days",
    image_url: "https://dummyimage.com/80x80/e7e4df/6e6b8f.png&text=3D",
    rarity: "rare",
    drop_condition: { type: "streak", days: 3 },
    is_default: false,
    status_icon_value: "streak-3",
  },
  {
    id: "icon-msgs-10",
    slug: "msgs-10",
    name: "Chatterbox",
    image_url: "https://dummyimage.com/80x80/e7e4df/6e6b8f.png&text=10",
    rarity: "epic",
    drop_condition: { type: "messages_sent", count: 10 },
    is_default: false,
    status_icon_value: "msgs-10",
  },
  {
    id: "icon-msgs-100",
    slug: "msgs-100",
    name: "Centurion",
    image_url: "https://dummyimage.com/80x80/e7e4df/6e6b8f.png&text=100",
    rarity: "legendary",
    drop_condition: { type: "messages_sent", count: 100 },
    is_default: false,
    status_icon_value: "msgs-100",
  },
];

export const uiPreviewOwnedIcons: UserCollectionIcon[] = [
  {
    user_id: UI_PREVIEW_USER_ID,
    icon_id: "icon-online",
    acquired_at: new Date().toISOString(),
    icon: uiPreviewIcons[0],
  },
  {
    user_id: UI_PREVIEW_USER_ID,
    icon_id: "icon-focus",
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
