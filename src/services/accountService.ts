import { supabase } from "@/lib/supabase";

export const ACCOUNT_DELETION_CONFIRMATION = "DELETE_ACCOUNT";

export type DeleteAccountResult = {
  deleted: boolean;
  requestId?: string | null;
};

export async function deleteAccount(): Promise<DeleteAccountResult> {
  const { data, error } = await supabase.functions.invoke("delete-account", {
    method: "POST",
    body: { confirmation: ACCOUNT_DELETION_CONFIRMATION },
  });

  if (error) {
    throw normalizeDeleteAccountError(error);
  }

  return readDeleteAccountResult(data);
}

function readDeleteAccountResult(data: unknown): DeleteAccountResult {
  if (!data || typeof data !== "object") {
    return { deleted: true, requestId: null };
  }

  const row = data as Partial<DeleteAccountResult>;
  return {
    deleted: row.deleted !== false,
    requestId: typeof row.requestId === "string" ? row.requestId : null,
  };
}

function normalizeDeleteAccountError(error: unknown): Error {
  if (error instanceof Error) return error;
  if (error && typeof error === "object" && "message" in error) {
    return new Error(String((error as { message?: unknown }).message));
  }
  return new Error("Account deletion failed.");
}
