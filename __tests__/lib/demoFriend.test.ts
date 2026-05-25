import {
  DEMO_FRIEND_BEEP_ID,
  DEMO_FRIEND_ID,
  buildDemoBlinkMessage,
  buildDemoFriend,
  isDemoFriend,
} from "@/lib/demoFriend";

describe("demoFriend", () => {
  it("identifies the demo friend id", () => {
    expect(isDemoFriend(DEMO_FRIEND_ID)).toBe(true);
    expect(isDemoFriend("real-uuid-123")).toBe(false);
    expect(isDemoFriend(null)).toBe(false);
    expect(isDemoFriend(undefined)).toBe(false);
  });

  it("builds a friendship row Beepy with the system beep_id", () => {
    const owner = "user-1";
    const friendship = buildDemoFriend(owner);

    expect(friendship.owner_id).toBe(owner);
    expect(friendship.user_id).toBe(owner);
    expect(friendship.friend_id).toBe(DEMO_FRIEND_ID);
    expect(friendship.friend.beep_id).toBe(DEMO_FRIEND_BEEP_ID);
    expect(friendship.friend.nickname).toBe("Beepy");
  });

  it("uses a system-reserved beep_id outside the generateBeepId range", () => {
    expect(DEMO_FRIEND_BEEP_ID).toMatch(/^0\d{7}$/);
  });

  it("builds the demo Blink like a real widget-ready Blink", () => {
    const message = buildDemoBlinkMessage("user-1");

    expect(message.media.playbackUri).toBeTruthy();
    expect(message.media.thumbnailUri).toMatch(/^data:image\/jpeg;base64,/);
    expect(message.media.stripFrameUris).toHaveLength(3);
    message.media.stripFrameUris.forEach((uri) => {
      expect(uri).toMatch(/^data:image\/jpeg;base64,/);
    });
  });
});
