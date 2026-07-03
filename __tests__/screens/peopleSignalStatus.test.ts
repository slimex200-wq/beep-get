import type { LegacyMessage } from "@/services/messageService";
import {
  buildFriendSignalSummaries,
  getFriendSignalSummary,
} from "@/screens/people/peopleSignalStatus";

const beepMessage = {
  id: "beep-1",
  from_user: "friend-beep",
  to_user: "me",
  number_code: "8282",
  memo: null,
  is_read: false,
  is_saved: false,
  expires_at: "2026-06-04T12:00:00.000Z",
  created_at: "2026-06-04T11:00:00.000",
} satisfies LegacyMessage;

const blinkMessage = {
  ...beepMessage,
  id: "blink-1",
  from_user: "friend-blink",
  number_code: "486",
  kind: "blink",
  media: {
    durationMs: 2000,
    status: "processed",
    thumbnailUri: "preview-thumb",
    stripFrameUris: ["preview-frame"],
    playbackUri: "preview-video",
  },
} satisfies LegacyMessage;

describe("peopleSignalStatus", () => {
  it("derives friend status from latest received signals instead of friend list position", () => {
    const summaries = buildFriendSignalSummaries([blinkMessage, beepMessage]);

    expect(getFriendSignalSummary(summaries, "friend-blink")).toEqual({
      badgeText: "BLINK",
      circuitStatus: "BLINK",
      rowStatus: "Blink 받음 · 486 · 11:00",
    });
    expect(getFriendSignalSummary(summaries, "friend-beep")).toEqual({
      badgeText: "BEEP",
      circuitStatus: "BEEP",
      rowStatus: "마지막 Beep · 8282 · 11:00",
    });
    expect(getFriendSignalSummary(summaries, "quiet-friend")).toEqual({
      badgeText: "quiet",
      circuitStatus: "quiet",
      rowStatus: "조용해요",
    });
  });
});
