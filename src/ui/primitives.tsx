import React from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { BackLineIcon } from "@/components/MockupLineIcons";
import { AppSurface } from "@/components/AppSurface";
import { useAppPalette } from "@/design/appTheme";
import { font, type } from "@/design/typography";
import { radius, spacing } from "@/design/tokens";

/* ============================================================
   BEEP-GET UI PRIMITIVES — "Paper · Ink · Signal" (2026-07-02)
   The single component vocabulary for every product surface.

   Rules encoded here, so screens cannot drift:
   - Primary actions and selected fills are always ink (palette.primary).
   - palette.sig appears only through <Beacon/>, <SectionLabel/> tick,
     signal-semantic text (`sig` prop), and selection rings.
   - Sections have exactly one left label. No right hints.
   - Chips, buttons, inputs, segments are pills.
   ============================================================ */

/* ---------- Screen shell: header (optional back + title + mono side) + scroll ---------- */
export function Screen({
  title,
  side,
  headerRight,
  onBack,
  backAccessibilityLabel,
  refreshing,
  onRefresh,
  children,
}: {
  readonly title: string;
  readonly side?: string;
  readonly headerRight?: React.ReactNode;
  /** Pushed drill-in screens render a left back affordance; modals use headerRight instead. */
  readonly onBack?: () => void;
  readonly backAccessibilityLabel?: string;
  readonly refreshing?: boolean;
  readonly onRefresh?: () => void;
  readonly children: React.ReactNode;
}) {
  const palette = useAppPalette();
  return (
    <AppSurface backgroundColor={palette.background} statusBarStyle={palette.statusBar}>
      <ScrollView
        contentContainerStyle={styles.screenContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={Boolean(refreshing)}
              onRefresh={onRefresh}
              tintColor={palette.muted}
            />
          ) : undefined
        }
      >
        <View style={styles.headerRow}>
          <View style={styles.headerLead}>
            {onBack ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={backAccessibilityLabel ?? "Back"}
                onPress={onBack}
                style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
              >
                <BackLineIcon color={palette.text} />
              </Pressable>
            ) : null}
            <Text style={[type.screenTitle, { color: palette.text }]}>{title}</Text>
          </View>
          {headerRight ??
            (side ? (
              <Text style={[styles.headerSide, { color: palette.muted2 }]}>{side}</Text>
            ) : null)}
        </View>
        {children}
      </ScrollView>
    </AppSurface>
  );
}

/* ---------- Section label: one left label + sig square tick ---------- */
export function SectionLabel({ children }: { readonly children: string }) {
  const palette = useAppPalette();
  return (
    <View style={styles.sectionRow}>
      <View style={[styles.sectionTick, { backgroundColor: palette.sig }]} />
      <Text style={[styles.sectionText, { color: palette.muted }]}>{children}</Text>
    </View>
  );
}

/* ---------- Card ---------- */
export function Card({
  children,
  style,
  onPress,
  accessibilityLabel,
}: {
  readonly children: React.ReactNode;
  readonly style?: StyleProp<ViewStyle>;
  readonly onPress?: () => void;
  readonly accessibilityLabel?: string;
}) {
  const palette = useAppPalette();
  const base = [
    styles.card,
    { backgroundColor: palette.card, borderColor: palette.rule },
    style,
  ];
  if (!onPress) return <View style={base}>{children}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [...base, pressed && styles.pressed]}
    >
      {children}
    </Pressable>
  );
}

/* ---------- List row: left node + title/meta + right node ---------- */
export function ListRow({
  left,
  title,
  meta,
  metaMono,
  right,
  onPress,
  isLast,
  accessibilityLabel,
}: {
  readonly left?: React.ReactNode;
  readonly title: string;
  readonly meta?: string;
  readonly metaMono?: boolean;
  readonly right?: React.ReactNode;
  readonly onPress?: () => void;
  readonly isLast?: boolean;
  readonly accessibilityLabel?: string;
}) {
  const palette = useAppPalette();
  const body = (
    <>
      {left}
      <View style={styles.rowGrow}>
        <Text style={[styles.rowTitle, { color: palette.text }]} numberOfLines={1}>
          {title}
        </Text>
        {meta ? (
          <Text
            style={[metaMono ? styles.rowMetaMono : styles.rowMeta, { color: palette.muted }]}
            numberOfLines={1}
          >
            {meta}
          </Text>
        ) : null}
      </View>
      {right}
    </>
  );
  const border = isLast ? null : { borderBottomWidth: 1, borderBottomColor: palette.rule };
  if (!onPress) return <View style={[styles.row, border]}>{body}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      onPress={onPress}
      style={({ pressed }) => [styles.row, border, pressed && styles.pressed]}
    >
      {body}
    </Pressable>
  );
}

