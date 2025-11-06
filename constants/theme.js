// Apple 2024 Dark Mode Design System
export const theme = {
  colors: {
    // Primary colors - Modern red with dark mode optimization
    primary: '#FF453A', // Vibrant red for dark mode
    primaryDark: '#FF2D20', // Deeper red for emphasis
    primaryLight: '#FF6961', // Softer red for accents
    secondary: '#FF9F8F', // Warm soft red
    accent: '#FFAA9F', // Lightest red accent
    
    // Dark backgrounds - Apple's 2024 dark hierarchy
    background: '#000000', // Pure black for OLED
    backgroundElevated: '#1C1C1E', // Elevated surfaces
    surface: '#1C1C1E', // Card/surface color
    surfaceElevated: '#2C2C2E', // Elevated cards
    surfaceHighlight: '#3A3A3C', // Hover/pressed states
    
    // Text colors optimized for dark mode
    text: '#FFFFFF', // Pure white for primary text
    textSecondary: '#98989D', // Muted secondary text
    textTertiary: '#636366', // Tertiary text
    textInverse: '#000000', // For light backgrounds
    
    // Borders - subtle in dark mode
    border: '#38383A', // Subtle separator
    borderLight: '#2C2C2E', // Very subtle separator
    borderHeavy: '#48484A', // More visible separator
    
    // Status colors - Apple's vibrant dark mode palette
    success: '#32D74B',
    error: '#FF453A',
    warning: '#FFD60A',
    info: '#0A84FF',
    white: '#FFFFFF',
    black: '#000000',
    
    // Gradient colors for dark mode
    gradientStart: '#FF453A',
    gradientMiddle: '#FF5E52',
    gradientEnd: '#FF6961',
    gradientLight: '#FF9F8F',
    gradientAccent: '#FFAA9F',
    
    // Glassmorphism and blur effects
    glass: 'rgba(28, 28, 30, 0.72)', // Dark glass
    glassDark: 'rgba(28, 28, 30, 0.85)', // Darker glass
    glassLight: 'rgba(44, 44, 46, 0.72)', // Light glass
    glassRed: 'rgba(255, 69, 58, 0.15)', // Red tinted glass
    
    // Overlay colors
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.3)',
    overlayHeavy: 'rgba(0, 0, 0, 0.7)',
    
    // Shadow colors for dark mode
    shadow: 'rgba(0, 0, 0, 0.3)',
    shadowDark: 'rgba(0, 0, 0, 0.5)',
    shadowRed: 'rgba(255, 69, 58, 0.3)',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  borderRadius: {
    sm: 10,
    md: 14,
    lg: 18,
    xl: 22,
    xxl: 28,
    round: 9999,
  },
  typography: {
    // Large display - hero sections
    display: {
      fontSize: 40,
      fontWeight: '800',
      lineHeight: 48,
      letterSpacing: -1.5,
    },
    // Extra large title
    h1: {
      fontSize: 30,
      fontWeight: '800',
      lineHeight: 38,
      letterSpacing: -0.5,
    },
    // Large title
    h2: {
      fontSize: 26,
      fontWeight: '700',
      lineHeight: 32,
      letterSpacing: -0.5,
    },
    // Title 1
    h3: {
      fontSize: 22,
      fontWeight: '700',
      lineHeight: 28,
      letterSpacing: -0.3,
    },
    // Title 2
    title: {
      fontSize: 22,
      fontWeight: '600',
      lineHeight: 28,
      letterSpacing: -0.26,
    },
    // Body text
    body: {
      fontSize: 17,
      fontWeight: '400',
      lineHeight: 26,
      letterSpacing: -0.41,
    },
    // Subheadline
    bodySmall: {
      fontSize: 15,
      fontWeight: '400',
      lineHeight: 22,
      letterSpacing: -0.24,
    },
    // Footnote
    caption: {
      fontSize: 13,
      fontWeight: '400',
      lineHeight: 18,
      letterSpacing: -0.08,
    },
    // CTA Button text
    button: {
      fontSize: 18,
      fontWeight: '600',
      lineHeight: 22,
      letterSpacing: -0.45,
    },
    // Large CTA Button
    buttonLarge: {
      fontSize: 20,
      fontWeight: '700',
      lineHeight: 24,
      letterSpacing: -0.5,
    },
  },
  shadows: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    small: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 16,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.4,
      shadowRadius: 24,
      elevation: 12,
    },
    glow: {
      shadowColor: '#FF453A',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 20,
      elevation: 5,
    },
    glowSubtle: {
      shadowColor: '#FF453A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 3,
    },
  },
  animations: {
    instant: 100,
    fast: 200,
    normal: 350,
    slow: 500,
    verySlow: 700,
    spring: {
      damping: 15,
      stiffness: 200,
      mass: 1,
    },
    springBouncy: {
      damping: 10,
      stiffness: 150,
      mass: 0.8,
    },
    easing: {
      easeOut: [0.16, 1, 0.3, 1],
      easeIn: [0.7, 0, 0.84, 0],
      easeInOut: [0.65, 0, 0.35, 1],
      spring: [0.5, 1.8, 0.3, 0.9],
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

