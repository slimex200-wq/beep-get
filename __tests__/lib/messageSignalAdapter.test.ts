import { legacyMessageToSignalInput } from "@/lib/messageSignalAdapter";

describe("legacy message to signal adapter", () => {
  it("maps existing code messages to Beep signal input", () => {
    expect(
      legacyMessageToSignalInput({
        id: "message-1",
        number_code: "8282",
        memo: null,
        is_read: false,
        is_saved: false,
        expires_at: "2026-05-04T00:00:00.000Z",
        created_at: "2026-05-03T00:00:00.000Z",
        from_user_profile: { nickname: "Mina", beep_id: "12345678" },
      })
    ).toMatchObject({
      id: "message-1",
      kind: "beep",
      code: "8282",
      status: "sent",
      sender: { nickname: "Mina", beepId: "12345678" },
    });
  });

  it("maps preview media messages to Blink signal input", () => {
    expect(
      legacyMessageToSignalInput({
        id: "message-2",
        number_code: "1004",
        is_read: true,
        is_saved: true,
        expires_at: "2026-05-04T00:00:00.000Z",
        created_at: "2026-05-03T00:00:00.000Z",
        media: {
          durationMs: 2000,
          status: "processed",
          thumbnailUri: "thumb.jpg",
          stripFrameUris: ["1.jpg", "2.jpg", "3.jpg"],
        },
      })
    ).toMatchObject({
      kind: "blink",
      status: "read",
      isSaved: true,
      media: { durationMs: 2000, status: "processed" },
    });
  });
});
