import { StyleSheet } from "react-native";
import { spacing } from "@/design/tokens";
import { type } from "@/design/typography";

export const styles = StyleSheet.create({
  small: {
    width: 178,
    aspectRatio: 1,
    alignSelf: "center",
    justifyContent: "space-between",
    overflow: "hidden",
    padding: 11,
    borderWidth: 1,
    borderRadius: 16,
  },
  smallCompact: {
    width: "84%",
    maxWidth: 178,
  },
  smallHead: {
    minHeight: 20,
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: spacing[2],
  },
  smallKind: {
    ...type.slipTitleSmall,
    fontSize: 17,
    lineHeight: 20,
  },
  smallTime: {
    ...type.tinyMono,
    fontSize: 9,
  },
  smallCode: {
    ...type.codeMedium,
    fontSize: 42,
    lineHeight: 48,
  },
  smallFoot: {
    minHeight: 16,
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: spacing[2],
  },
  medium: {
    width: "100%",
    minHeight: 194,
    overflow: "hidden",
    borderWidth: 1,
    borderRadius: 16,
  },
  mediumHead: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[3],
    paddingHorizontal: spacing[4],
  },
  mediumTitleRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing[1],
  },
  mediumTitle: {
    ...type.slipTitleSmall,
    fontSize: 15,
    lineHeight: 18,
  },
  mediumKind: {
    ...type.slipTitleSmall,
    fontSize: 15,
    fontStyle: "italic",
    lineHeight: 18,
  },
  mediumMeta: {
    ...type.tinyMono,
    fontSize: 8,
  },
  mediumBody: {
    flex: 1,
    minHeight: 144,
    flexDirection: "row",
  },
  mediumNumberBlock: {
    width: 98,
    justifyContent: "center",
    gap: spacing[1],
    paddingHorizontal: spacing[4],
  },
  mediumCode: {
    ...type.codeMedium,
    fontSize: 34,
    lineHeight: 40,
  },
  mediumSignalPane: {
    flex: 1,
    minWidth: 0,
    gap: spacing[2],
    padding: spacing[3],
  },
  signalHead: {
    minHeight: 18,
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: spacing[2],
  },
  labelValue: {
    minHeight: 14,
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing[1],
  },
  labelValueText: {
    ...type.tinyMono,
    flex: 1,
    fontSize: 9,
  },
  label: {
    ...type.tinyMono,
    fontSize: 8,
  },
  status: {
    ...type.tinyMono,
    fontSize: 8,
  },
  rule: {
    height: 1,
  },
  verticalRule: {
    width: 1,
  },
  slotStrip: {
    flex: 1,
    minHeight: 66,
    flexDirection: "row",
    gap: spacing[2],
  },
  slotStripCompact: {
    flex: 0,
    minHeight: 24,
    height: 24,
  },
  slot: {
    flex: 1,
    overflow: "hidden",
    borderWidth: 1,
  },
  slotImage: {
    width: "100%",
    height: "100%",
    transform: [{ scale: 1.05 }],
  },
  emptySlot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptySlotLine: {
    width: "120%",
    height: 1,
    opacity: 0.34,
    transform: [{ rotate: "-16deg" }],
  },
});
