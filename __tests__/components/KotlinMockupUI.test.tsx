import React from "react";
import { render } from "@testing-library/react-native";
import { IconButton, KotlinHeader } from "@/components/KotlinMockupUI";
import { BackLineIcon, XLineIcon } from "@/components/MockupLineIcons";
import { darkPalette } from "@/design/appTheme";

jest.mock("@/design/appTheme", () => {
  const actual = jest.requireActual("@/design/appTheme");

  return {
    ...actual,
    useAppPalette: () => actual.darkPalette,
  };
});

describe("KotlinMockupUI dark action controls", () => {
  it("recolors supplied close icons against the dark header surface", () => {
    const { toJSON } = render(
      <IconButton label="Close" icon={<XLineIcon />} accessibilityLabel="Close sheet" onPress={jest.fn()} />,
    );

    const output = JSON.stringify(toJSON());

    expect(output).toContain(`"stroke":"${darkPalette.text}"`);
    expect(output).toContain('"backgroundColor":"rgba(36,38,41,1.00)"');
  });

  it("keeps header back actions visible in dark mode", () => {
    const { toJSON } = render(
      <KotlinHeader
        title="SEND"
        showAvatar={false}
        actions={[{ label: "Back", icon: <BackLineIcon />, accessibilityLabel: "Back", onPress: jest.fn() }]}
      />,
    );

    const output = JSON.stringify(toJSON());

    expect(output).toContain(`"stroke":"${darkPalette.text}"`);
    expect(output).toContain('"borderTopColor":"rgba(244,242,238,0.16)"');
  });
});
