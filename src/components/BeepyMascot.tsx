import React from "react";
import { Image, StyleSheet, View, ViewStyle } from "react-native";

const handdrawnBeepy = require("../../assets/brand/beepy-handdrawn.png");

type Props = {
  size?: number;
  style?: ViewStyle;
};

export function BeepyMascot({ size = 112, style }: Props) {
  return (
    <View
      style={[styles.root, { width: size, height: size * 1.1 }, style]}
      accessibilityLabel="BEEP-GET mascot"
      accessibilityRole="image"
    >
      <Image
        source={handdrawnBeepy}
        resizeMode="contain"
        style={styles.image}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignSelf: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});

