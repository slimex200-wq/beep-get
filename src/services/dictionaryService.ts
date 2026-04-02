import { supabase } from "@/lib/supabase";
import { MAX_CODE_LENGTH } from "@/lib/constants";

interface ValidationResult {
  valid: boolean;
  error?: string;
}

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
    .from("code_dictionary")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addEntry(userId: string, code: string, meaning: string) {
  const validation = validateDictionaryEntry(code, meaning);
  if (!validation.valid) throw new Error(validation.error);

  const { data, error } = await supabase
    .from("code_dictionary")
    .insert({ user_id: userId, code, meaning })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateEntry(entryId: string, code: string, meaning: string) {
  const validation = validateDictionaryEntry(code, meaning);
  if (!validation.valid) throw new Error(validation.error);

  const { error } = await supabase
    .from("code_dictionary")
    .update({ code, meaning })
    .eq("id", entryId);
  if (error) throw error;
}

export async function deleteEntry(entryId: string) {
  const { error } = await supabase
    .from("code_dictionary")
    .delete()
    .eq("id", entryId);
  if (error) throw error;
}
