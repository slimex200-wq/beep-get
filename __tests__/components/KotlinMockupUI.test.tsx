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

// react-native-web normalizes colors: hex -> "rgba(r,g,b,1.00)", rgba strings lose
// their spaces. Derive the expected literals from the live palette so this test
// tracks palette changes instead of freezing old hex values.
function normalizedHex(hex: string): string {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r},${g},${b},1.00)`;
}
const normalizedRule = darkPalette.rule.replace(/\s+/g, "");

describe("KotlinMockupUI dark action controls", () => {
  it("recolors supplied close icons against the dark header surface", () => {
    const { toJSON } = render(
      <IconButton label="Close" icon={<XLineIcon />} accessibilityLabel="Close sheet" onPress={jest.fn()} />,
    );

    const output = JSON.stringify(toJSON());

    expect(output).toContain(`"stroke":"${darkPalette.text}"`);
    expect(output).toContain(`"backgroundColor":"${normalizedHex(darkPalette.chip)}"`);
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
    expect(output).toContain(`"borderTopColor":"${normalizedRule}"`);
  });
});
