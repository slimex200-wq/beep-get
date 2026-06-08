import type { IdentityPack, IdentityPackTone } from "@/design/identityPacks";
import { colors } from "@/design/tokens";

export type IdentityPackVisual = {
  readonly surface: string;
  readonly chip: string;
  readonly text: string;
  readonly muted: string;
  readonly border: string;
  readonly accent: string;
};

const PACK_VISUALS = {
  paper: {
    surface: colors.paper,
    chip: "#FFFFFF",
    text: "#0A0A0A",
    muted: "#6B655C",
    border: "#9C958B",
    accent: "#D8361E",
  },
  school: {
    surface: "#FFF8E8",
    chip: "#FFFFFF",
    text: "#13110D",
    muted: "#70695D",
    border: "#B8AD9C",
    accent: "#35724D",
  },
  cherry: {
    surface: "#FFECEF",
    chip: "#FFFFFF",
    text: "#1B1114",
    muted: "#7A6268",
    border: "#E6BAC2",
    accent: "#D84B62",
  },
  photo: {
    surface: "#F8FCFD",
    chip: "#FFFFFF",
    text: "#0E171A",
    muted: "#65767B",
    border: "#AFC9D0",
    accent: "#166F83",
  },
  night: {
    surface: "#0A0A0A",
    chip: "#20231F",
    text: "#F8F2E8",
    muted: "#B9B0A3",
    border: "rgba(248,242,232,0.36)",
    accent: "#92D66D",
  },
} satisfies Record<IdentityPackTone, IdentityPackVisual>;

export function getPackVisual(pack: Pick<IdentityPack, "tone">): IdentityPackVisual {
  return PACK_VISUALS[pack.tone];
}
