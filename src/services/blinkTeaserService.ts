import * as VideoThumbnails from "expo-video-thumbnails";
import {
  BLINK_MAX_DURATION_MS,
  BLINK_STRIP_FRAME_COUNT,
} from "@/lib/beepBlinkLimits";
import { createBlinkObjectKey } from "@/services/mediaStorage";

const BLINK_TEASER_EXTENSION = "jpg";
export const BLINK_TEASER_MIME_TYPE = "image/jpeg" as const;
const BLINK_TEASER_QUALITY = 0.38;

export type BlinkTeaserAsset = {
  uri: string;
  objectKey: string;
  mimeType: typeof BLINK_TEASER_MIME_TYPE;
  timeMs: number;
};

export type BlinkTeaser = {
  thumbnailKey: string | null;
  stripKeys: string[];
  assets: BlinkTeaserAsset[];
};

export type BlinkTeaserGeneratorInput = {
  senderId: string;
  receiverId: string;
  videoUri: string;
  durationMs: number;
  now?: Date;
  randomId?: string;
};

export type BlinkTeaserGenerator = (
  input: BlinkTeaserGeneratorInput
) => Promise<BlinkTeaser>;

export async function createBlinkTeaser({
  senderId,
  receiverId,
  videoUri,
  durationMs,
  now = new Date(),
  randomId = createRandomId(),
}: BlinkTeaserGeneratorInput): Promise<BlinkTeaser> {
  const times = getBlinkStripFrameTimes(durationMs);
  const assets = await Promise.all(
    times.map(async (timeMs, index) => {
      const result = await VideoThumbnails.getThumbnailAsync(videoUri, {
        quality: BLINK_TEASER_QUALITY,
        time: timeMs,
      });

      if (!result.uri) {
        throw new Error("Could not prepare Blink preview frame.");
      }

      return {
        uri: result.uri,
        objectKey: createBlinkObjectKey({
          senderId,
          receiverId,
          now,
          randomId: `${randomId}-strip-${index + 1}`,
          extension: BLINK_TEASER_EXTENSION,
        }),
        mimeType: BLINK_TEASER_MIME_TYPE,
        timeMs,
      };
    })
  );

  return {
    thumbnailKey: assets[0]?.objectKey ?? null,
    stripKeys: assets.map((asset) => asset.objectKey),
    assets,
  };
}

export function getBlinkStripFrameTimes(durationMs: number): number[] {
  const safeDuration = Math.max(1, Math.min(durationMs, BLINK_MAX_DURATION_MS));
  return Array.from({ length: BLINK_STRIP_FRAME_COUNT }, (_, index) =>
    Math.floor(safeDuration * (index / BLINK_STRIP_FRAME_COUNT))
  );
}

function createRandomId(): string {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
