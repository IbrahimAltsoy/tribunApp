/**
 * Responsive Design Utilities
 * Provides screen-aware sizing and scaling functions
 */

import { Dimensions, PixelRatio, Platform } from 'react-native';

// Get screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (iPhone 11 Pro as reference)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

/**
 * Device size categories
 */
export const getDeviceSize = () => {
  if (SCREEN_WIDTH < 375) return 'small'; // iPhone SE, small Androids
  if (SCREEN_WIDTH < 414) return 'medium'; // iPhone 11 Pro, regular phones
  if (SCREEN_WIDTH < 768) return 'large'; // iPhone Pro Max, large phones
  return 'tablet'; // iPads, tablets
};

export const isSmallDevice = () => getDeviceSize() === 'small';
export const isMediumDevice = () => getDeviceSize() === 'medium';
export const isLargeDevice = () => getDeviceSize() === 'large';
export const isTablet = () => getDeviceSize() === 'tablet';

/**
 * Scale size based on screen width
 * @param size - Base size (from design)
 * @returns Scaled size for current screen
 */
export const wp = (percentage: number): number => {
  return (SCREEN_WIDTH * percentage) / 100;
};

/**
 * Scale size based on screen height
 * @param percentage - Percentage of screen height
 * @returns Scaled size for current screen
 */
export const hp = (percentage: number): number => {
  return (SCREEN_HEIGHT * percentage) / 100;
};

/**
 * Scale font size based on screen width
 * Ensures text is readable on all devices
 * @param size - Base font size
 * @returns Scaled font size
 */
export const scaleFont = (size: number): number => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  const newSize = size * scale;

  // Add platform-specific adjustments
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }

  // Android fonts tend to look slightly larger
  return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 1;
};

/**
 * Scale spacing/padding/margin based on screen size
 * @param size - Base size
 * @returns Scaled size
 */
export const scaleSize = (size: number): number => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  return Math.round(size * scale);
};

/**
 * Moderate scale - less aggressive scaling for large elements
 * Good for padding, margins, icon sizes
 * @param size - Base size
 * @param factor - Scaling factor (0-1), default 0.5
 * @returns Moderately scaled size
 */
export const moderateScale = (size: number, factor: number = 0.5): number => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  return Math.round(size + (scale - 1) * size * factor);
};

/**
 * Get responsive value based on device size
 * @param values - Object with size-specific values
 * @returns Value for current device size
 */
export const getResponsiveValue = <T,>(values: {
  small?: T;
  medium?: T;
  large?: T;
  tablet?: T;
  default: T;
}): T => {
  const deviceSize = getDeviceSize();
  return values[deviceSize] ?? values.default;
};

/**
 * Check if device is in landscape mode
 */
export const isLandscape = (): boolean => {
  return SCREEN_WIDTH > SCREEN_HEIGHT;
};

/**
 * Get safe maximum width for content
 * Prevents content from being too wide on tablets
 */
export const getMaxContentWidth = (): number => {
  if (isTablet()) {
    return Math.min(SCREEN_WIDTH * 0.8, 600);
  }
  return SCREEN_WIDTH;
};

/**
 * Responsive grid columns
 * Returns optimal number of columns based on screen width
 */
export const getGridColumns = (minItemWidth: number = 150): number => {
  const deviceSize = getDeviceSize();

  if (deviceSize === 'tablet') return 4;
  if (deviceSize === 'large') return 3;
  if (deviceSize === 'medium') return 2;
  return 2; // small devices
};

// Export screen dimensions for direct use
export const SCREEN = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmall: isSmallDevice(),
  isMedium: isMediumDevice(),
  isLarge: isLargeDevice(),
  isTablet: isTablet(),
};
