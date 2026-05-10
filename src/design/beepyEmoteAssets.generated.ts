/* Auto-generated asset map for BEEP-GET Beepy / pack-native emotes. */
/* Copy this file into src/design/ or use it as the wiring reference for identityPacks.ts. */

export type BeepyEmoteArtFamily = "canonical-beepy" | "pack-native";
export type BeepyEmoteAsset = {
  id: string;
  label: string;
  source: "asset";
  asset: ReturnType<typeof require>;
};

export type BeepyEmotePackAssets = {
  slug: string;
  name: string;
  artFamily: BeepyEmoteArtFamily;
  expressions: BeepyEmoteAsset[];
};

export const beepyEmotePackAssets: BeepyEmotePackAssets[] = [
  {
    slug: "classic-paper",
    name: "Classic Paper",
    artFamily: "canonical-beepy",
    expressions: [
      {
        id: "basic-beepy",
        label: "Basic Beepy",
        source: "asset",
        asset: require("../../assets/brand/emotes/classic-paper/classic-paper__basic-beepy.png"),
      },
      {
        id: "ok-slip",
        label: "OK Slip",
        source: "asset",
        asset: require("../../assets/brand/emotes/classic-paper/classic-paper__ok-slip.png"),
      },
      {
        id: "open-signal",
        label: "Open Signal",
        source: "asset",
        asset: require("../../assets/brand/emotes/classic-paper/classic-paper__open-signal.png"),
      },
      {
        id: "save",
        label: "Save",
        source: "asset",
        asset: require("../../assets/brand/emotes/classic-paper/classic-paper__save.png"),
      },
      {
        id: "ping",
        label: "Ping",
        source: "asset",
        asset: require("../../assets/brand/emotes/classic-paper/classic-paper__ping.png"),
      },
      {
        id: "waiting",
        label: "Waiting",
        source: "asset",
        asset: require("../../assets/brand/emotes/classic-paper/classic-paper__waiting.png"),
      },
    ],
  },
  {
    slug: "school-desk",
    name: "School Desk",
    artFamily: "pack-native",
    expressions: [
      {
        id: "hungry",
        label: "Hungry",
        source: "asset",
        asset: require("../../assets/brand/emotes/school-desk/school-desk__hungry.png"),
      },
      {
        id: "focus-mode",
        label: "Focus Mode",
        source: "asset",
        asset: require("../../assets/brand/emotes/school-desk/school-desk__focus-mode.png"),
      },
      {
        id: "cafe-study",
        label: "Cafe Study",
        source: "asset",
        asset: require("../../assets/brand/emotes/school-desk/school-desk__cafe-study.png"),
      },
      {
        id: "done-after-class",
        label: "Done After Class",
        source: "asset",
        asset: require("../../assets/brand/emotes/school-desk/school-desk__done-after-class.png"),
      },
      {
        id: "sleepy",
        label: "Sleepy",
        source: "asset",
        asset: require("../../assets/brand/emotes/school-desk/school-desk__sleepy.png"),
      },
      {
        id: "exam-panic",
        label: "Exam Panic",
        source: "asset",
        asset: require("../../assets/brand/emotes/school-desk/school-desk__exam-panic.png"),
      },
    ],
  },
  {
    slug: "cherry-dot",
    name: "Cherry Dot",
    artFamily: "pack-native",
    expressions: [
      {
        id: "like",
        label: "Like",
        source: "asset",
        asset: require("../../assets/brand/emotes/cherry-dot/cherry-dot__like.png"),
      },
      {
        id: "waiting",
        label: "Waiting",
        source: "asset",
        asset: require("../../assets/brand/emotes/cherry-dot/cherry-dot__waiting.png"),
      },
      {
        id: "sulking",
        label: "Sulking",
        source: "asset",
        asset: require("../../assets/brand/emotes/cherry-dot/cherry-dot__sulking.png"),
      },
      {
        id: "come-out",
        label: "Come Out",
        source: "asset",
        asset: require("../../assets/brand/emotes/cherry-dot/cherry-dot__come-out.png"),
      },
      {
        id: "heart-ping",
        label: "Heart Ping",
        source: "asset",
        asset: require("../../assets/brand/emotes/cherry-dot/cherry-dot__heart-ping.png"),
      },
      {
        id: "shy-yes",
        label: "Shy Yes",
        source: "asset",
        asset: require("../../assets/brand/emotes/cherry-dot/cherry-dot__shy-yes.png"),
      },
    ],
  },
  {
    slug: "photo-booth-blink",
    name: "Photo Booth Blink",
    artFamily: "pack-native",
    expressions: [
      {
        id: "pose",
        label: "Pose",
        source: "asset",
        asset: require("../../assets/brand/emotes/photo-booth-blink/photo-booth-blink__pose.png"),
      },
      {
        id: "v-sign",
        label: "V Sign",
        source: "asset",
        asset: require("../../assets/brand/emotes/photo-booth-blink/photo-booth-blink__v-sign.png"),
      },
      {
        id: "retake",
        label: "Retake",
        source: "asset",
        asset: require("../../assets/brand/emotes/photo-booth-blink/photo-booth-blink__retake.png"),
      },
      {
        id: "bff",
        label: "BFF",
        source: "asset",
        asset: require("../../assets/brand/emotes/photo-booth-blink/photo-booth-blink__bff.png"),
      },
      {
        id: "camera-flash",
        label: "Camera Flash",
        source: "asset",
        asset: require("../../assets/brand/emotes/photo-booth-blink/photo-booth-blink__camera-flash.png"),
      },
      {
        id: "photo-saved",
        label: "Photo Saved",
        source: "asset",
        asset: require("../../assets/brand/emotes/photo-booth-blink/photo-booth-blink__photo-saved.png"),
      },
    ],
  },
  {
    slug: "night-signal",
    name: "Night Signal",
    artFamily: "pack-native",
    expressions: [
      {
        id: "secret",
        label: "Secret",
        source: "asset",
        asset: require("../../assets/brand/emotes/night-signal/night-signal__secret.png"),
      },
      {
        id: "private",
        label: "Private",
        source: "asset",
        asset: require("../../assets/brand/emotes/night-signal/night-signal__private.png"),
      },
      {
        id: "lock",
        label: "Lock",
        source: "asset",
        asset: require("../../assets/brand/emotes/night-signal/night-signal__lock.png"),
      },
      {
        id: "radar-detected",
        label: "Radar Detected",
        source: "asset",
        asset: require("../../assets/brand/emotes/night-signal/night-signal__radar-detected.png"),
      },
      {
        id: "do-not-disturb",
        label: "Do Not Disturb",
        source: "asset",
        asset: require("../../assets/brand/emotes/night-signal/night-signal__do-not-disturb.png"),
      },
      {
        id: "open-quietly",
        label: "Open Quietly",
        source: "asset",
        asset: require("../../assets/brand/emotes/night-signal/night-signal__open-quietly.png"),
      },
    ],
  },
];
