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

  it("presents a full-screen updating stage with restart and later actions", () => {
    const onReload = jest.fn();
    const onDismiss = jest.fn();
    const { getByLabelText, toJSON } = render(
      <UpdateBannerSlip visible onReload={onReload} onDismiss={onDismiss} />,
    );
    const output = JSON.stringify(toJSON());

    expect(output).toContain("FULL SCREEN UPDATE");
    expect(output).toContain("Update ready to install");
    expect(output).toContain("The app will restart into the new build.");

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
    expect(output).toContain("Applying update");
    expect(queryByLabelText("Dismiss update reminder")).toBeNull();

    fireEvent.press(getByLabelText("Restarting update"));

    expect(onReload).not.toHaveBeenCalled();
  });
});
