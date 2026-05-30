import React from "react";
import type { StyleProp, ViewStyle } from "react-native";
import {
  CalendarDays,
  Camera,
  ChevronRight,
  CircleCheck,
  Copy,
  Pencil,
  RefreshCw,
  Search,
  SendHorizontal,
  Settings,
  UserRound,
  UserRoundPlus,
  UsersRound,
  X,
  type LucideIcon,
} from "lucide-react-native";
import { colors } from "@/design/tokens";

type IconProps = {
  color?: string;
  style?: StyleProp<ViewStyle>;
};

type LucideLineIconProps = IconProps & {
  icon: LucideIcon;
  size?: number;
  strokeWidth?: number;
};

function LucideLineIcon({
  icon: Icon,
  color = colors.ink,
  size = 24,
  strokeWidth = 2,
  style,
}: LucideLineIconProps) {
  return (
    <Icon
      color={color}
      size={size}
      strokeWidth={strokeWidth}
      absoluteStrokeWidth
      style={style}
    />
  );
}

export function TodayCalendarIcon({ color = colors.ink, style }: IconProps) {
  return <LucideLineIcon icon={CalendarDays} color={color} style={style} />;
}

export function SendPlaneIcon({ color = colors.ink, style }: IconProps) {
  return <LucideLineIcon icon={SendHorizontal} color={color} style={style} strokeWidth={2.15} />;
}

export function FriendsGroupIcon({ color = colors.ink, style }: IconProps) {
  return <LucideLineIcon icon={UsersRound} color={color} style={style} strokeWidth={1.95} />;
}

export function MyUserIcon({ color = colors.ink, style }: IconProps) {
  return <LucideLineIcon icon={UserRound} color={color} style={style} />;
}

export function CopyLineIcon({ color = colors.ink, style }: IconProps) {
  return <LucideLineIcon icon={Copy} color={color} style={style} />;
}

export function AddPersonLineIcon({ color = colors.ink, style }: IconProps) {
  return <LucideLineIcon icon={UserRoundPlus} color={color} style={style} strokeWidth={1.95} />;
}

export function ChevronRightLineIcon({ color = colors.muted, style }: IconProps) {
  return <LucideLineIcon icon={ChevronRight} color={color} style={style} strokeWidth={2.25} />;
}

export function CameraLineIcon({ color = colors.ink, style }: IconProps) {
  return <LucideLineIcon icon={Camera} color={color} style={style} />;
}

export function GearLineIcon({ color = colors.ink, style }: IconProps) {
  return <LucideLineIcon icon={Settings} color={color} style={style} />;
}

export function SearchLineIcon({ color = colors.muted2, style }: IconProps) {
  return <LucideLineIcon icon={Search} color={color} style={style} />;
}

export function RefreshLineIcon({ color = colors.ink, style }: IconProps) {
  return <LucideLineIcon icon={RefreshCw} color={color} style={style} />;
}

export function PencilLineIcon({ color = colors.ink, style }: IconProps) {
  return <LucideLineIcon icon={Pencil} color={color} style={style} />;
}

export function CheckCircleLineIcon({ color = colors.greenDot, style }: IconProps) {
  return <LucideLineIcon icon={CircleCheck} color={color} style={style} strokeWidth={2.2} />;
}

export function XLineIcon({ color = colors.ink, style }: IconProps) {
  return <LucideLineIcon icon={X} color={color} style={style} strokeWidth={2.25} />;
}
