import { scaleFont } from '../utils/responsive';

export const typography = {
  regular: 'Montserrat_400Regular',
  medium: 'Montserrat_500Medium',
  semiBold: 'Montserrat_600SemiBold',
  bold: 'Montserrat_700Bold',
  extraBold: 'Montserrat_800ExtraBold',
};

/**
 * Responsive font sizes
 * Scales based on screen size for optimal readability
 */
export const fontSizes = {
  xs: scaleFont(11),
  sm: scaleFont(13),
  md: scaleFont(15),
  base: scaleFont(17),
  lg: scaleFont(20),
  xl: scaleFont(28),
  xxl: scaleFont(40),
  xxxl: scaleFont(56),
  display: scaleFont(72),
};

/**
 * Responsive line heights
 */
export const lineHeights = {
  tight: scaleFont(18),
  normal: scaleFont(22),
  relaxed: scaleFont(26),
  loose: scaleFont(30),
  xl: scaleFont(60),
};
