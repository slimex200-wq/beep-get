const { getThumbnailAsync } = require("expo-video-thumbnails");
import {
  createBlinkTeaser,
  getBlinkStripFrameTimes,
} from "@/services/blinkTeaserService";

beforeEach(() => jest.clearAllMocks());

describe("getBlinkStripFrameTimes", () => {
  it("chooses three frame anchors inside the two second Blink window", () => {
    expect(getBlinkStripFrameTimes(2000)).toEqual([0, 666, 1333]);
  });

  it("caps frame anchors at the Blink duration limit", () => {
    expect(getBlinkStripFrameTimes(9999)).toEqual([0, 666, 1333]);
  });
});

describe("createBlinkTeaser", () => {
  it("generates three jpeg teaser assets with private storage keys", async () => {
    getThumbnailAsync.mockImplementation((_uri: string, options: { time: number }) =>
      Promise.resolve({
        height: 360,
        uri: `file:///tmp/frame-${options.time}.jpg`,
        width: 480,
      })
    );

    const teaser = await createBlinkTeaser({
      senderId: "sender-1",
      receiverId: "receiver-1",
      videoUri: "file:///tmp/blink.mp4",
      durationMs: 2000,
      now: new Date("2026-05-03T12:34:56.789Z"),
      randomId: "teaser",
    });

    expect(getThumbnailAsync).toHaveBeenCalledTimes(3);
    expect(getThumbnailAsync).toHaveBeenCalledWith("file:///tmp/blink.mp4", {
      quality: 0.38,
      time: 666,
    });
    expect(teaser.thumbnailKey).toBe(
      "sender-1/2026/05/03/receiver-1-teaser-strip-1.jpg"
    );
    expect(teaser.stripKeys).toEqual([
      "sender-1/2026/05/03/receiver-1-teaser-strip-1.jpg",
      "sender-1/2026/05/03/receiver-1-teaser-strip-2.jpg",
      "sender-1/2026/05/03/receiver-1-teaser-strip-3.jpg",
    ]);
    expect(teaser.assets[1]).toEqual({
      uri: "file:///tmp/frame-666.jpg",
      objectKey: "sender-1/2026/05/03/receiver-1-teaser-strip-2.jpg",
      mimeType: "image/jpeg",
      timeMs: 666,
    });
  });
});
