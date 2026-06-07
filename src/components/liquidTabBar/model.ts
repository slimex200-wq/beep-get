import {
  BookmarkLineIcon,
  FriendsGroupIcon,
  GearLineIcon,
  HashLineIcon,
  MyUserIcon,
  SendPlaneIcon,
  TodayCalendarIcon,
} from "@/components/MockupLineIcons";
import type { SecondaryAction, TabVisual } from "@/components/liquidTabBar/types";

export const secondaryActions: readonly SecondaryAction[] = [
  { key: "saved", label: "SAVED", screen: "Logs", Icon: BookmarkLineIcon },
  { key: "settings", label: "SETTINGS", screen: "Account", Icon: GearLineIcon },
  { key: "codes", label: "CODES", screen: "Dictionary", Icon: HashLineIcon },
] as const;

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
