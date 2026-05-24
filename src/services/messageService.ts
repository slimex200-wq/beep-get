import { supabase } from "@/lib/supabase";
import { MAX_CODE_LENGTH, MAX_MEMO_LENGTH } from "@/lib/constants";
import { buildQuickReplyClientActionId } from "@/lib/widgetActions";
import {
  BLINK_ORIGINALS_BUCKET,
  BLINK_THUMBS_BUCKET,
} from "@/services/mediaStorage";
import { notifySignal } from "@/services/pushService";

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
    playbackUri?: string | number | null;
  } | null;
};

export function validateMessage(code: string, memo?: string): ValidationResult {
  const token = code.trim();
  if (!token) return { valid: false, error: "신호 토큰을 입력하세요" };
  if (token.length > MAX_CODE_LENGTH)
    return { valid: false, error: `신호 토큰은 ${MAX_CODE_LENGTH}자 이하여야 합니다` };
  if (/[\r\n]/.test(token)) return { valid: false, error: "신호 토큰은 한 줄이어야 합니다" };
  if (/(https?:\/\/|www\.|:\/\/)/i.test(token))
    return { valid: false, error: "신호 토큰에는 링크를 넣을 수 없습니다" };
  if (!/^[0-9A-Za-z가-힣!?+_. -]+$/.test(token))
    return { valid: false, error: "신호 토큰에는 숫자, 글자, 짧은 기호만 사용할 수 있습니다" };
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
  const token = numberCode.trim();
  const validation = validateMessage(token, memo);
  if (!validation.valid) throw new Error(validation.error);

  void fromUserId;

  const { data, error } = await supabase.rpc("send_beep", {
    p_receiver_id: toUserId,
    p_code: token,
    p_memo: memo ?? null,
  });

  if (error) throw error;
  const message = mapSignalToLegacyMessage(data as SignalRow);
  // Push notification is a non-blocking nicety - the signal is already in
  // the DB and the receiver will see it on next fetch / realtime. Silent
  // catch is intentional; surface via Supabase logs / Sentry when wired.
  notifySignal(message.id).catch(() => {});
  return message;
}

export async function sendQuickReplyToMessage(
  currentUserId: string,
  sourceMessage: LegacyMessage,
  numberCode: string,
  clientActionId?: string
) {
  if (sourceMessage.to_user !== currentUserId) {
    throw new Error("Cannot reply to a signal that was not received by this user");
  }

  const token = numberCode.trim();
  const validation = validateMessage(token);
  if (!validation.valid) throw new Error(validation.error);
  const actionId = clientActionId ?? buildQuickReplyClientActionId(sourceMessage.id, token);

  const { data, error } = await supabase.rpc("reply_with_preset_once", {
    p_signal_id: sourceMessage.id,
    p_code: token,
    p_client_action_id: actionId,
  });

  if (error) throw error;
  const message = mapSignalToLegacyMessage(data as SignalRow);
  // Same as sendMessage: push is non-blocking, receiver picks up the
  // reply on next fetch / realtime if the push call itself errors.
  notifySignal(message.id).catch(() => {});
  return message;
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
  return resolveSignedBlinkMediaUrls(
    mapSignalsToLegacyMessages(data as SignalRow[] | null)
  );
}

export async function getMessageById(messageId: string) {
  const { data, error } = await supabase
    .from("signals")
    .select(
      "*, from_user_profile:profiles!signals_sender_id_fkey(nickname, beep_id), media:signal_media(*)"
    )
    .eq("id", messageId)
    .single();

  if (error) throw error;
  return resolveSignedBlinkMediaUrl(mapSignalToLegacyMessage(data as SignalRow));
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
  return resolveSignedBlinkMediaUrls(
    mapSignalsToLegacyMessages(data as SignalRow[] | null)
  );
}

async function resolveSignedBlinkMediaUrls(messages: LegacyMessage[]) {
  return Promise.all(messages.map(resolveSignedBlinkMediaUrl));
}

async function resolveSignedBlinkMediaUrl(message: LegacyMessage) {
  const media = message.media;
  if (!media) return message;

  const [thumbnailUri, signedStripFrameUris, playbackUri] = await Promise.all([
    signStorageKey(BLINK_THUMBS_BUCKET, media.thumbnailUri),
    Promise.all(
      (media.stripFrameUris ?? []).map((uri) =>
        signStorageKey(BLINK_THUMBS_BUCKET, uri)
      )
    ),
    signStorageKey(
      BLINK_ORIGINALS_BUCKET,
      typeof media.playbackUri === "string" ? media.playbackUri : null
    ),
  ]);

  return {
    ...message,
    media: {
      ...media,
      thumbnailUri,
      stripFrameUris: signedStripFrameUris.filter(
        (uri): uri is string => Boolean(uri)
      ),
      playbackUri,
    },
  };
}

async function signStorageKey(bucket: string, value?: string | null) {
  if (!value || !shouldSignStorageKey(value)) return value ?? null;

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(value, 60);

  if (error) throw error;
  return data?.signedUrl ?? value;
}

function shouldSignStorageKey(value: string) {
  return !/^(https?:|file:|content:|data:|asset:|preview-)/i.test(value);
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
