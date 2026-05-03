const beepWidget = require("../../modules/beep-widget");
import {
  buildWidgetData,
  syncWidgetData,
  triggerWidgetReload,
} from "@/services/widgetService";

beforeEach(() => jest.clearAllMocks());

const mockMessages = [
  {
    id: "msg-1",
    from_user: "user-a",
    number_code: "012486",
    is_read: false,
    created_at: "2026-04-02T10:00:00Z",
    from_user_profile: { nickname: "엄마", beep_id: "11111111" },
  },
  {
    id: "msg-2",
    from_user: "user-b",
    number_code: "1004",
    is_read: true,
    created_at: "2026-04-02T09:00:00Z",
    from_user_profile: { nickname: "친구", beep_id: "22222222" },
  },
  {
    id: "msg-3",
    from_user: "user-a",
    number_code: "8282",
    is_read: true,
    created_at: "2026-04-02T08:00:00Z",
    from_user_profile: { nickname: "엄마", beep_id: "11111111" },
  },
  {
    id: "msg-4",
    from_user: "user-c",
    number_code: "7942",
    is_read: true,
    created_at: "2026-04-02T07:00:00Z",
    from_user_profile: { nickname: "동생", beep_id: "33333333" },
  },
  {
    id: "msg-5",
    from_user: "user-d",
    number_code: "1111",
    is_read: true,
    created_at: "2026-04-02T06:00:00Z",
    from_user_profile: { nickname: "직장", beep_id: "44444444" },
  },
];

const mockFriends = [
  {
    friend_id: "user-a",
    friend: { id: "user-a", beep_id: "11111111", nickname: "엄마", status_icon: "online" },
  },
  {
    friend_id: "user-b",
    friend: { id: "user-b", beep_id: "22222222", nickname: "친구", status_icon: "away" },
  },
];

describe("buildWidgetData", () => {
  it("returns null latestMessage when no messages", () => {
    const data = buildWidgetData([], []);
    expect(data.latestMessage).toBeNull();
    expect(data.recentSenders).toEqual([]);
  });

  it("returns latest message correctly", () => {
    const data = buildWidgetData(mockMessages, mockFriends);
    expect(data.latestMessage).toEqual({
      code: "012486",
      senderNickname: "엄마",
      senderBeepId: "11111111",
      messageId: "msg-1",
      receivedAt: "2026-04-02T10:00:00Z",
      isRead: false,
      kind: "beep",
      actions: {
        openReplyRoomUrl: "beepget://reply/msg-1",
        confirmUrl: "beepget://signal/msg-1/confirm",
        saveUrl: "beepget://signal/msg-1/save",
        quickReplyUrls: [
          {
            code: "8282",
            url: "beepget://signal/msg-1/quick-reply/8282",
          },
        ],
      },
    });
  });

  it("includes three-frame Blink teaser data for the latest Blink", () => {
    const data = buildWidgetData(
      [
        {
          ...mockMessages[0],
          kind: "blink",
          media: {
            durationMs: 2000,
            status: "processed",
            thumbnailUri: "thumb-1",
            stripFrameUris: ["frame-1", "frame-2", "frame-3", "frame-4"],
          },
        },
      ],
      mockFriends
    );

    expect(data.latestMessage).toEqual(
      expect.objectContaining({
        kind: "blink",
        teaser: {
          durationMs: 2000,
          thumbnailUri: "thumb-1",
          stripFrameUris: ["frame-1", "frame-2", "frame-3"],
        },
      })
    );
  });

  it("extracts up to 3 unique recent senders", () => {
    const data = buildWidgetData(mockMessages, mockFriends);
    expect(data.recentSenders).toHaveLength(3);
    expect(data.recentSenders[0].nickname).toBe("엄마");
    expect(data.recentSenders[1].nickname).toBe("친구");
    expect(data.recentSenders[2].nickname).toBe("동생");
  });

  it("deduplicates senders", () => {
    const data = buildWidgetData(mockMessages, mockFriends);
    const nicknames = data.recentSenders.map((s: any) => s.nickname);
    expect(new Set(nicknames).size).toBe(nicknames.length);
  });

  it("includes friend status_icon when available", () => {
    const data = buildWidgetData(mockMessages, mockFriends);
    expect(data.recentSenders[0].statusIcon).toBe("online");
    expect(data.recentSenders[1].statusIcon).toBe("away");
    // user-c not in friends, defaults to "online"
    expect(data.recentSenders[2].statusIcon).toBe("online");
  });

  it("handles messages without from_user_profile", () => {
    const msgs = [
      {
        id: "msg-1",
        from_user: "user-x",
        number_code: "999",
        is_read: false,
        created_at: "2026-04-02T10:00:00Z",
      },
    ];
    const data = buildWidgetData(msgs, []);
    expect(data.latestMessage!.senderNickname).toBe("???");
    expect(data.latestMessage!.senderBeepId).toBe("");
  });
});

describe("syncWidgetData", () => {
  it("calls updateWidgetData with built data", () => {
    syncWidgetData(mockMessages, mockFriends);
    expect(beepWidget.updateWidgetData).toHaveBeenCalledWith(
      expect.objectContaining({
        latestMessage: expect.any(Object),
        recentSenders: expect.any(Array),
      })
    );
  });

  it("does not throw when native module fails", () => {
    beepWidget.updateWidgetData.mockImplementation(() => {
      throw new Error("native module not available");
    });

    expect(() => syncWidgetData(mockMessages, mockFriends)).not.toThrow();
  });

  it("calls updateWidgetData with empty data for no messages", () => {
    syncWidgetData([], []);
    expect(beepWidget.updateWidgetData).toHaveBeenCalledWith({
      latestMessage: null,
      recentSenders: [],
    });
  });
});

describe("triggerWidgetReload", () => {
  it("calls reloadWidgets", () => {
    triggerWidgetReload();
    expect(beepWidget.reloadWidgets).toHaveBeenCalled();
  });

  it("does not throw when native module fails", () => {
    beepWidget.reloadWidgets.mockImplementation(() => {
      throw new Error("native module not available");
    });

    expect(() => triggerWidgetReload()).not.toThrow();
  });
});
