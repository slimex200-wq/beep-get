import React from "react";
import { Text, View } from "react-native";
import { appleLiquidGlassPreviewStyles as styles } from "@/screens/appleLiquidGlassPreview/styles";

type ContentTone = "teal" | "blue" | "pink" | "mint";

export function PreviewHeroCard() {
  return (
    <View style={styles.heroCard}>
      <View style={styles.heroCyanPane} />
      <View style={styles.heroBluePane} />
      <View style={styles.heroMintPane} />
      <View style={styles.heroRosePane} />
      <View style={styles.heroNavyPane}>
        <Text style={styles.heroKicker}>BEEP GET</Text>
        <Text style={styles.heroCode}>8282</Text>
      </View>
    </View>
  );
}

export function PreviewBackgroundSections() {
  return (
    <>
      <View style={styles.feedSection}>
        <ContentRow tone="teal" label="CYAN CHANNEL" value="04" />
        <ContentRow tone="blue" label="BLUE SIGNAL" value="11" />
        <ContentRow tone="pink" label="PINK REPLY" value="27" />
        <ContentRow tone="mint" label="MINT LOOP" value="36" />
      </View>
      <View style={styles.darkSection}>
        <Text style={styles.darkTitle}>DARK MATERIAL CHECK</Text>
        <View style={styles.darkPanel}>
          <View style={styles.darkStripe} />
          <View style={styles.darkStripeSoft} />
        </View>
      </View>
    </>
  );
}

function ContentRow({
  tone,
  label,
  value,
}: {
  readonly tone: ContentTone;
  readonly label: string;
  readonly value: string;
}) {
  return (
    <View style={[styles.contentRow, styles[tone]]}>
      <Text style={styles.contentLabel}>{label}</Text>
      <Text style={styles.contentValue}>{value}</Text>
    </View>
  );
}
