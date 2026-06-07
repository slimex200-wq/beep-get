import React from "react";
import { SendMockupPrimaryScreen } from "@/components/SendMockupPrimaryScreen";
import { SendSettingsSheet } from "@/components/SendSettingsSheet";
import { useSendSignalController } from "@/screens/send/useSendSignalController";

export function SendSignalScreen() {
  const controller = useSendSignalController();

  return (
    <>
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
        onAddSlot={controller.openDictionary}
        onSelectCombo={controller.selectRecentCombo}
        onSend={controller.mode === "beep" ? controller.sendBeep : controller.sendBlink}
        onRetake={controller.clearBlinkDraft}
        onBack={controller.goBackToFlow}
        onOpenSettings={controller.openSendSettings}
        showBackAction={controller.isModalFlow}
      />
      <SendSettingsSheet
        visible={controller.sendSettingsVisible}
        blinkFrameCount={controller.visibleFrameUris.length}
        onClose={controller.closeSendSettings}
        onClearDraft={controller.clearBlinkDraft}
      />
    </>
  );
}
