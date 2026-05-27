import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { BlinkStrip } from "@/components/BlinkStrip";
import { colors, radius, spacing } from "@/design/tokens";
import { type } from "@/design/typography";

type Props = {
  playbackUri?: string | number | null;
  frameUris?: string[] | null;
  sender: string;
};

export function BlinkHeroPreview({ playbackUri, frameUris, sender }: Props) {
  const player = useVideoPlayer(playbackUri ?? null, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  const hasPlayback = Boolean(playbackUri);

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>Incoming Blink</Text>
        <Text style={styles.meta}>2.0s private video</Text>
      </View>
      {hasPlayback ? (
        <View style={styles.videoShell}>
          <VideoView
            player={player}
            style={styles.video}
            nativeControls={false}
            contentFit="cover"
            allowsFullscreen={false}
            surfaceType="textureView"
          />
          <View style={styles.videoOverlay}>
            <Text style={styles.overlayText}>{sender}</Text>
            <Text style={styles.overlayTime}>BLINK / LIVE</Text>
          </View>
        </View>
      ) : (
        <BlinkStrip frameUris={frameUris} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing[3],
  },
  header: {
    minHeight: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[3],
  },
  title: {
    ...type.metaValue,
    fontSize: 11,
  },
  meta: {
    ...type.tinyMono,
    color: colors.muted,
  },
  videoShell: {
    height: 210,
    borderRadius: radius.control,
    overflow: "hidden",
    backgroundColor: colors.ink,
    borderWidth: 1,
    borderColor: colors.ruleStrong,
  },
  video: {
    width: "100%",
    height: "100%",
  },
  videoOverlay: {
    position: "absolute",
    left: spacing[3],
    right: spacing[3],
    bottom: spacing[3],
    minHeight: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[3],
    paddingHorizontal: spacing[3],
    borderRadius: radius.pill,
    backgroundColor: "rgba(0,0,0,0.54)",
  },
  overlayText: {
    ...type.metaValue,
    color: colors.white,
  },
  overlayTime: {
    ...type.tinyMono,
    color: colors.white,
  },
});
