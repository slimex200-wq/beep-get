import { supabase } from "@/lib/supabase";
import { MAX_CODE_LENGTH, MAX_MEMO_LENGTH, MESSAGE_TTL_HOURS } from "@/lib/constants";

interface ValidationResult {
  valid: boolean;
  error?: string;
}

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

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + MESSAGE_TTL_HOURS);

  const { data, error } = await supabase
    .from("messages")
    .insert({
      from_user: fromUserId,
      to_user: toUserId,
      number_code: numberCode,
      memo: memo || null,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getReceivedMessages(userId: string) {
  const { data, error } = await supabase
    .from("messages")
    .select("*, from_user_profile:users!messages_from_user_fkey(nickname, beep_id)")
    .eq("to_user", userId)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function markAsRead(messageId: string) {
  const { error } = await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("id", messageId);
  if (error) throw error;
}

export async function saveMessage(messageId: string) {
  const { error } = await supabase
    .from("messages")
    .update({ is_saved: true })
    .eq("id", messageId);
  if (error) throw error;
}

export async function getSavedMessages(userId: string) {
  const { data, error } = await supabase
    .from("messages")
    .select("*, from_user_profile:users!messages_from_user_fkey(nickname, beep_id)")
    .eq("to_user", userId)
    .eq("is_saved", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
