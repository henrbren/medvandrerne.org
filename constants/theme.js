// Ultra premium theme with stunning red color palette and enhanced design
export const theme = {
  colors: {
    // Rich red primary colors with depth
    primary: '#DC2626', // Vibrant red-600
    primaryDark: '#991B1B', // Deep red-800
    primaryLight: '#EF4444', // Bright red-500
    secondary: '#F87171', // Soft red-400
    accent: '#FCA5A5', // Light red-300
    // Enhanced background with subtle warmth
    background: '#FFF5F5', // Red-50 - warm white background
    surface: '#FFFFFF',
    surfaceElevated: '#FFFBFB', // Slightly warm elevated surface
    // Refined text colors
    text: '#1F2937', // Rich dark gray
    textSecondary: '#6B7280', // Medium gray
    textLight: '#9CA3AF', // Light gray
    // Subtle borders with warmth
    border: '#FEE2E2', // Red-100
    borderLight: '#FEF2F2', // Red-50
    // Status colors
    success: '#10B981',
    error: '#DC2626',
    warning: '#F59E0B',
    info: '#3B82F6',
    white: '#FFFFFF',
    black: '#000000',
    // Stunning gradient colors for red theme
    gradientStart: '#7F1D1D', // Deep burgundy
    gradientMiddle: '#B91C1C', // Rich red
    gradientEnd: '#DC2626', // Vibrant red
    gradientLight: '#EF4444', // Bright red
    gradientAccent: '#F87171', // Soft red
    // Enhanced shadow colors with red tint
    shadow: 'rgba(220, 38, 38, 0.1)',
    shadowDark: 'rgba(153, 27, 27, 0.2)',
    shadowRed: 'rgba(220, 38, 38, 0.15)',
    // Glass morphism effects
    glass: 'rgba(255, 255, 255, 0.85)',
    glassDark: 'rgba(255, 255, 255, 0.95)',
    glassRed: 'rgba(220, 38, 38, 0.1)',
  },
  spacing: {
    xs: 6,
    sm: 12,
    md: 20,
    lg: 28,
    xl: 40,
    xxl: 56,
    xxxl: 72,
  },
  borderRadius: {
    sm: 10,
    md: 16,
    lg: 20,
    xl: 28,
    xxl: 36,
    round: 9999,
  },
  typography: {
    h1: {
      fontSize: 36,
      fontWeight: '800',
      lineHeight: 44,
      letterSpacing: -0.5,
    },
    h2: {
      fontSize: 28,
      fontWeight: '700',
      lineHeight: 36,
      letterSpacing: -0.3,
    },
    h3: {
      fontSize: 22,
      fontWeight: '700',
      lineHeight: 30,
      letterSpacing: -0.2,
    },
    body: {
      fontSize: 17,
      fontWeight: '400',
      lineHeight: 26,
      letterSpacing: 0.1,
    },
    bodySmall: {
      fontSize: 15,
      fontWeight: '400',
      lineHeight: 22,
      letterSpacing: 0.1,
    },
    caption: {
      fontSize: 13,
      fontWeight: '500',
      lineHeight: 18,
      letterSpacing: 0.2,
    },
    display: {
      fontSize: 48,
      fontWeight: '900',
      lineHeight: 56,
      letterSpacing: -1,
    },
  },
  shadows: {
    small: {
      shadowColor: '#DC2626',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#DC2626',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 6,
    },
    large: {
      shadowColor: '#DC2626',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.16,
      shadowRadius: 28,
      elevation: 10,
    },
    xl: {
      shadowColor: '#991B1B',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.2,
      shadowRadius: 40,
      elevation: 14,
    },
    glow: {
      shadowColor: '#DC2626',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 8,
    },
  },
  animations: {
    fast: 200,
    normal: 350,
    slow: 600,
    spring: {
      damping: 15,
      stiffness: 150,
    },
  },
  // Web-specific responsive breakpoints
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1280,
  },
  // Web-specific styles
  web: {
    maxContentWidth: 1200,
    maxWideWidth: 1400,
    sidePadding: 40,
    cardGap: 24,
  },
};

