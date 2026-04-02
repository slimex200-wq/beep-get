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

  // Extract phone numbers
  const phoneNumbers: string[] = [];
  for (const contact of data) {
    if (contact.phoneNumbers) {
      for (const pn of contact.phoneNumbers) {
        if (pn.number) {
          // Normalize: remove spaces, dashes, country code
          const normalized = pn.number.replace(/[\s\-\(\)]/g, "").replace(/^\+82/, "0");
          phoneNumbers.push(normalized);
        }
      }
    }
  }

  if (phoneNumbers.length === 0) return [];

  // Check which phone numbers are registered (requires a lookup function on Supabase)
  // For now, return empty — actual implementation needs a phone_number column or Edge Function
  return [];
}

export function generateInviteLink(beepId: string): string {
  return `beepget://add/${beepId}`;
}

export function generateShareText(beepId: string, nickname: string): string {
  return `${nickname}님이 BEEP-GET으로 초대합니다! 삐삐 번호: ${beepId}\n\n다운로드: beepget://add/${beepId}`;
}
