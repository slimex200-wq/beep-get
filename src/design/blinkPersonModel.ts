import type { ImageSourcePropType } from "react-native";

export type BlinkPersonPose = "wave" | "jump" | "peace";

export type BlinkPersonFrame = {
  index: 1 | 2 | 3;
  id: string;
  label: string;
  shortLabel: string;
  pose: BlinkPersonPose;
  accessibilityLabel: string;
};

export type BlinkPersonModel = {
  id: string;
  displayName: string;
  stripAsset: ImageSourcePropType;
  frames: readonly [BlinkPersonFrame, BlinkPersonFrame, BlinkPersonFrame];
};

export const BLINK_PERSON_MODEL: BlinkPersonModel = {
  id: "mina-motion-sample",
  displayName: "Mina",
  stripAsset: require("../../assets/brand/blink/blink-person-model-strip.png"),
  frames: [
    {
      index: 1,
      id: "wave-in",
      label: "WAVE",
      shortLabel: "HI",
      pose: "wave",
      accessibilityLabel: "waves into frame",
    },
    {
      index: 2,
      id: "jump-mid",
      label: "JUMP",
      shortLabel: "UP",
      pose: "jump",
      accessibilityLabel: "jumps in the middle frame",
    },
    {
      index: 3,
      id: "peace-out",
      label: "PEACE",
      shortLabel: "V",
      pose: "peace",
      accessibilityLabel: "finishes with a peace sign",
    },
  ],
};
