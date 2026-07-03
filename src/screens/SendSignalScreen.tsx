import React from "react";
import { Animated, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { PickableFriend } from "@/components/FriendPickerStrip";
import { BackLineIcon, GearLineIcon, SendPlaneIcon } from "@/components/MockupLineIcons";
import { BlinkCapturePanel } from "@/components/SendBlinkCapturePanel";
import { SendSettingsSheet } from "@/components/SendSettingsSheet";
import { useAppPalette } from "@/design/appTheme";
import { radius, spacing } from "@/design/tokens";
import { font, type } from "@/design/typography";
import { getAvatarImageSource } from "@/lib/avatarSource";
import { useSendSignalController, type SendMode } from "@/screens/send/useSendSignalController";
import { Chip, PrimaryButton, Screen, SectionLabel, Segmented } from "@/ui/primitives";

const MODE_OPTIONS = [
  { key: "beep", label: "BEEP" },
  { key: "blink", label: "BLINK" },
] as const;

export function SendSignalScreen() {
  const controller = useSendSignalController();
  const palette = useAppPalette();
  const iconFlight = React.useRef(new Animated.Value(0)).current;

  const mode = controller.mode;
  const code = controller.code;
  const recipient = controller.recipient;
  const hasCapturedBlink = Boolean(controller.blinkDraft);
  const primaryLabel = getPrimaryLabel(
    mode,
    controller.sentFeedback,
    controller.sending,
    controller.recording,
    hasCapturedBlink,
  );
  const disabled = !code || controller.sending || controller.recording || controller.friendOptions.length === 0;
  const onSend = mode === "beep" ? controller.sendBeep : controller.sendBlink;

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

  return (
    <>
      <Screen
        title="Send"
        headerRight={
          <View style={styles.headerActions}>
            {controller.isModalFlow ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Back"
                hitSlop={8}
                onPress={controller.goBackToFlow}
                style={({ pressed }) => [styles.headerAction, pressed && styles.pressed]}
              >
                <BackLineIcon color={palette.text} />
              </Pressable>
            ) : null}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Send settings"
              hitSlop={8}
              onPress={controller.openSendSettings}
              style={({ pressed }) => [styles.headerAction, pressed && styles.pressed]}
            >
              <GearLineIcon color={palette.text} />
            </Pressable>
          </View>
        }
      >
        <Segmented options={MODE_OPTIONS} value={mode} onChange={controller.setMode} />

        {mode === "blink" ? (
          <>
            <SectionLabel>2초 캡처</SectionLabel>
            <BlinkCapturePanel
              cameraRef={controller.cameraRef}
              cameraPermissionGranted={controller.cameraPermissionGranted}
              previewMode={controller.previewMode}
              frameUris={controller.visibleFrameUris}
              recording={controller.recording}
              hasCapturedBlink={hasCapturedBlink}
              onRetake={controller.clearBlinkDraft}
            />
          </>
        ) : null}

        <SectionLabel>받는 사람</SectionLabel>
        <SendToRail
          friends={controller.friendOptions}
          selectedId={recipient?.id ?? null}
          onSelect={controller.selectRecipient}
          onAddFriend={controller.openPeople}
        />

        <SectionLabel>신호 코드</SectionLabel>
        <SendCodeDeck
          slots={controller.slotDeck}
          selected={code}
          onSelectSlot={controller.selectSlot}
          onAddSlot={controller.openDictionary}
        />

        <View style={styles.summaryLine}>
          {recipient && code ? (
            <Text style={[styles.summaryText, { color: palette.muted }]}>
              <Text style={[styles.summaryName, { color: palette.text }]}>{recipient.name}</Text>
              에게{" "}
              <Text style={[styles.summaryCode, { color: palette.text }]}>{code}</Text>
              {controller.codeMeaning ? ` · ${controller.codeMeaning}` : ""}
              {mode === "blink"
                ? hasCapturedBlink
                  ? " + Blink 2.0s"
                  : <Text style={{ color: palette.sig }}> · Blink 캡처 필요</Text>
                : null}
            </Text>
          ) : (
            <Text style={[styles.summaryText, { color: palette.muted }]}>친구와 코드를 선택하세요</Text>
          )}
        </View>

        <PrimaryButton
          label={primaryLabel}
          accessibilityLabel={primaryLabel}
          disabled={disabled}
          busy={controller.sending}
          onPress={handleSendPress}
          icon={
            <Animated.View
              style={{
                transform: [{
                  translateX: iconFlight.interpolate({ inputRange: [0, 1], outputRange: [0, 8] }),
                }],
              }}
            >
              <SendPlaneIcon color={palette.sig} />
            </Animated.View>
          }
        />
      </Screen>
      <SendSettingsSheet
        visible={controller.sendSettingsVisible}
        blinkFrameCount={controller.visibleFrameUris.length}
        onClose={controller.closeSendSettings}
        onClearDraft={controller.clearBlinkDraft}
      />
    </>
  );
}

