import { createTheme } from '@mui/material/styles';

// 🎨 PROFESSIONAL COLOR PALETTE - Corporate & Elegant
export const PROFESSIONAL_COLORS = {
  // Primary - Sophisticated Blues
  primary: {
    50: '#E3F2FD',
    100: '#BBDEFB', 
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#2196F3', // Main primary
    600: '#1E88E5',
    700: '#1976D2', // Dark primary
    800: '#1565C0',
    900: '#0D47A1',
    main: '#1976D2',
    dark: '#1565C0',
    light: '#42A5F5',
    contrastText: '#FFFFFF'
  },

  // Secondary - Professional Red
  secondary: {
    50: '#FFEBEE',
    100: '#FFCDD2',
    200: '#EF9A9A', 
    300: '#E57373',
    400: '#EF5350',
    500: '#F44336',
    600: '#E53935',
    700: '#D32F2F', // Main secondary
    800: '#C62828',
    900: '#B71C1C',
    main: '#D32F2F',
    dark: '#C62828',
    light: '#EF5350',
    contrastText: '#FFFFFF'
  },

  // Success - Sophisticated Green
  success: {
    50: '#E8F5E8',
    100: '#C8E6C8',
    200: '#A5D6A5',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50',
    600: '#43A047',
    700: '#388E3C', // Main success
    800: '#2E7D32',
    900: '#1B5E20',
    main: '#388E3C',
    dark: '#2E7D32',
    light: '#66BB6A',
    contrastText: '#FFFFFF'
  },

  // Warning - Elegant Orange
  warning: {
    50: '#FFF3E0',
    100: '#FFE0B2',
    200: '#FFCC80',
    300: '#FFB74D',
    400: '#FFA726',
    500: '#FF9800',
    600: '#FB8C00',
    700: '#F57C00', // Main warning  
    800: '#EF6C00',
    900: '#E65100',
    main: '#F57C00',
    dark: '#EF6C00',
    light: '#FFA726',
    contrastText: '#FFFFFF'
  },

  // Error - Professional Red (same as secondary for consistency)
  error: {
    50: '#FFEBEE',
    100: '#FFCDD2',
    200: '#EF9A9A',
    300: '#E57373', 
    400: '#EF5350',
    500: '#F44336',
    600: '#E53935',
    700: '#D32F2F',
    800: '#C62828', // Main error
    900: '#B71C1C',
    main: '#C62828',
    dark: '#B71C1C',
    light: '#EF5350',
    contrastText: '#FFFFFF'
  },

  // Elegant Grays
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121'
  },

  // Background colors - Professional & Clean
  background: {
    default: '#FAFAFA', // Very light gray
    paper: '#FFFFFF',   // Pure white
    surface: '#F8F9FA', // Subtle gray
    elevated: '#FFFFFF' // White for elevated surfaces
  }
} as const;

// 📏 PROFESSIONAL SPACING SYSTEM
export const SPACING = {
  xs: 4,   // 0.5 * 8
  sm: 8,   // 1 * 8  
  md: 16,  // 2 * 8
  lg: 24,  // 3 * 8
  xl: 32,  // 4 * 8
  xxl: 48  // 6 * 8
} as const;

// 🔤 PROFESSIONAL TYPOGRAPHY
export const TYPOGRAPHY = {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  
  // Professional hierarchy
  h1: {
    fontSize: '2.5rem',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.01562em'
  },
  h2: {
    fontSize: '2rem', 
    fontWeight: 600,
    lineHeight: 1.2,
    letterSpacing: '-0.00833em'
  },
  h3: {
    fontSize: '1.75rem',
    fontWeight: 600,
    lineHeight: 1.2
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.3
  },
  h5: {
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.3
  },
  h6: {
    fontSize: '1.125rem',
    fontWeight: 600,
    lineHeight: 1.4
  },
  
  // Body text
  body1: {
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.5
  },
  body2: {
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1.43
  },
  
  // Special text
  subtitle1: {
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: 1.5
  },
  subtitle2: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.43
  },
  caption: {
    fontSize: '0.75rem',
    fontWeight: 400,
    lineHeight: 1.4
  },
  overline: {
    fontSize: '0.75rem',
    fontWeight: 500,
    lineHeight: 1.4,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08333em'
  }
} as const;

// 🎭 PROFESSIONAL SHADOWS - Elegant & Subtle
export const SHADOWS = {
  card: '0 2px 8px rgba(0, 0, 0, 0.08)',
  cardHover: '0 4px 16px rgba(0, 0, 0, 0.12)', 
  cardElevated: '0 8px 24px rgba(0, 0, 0, 0.15)',
  dialog: '0 8px 32px rgba(0, 0, 0, 0.16)',
  dropdown: '0 4px 12px rgba(0, 0, 0, 0.1)',
  button: '0 2px 4px rgba(0, 0, 0, 0.08)',
  buttonHover: '0 4px 8px rgba(0, 0, 0, 0.12)',
  none: 'none'
} as const;

