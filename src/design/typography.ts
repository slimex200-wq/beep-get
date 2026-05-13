import { TextStyle } from 'react-native';
import { colors } from './tokens';

export const font = {
  displayKo: 'Pretendard-Bold',
  displayLatin: 'Pretendard-Bold',
  sans: 'Pretendard',
  sansMedium: 'Pretendard-Medium',
  sansSemiBold: 'Pretendard-SemiBold',
  sansBold: 'Pretendard-Bold',
  mono: 'IBMPlexMono',
  monoMedium: 'IBMPlexMono-Medium',
  monoBold: 'IBMPlexMono-Bold',
  brand: 'Pretendard-Bold',
  brandItalic: 'Pretendard-Medium',
} as const;

export const type = {
  appTitle: {
    fontFamily: font.sansBold,
    fontSize: 13,
    lineHeight: 17,
    letterSpacing: 1.2,
    color: colors.ink,
  } satisfies TextStyle,

  boardLabel: {
    fontFamily: font.sansSemiBold,
    fontSize: 12,
    lineHeight: 17,
    letterSpacing: 0.8,
    color: colors.white,
  } satisfies TextStyle,

  screenTitle: {
    fontFamily: font.sansBold,
    fontSize: 20,
    lineHeight: 27,
    letterSpacing: -0.2,
    color: colors.ink,
  } satisfies TextStyle,

  slipTitle: {
    fontFamily: font.sansSemiBold,
    fontSize: 17,
    lineHeight: 23,
    letterSpacing: -0.25,
    color: colors.ink,
  } satisfies TextStyle,

  slipTitleSmall: {
    fontFamily: font.sansSemiBold,
    fontSize: 13,
    lineHeight: 17,
    letterSpacing: -0.1,
    color: colors.ink,
  } satisfies TextStyle,

  codeHero: {
    fontFamily: font.monoBold,
    fontSize: 68,
    lineHeight: 76,
    letterSpacing: -3.5,
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  } satisfies TextStyle,

  codeMedium: {
    fontFamily: font.monoBold,
    fontSize: 40,
    lineHeight: 47,
    letterSpacing: -2,
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  } satisfies TextStyle,

  codeSmall: {
    fontFamily: font.monoBold,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -1,
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  } satisfies TextStyle,

  metaLabel: {
    fontFamily: font.monoBold,
    fontSize: 7,
    lineHeight: 10,
    letterSpacing: 0.7,
    color: colors.muted,
  } satisfies TextStyle,

  metaValue: {
    fontFamily: font.sansBold,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: -0.05,
    color: colors.ink,
  } satisfies TextStyle,

  monoValue: {
    fontFamily: font.monoBold,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.1,
    color: colors.ink,
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
    fontFamily: font.sansBold,
    fontSize: 12,
    lineHeight: 15,
    letterSpacing: -0.05,
    color: colors.ink,
  } satisfies TextStyle,

  buttonMono: {
    fontFamily: font.monoBold,
    fontSize: 12,
    lineHeight: 15,
    letterSpacing: 0.25,
    color: colors.ink,
  } satisfies TextStyle,

  tinyMono: {
    fontFamily: font.monoBold,
    fontSize: 8,
    lineHeight: 11,
    letterSpacing: 0.45,
    color: colors.muted,
  } satisfies TextStyle,
};
