const { supabase } = require("@/lib/supabase");
import {
  createBlinkObjectKey,
  createSupabaseBlinkMediaStorage,
  validateBlinkUploadRequest,
} from "@/services/mediaStorage";

beforeEach(() => jest.clearAllMocks());

const validRequest = {
  receiverId: "receiver-1",
  code: "8282",
  memo: "blink",
  durationMs: 2000,
  byteSize: 700000,
  mimeType: "video/mp4",
};

describe("validateBlinkUploadRequest", () => {
  it("accepts a 2 second mp4 under the byte limit", () => {
    expect(validateBlinkUploadRequest(validRequest)).toEqual({ valid: true });
  });

  it("rejects videos over 2 seconds", () => {
    expect(
      validateBlinkUploadRequest({ ...validRequest, durationMs: 2001 })
    ).toEqual({ valid: false, reason: "duration" });
  });

  it("rejects oversized videos", () => {
    expect(
      validateBlinkUploadRequest({ ...validRequest, byteSize: 750001 })
    ).toEqual({ valid: false, reason: "size" });
  });

  it("rejects unsupported mime types", () => {
    expect(
      validateBlinkUploadRequest({ ...validRequest, mimeType: "video/avi" })
    ).toEqual({ valid: false, reason: "mime" });
  });
});

describe("createBlinkObjectKey", () => {
  it("creates a stable private object key shape without exposing a URL", () => {
    const key = createBlinkObjectKey({
      senderId: "sender-1",
      receiverId: "receiver-1",
      now: new Date("2026-05-03T12:34:56.789Z"),
      randomId: "abc123",
      extension: "mp4",
    });

    expect(key).toBe("sender-1/2026/05/03/receiver-1-abc123.mp4");
    expect(key).not.toContain("http");
  });

  it("sanitizes unusual path parts", () => {
    const key = createBlinkObjectKey({
      senderId: "sender/one",
      receiverId: "receiver two",
      now: new Date("2026-05-03T00:00:00.000Z"),
      randomId: "id!@#",
      extension: ".quicktime",
    });

    expect(key).toBe("sender-one/2026/05/03/receiver-two-id---.quicktime");
  });
});

describe("Supabase blink media storage", () => {
  it("creates metadata and a signed upload target", async () => {
    supabase.rpc.mockResolvedValue({
      data: [{ signal_id: "signal-1", media_id: "media-1", object_key: "object.mp4" }],
      error: null,
    });
    supabase.storage.from.mockReturnValue({
      createSignedUploadUrl: jest.fn().mockResolvedValue({
        data: { signedUrl: "https://upload.example", token: "upload-token", path: "object.mp4" },
        error: null,
      }),
    });

    const storage = createSupabaseBlinkMediaStorage({
      senderId: "sender-1",
      randomId: () => "abc123",
      now: () => new Date("2026-05-03T12:34:56.789Z"),
    });

    const target = await storage.requestUploadTarget(validRequest);

    expect(supabase.rpc).toHaveBeenCalledWith("create_blink_metadata", {
      p_receiver_id: "receiver-1",
      p_code: "8282",
      p_memo: "blink",
      p_duration_ms: 2000,
      p_byte_size: 700000,
      p_object_key: "sender-1/2026/05/03/receiver-1-abc123.mp4",
      p_thumbnail_key: null,
    });
    expect(supabase.storage.from).toHaveBeenCalledWith("blink-originals");
    expect(target).toEqual({
      signalId: "signal-1",
      mediaId: "media-1",
      provider: "supabase_storage",
      bucket: "blink-originals",
      objectKey: "object.mp4",
      uploadUrl: "https://upload.example",
      uploadToken: "upload-token",
    });
  });

  it("rejects invalid media before calling Supabase", async () => {
    const storage = createSupabaseBlinkMediaStorage({
      senderId: "sender-1",
      randomId: () => "abc123",
      now: () => new Date("2026-05-03T12:34:56.789Z"),
    });

    await expect(
      storage.requestUploadTarget({ ...validRequest, durationMs: 3000 })
    ).rejects.toThrow("Blink video must be 2 seconds or shorter.");
    expect(supabase.rpc).not.toHaveBeenCalled();
  });

  it("returns signed playback references without permanent public URLs", async () => {
    supabase.storage.from.mockReturnValue({
      createSignedUrl: jest.fn().mockResolvedValue({
        data: { signedUrl: "https://signed-playback.example" },
        error: null,
      }),
    });
    const storage = createSupabaseBlinkMediaStorage({ senderId: "sender-1" });

    const playback = await storage.createPlaybackReference({
      bucket: "blink-originals",
      objectKey: "object.mp4",
      expiresInSeconds: 60,
    });

    expect(playback).toEqual({
      bucket: "blink-originals",
      objectKey: "object.mp4",
      signedUrl: "https://signed-playback.example",
      expiresInSeconds: 60,
    });
  });

  it("uploads a captured file to the signed target", async () => {
    const uploadToSignedUrl = jest.fn().mockResolvedValue({
      data: { path: "object.mp4", fullPath: "blink-originals/object.mp4" },
      error: null,
    });
    supabase.storage.from.mockReturnValue({ uploadToSignedUrl });
    const storage = createSupabaseBlinkMediaStorage({ senderId: "sender-1" });
    const body = new Blob(["video"], { type: "video/mp4" });

    const result = await storage.uploadToTarget(
      {
        signalId: "signal-1",
        mediaId: "media-1",
        provider: "supabase_storage",
        bucket: "blink-originals",
        objectKey: "object.mp4",
        uploadUrl: "https://upload.example",
        uploadToken: "upload-token",
      },
      body,
      { contentType: "video/mp4" }
    );

    expect(uploadToSignedUrl).toHaveBeenCalledWith(
      "object.mp4",
      "upload-token",
      body,
      { contentType: "video/mp4", upsert: false }
    );
    expect(result).toEqual({
      bucket: "blink-originals",
      objectKey: "object.mp4",
      path: "object.mp4",
      fullPath: "blink-originals/object.mp4",
    });
  });

  it("finalizes a Blink upload after storage succeeds", async () => {
    supabase.rpc.mockResolvedValue({
      data: { id: "media-1", status: "uploaded" },
      error: null,
    });
    const storage = createSupabaseBlinkMediaStorage({ senderId: "sender-1" });

    await storage.finalizeUpload({
      signalId: "signal-1",
      mediaId: "media-1",
      provider: "supabase_storage",
      bucket: "blink-originals",
      objectKey: "object.mp4",
      uploadUrl: "https://upload.example",
      uploadToken: "upload-token",
    });

    expect(supabase.rpc).toHaveBeenCalledWith("finalize_blink_upload", {
      p_signal_id: "signal-1",
      p_object_key: "object.mp4",
    });
  });
});
