export const colors = {
  stage: '#020202',
  stageSoft: '#0A0A0A',
  shell: '#080808',
  shellRaised: '#141414',
  shellEdge: '#303030',
  paper: '#F4EFE5',
  paperWarm: '#FFF5E4',
  paperDeep: '#E8DDCD',
  paperLine: '#D8CDBE',
  ink: '#0A0A0A',
  muted: '#6B6259',
  muted2: '#968B7E',
  faint: '#BDB3A5',
  rule: 'rgba(10, 10, 10, 0.22)',
  ruleStrong: 'rgba(10, 10, 10, 0.42)',
  red: '#D8361E',
  redDeep: '#9E2115',
  redSoft: '#F3D4CB',
  lcd: '#DCEBCB',
  green: '#6F8762',
  greenDot: '#7EA05E',
  white: '#F7F3EA',
  transparent: 'transparent',
} as const;

export const spacing = {
  0: 0,
  1: 2,
  2: 4,
  3: 6,
  4: 8,
  5: 10,
  6: 12,
  7: 14,
  8: 16,
  10: 20,
  12: 24,
  14: 28,
  16: 32,
  20: 40,
} as const;

export const radius = {
  pager: 34,
  pagerInner: 24,
  shellInset: 18,
  slip: 15,
  slipSmall: 10,
  control: 8,
  button: 7,
  pill: 999,
} as const;

export const line = {
  hair: 1,
  medium: 1.5,
  strong: 2,
} as const;

export const shadow = {
  pager: {
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 14 },
    elevation: 10,
  },
  slip: {
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
} as const;
