import {
  createSupabaseBlinkMediaStorage,
  type BlinkMediaStorage,
} from "@/services/mediaStorage";

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
}: SendBlinkVideoInput): Promise<SendBlinkVideoResult> {
  const body = await readFile(video.uri);
  const byteSize = video.byteSize ?? body.size;
  const mimeType = video.mimeType ?? (body.type || "video/mp4");
  const extension = video.extension ?? extensionFromMimeType(mimeType);

  const target = await storage.requestUploadTarget({
    receiverId,
    code,
    memo: memo ?? null,
    durationMs: video.durationMs,
    byteSize,
    mimeType,
    extension,
  });

  await storage.uploadToTarget(target, body, { contentType: mimeType });
  await storage.finalizeUpload(target);

  return {
    signalId: target.signalId,
    mediaId: target.mediaId,
    bucket: target.bucket,
    objectKey: target.objectKey,
  };
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
