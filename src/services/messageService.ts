import { supabase } from "@/lib/supabase";
import { MAX_CODE_LENGTH, MAX_MEMO_LENGTH } from "@/lib/constants";

interface ValidationResult {
  valid: boolean;
  error?: string;
}

type SignalKind = "beep" | "blink";
type SignalStatus = "sent" | "delivered" | "read" | "dismissed";
type SignalMediaStatus =
  | "pending_upload"
  | "uploaded"
  | "processed"
  | "failed"
  | "expired"
  | "deleted";

type SignalMediaRow = {
  duration_ms: number;
  status: SignalMediaStatus;
  thumbnail_key: string | null;
  strip_keys: string[] | null;
  object_key: string;
};

type SignalRow = {
  id: string;
  kind: SignalKind;
  sender_id: string;
  receiver_id: string;
  code: string;
  memo: string | null;
  status: SignalStatus;
  is_saved: boolean;
  expires_at: string;
  created_at: string;
  from_user_profile?: { nickname: string | null; beep_id: string | null } | null;
  media?: SignalMediaRow | SignalMediaRow[] | null;
};

export type LegacyMessage = {
  id: string;
  from_user: string;
  to_user: string;
  number_code: string;
  memo: string | null;
  is_read: boolean;
  is_saved: boolean;
  expires_at: string;
  created_at: string;
  kind?: SignalKind;
  from_user_profile?: { nickname: string | null; beep_id: string | null } | null;
  media?: {
    durationMs: number;
    status: SignalMediaStatus;
    thumbnailUri?: string | null;
    stripFrameUris?: string[] | null;
    playbackUri?: string | null;
  } | null;
};

export function validateMessage(code: string, memo?: string): ValidationResult {
  if (!code) return { valid: false, error: "숫자 코드를 입력하세요" };
  if (code.length > MAX_CODE_LENGTH)
    return { valid: false, error: `숫자 코드는 ${MAX_CODE_LENGTH}자리 이하여야 합니다` };
  if (!/^\d+$/.test(code))
    return { valid: false, error: "숫자만 입력 가능합니다" };
  if (memo && memo.length > MAX_MEMO_LENGTH)
    return { valid: false, error: `메모는 ${MAX_MEMO_LENGTH}자 이하여야 합니다` };
  return { valid: true };
}

export async function sendMessage(
  fromUserId: string,
  toUserId: string,
  numberCode: string,
  memo?: string
) {
  const validation = validateMessage(numberCode, memo);
  if (!validation.valid) throw new Error(validation.error);

  void fromUserId;

  const { data, error } = await supabase.rpc("send_beep", {
    p_receiver_id: toUserId,
    p_code: numberCode,
    p_memo: memo ?? null,
  });

  if (error) throw error;
  return mapSignalToLegacyMessage(data as SignalRow);
}

export async function sendQuickReplyToMessage(
  currentUserId: string,
  sourceMessage: LegacyMessage,
  numberCode: string
) {
  if (sourceMessage.to_user !== currentUserId) {
    throw new Error("Cannot reply to a signal that was not received by this user");
  }

  const validation = validateMessage(numberCode);
  if (!validation.valid) throw new Error(validation.error);

  return sendMessage(currentUserId, sourceMessage.from_user, numberCode);
}

export async function getReceivedMessages(userId: string) {
  const { data, error } = await supabase
    .from("signals")
    .select(
      "*, from_user_profile:profiles!signals_sender_id_fkey(nickname, beep_id), media:signal_media(*)"
    )
    .eq("receiver_id", userId)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  if (error) throw error;
  return mapSignalsToLegacyMessages(data as SignalRow[] | null);
}

export async function markAsRead(messageId: string) {
  const { error } = await supabase.rpc("mark_signal_read", {
    p_signal_id: messageId,
  });
  if (error) throw error;
}

export async function saveMessage(messageId: string) {
  const { error } = await supabase.rpc("save_signal", {
    p_signal_id: messageId,
  });
  if (error) throw error;
}

export async function getSavedMessages(userId: string) {
  const { data, error } = await supabase
    .from("signals")
    .select(
      "*, from_user_profile:profiles!signals_sender_id_fkey(nickname, beep_id), media:signal_media(*)"
    )
    .eq("receiver_id", userId)
    .eq("is_saved", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return mapSignalsToLegacyMessages(data as SignalRow[] | null);
}

function mapSignalsToLegacyMessages(signals: SignalRow[] | null): LegacyMessage[] {
  return (signals ?? []).map(mapSignalToLegacyMessage);
}

function mapSignalToLegacyMessage(signal: SignalRow): LegacyMessage {
  const media = firstSignalMedia(signal.media);
  return {
    id: signal.id,
    from_user: signal.sender_id,
    to_user: signal.receiver_id,
    number_code: signal.code,
    memo: signal.memo,
    is_read: signal.status === "read",
    is_saved: signal.is_saved,
    expires_at: signal.expires_at,
    created_at: signal.created_at,
    kind: signal.kind,
    from_user_profile: signal.from_user_profile ?? null,
    media: media
      ? {
          durationMs: media.duration_ms,
          status: media.status,
          thumbnailUri: media.thumbnail_key,
          stripFrameUris: media.strip_keys ?? [],
          playbackUri: media.object_key,
        }
      : null,
  };
}

function firstSignalMedia(
  media: SignalMediaRow | SignalMediaRow[] | null | undefined
): SignalMediaRow | null {
  if (!media) return null;
  return Array.isArray(media) ? (media[0] ?? null) : media;
}
