import {
  formatSlipTime,
  messageToSlipSignal,
  relationshipToSlipFriend,
} from "@/lib/slipUiModels";

describe("messageToSlipSignal", () => {
  it("maps a live Blink message into the slip UI shape", () => {
    const signal = messageToSlipSignal(
      {
        id: "message-1",
        from_user: "friend-1",
        to_user: "user-1",
        number_code: "8282",
        memo: "call now",
        is_read: false,
        is_saved: false,
        kind: "blink",
        expires_at: "2026-05-04T10:00:00",
        created_at: "2026-05-04T09:00:00",
        from_user_profile: { nickname: "Mina", beep_id: "12031997" },
        media: {
          durationMs: 2000,
          status: "processed",
          stripFrameUris: ["a", "b", "c"],
        },
      },
      { now: new Date("2026-05-04T09:30:00"), index: 4 }
    );

    expect(signal).toEqual({
      id: "message-1",
      code: "8282",
      sender: "Mina",
      senderNo: "97",
      time: "09:00",
      note: "2 SEC BLINK / call now",
      hasBlink: true,
      status: "new",
    });
  });

  it("marks unsaved expired messages as expired metadata rows", () => {
    expect(
      messageToSlipSignal(
        {
          id: "message-2",
          from_user: "friend-1",
          to_user: "user-1",
          number_code: "486",
          memo: null,
          is_read: true,
          is_saved: false,
          expires_at: "2026-05-03T00:00:00.000Z",
          created_at: "2026-05-02T23:00:00.000Z",
        },
        { now: new Date("2026-05-04T00:00:00.000Z") }
      ).status
    ).toBe("expired");
  });
});

describe("relationshipToSlipFriend", () => {
  it("maps a relationship into a close-circuit friend card", () => {
    expect(
      relationshipToSlipFriend(
        {
          id: "rel-1",
          user_id: "user-1",
          friend_id: "friend-1",
          nickname: "M",
          vibration_pattern: "short",
          friend: {
            id: "friend-1",
            beep_id: "12031997",
            nickname: "Mina",
            status_icon: "online",
          },
        },
        0
      )
    ).toEqual({
      id: "friend-1",
      no: "97",
      name: "M",
      relation: "short",
      presets: ["8282", "486", "1004"],
      isClose: true,
    });
  });
});

describe("formatSlipTime", () => {
  it("returns a safe placeholder for invalid dates", () => {
    expect(formatSlipTime("not-a-date")).toBe("--:--");
  });
});
