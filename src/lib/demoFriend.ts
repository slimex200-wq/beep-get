// Client-side demo friend "Beepy" injected into the friend list so a fresh
// signup can rehearse Beep/Blink flows before any real friend has joined.
// Send actions to this id short-circuit with a friendly alert instead of
// hitting send_beep; nothing reaches the server.
//
// When a real system-managed demo profile is registered in production, this
// id can be swapped to the server-side uuid and the client-side prepend can
// be removed.

export const DEMO_FRIEND_ID = "beepy-demo-friend";
export const DEMO_FRIEND_BEEP_ID = "00000001";

export function isDemoFriend(id: string | null | undefined): boolean {
  return id === DEMO_FRIEND_ID;
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
