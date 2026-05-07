import {
  createFileUriBlobReader,
  sendBlinkVideo,
  type CapturedBlinkVideo,
} from "@/services/blinkSendService";
import type { BlinkMediaStorage, BlinkUploadTarget } from "@/services/mediaStorage";
import type { BlinkTeaser } from "@/services/blinkTeaserService";

const target: BlinkUploadTarget = {
  signalId: "signal-1",
  mediaId: "media-1",
  provider: "supabase_storage",
  bucket: "blink-originals",
  objectKey: "object.mp4",
  uploadUrl: "https://upload.example",
  uploadToken: "upload-token",
};

const video: CapturedBlinkVideo = {
  uri: "file:///tmp/blink.mp4",
  durationMs: 2000,
  mimeType: "video/mp4",
};

const teaser: BlinkTeaser = {
  thumbnailKey: "sender-1/2026/05/03/receiver-1-strip-1.jpg",
  stripKeys: [
    "sender-1/2026/05/03/receiver-1-strip-1.jpg",
    "sender-1/2026/05/03/receiver-1-strip-2.jpg",
    "sender-1/2026/05/03/receiver-1-strip-3.jpg",
  ],
  assets: [
    {
      uri: "file:///tmp/strip-1.jpg",
      objectKey: "sender-1/2026/05/03/receiver-1-strip-1.jpg",
      mimeType: "image/jpeg",
      timeMs: 0,
    },
    {
      uri: "file:///tmp/strip-2.jpg",
      objectKey: "sender-1/2026/05/03/receiver-1-strip-2.jpg",
      mimeType: "image/jpeg",
      timeMs: 666,
    },
    {
      uri: "file:///tmp/strip-3.jpg",
      objectKey: "sender-1/2026/05/03/receiver-1-strip-3.jpg",
      mimeType: "image/jpeg",
      timeMs: 1333,
    },
  ],
};

function createStorage(): jest.Mocked<BlinkMediaStorage> {
  return {
    requestUploadTarget: jest.fn().mockResolvedValue(target),
    createSignedUploadTarget: jest.fn((input) =>
      Promise.resolve({
        ...input,
        uploadUrl: `https://upload.example/${input.objectKey}`,
        uploadToken: `token-${input.objectKey}`,
      })
    ),
    uploadToTarget: jest.fn().mockResolvedValue({
      bucket: "blink-originals",
      objectKey: "object.mp4",
      path: "object.mp4",
      fullPath: "blink-originals/object.mp4",
    }),
    finalizeUpload: jest.fn().mockResolvedValue(undefined),
    createPlaybackReference: jest.fn(),
  };
}

describe("sendBlinkVideo", () => {
  it("reads the captured file, uploads it, and finalizes metadata", async () => {
    const storage = createStorage();
    const body = new Blob(["video"], { type: "video/mp4" });
    const imageBody = new Blob(["image"], { type: "image/jpeg" });
    const readFile = jest
      .fn()
      .mockResolvedValueOnce(body)
      .mockResolvedValue(imageBody);

    const result = await sendBlinkVideo({
      senderId: "sender-1",
      receiverId: "receiver-1",
      code: "8282",
      memo: "now",
      video,
      storage,
      readFile,
      createTeaser: jest.fn().mockResolvedValue(teaser),
    });

    expect(storage.requestUploadTarget).toHaveBeenCalledWith({
      receiverId: "receiver-1",
      code: "8282",
      memo: "now",
      durationMs: 2000,
      byteSize: body.size,
      mimeType: "video/mp4",
      extension: "mp4",
      thumbnailKey: teaser.thumbnailKey,
      stripKeys: teaser.stripKeys,
    });
    expect(storage.createSignedUploadTarget).toHaveBeenCalledTimes(3);
    expect(storage.uploadToTarget).toHaveBeenCalledWith(target, body, {
      contentType: "video/mp4",
    });
    expect(storage.uploadToTarget).toHaveBeenCalledWith(
      expect.objectContaining({
        bucket: "blink-thumbs",
        objectKey: "sender-1/2026/05/03/receiver-1-strip-1.jpg",
      }),
      imageBody,
      { contentType: "image/jpeg" }
    );
    expect(storage.finalizeUpload).toHaveBeenCalledWith(target);
    expect(result).toEqual({
      signalId: "signal-1",
      mediaId: "media-1",
      bucket: "blink-originals",
      objectKey: "object.mp4",
    });
  });

  it("uses explicit byteSize when provided before reading the file", async () => {
    const storage = createStorage();
    const body = new Blob(["video"], { type: "video/mp4" });

    await sendBlinkVideo({
      senderId: "sender-1",
      receiverId: "receiver-1",
      code: "8282",
      video: { ...video, byteSize: 1234 },
      storage,
      readFile: jest.fn().mockResolvedValue(body),
      createTeaser: jest.fn().mockResolvedValue({ ...teaser, assets: [] }),
    });

    expect(storage.requestUploadTarget).toHaveBeenCalledWith(
      expect.objectContaining({ byteSize: 1234 })
    );
  });

  it("does not finalize metadata if the storage upload fails", async () => {
    const storage = createStorage();
    storage.uploadToTarget.mockRejectedValue(new Error("upload failed"));

    await expect(
      sendBlinkVideo({
        senderId: "sender-1",
        receiverId: "receiver-1",
        code: "8282",
        video,
        storage,
        readFile: jest.fn().mockResolvedValue(new Blob(["video"], { type: "video/mp4" })),
        createTeaser: jest.fn().mockResolvedValue({ ...teaser, assets: [] }),
      })
    ).rejects.toThrow("upload failed");
    expect(storage.finalizeUpload).not.toHaveBeenCalled();
  });

  it("does not create backend metadata when a preview frame is too large", async () => {
    const storage = createStorage();
    const readFile = jest
      .fn()
      .mockResolvedValueOnce(new Blob(["video"], { type: "video/mp4" }))
      .mockResolvedValueOnce(new Blob([new Uint8Array(262145)], { type: "image/jpeg" }));

    await expect(
      sendBlinkVideo({
        senderId: "sender-1",
        receiverId: "receiver-1",
        code: "8282",
        video,
        storage,
        readFile,
        createTeaser: jest.fn().mockResolvedValue({
          ...teaser,
          stripKeys: [teaser.stripKeys[0]],
          assets: [teaser.assets[0]],
        }),
      })
    ).rejects.toThrow("Blink preview frame is too large.");
    expect(storage.requestUploadTarget).not.toHaveBeenCalled();
  });
});

describe("createFileUriBlobReader", () => {
  it("reads a local URI into a blob through fetch", async () => {
    const blob = new Blob(["video"], { type: "video/mp4" });
    const fetchImpl = jest.fn().mockResolvedValue({
      ok: true,
      blob: jest.fn().mockResolvedValue(blob),
    });

    await expect(createFileUriBlobReader(fetchImpl)("file:///tmp/blink.mp4")).resolves.toBe(blob);
    expect(fetchImpl).toHaveBeenCalledWith("file:///tmp/blink.mp4");
  });

  it("throws when the local URI cannot be read", async () => {
    const fetchImpl = jest.fn().mockResolvedValue({ ok: false, status: 404 });

    await expect(
      createFileUriBlobReader(fetchImpl)("file:///tmp/missing.mp4")
    ).rejects.toThrow("Could not read Blink video file.");
  });
});
