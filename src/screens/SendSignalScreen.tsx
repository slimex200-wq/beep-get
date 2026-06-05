import React from "react";
import { SendMockupPrimaryScreen } from "@/components/SendMockupPrimaryScreen";
import { SendSettingsSheet } from "@/components/SendSettingsSheet";
import { SendBeepScreen } from "@/screens/SendBeepScreen";
import { SendBlinkScreen } from "@/screens/SendBlinkScreen";
import { useSendSignalController } from "@/screens/send/useSendSignalController";

export function SendSignalScreen() {
  const controller = useSendSignalController();

  const mockupScreen = (
    <SendMockupPrimaryScreen
      mode={controller.mode}
      friends={controller.friendOptions}
      selectedId={controller.recipient?.id ?? null}
      code={controller.code}
      slots={controller.slotDeck}
      recentCombos={controller.recentCombos}
      sending={controller.sending}
      recording={controller.recording}
      hasCapturedBlink={Boolean(controller.blinkDraft)}
      sentFeedback={controller.sentFeedback}
      previewFrameUris={controller.visibleFrameUris}
      cameraPermissionGranted={controller.cameraPermissionGranted}
      previewMode={controller.previewMode}
      cameraRef={controller.cameraRef}
      onSelectMode={controller.setMode}
      onSelect={controller.selectRecipient}
      onAddFriend={controller.openPeople}
      onSelectSlot={controller.selectSlot}
      onSelectCombo={controller.selectRecentCombo}
      onSend={controller.mode === "beep" ? controller.sendBeep : controller.sendBlink}
      onRetake={controller.clearBlinkDraft}
    />
  );

  const activeScreen = !controller.isModalFlow || !controller.recipient ? (
    mockupScreen
  ) : controller.mode === "beep" ? (
    <SendBeepScreen
      recipientName={controller.recipient.name}
      recipientNo={controller.recipient.no}
      code={controller.code}
      memo={controller.memo}
      sending={controller.sending}
      sentFeedback={controller.sentFeedback}
      onCodeChange={controller.setCode}
      onMemoChange={controller.setMemo}
      onPreset={controller.setCode}
      onSend={controller.sendBeep}
      onBack={controller.goBackToFlow}
      onOpenSettings={controller.openSendSettings}
      headerAvatarUri={controller.headerAvatarUri}
      showBackAction={controller.isModalFlow}
      primaryActionLabel="SEND BEEP"
    />
  ) : (
    <SendBlinkScreen
      recipientName={controller.recipient.name}
      recipientNo={controller.recipient.no}
      code={controller.code}
      memo={controller.memo}
      sending={controller.sending}
      recording={controller.recording}
      hasCapturedBlink={Boolean(controller.blinkDraft)}
      sentFeedback={controller.sentFeedback}
      previewFrameUris={controller.blinkDraft?.previewFrameUris}
      cameraPermissionGranted={controller.cameraPermissionGranted}
      cameraRef={controller.cameraRef}
      onCodeChange={controller.setCode}
      onMemoChange={controller.setMemo}
      onPreset={controller.setCode}
      onRequestPermission={() => controller.requestCameraPermission()}
      onSend={controller.sendBlink}
      onRetake={controller.clearBlinkDraft}
      onBack={controller.goBackToFlow}
      onOpenSettings={controller.openSendSettings}
      headerAvatarUri={controller.headerAvatarUri}
      previewMode={controller.previewMode}
      showBackAction={controller.isModalFlow}
    />
  );

  return (
    <>
      {activeScreen}
      <SendSettingsSheet
        visible={controller.sendSettingsVisible}
        blinkFrameCount={controller.visibleFrameUris.length}
        onClose={controller.closeSendSettings}
        onClearDraft={controller.clearBlinkDraft}
      />
    </>
  );
}
