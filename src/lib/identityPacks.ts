export type IdentityPackTone = "paper" | "school" | "cherry" | "photo" | "night";

export type IdentityPack = {
  slug: string;
  index: string;
  name: string;
  badge: string;
  priceLabel: string;
  tone: IdentityPackTone;
  title: string;
  code: string;
  from: string;
  time: string;
  slots: string[];
  emotes: string[];
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
    title: "Incoming Beep",
    code: "8282",
    from: "Mina",
    time: "14:52",
    slots: ["OK", "8282", "OPEN"],
    emotes: ["B", "B", "☻"],
    isFree: true,
  },
  {
    slug: "school-desk",
    index: "02",
    name: "School Desk",
    badge: "HOT",
    priceLabel: "₩1,500",
    tone: "school",
    title: "도착한 Beep",
    code: "배고픔",
    from: "YOU",
    time: "14:56",
    slots: ["배고픔", "집중중", "끝나고"],
    emotes: ["↯", "B", "B"],
  },
  {
    slug: "cherry-dot",
    index: "03",
    name: "Cherry Dot",
    badge: "HOT",
    priceLabel: "₩1,500",
    tone: "cherry",
    title: "Incoming Beep",
    code: "1004",
    from: "유나",
    time: "15:34",
    slots: ["나와", "기다림", "좋아!"],
    emotes: ["☻", "♡", "☻"],
  },
  {
    slug: "photo-booth-blink",
    index: "04",
    name: "Photo Booth Blink",
    badge: "NEW",
    priceLabel: "₩1,500",
    tone: "photo",
    title: "Blink arrived",
    code: "0825",
    from: "민아",
    time: "16:20",
    slots: ["3 CUTS", "OPEN", "REPLY"],
    emotes: ["B", "☻", "▣"],
  },
  {
    slug: "night-signal",
    index: "05",
    name: "Night Signal",
    badge: "RARE",
    priceLabel: "₩2,500",
    tone: "night",
    title: "Secret Signal",
    code: "2020",
    from: "J",
    time: "00:12",
    slots: ["PRIVATE", "OK", "OPEN"],
    emotes: ["B", "☻", "◌"],
  },
];
