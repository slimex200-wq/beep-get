import { DEMO_FRIEND_ID } from "@/lib/demoFriend";
import { UI_PREVIEW_USER_ID, uiPreviewFriends } from "@/lib/uiPreview";

describe("UI preview demo friend", () => {
  it("preloads Beepy as the first friend for E2E Send QA", () => {
    const [firstFriend] = uiPreviewFriends;

    expect(firstFriend?.user_id).toBe(UI_PREVIEW_USER_ID);
    expect(firstFriend?.friend_id).toBe(DEMO_FRIEND_ID);
    expect(firstFriend?.friend.nickname).toBe("Beepy");
    expect(firstFriend?.friend.beep_id).toBe("00000001");
  });
});
