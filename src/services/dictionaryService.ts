import { supabase } from "@/lib/supabase";
import { MAX_CODE_LENGTH } from "@/lib/constants";

interface ValidationResult {
  valid: boolean;
  error?: string;
}

type CodePresetRow = {
  id: string;
  owner_id: string;
  code: string;
  label: string;
  created_at: string;
};

export function validateDictionaryEntry(code: string, meaning: string): ValidationResult {
  const token = code.trim();
  if (!token) return { valid: false, error: "신호 토큰을 입력하세요" };
  if (token.length > MAX_CODE_LENGTH)
    return { valid: false, error: `신호 토큰은 ${MAX_CODE_LENGTH}자 이하여야 합니다` };
  if (/[\r\n]/.test(token)) return { valid: false, error: "신호 토큰은 한 줄이어야 합니다" };
  if (/(https?:\/\/|www\.|:\/\/)/i.test(token))
    return { valid: false, error: "신호 토큰에는 링크를 넣을 수 없습니다" };
  if (!/^[0-9A-Za-z가-힣!?+_. -]+$/.test(token))
    return { valid: false, error: "신호 토큰에는 숫자, 글자, 짧은 기호만 사용할 수 있습니다" };
  if (!meaning) return { valid: false, error: "의미를 입력하세요" };
  if (meaning.length > 50)
    return { valid: false, error: "의미는 50자 이하여야 합니다" };
  return { valid: true };
}

export async function getDictionary(userId: string) {
  const { data, error } = await supabase
    .from("code_presets")
    .select("*")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as CodePresetRow[]).map(mapCodePresetToDictionaryEntry);
}

export async function addEntry(userId: string, code: string, meaning: string) {
  const validation = validateDictionaryEntry(code, meaning);
  if (!validation.valid) throw new Error(validation.error);
  const token = code.trim();

  const { data, error } = await supabase
    .from("code_presets")
    .insert({ owner_id: userId, code: token, label: meaning, is_widget_slot: false })
    .select()
    .single();
  if (error) throw error;
  return mapCodePresetToDictionaryEntry(data as CodePresetRow);
}

export async function updateEntry(entryId: string, code: string, meaning: string) {
  const validation = validateDictionaryEntry(code, meaning);
  if (!validation.valid) throw new Error(validation.error);
  const token = code.trim();

  const { error } = await supabase
    .from("code_presets")
    .update({ code: token, label: meaning })
    .eq("id", entryId);
  if (error) throw error;
}

export async function deleteEntry(entryId: string) {
  const { error } = await supabase
    .from("code_presets")
    .delete()
    .eq("id", entryId);
  if (error) throw error;
}

function mapCodePresetToDictionaryEntry(row: CodePresetRow) {
  return {
    id: row.id,
    user_id: row.owner_id,
    code: row.code,
    meaning: row.label,
    created_at: row.created_at,
  };
}
