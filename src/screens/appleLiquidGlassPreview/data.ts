import { Home, Send, Users } from "lucide-react-native";
import type {
  AppleLiquidGlassItem,
  LiquidGlassMode,
} from "@/components/appleLiquidGlass/AppleLiquidGlassControl";

export const appleLiquidGlassPreviewItems: readonly AppleLiquidGlassItem[] = [
  { key: "home", accessibilityLabel: "Select Home preview action", Icon: Home },
  { key: "send", accessibilityLabel: "Select Send preview action", Icon: Send },
  { key: "people", accessibilityLabel: "Select People preview action", Icon: Users },
];

export const liquidGlassModeOptions: readonly LiquidGlassMode[] = ["transparent", "tinted"];
