import { StyleSheet } from "react-native";
import { colors, spacing } from "@/design/tokens";
import { font } from "@/design/typography";

export const lightLiquidGlassBackground = "rgba(255,253,249,0.76)";
export const lightLiquidGlassWash = "rgba(143,94,199,0.12)";
export const lightLiquidGlassLobe = "rgba(143,94,199,0.16)";
export const lightLiquidGlassCompensation = "rgba(255,255,255,0.22)";
export const lightLiquidGlassBorder = "rgba(86,63,54,0.18)";
export const darkLiquidGlassBackground = "rgba(23,24,26,0.86)";
export const darkLiquidGlassWash = "rgba(244,242,238,0.08)";
export const darkLiquidGlassLobe = "rgba(244,242,238,0.12)";
export const darkLiquidGlassCompensation = "rgba(0,0,0,0.22)";
export const darkLiquidGlassBorder = "rgba(244,242,238,0.16)";

export const liquidTabStyles = StyleSheet.create({
  host: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 30,
    elevation: 30,
  },
  pill: {
    width: "92%",
    maxWidth: 430,
    height: 64,
    overflow: "hidden",
    paddingHorizontal: spacing[2],
    paddingVertical: 0,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 32,
    shadowColor: colors.ink,
    shadowOpacity: 0.28,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 18,
  },
  borrowedColorWash: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 32,
  },
  glassCompensation: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 32,
  },
  glassEdgeGlow: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 32,
  },
  mainRow: {
    position: "relative",
    height: 64,
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: 0,
    zIndex: 1,
  },
  tabButton: {
    flex: 1,
    minHeight: 64,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 32,
    overflow: "hidden",
    zIndex: 1,
  },
  liquidLobe: {
    position: "absolute",
    top: -1,
    left: 0,
    height: 66,
    borderRadius: 33,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  iconWrap: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -1,
    right: 0,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.pink,
  },
  moreButton: {
    width: 40,
    height: 64,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 0,
    borderRadius: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
    overflow: "visible",
    zIndex: 2,
  },
  secondaryRail: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing[2],
    borderRadius: 31,
    borderWidth: 0,
    backgroundColor: "transparent",
    overflow: "hidden",
    zIndex: 2,
  },
  secondaryRailExpanded: {
    height: 62,
    paddingTop: 10,
    paddingBottom: 4,
  },
  secondaryRailCollapsed: {
    height: 0,
    paddingVertical: 0,
    borderWidth: 0,
  },
  secondaryAction: {
    flex: 1,
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[1],
    paddingHorizontal: spacing[1],
    borderRadius: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
    overflow: "visible",
  },
  secondaryLabel: {
    fontFamily: font.sansBold,
    fontSize: 8,
    lineHeight: 10,
    letterSpacing: 0,
    color: colors.white,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ translateY: 1 }],
  },
});