/* ---------- To rail: avatar strip with sig ring + sigSoft halo on selection ---------- */
function SendToRail({
  friends,
  selectedId,
  onSelect,
  onAddFriend,
}: {
  readonly friends: readonly PickableFriend[];
  readonly selectedId: string | null;
  readonly onSelect: (friend: PickableFriend) => void;
  readonly onAddFriend: () => void;
}) {
  const palette = useAppPalette();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.peopleRow}>
      {friends.map((friend) => {
        const selected = friend.id === selectedId;
        const avatarSource = getAvatarImageSource(friend.avatarUri);
        return (
          <Pressable
            key={friend.id}
            accessibilityLabel={`Select ${friend.name}`}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onSelect(friend)}
            style={({ pressed }) => [styles.person, pressed && styles.pressed]}
          >
            <View style={[styles.avatarHalo, selected && { backgroundColor: palette.sigSoft }]}>
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: palette.input },
                  selected && { borderWidth: 2, borderColor: palette.sig },
                ]}
              >
                {avatarSource ? (
                  <Image source={avatarSource} resizeMode="cover" style={styles.avatarImage} />
                ) : (
                  <Text style={[styles.avatarText, { color: palette.text }]}>{friend.name.slice(0, 1)}</Text>
                )}
              </View>
            </View>
            <Text numberOfLines={1} style={[styles.personName, { color: selected ? palette.text : palette.muted }]}>
              {friend.name}
            </Text>
          </Pressable>
        );
      })}
      <Pressable
        accessibilityLabel="Add friend"
        accessibilityRole="button"
        onPress={onAddFriend}
        style={({ pressed }) => [
          styles.addPerson,
          { borderColor: palette.rule, backgroundColor: palette.card },
          pressed && styles.pressed,
        ]}
      >
        <Text style={[styles.addGlyph, { color: palette.text }]}>+</Text>
      </Pressable>
    </ScrollView>
  );
}

/* ---------- Signal code deck: 3-column Chip grid + add tile ---------- */
function SendCodeDeck({
  slots,
  selected,
  onSelectSlot,
  onAddSlot,
}: {
  readonly slots: readonly string[];
  readonly selected: string;
  readonly onSelectSlot: (slot: string) => void;
  readonly onAddSlot: () => void;
}) {
  return (
    <View style={styles.deckGrid}>
      {slots.slice(0, 8).map((slot) => (
        <View key={slot} style={styles.deckCell}>
          <Chip label={slot} selected={selected === slot} onPress={() => onSelectSlot(slot)} />
        </View>
      ))}
      <View style={styles.deckCell}>
        <Chip label="+" accessibilityLabel="Add signal slot" onPress={onAddSlot} />
      </View>
    </View>
  );
}

function getPrimaryLabel(
  mode: SendMode,
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
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[5],
  },
  headerAction: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  peopleRow: {
    alignItems: "flex-start",
    gap: spacing[5],
    minHeight: 64,
    paddingVertical: spacing[1],
  },
  person: {
    width: 46,
    alignItems: "center",
    gap: spacing[2],
  },
  avatarHalo: {
    padding: 3,
    borderRadius: radius.pill,
  },
  avatar: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: radius.pill,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarText: {
    ...type.metaValue,
  },
  personName: {
    fontFamily: font.sansSemiBold,
    fontSize: 10,
    lineHeight: 13,
    maxWidth: 48,
    textAlign: "center",
  },
  addPerson: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  addGlyph: {
    fontFamily: font.sans,
    fontSize: 25,
    lineHeight: 27,
  },
  deckGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[3],
  },
  deckCell: {
    width: "30.8%",
  },
  summaryLine: {
    minHeight: 18,
    justifyContent: "center",
    marginTop: spacing[8],
    marginBottom: spacing[5],
  },
  summaryText: {
    fontFamily: font.sansMedium,
    fontSize: 12,
    lineHeight: 17,
  },
  summaryName: {
    fontFamily: font.sansBold,
  },
  summaryCode: {
    ...type.tinyMono,
    fontSize: 12,
    lineHeight: 17,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ translateY: 1 }],
  },
});
