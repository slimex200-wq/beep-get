import { BLINK_MAX_DURATION_MS } from "@/lib/beepBlinkLimits";
import {
  createBlinkTeaser,
  type BlinkTeaser,
  type BlinkTeaserGenerator,
} from "@/services/blinkTeaserService";
import type { CapturedBlinkVideo } from "@/services/blinkSendService";

export type BlinkDraft = {
  video: CapturedBlinkVideo;
  teaser: BlinkTeaser;
  previewFrameUris: string[];
};

type CreateBlinkDraftInput = {
  senderId: string;
  receiverId: string;
  videoUri: string;
  durationMs?: number;
  mimeType?: string;
  createTeaser?: BlinkTeaserGenerator;
};

export async function createBlinkDraft({
  senderId,
  receiverId,
  videoUri,
  durationMs = BLINK_MAX_DURATION_MS,
  mimeType = "video/mp4",
  createTeaser = createBlinkTeaser,
}: CreateBlinkDraftInput): Promise<BlinkDraft> {
  const teaser = await createTeaser({
    senderId,
    receiverId,
    videoUri,
    durationMs,
  });

  return {
    video: {
      uri: videoUri,
      durationMs,
      mimeType,
    },
    teaser,
    previewFrameUris: teaser.assets.map((asset) => asset.uri).filter(Boolean).slice(0, 3),
  };
}
