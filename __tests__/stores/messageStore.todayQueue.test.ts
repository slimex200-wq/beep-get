import type { LegacyMessage } from "@/services/messageService";
import {
  getReceivedMessages,
  markAsRead,
} from "@/services/messageService";
import { useMessageStore } from "@/stores/messageStore";

jest.mock("@/services/messageService", () => ({
  getReceivedMessages: jest.fn(),
  getMessageById: jest.fn(),
  getSavedMessages: jest.fn(),
  markAsRead: jest.fn(),
  saveMessage: jest.fn(),
  sendMessage: jest.fn(),
  sendQuickReplyToMessage: jest.fn(),
}));

jest.mock("@/services/widgetService", () => ({
  syncWidgetData: jest.fn(),
}));

const receivedSignal = {
  id: "real-signal-1",
  from_user: "friend-1",
  to_user: "real-user",
  number_code: "8282",
  memo: "Almost there",
  is_read: false,
  is_saved: false,
  expires_at: "2026-06-04T12:00:00.000Z",
  created_at: "2026-06-04T11:00:00.000Z",
} satisfies LegacyMessage;

const nextSignal = {
  ...receivedSignal,
  id: "real-signal-2",
  number_code: "486",
} satisfies LegacyMessage;

beforeEach(() => {
  useMessageStore.getState().reset();
  jest.clearAllMocks();
  (markAsRead as jest.Mock).mockResolvedValue(undefined);
});

afterEach(() => {
  useMessageStore.getState().reset();
});

describe("messageStore Today queue behavior", () => {
  it("does not prepend onboarding demo signals for a real user inbox", async () => {
    (getReceivedMessages as jest.Mock).mockResolvedValue([receivedSignal]);

    await useMessageStore.getState().fetchReceived("real-user", []);

    expect(useMessageStore.getState().received.map((message) => message.id)).toEqual([
      "real-signal-1",
    ]);
    expect(useMessageStore.getState().received.map((message) => message.id)).not.toContain(
      "demo-welcome-blink"
    );
    expect(useMessageStore.getState().received.map((message) => message.id)).not.toContain(
      "demo-welcome-beep"
    );
  });

  it("retires a Done signal from the local Today queue after marking it read", async () => {
    useMessageStore.setState({ received: [receivedSignal, nextSignal] });

    await useMessageStore.getState().read("real-signal-1");

    expect(markAsRead).toHaveBeenCalledWith("real-signal-1");
    expect(useMessageStore.getState().received.map((message) => message.id)).toEqual([
      "real-signal-2",
    ]);
  });
});
