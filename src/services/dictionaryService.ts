import { supabase } from "@/lib/supabase";
import { MAX_CODE_LENGTH } from "@/lib/constants";

interface ValidationResult {
  valid: boolean;
  error?: string;
}

export type DictionaryEntry = {
  id: string;
  user_id: string;
  code: string;
  meaning: string;
  created_at: string;
  sort_order: number;
  is_widget_slot: boolean;
};

export type DictionaryEntryOptions = {
  isWidgetSlot?: boolean;
  sortOrder?: number;
};

type CodePresetRow = {
  id: string;
  owner_id: string;
  code: string;
  label: string;
  created_at: string;
  sort_order?: number | null;
  is_widget_slot?: boolean | null;
};

export function validateDictionaryEntry(code: string, meaning: string): ValidationResult {
  const token = code.trim();
  if (!token) return { valid: false, error: "신호 토큰을 입력하세요" };
  if (token.length > MAX_CODE_LENGTH)
    return { valid: false, error: `신호 토큰은 ${MAX_CODE_LENGTH}자 이하여야 합니다` };
  if (/[\r\n]/.test(token)) return { valid: false, error: "신호 토큰은 한 줄이어야 합니다" };
  if (/(https?:\/\/|www\.|:\/\/)/i.test(token))
    return { valid: false, error: "신호 토큰에는 링크를 넣을 수 없습니다" };
  if (!/^[\p{L}\p{N}\p{M}\p{P}\p{S} \u200D]+$/u.test(token))
    return { valid: false, error: "신호 토큰에는 숫자, 글자, 이모지, 짧은 기호만 사용할 수 있습니다" };
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

export async function addEntry(
  userId: string,
  code: string,
  meaning: string,
  options: DictionaryEntryOptions = {},
) {
  const validation = validateDictionaryEntry(code, meaning);
  if (!validation.valid) throw new Error(validation.error);
  const token = code.trim();
  const insertPayload: Record<string, unknown> = {
    owner_id: userId,
    code: token,
    label: meaning,
    is_widget_slot: options.isWidgetSlot ?? false,
  };

  if (typeof options.sortOrder === "number") {
    insertPayload.sort_order = options.sortOrder;
  }

  const { data, error } = await supabase
    .from("code_presets")
    .insert(insertPayload)
    .select()
    .single();
  if (error) throw error;
  return mapCodePresetToDictionaryEntry(data as CodePresetRow);
}

export async function updateEntry(
  entryId: string,
  code: string,
  meaning: string,
  options: DictionaryEntryOptions = {},
) {
  const validation = validateDictionaryEntry(code, meaning);
  if (!validation.valid) throw new Error(validation.error);
  const token = code.trim();
  const updatePayload: Record<string, unknown> = { code: token, label: meaning };

  if (typeof options.isWidgetSlot === "boolean") {
    updatePayload.is_widget_slot = options.isWidgetSlot;
  }
  if (typeof options.sortOrder === "number") {
    updatePayload.sort_order = options.sortOrder;
  }

  const { error } = await supabase
    .from("code_presets")
    .update(updatePayload)
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

function mapCodePresetToDictionaryEntry(row: CodePresetRow): DictionaryEntry {
  return {
    id: row.id,
    user_id: row.owner_id,
    code: row.code,
    meaning: row.label,
    created_at: row.created_at,
    sort_order: row.sort_order ?? 0,
    is_widget_slot: row.is_widget_slot ?? false,
  };
}
