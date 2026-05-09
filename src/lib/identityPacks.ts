export type IdentityPackTone = "paper" | "school" | "cherry" | "photo" | "night";

export type IdentityPackLayout =
  | "classic-slip"
  | "school-note"
  | "cherry-sticker"
  | "photo-booth"
  | "night-signal";

export type IdentityPack = {
  slug: string;
  index: string;
  name: string;
  badge: string;
  priceLabel: string;
  tone: IdentityPackTone;
  layout: IdentityPackLayout;
  title: string;
  code: string;
  from: string;
  time: string;
  slots: string[];
  emotes: string[];
  shortCopy: string;
  isFree?: boolean;
};

export const identityPacks: IdentityPack[] = [
  {
    slug: "classic-paper",
    index: "01",
    name: "Classic Paper",
    badge: "NEW",
    priceLabel: "FREE",
    tone: "paper",
    layout: "classic-slip",
    title: "Incoming Beep",
    code: "8282",
    from: "Mina",
    time: "14:52",
    slots: ["OK", "8282", "OPEN"],
    emotes: ["B", "Beep", "B:"],
    shortCopy: "Cream ticket, thin rules, tiny Beepy mark.",
    isFree: true,
  },
  {
    slug: "school-desk",
    index: "02",
    name: "School Desk",
    badge: "HOT",
    priceLabel: "₩1,500",
    tone: "school",
    layout: "school-note",
    title: "도착한 Beep",
    code: "배고픔",
    from: "YOU",
    time: "14:56",
    slots: ["배고픔", "집중중", "끝나고"],
    emotes: ["연필", "B", "낙서"],
    shortCopy: "Ruled note paper with binder holes and pencil scribbles.",
  },
  {
    slug: "cherry-dot",
    index: "03",
    name: "Cherry Dot",
    badge: "HOT",
    priceLabel: "₩1,500",
    tone: "cherry",
    layout: "cherry-sticker",
    title: "Incoming Beep",
    code: "1004",
    from: "유나",
    time: "15:34",
    slots: ["나와", "기다림", "좋아!"],
    emotes: ["체리", "하트", "B"],
    shortCopy: "Pink sticker slip with soft dots and cherry doodles.",
  },
  {
    slug: "photo-booth-blink",
    index: "04",
    name: "Photo Booth Blink",
    badge: "NEW",
    priceLabel: "₩1,500",
    tone: "photo",
    layout: "photo-booth",
    title: "Blink arrived",
    code: "0825",
    from: "민아",
    time: "16:20",
    slots: ["3 CUTS", "OPEN", "REPLY"],
    emotes: ["사진", "B", "카메라"],
    shortCopy: "Blue grid paper, tape, and a three-cut photo strip.",
  },
  {
    slug: "night-signal",
    index: "05",
    name: "Night Signal",
    badge: "RARE",
    priceLabel: "₩2,500",
    tone: "night",
    layout: "night-signal",
    title: "Secret Signal",
    code: "2020",
    from: "J",
    time: "00:12",
    slots: ["PRIVATE", "OK", "OPEN"],
    emotes: ["B", "RADAR", "LOCK"],
    shortCopy: "Dark pager glow with green scan lines and secret chips.",
  },
];
