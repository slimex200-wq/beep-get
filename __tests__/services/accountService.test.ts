const { supabase } = require("@/lib/supabase");
import { ACCOUNT_DELETION_CONFIRMATION, deleteAccount } from "@/services/accountService";

beforeEach(() => jest.clearAllMocks());

describe("deleteAccount", () => {
  it("calls the delete-account Edge Function with confirmation", async () => {
    supabase.functions.invoke.mockResolvedValue({
      data: { deleted: true, requestId: "request-1" },
      error: null,
    });

    await expect(deleteAccount()).resolves.toEqual({
      deleted: true,
      requestId: "request-1",
    });

    expect(supabase.functions.invoke).toHaveBeenCalledWith("delete-account", {
      method: "POST",
      body: { confirmation: ACCOUNT_DELETION_CONFIRMATION },
    });
  });

  it("throws when the Edge Function fails", async () => {
    supabase.functions.invoke.mockResolvedValue({
      data: null,
      error: { message: "delete failed" },
    });

    await expect(deleteAccount()).rejects.toThrow("delete failed");
  });
});
