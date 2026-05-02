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
  if (!code) return { valid: false, error: "숫자 코드를 입력하세요" };
  if (code.length > MAX_CODE_LENGTH)
    return { valid: false, error: `숫자 코드는 ${MAX_CODE_LENGTH}자리 이하여야 합니다` };
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

  const { data, error } = await supabase
    .from("code_presets")
    .insert({ owner_id: userId, code, label: meaning, is_widget_slot: false })
    .select()
    .single();
  if (error) throw error;
  return mapCodePresetToDictionaryEntry(data as CodePresetRow);
}

export async function updateEntry(entryId: string, code: string, meaning: string) {
  const validation = validateDictionaryEntry(code, meaning);
  if (!validation.valid) throw new Error(validation.error);

  const { error } = await supabase
    .from("code_presets")
    .update({ code, label: meaning })
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
