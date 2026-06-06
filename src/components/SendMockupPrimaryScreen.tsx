import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { CameraView } from "expo-camera";
import { AppSurface } from "@/components/AppSurface";
import { BlinkCapturePanel } from "@/components/SendBlinkCapturePanel";
import {
  SendMockupSlotGrid,
  SendModeToggle,
  SendRecipientStrip,
  type SendMockupMode,
} from "@/components/SendMockupControls";
import { GearLineIcon, SendPlaneIcon } from "@/components/MockupLineIcons";
import { TodayMockupHeader, TodaySectionHeader } from "@/components/TodayMockupChrome";
import { colors, spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import type { PickableFriend } from "@/components/FriendPickerStrip";
import type { RecentSignalCombo } from "@/components/RecentSignalCombos";

type Props = {
  readonly mode: SendMockupMode;
  readonly friends: readonly PickableFriend[];
  readonly selectedId: string | null;
  readonly code: string;
  readonly slots: readonly string[];
  readonly recentCombos: readonly RecentSignalCombo[];
  readonly sending: boolean;
  readonly recording: boolean;
  readonly hasCapturedBlink: boolean;
  readonly sentFeedback: boolean;
  readonly previewFrameUris: readonly string[];
  readonly cameraPermissionGranted: boolean;
  readonly previewMode: boolean;
  readonly cameraRef: React.RefObject<CameraView | null>;
  readonly onSelectMode: (mode: SendMockupMode) => void;
  readonly onSelect: (friend: PickableFriend) => void;
  readonly onAddFriend: () => void;
  readonly onSelectSlot: (slot: string) => void;
  readonly onSelectCombo: (combo: RecentSignalCombo) => void;
  readonly onSend: () => void;
  readonly onRetake: () => void;
  readonly onOpenSettings: () => void;
};

export function SendMockupPrimaryScreen({
  mode,
  friends,
  selectedId,
  code,
  slots,
  recentCombos,
  sending,
  recording,
  hasCapturedBlink,
  sentFeedback,
  previewFrameUris,
  cameraPermissionGranted,
  previewMode,
  cameraRef,
  onSelectMode,
  onSelect,
  onAddFriend,
  onSelectSlot,
  onSelectCombo,
  onSend,
  onRetake,
  onOpenSettings,
}: Props) {
  const primaryLabel = getPrimaryLabel(mode, sentFeedback, sending, recording, hasCapturedBlink);
  const disabled = !code || sending || recording || friends.length === 0;

  return (
    <AppSurface backgroundColor={colors.ivory} statusBarStyle="dark">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TodayMockupHeader
          title="SEND"
          actions={[
            {
              label: "Settings",
              accessibilityLabel: "Send settings",
              icon: <GearLineIcon color={colors.ink} />,
              onPress: onOpenSettings,
            },
          ]}
        />
        <View style={styles.section}>
          <TodaySectionHeader label="To" hint="신호를 보낼 친구" />
          <SendRecipientStrip
            friends={friends}
            selectedId={selectedId}
            onSelect={onSelect}
            onAddFriend={onAddFriend}
          />
        </View>

        <SendModeToggle mode={mode} onSelectMode={onSelectMode} />
        {mode === "blink" ? (
          <BlinkCapturePanel
            cameraRef={cameraRef}
            cameraPermissionGranted={cameraPermissionGranted}
            previewMode={previewMode}
            frameUris={previewFrameUris}
            recording={recording}
            hasCapturedBlink={hasCapturedBlink}
            onRetake={onRetake}
          />
        ) : null}

        <View style={styles.section}>
          <TodaySectionHeader label="Signal Slot Deck" hint="작은 숫자와 말" />
          <SendMockupSlotGrid slots={slots} selected={code} onSelectSlot={onSelectSlot} />
        </View>

        <View style={styles.section}>
          <TodaySectionHeader label="Recent Combos" hint="방금 쓴 조합" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.comboRow}>
            {recentCombos.map((combo) => (
              <Pressable
                key={combo.id}
                accessibilityRole="button"
                onPress={() => onSelectCombo(combo)}
                style={({ pressed }) => [styles.comboChip, pressed && styles.pressed]}
              >
                <Text numberOfLines={1} style={styles.comboText}>{combo.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <Pressable
          accessibilityLabel={primaryLabel}
          accessibilityRole="button"
          disabled={disabled}
          onPress={onSend}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed, disabled && styles.disabled]}
        >
          <SendPlaneIcon color={colors.white} />
          <Text style={styles.primaryText}>{primaryLabel}</Text>
        </Pressable>
      </ScrollView>
    </AppSurface>
  );
}

function getPrimaryLabel(
  mode: SendMockupMode,
  sentFeedback: boolean,
  sending: boolean,
  recording: boolean,
  hasCapturedBlink: boolean,
) {
  if (sentFeedback) return "Sent";
  if (recording) return "Recording 2.0s";
  if (sending) return "Sending";
  if (mode === "blink") return hasCapturedBlink ? "Send Blink" : "Capture Blink";
  return "SEND BEEP";
}

const styles = StyleSheet.create({
  content: { width: "100%", maxWidth: 332, alignSelf: "center", gap: spacing[5], paddingHorizontal: spacing[5], paddingBottom: 110 },
  section: { gap: spacing[2] },
  comboRow: { gap: spacing[2], paddingVertical: spacing[1] },
  comboChip: { minHeight: 30, justifyContent: "center", paddingHorizontal: spacing[4], borderWidth: 1, borderColor: "rgba(10,10,10,0.14)", borderRadius: 8, backgroundColor: "#FFFDF9" },
  comboText: { ...type.tinyMono, color: colors.ink },
  primaryButton: { minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing[3], borderRadius: 11, backgroundColor: colors.lavender },
  primaryText: { ...type.buttonMono, color: colors.white },
  pressed: { opacity: 0.82, transform: [{ translateY: 1 }] },
  disabled: { opacity: 0.48 },
});
