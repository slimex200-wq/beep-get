import {
  createFileUriBlobReader,
  sendBlinkVideo,
  type CapturedBlinkVideo,
} from "@/services/blinkSendService";
import type { BlinkMediaStorage, BlinkUploadTarget } from "@/services/mediaStorage";

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

function createStorage(): jest.Mocked<BlinkMediaStorage> {
  return {
    requestUploadTarget: jest.fn().mockResolvedValue(target),
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

    const result = await sendBlinkVideo({
      senderId: "sender-1",
      receiverId: "receiver-1",
      code: "8282",
      memo: "now",
      video,
      storage,
      readFile: jest.fn().mockResolvedValue(body),
    });

    expect(storage.requestUploadTarget).toHaveBeenCalledWith({
      receiverId: "receiver-1",
      code: "8282",
      memo: "now",
      durationMs: 2000,
      byteSize: body.size,
      mimeType: "video/mp4",
      extension: "mp4",
    });
    expect(storage.uploadToTarget).toHaveBeenCalledWith(target, body, {
      contentType: "video/mp4",
    });
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
      })
    ).rejects.toThrow("upload failed");
    expect(storage.finalizeUpload).not.toHaveBeenCalled();
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
