import { supabase } from "@/lib/supabase";
import { useMessageStore } from "@/stores/messageStore";

const supabaseMock = supabase as unknown as {
  channel: jest.Mock;
  removeChannel: jest.Mock;
};

type MockRealtimeChannel = {
  on: jest.Mock<MockRealtimeChannel, [string]>;
  subscribe: jest.Mock<MockRealtimeChannel, []>;
};

function createRealtimeChannel(topic: string): MockRealtimeChannel {
  let subscribed = false;
  const channel = {} as MockRealtimeChannel;
  channel.on = jest.fn((type: string) => {
    if (subscribed && type === "postgres_changes") {
      throw new Error(
        `cannot add \`${type}\` callbacks for ${topic} after \`subscribe()\`.`,
      );
    }
    return channel;
  });
  channel.subscribe = jest.fn(() => {
    subscribed = true;
    return channel;
  });
  return channel;
}

beforeEach(() => {
  useMessageStore.getState().reset();
  jest.clearAllMocks();
});

afterEach(() => {
  useMessageStore.getState().reset();
});

describe("messageStore realtime subscription", () => {
  it("does not add postgres_changes callbacks again for an already subscribed user", () => {
    const userId = "6b41c306-0aad-440f-869b-2670ab615e2";
    const channel = createRealtimeChannel(`realtime:signals:${userId}`);
    supabaseMock.channel.mockReturnValue(channel);

    expect(() => useMessageStore.getState().subscribeRealtime(userId)).not.toThrow();
    expect(() => useMessageStore.getState().subscribeRealtime(userId)).not.toThrow();

    expect(supabaseMock.channel).toHaveBeenCalledTimes(1);
    expect(supabaseMock.channel).toHaveBeenCalledWith(`signals:${userId}`);
    expect(channel.on).toHaveBeenCalledTimes(1);
    expect(channel.subscribe).toHaveBeenCalledTimes(1);
  });

  it("removes the previous realtime channel before subscribing as another user", () => {
    const firstUserId = "user-a";
    const nextUserId = "user-b";
    const firstChannel = createRealtimeChannel(`realtime:signals:${firstUserId}`);
    const nextChannel = createRealtimeChannel(`realtime:signals:${nextUserId}`);
    supabaseMock.channel
      .mockReturnValueOnce(firstChannel)
      .mockReturnValueOnce(nextChannel);

    useMessageStore.getState().subscribeRealtime(firstUserId);
    useMessageStore.getState().subscribeRealtime(nextUserId);

    expect(supabaseMock.removeChannel).toHaveBeenCalledWith(firstChannel);
    expect(supabaseMock.channel).toHaveBeenNthCalledWith(2, `signals:${nextUserId}`);
    expect(nextChannel.on).toHaveBeenCalledTimes(1);
    expect(nextChannel.subscribe).toHaveBeenCalledTimes(1);
  });
});
