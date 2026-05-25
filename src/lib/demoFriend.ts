// Client-side demo friend "Beepy" injected into the friend list so a fresh
// signup can rehearse Beep/Blink flows before any real friend has joined.
// Send actions to this id short-circuit with a friendly alert instead of
// hitting send_beep; nothing reaches the server.
//
import {
  DEMO_BLINK_FRAME_DATA_URIS,
  DEMO_BLINK_THUMBNAIL_URI,
} from "@/lib/demoBlinkFrameData";

// When a real system-managed demo profile is registered in production, this
// id can be swapped to the server-side uuid and the client-side prepend can
// be removed.

export const DEMO_FRIEND_ID = "beepy-demo-friend";
export const DEMO_FRIEND_BEEP_ID = "00000001";
export const DEMO_WELCOME_SIGNAL_ID = "demo-welcome-beep";
export const DEMO_BLINK_SIGNAL_ID = "demo-welcome-blink";

export function isDemoFriend(id: string | null | undefined): boolean {
  return id === DEMO_FRIEND_ID;
}

export function isDemoSignal(id: string | null | undefined): boolean {
  return id === DEMO_WELCOME_SIGNAL_ID || id === DEMO_BLINK_SIGNAL_ID;
}

export function buildDemoWelcomeMessage(ownerId: string) {
  const now = new Date().toISOString();
  return {
    id: DEMO_WELCOME_SIGNAL_ID,
    from_user: DEMO_FRIEND_ID,
    to_user: ownerId,
    number_code: "486",
    memo: "Welcome to BEEP-GET",
    is_read: false,
    is_saved: false,
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(),
    created_at: now,
    from_user_profile: {
      nickname: "Beepy",
      beep_id: DEMO_FRIEND_BEEP_ID,
    },
  };
}

export function buildDemoBlinkMessage(ownerId: string) {
  const now = new Date(Date.now() + 1000).toISOString();
  return {
    id: DEMO_BLINK_SIGNAL_ID,
    from_user: DEMO_FRIEND_ID,
    to_user: ownerId,
    kind: "blink" as const,
    number_code: "8282",
    memo: "Demo Blink — 2초 영상 시연",
    is_read: false,
    is_saved: false,
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(),
    created_at: now,
    from_user_profile: {
      nickname: "Beepy",
      beep_id: DEMO_FRIEND_BEEP_ID,
    },
    media: {
      durationMs: 2000,
      status: "processed" as const,
      thumbnailUri: DEMO_BLINK_THUMBNAIL_URI,
      stripFrameUris: [...DEMO_BLINK_FRAME_DATA_URIS],
      playbackUri: require("../../assets/demo/beepy-blink.mp4") as number,
    },
  };
}

export function buildDemoFriend(ownerId: string) {
  const now = new Date().toISOString();
  return {
    id: `demo-relationship-${ownerId}`,
    owner_id: ownerId,
    user_id: ownerId,
    friend_id: DEMO_FRIEND_ID,
    nickname: "Beepy",
    vibration_pattern: "CLOSE FRIEND",
    created_at: now,
    friend: {
      id: DEMO_FRIEND_ID,
      beep_id: DEMO_FRIEND_BEEP_ID,
      nickname: "Beepy",
      status_icon: "online",
    },
  };
}
