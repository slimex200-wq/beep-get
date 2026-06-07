import { StyleSheet } from "react-native";

export const appleLiquidGlassStyles = StyleSheet.create({
  bar: {
    width: "76%",
    minWidth: 282,
    maxWidth: 360,
    height: 64,
    borderRadius: 32,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOpacity: 0.28,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 15 },
    elevation: 18,
  },
  borrowedColorWash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(87,211,255,0.10)",
  },
  pointerNone: {
    pointerEvents: "none",
  },
  darkCompensation: {
    ...StyleSheet.absoluteFillObject,
  },
  lobe: {
    position: "absolute",
    top: 3,
    left: 0,
    height: 58,
    borderRadius: 29,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  innerGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 32,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.08)",
  },
  iconRail: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  iconButton: {
    height: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.74,
    transform: [{ translateY: 1 }],
  },
});
