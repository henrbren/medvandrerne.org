import { Platform, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

/**
 * Detects if the device is a tablet/iPad
 * @returns {boolean} True if device is a tablet
 */
export const isTablet = () => {
  if (Platform.OS === 'web') {
    // For web, check screen width
    return width >= 768;
  }
  
  // For iOS, check if it's an iPad
  if (Platform.OS === 'ios') {
    // iPad detection: check screen size and aspect ratio
    const aspectRatio = Math.max(width, height) / Math.min(width, height);
    const minDimension = Math.min(width, height);
    // iPad typically has min dimension >= 768 and aspect ratio < 2
    return minDimension >= 768 && aspectRatio < 2;
  }
  
  // For Android, check screen size
  if (Platform.OS === 'android') {
    const minDimension = Math.min(width, height);
    const maxDimension = Math.max(width, height);
    // Tablet typically has min dimension >= 600dp
    return minDimension >= 600 || (minDimension >= 480 && maxDimension / minDimension < 1.6);
  }
  
  return false;
};

/**
 * Gets the number of columns for grid layouts based on device type
 * @param {number} mobileColumns - Number of columns on mobile (default: 1)
 * @param {number} tabletColumns - Number of columns on tablet (default: 2)
 * @returns {number} Number of columns
 */
export const getColumnCount = (mobileColumns = 1, tabletColumns = 2) => {
  return isTablet() ? tabletColumns : mobileColumns;
};

/**
 * Gets responsive spacing based on device type
 * @param {number} mobileSpacing - Spacing on mobile
 * @param {number} tabletSpacing - Spacing on tablet
 * @returns {number} Spacing value
 */
export const getResponsiveSpacing = (mobileSpacing, tabletSpacing) => {
  return isTablet() ? tabletSpacing : mobileSpacing;
};

/**
 * Gets responsive font size based on device type
 * @param {number} mobileSize - Font size on mobile
 * @param {number} tabletSize - Font size on tablet
 * @returns {number} Font size
 */
export const getResponsiveFontSize = (mobileSize, tabletSize) => {
  return isTablet() ? tabletSize : mobileSize;
};