/* ---------- Chevron for settings rows ---------- */
export function RowChevron() {
  const palette = useAppPalette();
  return <Text style={[styles.chevron, { color: palette.muted2 }]}>›</Text>;
}

/* ---------- Pill chip: idle paper / selected ink (+ sig microdot) ---------- */
export function Chip({
  label,
  selected,
  mono = true,
  disabled,
  flex,
  onPress,
  accessibilityLabel,
}: {
  readonly label: string;
  readonly selected?: boolean;
  readonly mono?: boolean;
  readonly disabled?: boolean;
  readonly flex?: boolean;
  readonly onPress?: () => void;
  readonly accessibilityLabel?: string;
}) {
  const palette = useAppPalette();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ ...(selected ? { selected: true } : {}), ...(disabled ? { disabled: true } : {}) }}
      disabled={disabled || !onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        flex && styles.flex1,
        selected
          ? { backgroundColor: palette.primary, borderColor: palette.primary }
          : { backgroundColor: palette.card, borderColor: palette.rule },
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <Text
        numberOfLines={1}
        style={[
          mono ? styles.chipTextMono : styles.chipText,
          { color: selected ? palette.primaryText : palette.text },
        ]}
      >
        {label}
      </Text>
      {selected ? <View style={[styles.chipDot, { backgroundColor: palette.sig }]} /> : null}
    </Pressable>
  );
}

/* ---------- Quiet outline pill button (편집 / 변경 / 복사 / 추가) ---------- */
export function PillButton({
  label,
  onPress,
  disabled,
  accessibilityLabel,
}: {
  readonly label: string;
  readonly onPress: () => void;
  readonly disabled?: boolean;
  readonly accessibilityLabel?: string;
}) {
  const palette = useAppPalette();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.pillButton,
        { borderColor: palette.text },
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.pillButtonText, { color: palette.text }]}>{label}</Text>
    </Pressable>
  );
}

/* ---------- Primary action: ink fill, sig-tinted icon ---------- */
export function PrimaryButton({
  label,
  icon,
  onPress,
  disabled,
  busy,
  accessibilityLabel,
}: {
  readonly label: string;
  readonly icon?: React.ReactNode;
  readonly onPress: () => void;
  readonly disabled?: boolean;
  readonly busy?: boolean;
  readonly accessibilityLabel?: string;
}) {
  const palette = useAppPalette();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={disabled || busy ? { disabled: true } : {}}
      disabled={disabled || busy}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        { backgroundColor: palette.primary },
        (disabled || busy) && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      {busy ? <ActivityIndicator size="small" color={palette.primaryText} /> : icon}
      <Text style={[styles.primaryButtonText, { color: palette.primaryText }]}>{label}</Text>
    </Pressable>
  );
}

