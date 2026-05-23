import {
  DEMO_FRIEND_BEEP_ID,
  DEMO_FRIEND_ID,
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
});
