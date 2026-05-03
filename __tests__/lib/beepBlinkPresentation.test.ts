import {
  buildSignalPresentation,
  buildWidgetSignalPayload,
} from "@/lib/beepBlinkPresentation";

const NOW = new Date("2026-05-03T00:00:00.000Z");

describe("beep/blink presentation", () => {
  it("presents a plain Beep without media teaser", () => {
    const presentation = buildSignalPresentation(
      {
        id: "signal-1",
        kind: "beep",
        code: "8282",
        createdAt: "2026-05-02T23:59:00.000Z",
        expiresAt: "2026-05-03T23:59:00.000Z",
        isSaved: false,
        status: "sent",
        sender: { nickname: "Mina", beepId: "12345678" },
      },
      { now: NOW }
    );

    expect(presentation.title).toBe("Incoming Beep");
    expect(presentation.code).toBe("8282");
    expect(presentation.senderName).toBe("Mina");
    expect(presentation.teaser).toBeNull();
    expect(presentation.availability).toBe("active");
  });

  it("presents a Blink with thumbnail and three frame strip", () => {
    const presentation = buildSignalPresentation(
      {
        id: "signal-2",
        kind: "blink",
        code: "1004",
        createdAt: "2026-05-02T23:59:00.000Z",
        expiresAt: "2026-05-03T23:59:00.000Z",
        isSaved: false,
        status: "sent",
        sender: { nickname: "J", beepId: "87654321" },
        media: {
          durationMs: 2000,
          status: "processed",
          thumbnailUri: "thumb.jpg",
          stripFrameUris: ["1.jpg", "2.jpg", "3.jpg", "4.jpg"],
          playbackUri: "private-playback-url",
        },
      },
      { now: NOW }
    );

    expect(presentation.title).toBe("Incoming Blink");
    expect(presentation.teaser).toEqual({
      durationMs: 2000,
      thumbnailUri: "thumb.jpg",
      stripFrameUris: ["1.jpg", "2.jpg", "3.jpg"],
    });
  });

  it("marks expired unsaved media as metadata-only", () => {
    const presentation = buildSignalPresentation(
      {
        id: "signal-3",
        kind: "blink",
        code: "404",
        createdAt: "2026-05-01T00:00:00.000Z",
        expiresAt: "2026-05-02T00:00:00.000Z",
        isSaved: false,
        status: "sent",
      },
      { now: NOW }
    );

    expect(presentation.availability).toBe("expired");
    expect(presentation.teaser).toBeNull();
  });

  it("keeps saved Blinks visible after the normal expiry time", () => {
    const presentation = buildSignalPresentation(
      {
        id: "signal-4",
        kind: "blink",
        code: "486",
        createdAt: "2026-05-01T00:00:00.000Z",
        expiresAt: "2026-05-02T00:00:00.000Z",
        isSaved: true,
        status: "read",
        media: {
          durationMs: 1800,
          status: "processed",
          thumbnailUri: "saved.jpg",
          stripFrameUris: [],
        },
      },
      { now: NOW }
    );

    expect(presentation.availability).toBe("saved");
    expect(presentation.isSaved).toBe(true);
    expect(presentation.teaser?.thumbnailUri).toBe("saved.jpg");
  });

  it("omits private playback URLs from widget payloads", () => {
    const presentation = buildSignalPresentation(
      {
        id: "signal-5",
        kind: "blink",
        code: "8282",
        createdAt: "2026-05-02T23:59:00.000Z",
        expiresAt: "2026-05-03T23:59:00.000Z",
        isSaved: false,
        status: "sent",
        sender: { nickname: "Mina", beepId: "12345678" },
        media: {
          durationMs: 2000,
          status: "processed",
          thumbnailUri: "thumb.jpg",
          stripFrameUris: ["1.jpg", "2.jpg", "3.jpg"],
          playbackUri: "private-playback-url",
        },
      },
      { now: NOW }
    );

    const payload = buildWidgetSignalPayload(presentation, {
      quickReplyCodes: ["8282", "1004", "404", "9999"],
    });

    expect(JSON.stringify(payload)).not.toContain("private-playback-url");
    expect(payload.actions.quickReplyUrls).toEqual([
      {
        code: "8282",
        url: "beepget://signal/signal-5/quick-reply/8282",
      },
      {
        code: "1004",
        url: "beepget://signal/signal-5/quick-reply/1004",
      },
      {
        code: "404",
        url: "beepget://signal/signal-5/quick-reply/404",
      },
    ]);
    expect(payload.actions.openReplyRoomUrl).toBe("beepget://reply/signal-5");
  });
});
