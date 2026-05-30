import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { FriendPickerStrip } from "@/components/FriendPickerStrip";

describe("FriendPickerStrip", () => {
  it("wires add and friend selection actions", () => {
    const onAddPress = jest.fn();
    const onSelect = jest.fn();

    const { getByLabelText } = render(
      <FriendPickerStrip
        friends={[
          { id: "friend-1", name: "Bippi", no: "04" },
          { id: "friend-2", name: "Mina", no: "86" },
        ]}
        selectedId="friend-1"
        onAddPress={onAddPress}
        onSelect={onSelect}
      />
    );

    fireEvent.press(getByLabelText("Add friend"));
    fireEvent.press(getByLabelText("Select Mina"));

    expect(onAddPress).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith({ id: "friend-2", name: "Mina", no: "86" });
  });
});
