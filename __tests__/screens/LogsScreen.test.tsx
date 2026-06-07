import { readFileSync } from "fs";
import path from "path";
import { getBlinkMemories } from "@/components/BlinkMemoriesCard";
import type { LegacyMessage } from "@/services/messageService";

const TRUSTED_SUPABASE_URL = "https://dyuzxilukcwiavtvbmci.supabase.co";
const originalSupabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;

describe("LogsScreen saved slips surface", () => {
  beforeAll(() => {
    process.env.EXPO_PUBLIC_SUPABASE_URL = TRUSTED_SUPABASE_URL;
  });

  afterAll(() => {
    process.env.EXPO_PUBLIC_SUPABASE_URL = originalSupabaseUrl;
  });

  it("names the saved-slip ledger as Saved instead of a generic log surface", () => {
    const source = readFileSync(path.join(process.cwd(), "src/screens/LogsScreen.tsx"), "utf8");
    const blinkMemoriesSource = readFileSync(
      path.join(process.cwd(), "src/components/BlinkMemoriesCard.tsx"),
      "utf8",
    );
    const combinedSource = [source, blinkMemoriesSource].join("\n");

    expect(source).toContain("Saved Slips");
    expect(source).toContain("PRIVATE SAVED SLIPS");
    expect(combinedSource).toContain("BLINK MEMORIES");
    expect(combinedSource).toContain("Blink Memories");
    expect(combinedSource).toContain("Saved 3-cut strips from private Blinks.");
    expect(source).toContain("<BlinkMemoriesCard messages={saved}");
    expect(source).toContain("BlinkMemoriesCard");
    expect(blinkMemoriesSource).toContain("import type { LegacyMessage }");
    expect(blinkMemoriesSource).toContain("stripFrameUris");
    expect(blinkMemoriesSource).toContain("thumbnailUri");
    expect(blinkMemoriesSource).toContain("No saved Blink memories yet.");
    expect(blinkMemoriesSource).not.toContain("blink-person-model-strip");
    expect(source).toContain("Refresh");
    expect(source).toContain("Saved slips remain in this private list.");
    expect(source).toContain("KotlinHeader");
    expect(source).toContain("MockupSection");
    expect(source).toContain("MockupCard");
    expect(source).toContain("XLineIcon");
    expect(source).toContain("AppSurface backgroundColor={palette.background}");
    expect(source).not.toContain("BEEP-GET LOG");
    expect(source).not.toContain("SLIP LEDGER");
    expect(source).not.toContain("REFRESH LOG");
    expect(source).not.toContain("HeaderBar");
  });

  it("keeps one refresh path instead of duplicating refresh in the body", () => {
    const source = readFileSync(path.join(process.cwd(), "src/screens/LogsScreen.tsx"), "utf8");

    expect((source.match(/label: "Refresh"/g) ?? []).length).toBe(1);
    expect(source).not.toContain('label="Refresh"');
    expect(source).not.toContain("Saved Controls");
  });

  it("builds Blink memories only from saved media-backed messages", () => {
    const frame1Uri = signedBlinkThumbUrl("frame-1.jpg");
    const frame2Uri = signedBlinkThumbUrl("frame-2.jpg");
    const frame3Uri = signedBlinkThumbUrl("frame-3.jpg");

    const memories = getBlinkMemories([
      makeMessage({
        id: "saved-blink-strip",
        kind: "blink",
        media: {
          durationMs: 1800,
          status: "processed",
          thumbnailUri: signedBlinkThumbUrl("thumb.jpg"),
          stripFrameUris: [frame1Uri, frame2Uri, frame3Uri],
          playbackUri: "https://example.com/playback.mp4",
        },
      }),
      makeMessage({
        id: "saved-beep",
        kind: "beep",
        media: null,
      }),
      makeMessage({
        id: "unsaved-blink",
        kind: "blink",
        is_saved: false,
        media: {
          durationMs: 1800,
          status: "processed",
          thumbnailUri: signedBlinkThumbUrl("unsaved-thumb.jpg"),
          stripFrameUris: null,
          playbackUri: null,
        },
      }),
    ]);

    expect(memories).toEqual([
      {
        id: "saved-blink-strip",
        sender: "Nari",
        code: "BLINK-101",
        frameUris: [frame1Uri, frame2Uri, frame3Uri],
      },
    ]);
  });

  it("falls back to the saved Blink thumbnail when no strip frames exist", () => {
    const thumbnailUri = signedBlinkThumbUrl("thumb-only.jpg");

    const memories = getBlinkMemories([
      makeMessage({
        id: "saved-blink-thumb",
        kind: "blink",
        media: {
          durationMs: 1200,
          status: "uploaded",
          thumbnailUri,
          stripFrameUris: null,
          playbackUri: null,
        },
      }),
    ]);

    expect(memories[0]?.frameUris).toEqual([thumbnailUri]);
  });

  it("drops untrusted saved Blink media URIs before rendering memories", () => {
    const trustedFrameUri = signedBlinkThumbUrl("safe-frame.jpg");

    const memories = getBlinkMemories([
      makeMessage({
        id: "mixed-blink-strip",
        kind: "blink",
        media: {
          durationMs: 1800,
          status: "processed",
          thumbnailUri: "https://example.com/thumb.jpg",
          stripFrameUris: [
            "data:image/jpeg;base64,unsafe",
            "file:///cache/frame.jpg",
            "content://media/external/video/media/1",
            trustedFrameUri,
          ],
          playbackUri: null,
        },
      }),
      makeMessage({
        id: "untrusted-only-blink",
        kind: "blink",
        media: {
          durationMs: 1800,
          status: "processed",
          thumbnailUri: "https://example.com/thumb-only.jpg",
          stripFrameUris: [
            "data:image/jpeg;base64,unsafe",
            "file:///cache/frame-only.jpg",
            "content://media/external/video/media/2",
          ],
          playbackUri: null,
        },
      }),
    ]);

    expect(memories).toEqual([
      {
        id: "mixed-blink-strip",
        sender: "Nari",
        code: "BLINK-101",
        frameUris: [trustedFrameUri],
      },
    ]);
  });
});

function signedBlinkThumbUrl(pathname: string): string {
  return `${TRUSTED_SUPABASE_URL}/storage/v1/object/sign/blink-thumbs/${pathname}?token=test-token`;
}

function makeMessage(overrides: Partial<LegacyMessage>): LegacyMessage {
  return {
    id: "message-1",
    from_user: "friend-1",
    to_user: "user-1",
    number_code: "BLINK-101",
    memo: null,
    is_read: false,
    is_saved: true,
    expires_at: "2026-06-08T00:00:00.000Z",
    created_at: "2026-06-07T00:00:00.000Z",
    kind: "blink",
    from_user_profile: {
      nickname: "Nari",
      beep_id: "nari",
      avatar_url: null,
    },
    media: null,
    ...overrides,
  };
}
