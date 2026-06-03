import React from "react";
import { Alert } from "react-native";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { BLINK_DURATION_SECONDS, BLINK_MAX_BYTES } from "@/lib/beepBlinkLimits";
import { createBlinkDraft } from "@/lib/blinkDraft";
import { SendSignalScreen } from "@/screens/SendSignalScreen";

const mockNavigate = jest.fn();
const mockCanGoBack = jest.fn(() => false);
const mockGoBack = jest.fn();
const mockRoute = {
  name: "Compose",
  params: {
    mode: "blink",
    initialCode: "8282",
  },
};
const mockCameraProps: Array<Record<string, unknown>> = [];
const mockRecordAsync = jest.fn();
const mockRequestCameraPermission = jest.fn();

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    canGoBack: mockCanGoBack,
    goBack: mockGoBack,
  }),
  useRoute: () => mockRoute,
}));

jest.mock("expo-camera", () => {
  const React = require("react");
  const { View } = require("react-native");

  return {
    CameraView: React.forwardRef((props: Record<string, unknown>, ref: React.Ref<unknown>) => {
      mockCameraProps.push(props);
      React.useImperativeHandle(ref, () => ({
        recordAsync: mockRecordAsync,
      }));
      return React.createElement(View, { testID: "mock-camera-view" });
    }),
    useCameraPermissions: jest.fn(() => [
      { granted: true },
      mockRequestCameraPermission,
    ]),
  };
});

jest.mock("@/lib/blinkDraft", () => ({
  createBlinkDraft: jest.fn().mockResolvedValue({
    video: {
      uri: "file:///tmp/blink-recorded.mp4",
      durationMs: 2000,
      mimeType: "video/mp4",
    },
    teaser: {
      thumbnailKey: null,
      stripKeys: [],
      assets: [],
    },
    previewFrameUris: [],
  }),
}));

jest.mock("@/stores/authStore", () => ({
  useAuthStore: jest.fn(() => ({
    profile: {
      id: "user-real-1",
      beep_id: "82820000",
      nickname: "Alex",
      status_icon: "online",
      active_skin_id: null,
      avatar_url: null,
    },
  })),
}));

jest.mock("@/stores/dictionaryStore", () => ({
  useDictionaryStore: jest.fn(() => ({
    entries: [
      {
        id: "entry-8282",
        user_id: "user-real-1",
        code: "8282",
        meaning: "come now",
        created_at: "2026-06-02T00:00:00.000Z",
        sort_order: 0,
        is_widget_slot: true,
      },
    ],
    fetch: jest.fn().mockResolvedValue(undefined),
  })),
}));

jest.mock("@/stores/friendStore", () => ({
  useFriendStore: jest.fn(() => ({
    friends: [
      {
        id: "friendship-1",
        user_id: "user-real-1",
        friend_id: "friend-real-1",
        nickname: "Bippi",
        vibration_pattern: "CLOSE",
        friend: {
          id: "friend-real-1",
          beep_id: "100486",
          nickname: "Bippi",
          status_icon: "online",
          avatar_url: null,
        },
      },
    ],
    fetch: jest.fn().mockResolvedValue(undefined),
  })),
}));

jest.mock("@/stores/messageStore", () => ({
  useMessageStore: jest.fn(() => ({
    send: jest.fn().mockResolvedValue(undefined),
  })),
}));

describe("SendSignalScreen Blink camera runtime", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCameraProps.length = 0;
    mockRecordAsync.mockResolvedValue({ uri: "file:///tmp/blink-recorded.mp4" });
    jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("passes iOS-safe video capture props and avc1 record options through the Blink camera path", async () => {
    const { getByLabelText } = render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 0, left: 0, right: 0, bottom: 0 },
        }}
      >
        <SendSignalScreen />
      </SafeAreaProvider>,
    );

    expect(mockCameraProps.at(-1)).toMatchObject({
      active: true,
      facing: "front",
      mirror: true,
      mode: "video",
      mute: true,
      videoBitrate: 2500000,
      videoQuality: "480p",
    });

    fireEvent.press(getByLabelText("Capture Blink"));

    await waitFor(() =>
      expect(mockRecordAsync).toHaveBeenCalledWith({
        codec: "avc1",
        maxDuration: BLINK_DURATION_SECONDS,
        maxFileSize: BLINK_MAX_BYTES,
      }),
    );
    expect(createBlinkDraft).toHaveBeenCalledWith({
      senderId: "user-real-1",
      receiverId: "friend-real-1",
      videoUri: "file:///tmp/blink-recorded.mp4",
    });
    expect(Alert.alert).toHaveBeenCalledWith(
      "Blink preview ready",
      "Check the 3 frames, then send or retake.",
    );
  });
});
