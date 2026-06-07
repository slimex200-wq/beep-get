export const liquidGlassTokens = {
  bar: {
    height: 64,
    radius: 32,
    backgroundTransparent: "rgba(255,255,255,0.055)",
    backgroundTinted: "rgba(255,255,255,0.105)",
    darkCompensation: "rgba(0,0,0,0.08)",
    border: "rgba(255,255,255,0.16)",
    innerGlow: "rgba(255,255,255,0.08)",
  },
  lobe: {
    height: 58,
    radius: 29,
    backgroundTransparent: "rgba(255,255,255,0.075)",
    backgroundTinted: "rgba(28,120,255,0.22)",
    border: "rgba(255,255,255,0.18)",
  },
  icon: {
    inactive: "rgba(255,255,255,0.78)",
    active: "rgba(245,255,255,0.96)",
    size: 29,
  },
} as const;
