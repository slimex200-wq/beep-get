import {
  validateBlinkUpload,
  type BlinkUploadValidation,
} from "@/lib/beepBlinkLimits";
import { supabase } from "@/lib/supabase";

export const BLINK_ORIGINALS_BUCKET = "blink-originals";

export type MediaProvider = "supabase_storage";

export type BlinkUploadRequest = {
  receiverId: string;
  code: string;
  memo?: string | null;
  durationMs: number;
  byteSize: number;
  mimeType?: string | null;
  thumbnailKey?: string | null;
  extension?: string | null;
};

export type BlinkUploadTarget = {
  signalId: string;
  mediaId: string;
  provider: MediaProvider;
  bucket: string;
  objectKey: string;
  uploadUrl: string;
  uploadToken: string;
};

export type BlinkPlaybackReference = {
  bucket: string;
  objectKey: string;
  expiresInSeconds: number;
  signedUrl: string;
};

export type CreateBlinkObjectKeyOptions = {
  senderId: string;
  receiverId: string;
  now?: Date;
  randomId?: string;
  extension?: string | null;
};

export type SupabaseBlinkMediaStorageOptions = {
  senderId: string;
  bucket?: string;
  now?: () => Date;
  randomId?: () => string;
};

type CreateBlinkMetadataRow = {
  signal_id: string;
  media_id: string;
  object_key: string;
};

export interface BlinkMediaStorage {
  requestUploadTarget(request: BlinkUploadRequest): Promise<BlinkUploadTarget>;
  createPlaybackReference(input: {
    bucket: string;
    objectKey: string;
    expiresInSeconds?: number;
  }): Promise<BlinkPlaybackReference>;
}

export function validateBlinkUploadRequest(
  request: BlinkUploadRequest
): BlinkUploadValidation {
  return validateBlinkUpload({
    durationMs: request.durationMs,
    byteSize: request.byteSize,
    mimeType: request.mimeType,
  });
}

export function createBlinkObjectKey({
  senderId,
  receiverId,
  now = new Date(),
  randomId = createRandomId(),
  extension = "mp4",
}: CreateBlinkObjectKeyOptions): string {
  const date = now.toISOString();
  const year = date.slice(0, 4);
  const month = date.slice(5, 7);
  const day = date.slice(8, 10);
  const normalizedExtension = normalizeExtension(extension);

  return [
    sanitizePathPart(senderId),
    year,
    month,
    day,
    `${sanitizePathPart(receiverId)}-${sanitizePathPart(randomId)}.${normalizedExtension}`,
  ].join("/");
}

export function createSupabaseBlinkMediaStorage(
  options: SupabaseBlinkMediaStorageOptions
): BlinkMediaStorage {
  return {
    requestUploadTarget: async (request) => {
      const validation = validateBlinkUploadRequest(request);
      if (!validation.valid) {
        throw new Error(getBlinkUploadErrorMessage(validation.reason));
      }

      const bucket = options.bucket ?? BLINK_ORIGINALS_BUCKET;
      const objectKey = createBlinkObjectKey({
        senderId: options.senderId,
        receiverId: request.receiverId,
        now: options.now?.() ?? new Date(),
        randomId: options.randomId?.() ?? createRandomId(),
        extension: request.extension ?? extensionFromMimeType(request.mimeType),
      });

      const { data, error } = await supabase.rpc("create_blink_metadata", {
        p_receiver_id: request.receiverId,
        p_code: request.code,
        p_memo: request.memo ?? null,
        p_duration_ms: request.durationMs,
        p_byte_size: request.byteSize,
        p_object_key: objectKey,
        p_thumbnail_key: request.thumbnailKey ?? null,
      });

      if (error) throw error;

      const metadata = readCreateBlinkMetadata(data);
      const storage = supabase.storage.from(bucket);
      const { data: uploadData, error: uploadError } =
        await storage.createSignedUploadUrl(metadata.object_key);

      if (uploadError) throw uploadError;

      return {
        signalId: metadata.signal_id,
        mediaId: metadata.media_id,
        provider: "supabase_storage",
        bucket,
        objectKey: metadata.object_key,
        uploadUrl: uploadData?.signedUrl ?? "",
        uploadToken: uploadData?.token ?? "",
      };
    },

    createPlaybackReference: async ({
      bucket,
      objectKey,
      expiresInSeconds = 60,
    }) => {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(objectKey, expiresInSeconds);

      if (error) throw error;

      return {
        bucket,
        objectKey,
        signedUrl: data?.signedUrl ?? "",
        expiresInSeconds,
      };
    },
  };
}

function readCreateBlinkMetadata(data: unknown): CreateBlinkMetadataRow {
  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row !== "object") {
    throw new Error("Blink metadata was not returned.");
  }

  const metadata = row as Partial<CreateBlinkMetadataRow>;
  if (!metadata.signal_id || !metadata.media_id || !metadata.object_key) {
    throw new Error("Blink metadata response is incomplete.");
  }

  return {
    signal_id: metadata.signal_id,
    media_id: metadata.media_id,
    object_key: metadata.object_key,
  };
}

function getBlinkUploadErrorMessage(reason: Exclude<BlinkUploadValidation, { valid: true }>["reason"]) {
  switch (reason) {
    case "duration":
      return "Blink video must be 2 seconds or shorter.";
    case "size":
      return "Blink video is too large.";
    case "mime":
      return "Blink video format is not supported.";
    case "missing":
      return "Blink video metadata is missing.";
  }
}

function extensionFromMimeType(mimeType?: string | null): string {
  switch (mimeType) {
    case "video/quicktime":
      return "mov";
    case "video/webm":
      return "webm";
    default:
      return "mp4";
  }
}

function normalizeExtension(extension?: string | null): string {
  const normalized = (extension ?? "mp4").replace(/^\./, "").toLowerCase();
  return sanitizePathPart(normalized) || "mp4";
}

function sanitizePathPart(value: string): string {
  return value.trim().replace(/[^a-zA-Z0-9._-]/g, "-") || "unknown";
}

function createRandomId(): string {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
