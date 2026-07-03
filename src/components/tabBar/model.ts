import type React from "react";
import {
  FriendsGroupIcon,
  MyUserIcon,
  SendPlaneIcon,
  TodayCalendarIcon,
} from "@/components/MockupLineIcons";

export type IconComponent = (props: { readonly color?: string }) => React.ReactNode;

export type TabVisual = {
  readonly label: string;
  readonly Icon: IconComponent;
};

export const tabLabels = {
  Today: "TODAY",
  Compose: "SEND",
  People: "PEOPLE",
  My: "MY",
} as const;

export function getTabVisual(routeName: string): TabVisual {
  switch (routeName) {
    case "Today":
      return { label: tabLabels.Today, Icon: TodayCalendarIcon };
    case "Compose":
      return { label: tabLabels.Compose, Icon: SendPlaneIcon };
    case "People":
      return { label: tabLabels.People, Icon: FriendsGroupIcon };
    case "My":
      return { label: tabLabels.My, Icon: MyUserIcon };
    default:
      return { label: routeName.toUpperCase(), Icon: MyUserIcon };
  }
}
