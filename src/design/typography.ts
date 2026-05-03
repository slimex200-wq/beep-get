import { Platform, TextStyle } from 'react-native';
import { colors } from './tokens';

const iosSans = 'System';
const androidSans = 'sans-serif';
const iosSerif = 'Georgia';
const androidSerif = 'serif';
const iosMono = 'Courier';
const androidMono = 'monospace';

export const font = {
  displayKo: Platform.select({ ios: iosSerif, android: androidSerif, default: iosSerif }),
  displayLatin: Platform.select({ ios: iosSerif, android: androidSerif, default: iosSerif }),
  sans: Platform.select({ ios: iosSans, android: androidSans, default: iosSans }),
  mono: Platform.select({ ios: iosMono, android: androidMono, default: iosMono }),
} as const;

export const type = {
  appTitle: {
    fontFamily: font.mono,
    fontSize: 13,
    lineHeight: 17,
    letterSpacing: 1.2,
    fontWeight: '700',
    color: colors.ink,
  } satisfies TextStyle,

  boardLabel: {
    fontFamily: font.mono,
    fontSize: 12,
    lineHeight: 17,
    letterSpacing: 0.8,
    color: colors.white,
  } satisfies TextStyle,

  screenTitle: {
    fontFamily: font.displayKo,
    fontSize: 20,
    lineHeight: 27,
    letterSpacing: -0.2,
    color: colors.ink,
    fontWeight: '700',
  } satisfies TextStyle,

  slipTitle: {
    fontFamily: font.displayKo,
    fontSize: 17,
    lineHeight: 23,
    letterSpacing: -0.25,
    color: colors.ink,
    fontWeight: '600',
  } satisfies TextStyle,

  slipTitleSmall: {
    fontFamily: font.displayKo,
    fontSize: 13,
    lineHeight: 17,
    letterSpacing: -0.1,
    color: colors.ink,
    fontWeight: '600',
  } satisfies TextStyle,

  codeHero: {
    fontFamily: font.mono,
    fontSize: 68,
    lineHeight: 76,
    letterSpacing: -3.5,
    color: colors.ink,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  } satisfies TextStyle,

  codeMedium: {
    fontFamily: font.mono,
    fontSize: 40,
    lineHeight: 47,
    letterSpacing: -2,
    color: colors.ink,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  } satisfies TextStyle,

  codeSmall: {
    fontFamily: font.mono,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -1,
    color: colors.ink,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  } satisfies TextStyle,

  metaLabel: {
    fontFamily: font.mono,
    fontSize: 7,
    lineHeight: 10,
    letterSpacing: 0.7,
    color: colors.muted,
    fontWeight: '700',
  } satisfies TextStyle,

  metaValue: {
    fontFamily: font.sans,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: -0.05,
    color: colors.ink,
    fontWeight: '700',
  } satisfies TextStyle,

  monoValue: {
    fontFamily: font.mono,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.1,
    color: colors.ink,
    fontWeight: '700',
  } satisfies TextStyle,

  body: {
    fontFamily: font.sans,
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: -0.1,
    color: colors.ink,
  } satisfies TextStyle,

  bodyMuted: {
    fontFamily: font.sans,
    fontSize: 11,
    lineHeight: 17,
    letterSpacing: -0.1,
    color: colors.muted,
  } satisfies TextStyle,

  button: {
    fontFamily: font.sans,
    fontSize: 12,
    lineHeight: 15,
    letterSpacing: -0.05,
    color: colors.ink,
    fontWeight: '800',
  } satisfies TextStyle,

  buttonMono: {
    fontFamily: font.mono,
    fontSize: 12,
    lineHeight: 15,
    letterSpacing: 0.25,
    color: colors.ink,
    fontWeight: '700',
  } satisfies TextStyle,

  tinyMono: {
    fontFamily: font.mono,
    fontSize: 8,
    lineHeight: 11,
    letterSpacing: 0.45,
    color: colors.muted,
    fontWeight: '700',
  } satisfies TextStyle,
};
