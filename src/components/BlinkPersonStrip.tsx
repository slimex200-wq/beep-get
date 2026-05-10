import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { BLINK_PERSON_MODEL } from "@/design/blinkPersonModel";
import { radius } from "@/design/tokens";

type Props = {
  compact?: boolean;
};

export function BlinkPersonStrip({ compact = false }: Props) {
  return (
    <View style={[styles.wrap, compact && styles.compactWrap]}>
      <Image
        accessibilityLabel={`${BLINK_PERSON_MODEL.displayName} three-frame Blink photo strip`}
        source={BLINK_PERSON_MODEL.stripAsset}
        resizeMode="cover"
        style={styles.image}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    height: 86,
    borderRadius: radius.control,
    overflow: "hidden",
  },
  compactWrap: {
    height: 54,
    borderRadius: radius.control - 2,
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
