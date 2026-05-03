import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { colors } from "@/design/tokens";

type Props = {
  size?: number;
  style?: ViewStyle;
};

export function BeepyMascot({ size = 112, style }: Props) {
  const bodyWidth = size;
  const bodyHeight = size * 0.72;
  const faceWidth = size * 0.58;
  const faceHeight = size * 0.42;
  const antennaDot = size * 0.12;
  const footSize = size * 0.1;

  return (
    <View
      accessibilityLabel="BEEP-GET mascot"
      accessibilityRole="image"
      style={[styles.root, { width: size, height: size * 1.06 }, style]}
    >
      <View
        style={[
          styles.antennaStem,
          {
            height: size * 0.25,
            left: size * 0.62,
            bottom: bodyHeight + size * 0.03,
          },
        ]}
      />
      <View
        style={[
          styles.antennaDot,
          {
            width: antennaDot,
            height: antennaDot,
            borderRadius: antennaDot / 2,
            left: size * 0.62 - antennaDot / 2,
            bottom: bodyHeight + size * 0.26,
          },
        ]}
      />
      <View
        style={[
          styles.signalArc,
          {
            width: size * 0.15,
            height: size * 0.21,
            left: size * 0.74,
            bottom: bodyHeight + size * 0.12,
          },
        ]}
      />
      <View
        style={[
          styles.signalArc,
          styles.signalArcOuter,
          {
            width: size * 0.24,
            height: size * 0.31,
            left: size * 0.77,
            bottom: bodyHeight + size * 0.07,
          },
        ]}
      />
      <View
        style={[
          styles.body,
          {
            width: bodyWidth,
            height: bodyHeight,
            borderRadius: size * 0.2,
            bottom: footSize * 0.7,
          },
        ]}
      >
        <View style={[styles.highlight, { borderRadius: size * 0.18 }]} />
        <View
          style={[
            styles.face,
            {
              width: faceWidth,
              height: faceHeight,
              borderRadius: size * 0.08,
              left: size * 0.16,
              top: size * 0.17,
            },
          ]}
        >
          <View style={[styles.eye, { left: faceWidth * 0.27 }]} />
          <View style={[styles.eye, { right: faceWidth * 0.27 }]} />
          <View
            style={[
              styles.cheekLed,
              {
                width: size * 0.075,
                height: size * 0.075,
                borderRadius: size * 0.04,
                right: size * 0.08,
                bottom: size * 0.08,
              },
            ]}
          />
        </View>
        <View
          style={[
            styles.sideKnob,
            {
              width: size * 0.15,
              height: size * 0.28,
              right: -size * 0.055,
              top: size * 0.26,
              borderRadius: size * 0.08,
            },
          ]}
        >
          <View style={styles.sideKnobInner} />
        </View>
        <View style={[styles.vent, { right: size * 0.15, top: size * 0.19 }]} />
        <View style={[styles.vent, { right: size * 0.105, top: size * 0.19 }]} />
      </View>
      <View
        style={[
          styles.foot,
          {
            width: footSize,
            height: footSize,
            borderRadius: footSize / 2,
            left: size * 0.14,
          },
        ]}
      />
      <View
        style={[
          styles.foot,
          {
            width: footSize,
            height: footSize,
            borderRadius: footSize / 2,
            right: size * 0.14,
          },
        ]}
      />
      <View style={[styles.shadow, { width: size * 0.74, left: size * 0.13 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: "relative",
    alignSelf: "center",
  },
  antennaStem: {
    position: "absolute",
    width: 3,
    backgroundColor: colors.ink,
    borderRadius: 2,
    zIndex: 2,
  },
  antennaDot: {
    position: "absolute",
    backgroundColor: colors.red,
    borderWidth: 1,
    borderColor: colors.redDeep,
    zIndex: 3,
  },
  signalArc: {
    position: "absolute",
    borderRightWidth: 2,
    borderColor: colors.ink,
    borderTopRightRadius: 999,
    borderBottomRightRadius: 999,
    opacity: 0.78,
  },
  signalArcOuter: {
    opacity: 0.42,
  },
  body: {
    position: "absolute",
    left: 0,
    backgroundColor: colors.shell,
    borderWidth: 2,
    borderColor: colors.ink,
    overflow: "visible",
  },
  highlight: {
    position: "absolute",
    left: 8,
    right: 8,
    top: 6,
    height: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  face: {
    position: "absolute",
    backgroundColor: colors.paperWarm,
    borderWidth: 2,
    borderColor: colors.ink,
  },
  eye: {
    position: "absolute",
    top: "42%",
    width: 5,
    height: 15,
    borderRadius: 3,
    backgroundColor: colors.ink,
  },
  cheekLed: {
    position: "absolute",
    backgroundColor: colors.red,
    borderWidth: 1,
    borderColor: colors.redDeep,
  },
  sideKnob: {
    position: "absolute",
    backgroundColor: colors.shellRaised,
    borderWidth: 2,
    borderColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  sideKnobInner: {
    width: 4,
    height: "68%",
    borderRadius: 2,
    backgroundColor: "rgba(244,239,229,0.24)",
  },
  vent: {
    position: "absolute",
    width: 3,
    height: 11,
    borderRadius: 2,
    backgroundColor: "rgba(244,239,229,0.35)",
  },
  foot: {
    position: "absolute",
    bottom: 2,
    backgroundColor: colors.ink,
  },
  shadow: {
    position: "absolute",
    bottom: 0,
    height: 4,
    borderRadius: 999,
    backgroundColor: "rgba(10,10,10,0.18)",
  },
});

