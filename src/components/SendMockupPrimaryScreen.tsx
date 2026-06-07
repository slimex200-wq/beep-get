import React from "react";
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { CameraView } from "expo-camera";
import { AppSurface } from "@/components/AppSurface";
import { BlinkCapturePanel } from "@/components/SendBlinkCapturePanel";
import {
  SendMockupSlotGrid,
  SendModeToggle,
  SendRecipientStrip,
  type SendMockupMode,
} from "@/components/SendMockupControls";
import { BackLineIcon, GearLineIcon, SendPlaneIcon } from "@/components/MockupLineIcons";
import { TodayMockupHeader, TodaySectionHeader } from "@/components/TodayMockupChrome";
import { spacing } from "@/design/tokens";
import { type } from "@/design/typography";
import { useAppPalette } from "@/design/appTheme";
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
  readonly onAddSlot: () => void;
  readonly onSelectCombo: (combo: RecentSignalCombo) => void;
  readonly onSend: () => void;
  readonly onRetake: () => void;
  readonly onBack: () => void;
  readonly onOpenSettings: () => void;
  readonly showBackAction?: boolean;
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
  onAddSlot,
  onSelectCombo,
  onSend,
  onRetake,
  onBack,
  onOpenSettings,
  showBackAction = false,
}: Props) {
  const palette = useAppPalette();
  const iconFlight = React.useRef(new Animated.Value(0)).current;
  const primaryLabel = getPrimaryLabel(mode, sentFeedback, sending, recording, hasCapturedBlink);
  const disabled = !code || sending || recording || friends.length === 0;

  const handleSendPress = () => {
    iconFlight.setValue(0);
    Animated.timing(iconFlight, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      iconFlight.setValue(0);
      onSend();
    });
  };

  const headerActions = [
    ...(showBackAction
      ? [{
          label: "Back",
          icon: <BackLineIcon color={palette.text} />,
          accessibilityLabel: "Back",
          onPress: onBack,
        }]
      : []),
    {
      label: "Settings",
      icon: <GearLineIcon color={palette.text} />,
      accessibilityLabel: "Send settings",
      onPress: onOpenSettings,
    },
  ];

  return (
    <AppSurface backgroundColor={palette.background} statusBarStyle={palette.statusBar}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TodayMockupHeader title="SEND" actions={headerActions} />
        <View style={styles.section}>
          <TodaySectionHeader label="To" hint="Choose a friend" />
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
          <TodaySectionHeader label="Signal Slot Deck" hint="Small codes and notes" />
          <SendMockupSlotGrid slots={slots} selected={code} onSelectSlot={onSelectSlot} onAddSlot={onAddSlot} />
        </View>

        <View style={styles.section}>
          <TodaySectionHeader label="Recent Combos" hint="Recent pairings" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.comboRow}>
            {recentCombos.map((combo) => (
              <Pressable
                key={combo.id}
                accessibilityRole="button"
                onPress={() => onSelectCombo(combo)}
                style={({ pressed }) => [
                  styles.comboChip,
                  { backgroundColor: palette.card, borderColor: palette.rule },
                  pressed && styles.pressed,
                ]}
              >
                <Text numberOfLines={1} style={[styles.comboText, { color: palette.text }]}>{combo.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <Pressable
          accessibilityLabel={primaryLabel}
          accessibilityRole="button"
          disabled={disabled}
          onPress={handleSendPress}
          style={({ pressed }) => [
            styles.primaryButton,
            { backgroundColor: palette.primary },
            pressed && styles.pressed,
            disabled && styles.disabled,
          ]}
        >
          <Animated.View
            style={{
              transform: [{
                translateX: iconFlight.interpolate({ inputRange: [0, 1], outputRange: [0, 8] }),
              }],
            }}
          >
            <SendPlaneIcon color={palette.primaryText} />
          </Animated.View>
          <Text style={[styles.primaryText, { color: palette.primaryText }]}>{primaryLabel}</Text>
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
  content: {
    width: "100%",
    maxWidth: 332,
    alignSelf: "center",
    gap: spacing[5],
    paddingHorizontal: spacing[5],
    paddingBottom: 110,
  },
  section: {
    gap: spacing[2],
  },
  comboRow: {
    gap: spacing[2],
    paddingVertical: spacing[1],
  },
  comboChip: {
    minHeight: 30,
    justifyContent: "center",
    paddingHorizontal: spacing[4],
    borderWidth: 1,
    borderRadius: 8,
  },
  comboText: {
    ...type.tinyMono,
  },
  primaryButton: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[3],
    borderRadius: 11,
  },
  primaryText: {
    ...type.buttonMono,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ translateY: 1 }],
  },
  disabled: {
    opacity: 0.48,
  },
});
