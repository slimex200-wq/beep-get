import type {
  SignalKind,
  SignalMediaStatus,
  SignalPresentationInput,
  SignalStatus,
} from "@/lib/beepBlinkPresentation";

export type LegacySignalMessage = {
  id: string;
  number_code: string;
  memo?: string | null;
  is_read: boolean;
  is_saved?: boolean;
  expires_at: string;
  created_at: string;
  kind?: SignalKind;
  from_user_profile?: {
    nickname?: string | null;
    beep_id?: string | null;
  } | null;
  media?: {
    durationMs: number;
    status: SignalMediaStatus;
    thumbnailUri?: string | null;
    stripFrameUris?: string[] | null;
    playbackUri?: string | null;
  } | null;
};

export function legacyMessageToSignalInput(
  message: LegacySignalMessage
): SignalPresentationInput {
  return {
    id: message.id,
    kind: message.kind ?? (message.media ? "blink" : "beep"),
    code: message.number_code,
    memo: message.memo ?? null,
    status: message.is_read ? "read" : ("sent" satisfies SignalStatus),
    isSaved: Boolean(message.is_saved),
    createdAt: message.created_at,
    expiresAt: message.expires_at,
    sender: {
      nickname: message.from_user_profile?.nickname ?? null,
      beepId: message.from_user_profile?.beep_id ?? null,
    },
    media: message.media ?? null,
  };
}