/* ---------- Segmented pill (BEEP | BLINK) ---------- */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  readonly options: readonly { readonly key: T; readonly label: string }[];
  readonly value: T;
  readonly onChange: (key: T) => void;
}) {
  const palette = useAppPalette();
  return (
    <View style={[styles.segTrack, { backgroundColor: palette.cardSoft, borderColor: palette.rule }]}>
      {options.map((option) => {
        const on = option.key === value;
        return (
          <Pressable
            key={option.key}
            accessibilityRole="button"
            accessibilityState={on ? { selected: true } : {}}
            onPress={() => onChange(option.key)}
            style={[styles.segOption, on && { backgroundColor: palette.primary }]}
          >
            <Text style={[styles.segText, { color: on ? palette.primaryText : palette.muted2 }]}>
              {option.label}
            </Text>
            {on ? <View style={[styles.segDot, { backgroundColor: palette.sig }]} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

/* ---------- Signal semantics ---------- */
// Pulsing-intent LED dot. Signal color only — never used decoratively.
export function Beacon({ size = 8 }: { readonly size?: number }) {
  const palette = useAppPalette();
  return (
    <View
      style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: palette.sig }}
    />
  );
}

// Status dot pinned to an avatar corner: "new" = sig, "on" = presence green.
export function StatusDot({ kind }: { readonly kind: "new" | "on" }) {
  const palette = useAppPalette();
  return (
    <View
      style={[
        styles.statusDot,
        {
          backgroundColor: kind === "new" ? palette.sig : palette.good,
          borderColor: palette.card,
        },
      ]}
    />
  );
}

// Mono signal-kind label, e.g. INCOMING BEEP — always sig.
export function SignalKindLabel({ children }: { readonly children: string }) {
  const palette = useAppPalette();
  return (
    <View style={styles.kindRow}>
      <Beacon />
      <Text style={[styles.kindText, { color: palette.sig }]}>{children}</Text>
    </View>
  );
}

/* ---------- Paper-slip perforation: dashed rule + punch-hole notches ---------- */
export function Perforation() {
  const palette = useAppPalette();
  return (
    <View style={styles.perfWrap} pointerEvents="none">
      <View style={[styles.perfLine, { borderColor: palette.rule }]} />
      <View
        style={[
          styles.perfNotch,
          styles.perfNotchLeft,
          { backgroundColor: palette.background, borderColor: palette.rule },
        ]}
      />
      <View
        style={[
          styles.perfNotch,
          styles.perfNotchRight,
          { backgroundColor: palette.background, borderColor: palette.rule },
        ]}
      />
    </View>
  );
}

/* ---------- Mono text helpers ---------- */
export function MonoValue({
  children,
  sig,
  dim,
  style,
}: {
  readonly children: string;
  readonly sig?: boolean;
  readonly dim?: boolean;
  readonly style?: StyleProp<TextStyle>;
}) {
  const palette = useAppPalette();
  const color = sig ? palette.sig : dim ? palette.muted2 : palette.text;
  return <Text style={[styles.monoValue, { color }, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  screenContent: {
    paddingHorizontal: spacing[6],
    paddingBottom: 118,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing[8],
    marginTop: spacing[4],
  },
  headerLead: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[5],
    flex: 1,
    minWidth: 0,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -6,
  },
  headerSide: {
    ...type.monoValue,
    fontSize: 13,
    letterSpacing: 1.4,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: spacing[10],
    marginBottom: spacing[5],
    marginHorizontal: 2,
  },
  sectionTick: {
    width: 6,
    height: 6,
  },
  sectionText: {
    ...type.tinyMono,
    fontSize: 11,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    fontWeight: "700",
  },
  card: {
    borderWidth: 1,
    borderRadius: 22,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[6],
    paddingVertical: spacing[7],
    paddingHorizontal: spacing[8],
  },
  rowGrow: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
      fontFamily: font.sansBold,
      fontSize: 15,
    },
  rowMeta: {
    ...type.bodyMuted,
    fontSize: 12,
    marginTop: 2,
  },
  rowMetaMono: {
    ...type.tinyMono,
    fontSize: 12,
    marginTop: 2,
  },
  chevron: {
    fontSize: 22,
    fontWeight: "600",
    marginLeft: spacing[2],
  },
  chip: {
    minHeight: 44,
    borderWidth: 1.5,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing[7],
    position: "relative",
  },
  chipText: {
      fontFamily: font.sansBold,
      fontSize: 14.5,
    },
  chipTextMono: {
    ...type.monoValue,
    fontSize: 14.5,
  },
  chipDot: {
    position: "absolute",
    top: 7,
    right: 9,
    width: 5,
    height: 5,
    borderRadius: radius.pill,
  },
  pillButton: {
    minHeight: 36,
    borderWidth: 1.5,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing[8],
  },
  pillButtonText: {
      fontFamily: font.sansBold,
      fontSize: 13,
    },
  primaryButton: {
    minHeight: 56,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[5],
  },
  primaryButtonText: {
    ...type.monoValue,
    fontSize: 15.5,
    letterSpacing: 1.4,
    fontWeight: "800",
  },
  segTrack: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: radius.pill,
    padding: 4,
  },
  segOption: {
    flex: 1,
    minHeight: 44,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  segText: {
    ...type.monoValue,
    fontSize: 13.5,
    letterSpacing: 1.6,
    fontWeight: "800",
  },
  segDot: {
    position: "absolute",
    top: 9,
    right: 14,
    width: 5,
    height: 5,
    borderRadius: radius.pill,
  },
  statusDot: {
    position: "absolute",
    right: -1,
    top: -1,
    width: 11,
    height: 11,
    borderRadius: radius.pill,
    borderWidth: 2,
  },
  kindRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  kindText: {
    ...type.tinyMono,
    fontSize: 11,
    letterSpacing: 2.2,
    fontWeight: "800",
  },
  perfWrap: {
    height: 0,
    marginHorizontal: spacing[5],
    position: "relative",
  },
  perfLine: {
    borderTopWidth: 2,
    borderStyle: "dashed",
  },
  perfNotch: {
    position: "absolute",
    top: -9,
    width: 18,
    height: 18,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  perfNotchLeft: {
    left: -19 - spacing[5],
  },
  perfNotchRight: {
    right: -19 - spacing[5],
  },
  monoValue: {
    ...type.monoValue,
    fontSize: 15,
    fontWeight: "800",
  },
  flex1: {
    flex: 1,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
  disabled: {
    opacity: 0.4,
  },
});
