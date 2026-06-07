import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import type { LegacyMessage } from "@/services/messageService";
import { spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { useAppPalette } from "@/design/appTheme";

type BlinkMemoriesCardProps = {
  readonly messages: readonly LegacyMessage[];
};

type BlinkMemory = {
  readonly id: string;
  readonly sender: string;
  readonly code: string;
  readonly frameUris: readonly string[];
};

export function BlinkMemoriesCard({ messages }: BlinkMemoriesCardProps) {
  const palette = useAppPalette();
  const memories = getBlinkMemories(messages);

  return (
    <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.rule }]}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={[styles.title, { color: palette.text }]}>Blink Memories</Text>
          <Text style={[type.bodyMuted, { color: palette.muted }]}>
            Saved 3-cut strips from private Blinks.
          </Text>
        </View>
        <Text style={[styles.hint, { color: palette.muted }]}>3-cut archive</Text>
      </View>

      {memories.length > 0 ? (
        <View style={styles.memoryList}>
          {memories.map((memory) => (
            <View key={memory.id} style={styles.memoryBlock}>
              <View style={styles.memoryMeta}>
                <Text style={[styles.sender, { color: palette.text }]} numberOfLines={1}>
                  {memory.sender}
                </Text>
                <Text style={[styles.code, { color: palette.muted }]} numberOfLines={1}>
                  {memory.code}
                </Text>
              </View>
              <View style={styles.strip}>
                {memory.frameUris.map((uri, index) => (
                  <View key={`${memory.id}-${uri}-${index}`} style={[styles.frame, { backgroundColor: palette.input }]}>
                    <Image source={{ uri }} style={styles.image} resizeMode="cover" />
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={[styles.emptyState, { backgroundColor: palette.input, borderColor: palette.rule }]}>
          <Text style={[styles.emptyTitle, { color: palette.text }]}>No saved Blink memories yet.</Text>
          <Text style={[type.bodyMuted, { color: palette.muted }]}>
            Save a Blink with media and its strip will appear here.
          </Text>
        </View>
      )}
    </View>
  );
}

export function getBlinkMemories(messages: readonly LegacyMessage[]): readonly BlinkMemory[] {
  return messages
    .filter((message) => message.is_saved && (message.kind === "blink" || Boolean(message.media)))
    .map(toBlinkMemory)
    .filter((memory): memory is BlinkMemory => memory !== null)
    .slice(0, 3);
}

function toBlinkMemory(message: LegacyMessage): BlinkMemory | null {
  const media = message.media;
  if (!media) return null;
  if (media.status === "failed" || media.status === "expired" || media.status === "deleted") return null;

  const stripFrameUris = (media.stripFrameUris ?? [])
    .map(toTrustedBlinkMemoryFrameUri)
    .filter((uri): uri is string => uri !== null)
    .slice(0, 3);
  const thumbnailUri = toTrustedBlinkMemoryFrameUri(media.thumbnailUri);
  const frameUris = stripFrameUris.length > 0 ? stripFrameUris : thumbnailUri ? [thumbnailUri] : [];

  if (frameUris.length === 0) return null;

  return {
    id: message.id,
    sender: message.from_user_profile?.nickname?.trim() || "UNKNOWN",
    code: message.number_code,
    frameUris,
  };
}

function toTrustedBlinkMemoryFrameUri(uri: string | null | undefined): string | null {
  const trimmed = uri?.trim();
  if (!trimmed) return null;
  if (isSignedBlinkThumbStorageUri(trimmed)) return trimmed;
  if (isScopedPreviewBlinkMemoryUri(trimmed)) return trimmed;
  return null;
}

function isSignedBlinkThumbStorageUri(uri: string): boolean {
  const configuredSupabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
  if (!configuredSupabaseUrl) return false;

  let parsed: URL;
  let configured: URL;
  try {
    parsed = new URL(uri);
    configured = new URL(configuredSupabaseUrl);
  } catch (error) {
    if (error instanceof TypeError) return false;
    throw error;
  }

  const signedBlinkThumbPath = "/storage/v1/object/sign/blink-thumbs/";
  if (parsed.protocol !== "https:") return false;
  if (parsed.origin !== configured.origin) return false;
  if (!parsed.pathname.startsWith(signedBlinkThumbPath)) return false;
  if (parsed.pathname.length <= signedBlinkThumbPath.length) return false;
  return Boolean(parsed.searchParams.get("token"));
}

function isScopedPreviewBlinkMemoryUri(uri: string): boolean {
  return /^preview-[A-Za-z0-9._-]+$/.test(uri);
}

const styles = StyleSheet.create({
  card: {
    gap: spacing[4],
    padding: spacing[4],
    borderWidth: 1,
    borderRadius: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing[3],
  },
  headerCopy: {
    flex: 1,
    gap: spacing[1],
  },
  title: {
    ...type.metaValue,
    fontSize: 13,
  },
  hint: {
    ...type.tinyMono,
  },
  memoryList: {
    gap: spacing[4],
  },
  memoryBlock: {
    gap: spacing[2],
  },
  memoryMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing[3],
  },
  sender: {
    ...type.metaValue,
    flex: 1,
    fontSize: 11,
  },
  code: {
    ...type.tinyMono,
    maxWidth: "48%",
  },
  strip: {
    flexDirection: "row",
    gap: spacing[3],
  },
  frame: {
    flex: 1,
    aspectRatio: 1.2,
    overflow: "hidden",
    borderRadius: 10,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  emptyState: {
    gap: spacing[2],
    padding: spacing[4],
    borderWidth: 1,
    borderRadius: 12,
  },
  emptyTitle: {
    ...type.metaValue,
    fontSize: 12,
  },
});
