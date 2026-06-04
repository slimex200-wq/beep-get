import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { UpdateBannerSlip } from "@/components/UpdateBannerSlip";

jest.mock("@/design/appTheme", () => {
  const actual = jest.requireActual("@/design/appTheme");

  return {
    ...actual,
    useAppPalette: () => actual.lightPalette,
  };
});

describe("UpdateBannerSlip", () => {
  it("does not expose update controls when hidden", () => {
    const { toJSON } = render(<UpdateBannerSlip visible={false} onReload={jest.fn()} />);

    expect(toJSON()).toBeNull();
  });

  it("presents a clear restart action and a later action", () => {
    const onReload = jest.fn();
    const onDismiss = jest.fn();
    const { getByLabelText, toJSON } = render(
      <UpdateBannerSlip visible onReload={onReload} onDismiss={onDismiss} />,
    );
    const output = JSON.stringify(toJSON());

    expect(output).toContain("UPDATE READY");
    expect(output).toContain("A fresher Beep Get build is ready. Restart to apply it.");

    fireEvent.press(getByLabelText("Restart to apply update"));
    fireEvent.press(getByLabelText("Dismiss update reminder"));

    expect(onReload).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("shows a non-repeatable restart state while busy", () => {
    const onReload = jest.fn();
    const { getByLabelText, queryByLabelText, toJSON } = render(
      <UpdateBannerSlip visible onReload={onReload} onDismiss={jest.fn()} busy />,
    );
    const output = JSON.stringify(toJSON());

    expect(output).toContain("Restarting");
    expect(queryByLabelText("Dismiss update reminder")).toBeNull();

    fireEvent.press(getByLabelText("Restarting update"));

    expect(onReload).not.toHaveBeenCalled();
  });
});
