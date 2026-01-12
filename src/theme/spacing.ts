import { moderateScale } from '../utils/responsive';

/**
 * Responsive spacing system
 * Scales based on screen size for consistent layouts
 */
export const spacing = {
  xxs: moderateScale(4),
  xs: moderateScale(8),
  sm: moderateScale(12),
  md: moderateScale(16),
  lg: moderateScale(24),
  xl: moderateScale(32),
  xxl: moderateScale(48),
  xxxl: moderateScale(64),
  huge: moderateScale(96),
};

/**
 * Responsive border radius
 */
export const radii = {
  xs: moderateScale(8),
  sm: moderateScale(12),
  md: moderateScale(16),
  lg: moderateScale(20),
  xl: moderateScale(24),
  xxl: moderateScale(28),
};
