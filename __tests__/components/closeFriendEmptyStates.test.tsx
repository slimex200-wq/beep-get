import React from "react";
import { render } from "@testing-library/react-native";
import { CloseCircuitMap } from "@/components/CloseCircuitMap";
import { FriendPulseCard } from "@/components/FriendPulseCard";

describe("close friend empty states", () => {
  it("does not render fake circuit friends when the close circuit is empty", () => {
    const { getByLabelText, toJSON } = render(
      <CloseCircuitMap friends={[]} capacity={4} onInvite={jest.fn()} />,
    );
    const output = JSON.stringify(toJSON());

    expect(output).toContain("No close friends yet");
    expect(output).not.toContain("BEEP");
    expect(output).not.toContain("BLINK");
    expect(getByLabelText("Invite Friend")).toBeTruthy();
  });

  it("does not render fake friend pulses when no pulse items exist", () => {
    const { toJSON } = render(<FriendPulseCard title="Friend Pulse" items={[]} />);
    const output = JSON.stringify(toJSON());

    expect(output).toContain("Friend Pulse");
    expect(output).toContain("No close-friend pulses yet");
    expect(output).not.toContain("now - 8282");
    expect(output).not.toContain("2m - BLINK");
  });
});
