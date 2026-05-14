import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { getRuntimePlatform } from "@/lib/runtimePlatform";
import { supabase } from "@/lib/supabase";

type NotificationData = {
  signalId?: unknown;
  kind?: unknown;
};

export function getNotificationSignalId(response: Notifications.NotificationResponse) {
  const data = response.notification.request.content.data as NotificationData;
  return typeof data?.signalId === "string" ? data.signalId : null;
}

export async function registerPushToken(userId: string) {
  const platform = getRuntimePlatform();
  if (platform === "web") return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  const finalStatus =
    existingStatus === "granted"
      ? existingStatus
      : (await Notifications.requestPermissionsAsync()).status;

  if (finalStatus !== "granted") return null;

  const projectId =
    Constants.easConfig?.projectId ?? Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) {
    throw new Error("EAS projectId is required for Expo push tokens.");
  }

  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  const expoPushToken = token.data;
  const { error } = await supabase.from("push_tokens").upsert(
    {
      user_id: userId,
      expo_push_token: expoPushToken,
      platform,
      enabled: true,
      last_seen_at: new Date().toISOString(),
    },
    { onConflict: "expo_push_token" },
  );

  if (error) throw error;
  return expoPushToken;
}

export async function notifySignal(signalId: string) {
  const { error } = await supabase.functions.invoke("send-signal-push", {
    body: { signalId },
  });
  if (error) throw error;
}
