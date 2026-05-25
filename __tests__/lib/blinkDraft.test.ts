import { createBlinkDraft } from "@/lib/blinkDraft";
import { BLINK_MAX_DURATION_MS } from "@/lib/beepBlinkLimits";
import type { BlinkTeaser } from "@/services/blinkTeaserService";

const teaser: BlinkTeaser = {
  thumbnailKey: "sender/strip-1.jpg",
  stripKeys: ["sender/strip-1.jpg", "sender/strip-2.jpg", "sender/strip-3.jpg"],
  assets: [
    {
      uri: "file:///tmp/strip-1.jpg",
      objectKey: "sender/strip-1.jpg",
      mimeType: "image/jpeg",
      timeMs: 0,
    },
    {
      uri: "file:///tmp/strip-2.jpg",
      objectKey: "sender/strip-2.jpg",
      mimeType: "image/jpeg",
      timeMs: 666,
    },
    {
      uri: "file:///tmp/strip-3.jpg",
      objectKey: "sender/strip-3.jpg",
      mimeType: "image/jpeg",
      timeMs: 1333,
    },
  ],
};

describe("createBlinkDraft", () => {
  it("keeps the captured video and exposes local preview frame URIs", async () => {
    const createTeaser = jest.fn().mockResolvedValue(teaser);

    const draft = await createBlinkDraft({
      senderId: "sender-1",
      receiverId: "receiver-1",
      videoUri: "file:///tmp/blink.mp4",
      createTeaser,
    });

    expect(createTeaser).toHaveBeenCalledWith({
      senderId: "sender-1",
      receiverId: "receiver-1",
      videoUri: "file:///tmp/blink.mp4",
      durationMs: BLINK_MAX_DURATION_MS,
    });
    expect(draft.video).toEqual({
      uri: "file:///tmp/blink.mp4",
      durationMs: BLINK_MAX_DURATION_MS,
      mimeType: "video/mp4",
    });
    expect(draft.previewFrameUris).toEqual([
      "file:///tmp/strip-1.jpg",
      "file:///tmp/strip-2.jpg",
      "file:///tmp/strip-3.jpg",
    ]);
    expect(draft.teaser).toBe(teaser);
  });
});
