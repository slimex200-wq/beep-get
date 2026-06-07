const Contacts = require("expo-contacts");
const { supabase } = require("@/lib/supabase");
import {
  requestContactPermission,
  findRegisteredContacts,
  generateInviteLink,
  generateShareText,
} from "@/services/contactService";

beforeEach(() => jest.clearAllMocks());

describe("generateInviteLink", () => {
  it("keeps QR/parser invite deeplink generation available", () => {
    expect(generateInviteLink("12345678")).toBe("beepget://add/12345678");
  });
});

describe("generateShareText", () => {
  it("includes nickname and beep_id without advertising an unhandled add deeplink", () => {
    const text = generateShareText("12345678", "Tester");

    expect(text).toContain("Tester");
    expect(text).toContain("12345678");
    expect(text).toContain("People");
    expect(text).not.toContain("beepget://add/12345678");
    expect(text).not.toContain("Open in app:");
  });
});

describe("requestContactPermission", () => {
  it("returns true when granted", async () => {
    Contacts.requestPermissionsAsync.mockResolvedValue({ status: "granted" });

    const result = await requestContactPermission();
    expect(Contacts.requestPermissionsAsync).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it("returns false when denied", async () => {
    Contacts.requestPermissionsAsync.mockResolvedValue({ status: "denied" });

    const result = await requestContactPermission();
    expect(result).toBe(false);
  });

  it("returns false when undetermined", async () => {
    Contacts.requestPermissionsAsync.mockResolvedValue({ status: "undetermined" });

    const result = await requestContactPermission();
    expect(result).toBe(false);
  });
});

describe("findRegisteredContacts", () => {
  it("returns empty array when permission denied", async () => {
    Contacts.getPermissionsAsync.mockResolvedValue({ status: "denied" });

    const result = await findRegisteredContacts();
    expect(result).toEqual([]);
    expect(Contacts.getContactsAsync).not.toHaveBeenCalled();
  });

  it("returns empty array when no contacts have phone numbers", async () => {
    Contacts.getPermissionsAsync.mockResolvedValue({ status: "granted" });
    Contacts.getContactsAsync.mockResolvedValue({
      data: [{ id: "c1", name: "Test" }],
    });

    const result = await findRegisteredContacts();
    expect(result).toEqual([]);
  });

  it("returns empty array when contacts have empty phone numbers", async () => {
    Contacts.getPermissionsAsync.mockResolvedValue({ status: "granted" });
    Contacts.getContactsAsync.mockResolvedValue({
      data: [{ id: "c1", name: "Test", phoneNumbers: [] }],
    });

    const result = await findRegisteredContacts();
    expect(result).toEqual([]);
  });

  it("returns empty array when phone numbers have no number field", async () => {
    Contacts.getPermissionsAsync.mockResolvedValue({ status: "granted" });
    Contacts.getContactsAsync.mockResolvedValue({
      data: [{ id: "c1", name: "Test", phoneNumbers: [{ label: "mobile" }] }],
    });

    const result = await findRegisteredContacts();
    expect(result).toEqual([]);
  });

  it("processes contacts with valid phone numbers and returns empty (stub implementation)", async () => {
    Contacts.getPermissionsAsync.mockResolvedValue({ status: "granted" });
    Contacts.getContactsAsync.mockResolvedValue({
      data: [
        {
          id: "c1",
          name: "Family",
          phoneNumbers: [{ number: "010-1234-5678", label: "mobile" }],
        },
        {
          id: "c2",
          name: "Friend",
          phoneNumbers: [{ number: "+82 10-9876-5432", label: "mobile" }],
        },
      ],
    });

    const result = await findRegisteredContacts();
    expect(result).toEqual([]);
    expect(Contacts.getContactsAsync).toHaveBeenCalledWith({
      fields: [Contacts.Fields.PhoneNumbers],
    });
    expect(supabase.from).not.toHaveBeenCalled();
    expect(supabase.rpc).not.toHaveBeenCalled();
    expect(supabase.functions.invoke).not.toHaveBeenCalled();
  });

  it("returns empty array when contacts data is empty", async () => {
    Contacts.getPermissionsAsync.mockResolvedValue({ status: "granted" });
    Contacts.getContactsAsync.mockResolvedValue({ data: [] });

    const result = await findRegisteredContacts();
    expect(result).toEqual([]);
  });
});
