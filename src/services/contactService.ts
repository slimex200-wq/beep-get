import * as Contacts from "expo-contacts";
import { supabase } from "@/lib/supabase";

export async function requestContactPermission(): Promise<boolean> {
  const { status } = await Contacts.requestPermissionsAsync();
  return status === "granted";
}

export async function findRegisteredContacts(): Promise<
  Array<{ beepId: string; nickname: string; phoneNumber: string }>
> {
  const { status } = await Contacts.getPermissionsAsync();
  if (status !== "granted") return [];

  const { data } = await Contacts.getContactsAsync({
    fields: [Contacts.Fields.PhoneNumbers],
  });

  const phoneNumbers: string[] = [];
  for (const contact of data) {
    if (contact.phoneNumbers) {
      for (const phoneNumber of contact.phoneNumbers) {
        if (phoneNumber.number) {
          const normalized = phoneNumber.number
            .replace(/[\s\-\(\)]/g, "")
            .replace(/^\+82/, "0");
          phoneNumbers.push(normalized);
        }
      }
    }
  }

  if (phoneNumbers.length === 0) return [];

  void supabase;
  return [];
}

export function generateInviteLink(beepId: string): string {
  return `beepget://add/${beepId}`;
}

export function generateShareText(beepId: string, nickname: string): string {
  return [
    `${nickname} invited you to BEEP-GET.`,
    `Beep ID: ${beepId}`,
    "",
    `Open in app: ${generateInviteLink(beepId)}`,
  ].join("\n");
}
