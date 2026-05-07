import {
  createSupabaseBlinkMediaStorage,
  validateBlinkUploadRequest,
  type BlinkMediaStorage,
} from "@/services/mediaStorage";
import {
  BLINK_THUMB_MAX_BYTES,
  type BlinkUploadValidation,
} from "@/lib/beepBlinkLimits";
import {
  BLINK_TEASER_MIME_TYPE,
  createBlinkTeaser,
  type BlinkTeaser,
  type BlinkTeaserGenerator,
} from "@/services/blinkTeaserService";

export type CapturedBlinkVideo = {
  uri: string;
  durationMs: number;
  byteSize?: number | null;
  mimeType?: string | null;
  extension?: string | null;
};

export type SendBlinkVideoInput = {
  senderId: string;
  receiverId: string;
  code: string;
  memo?: string | null;
  video: CapturedBlinkVideo;
  storage?: BlinkMediaStorage;
  readFile?: FileUriBlobReader;
  createTeaser?: BlinkTeaserGenerator;
};

export type SendBlinkVideoResult = {
  signalId: string;
  mediaId: string;
  bucket: string;
  objectKey: string;
};

export type FileUriBlobReader = (uri: string) => Promise<Blob>;

export async function sendBlinkVideo({
  senderId,
  receiverId,
  code,
  memo,
  video,
  storage = createSupabaseBlinkMediaStorage({ senderId }),
  readFile = createFileUriBlobReader(),
  createTeaser = createBlinkTeaser,
}: SendBlinkVideoInput): Promise<SendBlinkVideoResult> {
  const body = await readFile(video.uri);
  const byteSize = video.byteSize ?? body.size;
  const mimeType = video.mimeType ?? (body.type || "video/mp4");
  const extension = video.extension ?? extensionFromMimeType(mimeType);
  const uploadRequest = {
    receiverId,
    code,
    memo: memo ?? null,
    durationMs: video.durationMs,
    byteSize,
    mimeType,
    extension,
  };
  const validation = validateBlinkUploadRequest(uploadRequest);
  if (!validation.valid) {
    throw new Error(getBlinkUploadErrorMessage(validation.reason));
  }

  const teaser = await createTeaser({
    senderId,
    receiverId,
    videoUri: video.uri,
    durationMs: video.durationMs,
  });
  const teaserUploads = await readBlinkTeaserAssets(teaser, readFile);

  const target = await storage.requestUploadTarget({
    ...uploadRequest,
    thumbnailKey: teaser.thumbnailKey,
    stripKeys: teaser.stripKeys,
  });

  await storage.uploadToTarget(target, body, { contentType: mimeType });
  for (const upload of teaserUploads) {
    const uploadTarget = await storage.createSignedUploadTarget({
      bucket: "blink-thumbs",
      objectKey: upload.objectKey,
    });
    await storage.uploadToTarget(uploadTarget, upload.body, {
      contentType: BLINK_TEASER_MIME_TYPE,
    });
  }
  await storage.finalizeUpload(target);

  return {
    signalId: target.signalId,
    mediaId: target.mediaId,
    bucket: target.bucket,
    objectKey: target.objectKey,
  };
}

async function readBlinkTeaserAssets(
  teaser: BlinkTeaser,
  readFile: FileUriBlobReader
) {
  return Promise.all(
    teaser.assets.map(async (asset) => {
      const body = await readFile(asset.uri);
      if (body.size > BLINK_THUMB_MAX_BYTES) {
        throw new Error("Blink preview frame is too large.");
      }

      return {
        body,
        objectKey: asset.objectKey,
      };
    })
  );
}

function getBlinkUploadErrorMessage(
  reason: Exclude<BlinkUploadValidation, { valid: true }>["reason"]
) {
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

export function createFileUriBlobReader(
  fetchImpl: typeof fetch = fetch
): FileUriBlobReader {
  return async (uri) => {
    const response = await fetchImpl(uri);
    if (!response.ok) {
      throw new Error("Could not read Blink video file.");
    }

    return response.blob();
  };
}

function extensionFromMimeType(mimeType: string): string {
  switch (mimeType) {
    case "video/quicktime":
      return "mov";
    case "video/webm":
      return "webm";
    default:
      return "mp4";
  }
}