// 🔄 PROFESSIONAL TRANSITIONS  
export const TRANSITIONS = {
  default: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  quick: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  slow: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  
  // Specific effects
  hover: 'transform 0.2s ease-out, box-shadow 0.3s ease-out',
  fadeIn: 'opacity 0.3s ease-in-out',
  slideUp: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
} as const;

// 📐 PROFESSIONAL BORDER RADIUS
export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  round: '50%'
} as const;

// 🎨 STATUS COLORS - Professional & Semantic
export const STATUS_COLORS = {
  excellent: PROFESSIONAL_COLORS.success.main,
  good: PROFESSIONAL_COLORS.primary.main, 
  warning: PROFESSIONAL_COLORS.warning.main,
  critical: PROFESSIONAL_COLORS.error.main,
  info: PROFESSIONAL_COLORS.primary.light,
  neutral: PROFESSIONAL_COLORS.gray[500],
  
  // Specific statuses
  active: PROFESSIONAL_COLORS.success.main,
  inactive: PROFESSIONAL_COLORS.gray[400],
  pending: PROFESSIONAL_COLORS.warning.main,
  completed: PROFESSIONAL_COLORS.success.main,
  failed: PROFESSIONAL_COLORS.error.main,
  cancelled: PROFESSIONAL_COLORS.gray[500]
} as const;

// 🎯 PROFESSIONAL MUI THEME
export const createProfessionalTheme = (primaryColor?: string) => {
  const effectivePrimary = primaryColor || PROFESSIONAL_COLORS.primary.main;
  
  return createTheme({
    palette: {
      mode: 'light',
      primary: {
        ...PROFESSIONAL_COLORS.primary,
        main: effectivePrimary
      },
      secondary: PROFESSIONAL_COLORS.secondary,
      success: PROFESSIONAL_COLORS.success,
      warning: PROFESSIONAL_COLORS.warning,
      error: PROFESSIONAL_COLORS.error,
      background: PROFESSIONAL_COLORS.background,
      grey: PROFESSIONAL_COLORS.gray
    },
    
    typography: {
      fontFamily: TYPOGRAPHY.fontFamily,
      h1: TYPOGRAPHY.h1,
      h2: TYPOGRAPHY.h2, 
      h3: TYPOGRAPHY.h3,
      h4: TYPOGRAPHY.h4,
      h5: TYPOGRAPHY.h5,
      h6: TYPOGRAPHY.h6,
      body1: TYPOGRAPHY.body1,
      body2: TYPOGRAPHY.body2,
      subtitle1: TYPOGRAPHY.subtitle1,
      subtitle2: TYPOGRAPHY.subtitle2,
      caption: TYPOGRAPHY.caption,
      overline: TYPOGRAPHY.overline
    },
    
    spacing: 8, // Base spacing unit
    
    shape: {
      borderRadius: BORDER_RADIUS.md
    },
    
    shadows: [
      'none',                                          // 0
      SHADOWS.button,                                  // 1
      SHADOWS.card,                                    // 2  
      SHADOWS.cardHover,                               // 3
      SHADOWS.cardElevated,                            // 4
      SHADOWS.dropdown,                                // 5
      SHADOWS.dialog,                                  // 6
      '0 12px 40px rgba(0, 0, 0, 0.18)',             // 7
      '0 16px 48px rgba(0, 0, 0, 0.2)',              // 8
      '0 20px 56px rgba(0, 0, 0, 0.22)',             // 9
      '0 24px 64px rgba(0, 0, 0, 0.24)',             // 10
      '0 28px 72px rgba(0, 0, 0, 0.26)',             // 11
      '0 32px 80px rgba(0, 0, 0, 0.28)',             // 12
      '0 36px 88px rgba(0, 0, 0, 0.3)',              // 13
      '0 40px 96px rgba(0, 0, 0, 0.32)',             // 14
      '0 44px 104px rgba(0, 0, 0, 0.34)',            // 15
      '0 48px 112px rgba(0, 0, 0, 0.36)',            // 16
      '0 52px 120px rgba(0, 0, 0, 0.38)',            // 17
      '0 56px 128px rgba(0, 0, 0, 0.4)',             // 18
      '0 60px 136px rgba(0, 0, 0, 0.42)',            // 19
      '0 64px 144px rgba(0, 0, 0, 0.44)',            // 20
      '0 68px 152px rgba(0, 0, 0, 0.46)',            // 21
      '0 72px 160px rgba(0, 0, 0, 0.48)',            // 22
      '0 76px 168px rgba(0, 0, 0, 0.5)',             // 23
      '0 80px 176px rgba(0, 0, 0, 0.52)'             // 24
    ],
    
    components: {
      // Professional component overrides will be added here
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: SHADOWS.card,
            borderRadius: BORDER_RADIUS.lg,
            transition: TRANSITIONS.default,
            '&:hover': {
              boxShadow: SHADOWS.cardHover
            }
          }
        }
      },
      
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: BORDER_RADIUS.md,
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: SHADOWS.button,
            transition: TRANSITIONS.hover,
            '&:hover': {
              boxShadow: SHADOWS.buttonHover,
              transform: 'translateY(-1px)'
            }
          }
        }
      }
    }
  });
};

export default createProfessionalTheme; 