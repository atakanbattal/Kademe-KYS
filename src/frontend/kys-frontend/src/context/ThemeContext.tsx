import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, Theme } from '@mui/material/styles';

interface AppearanceSettings {
  theme: 'light' | 'dark';
  language: string;
  dateFormat: string;
  timeFormat: string;
  currency: string;
  primaryColor: string;
  companyLogo: string | null;
  dashboardLayout: string;
}

interface ThemeContextType {
  theme: Theme;
  appearanceSettings: AppearanceSettings;
  updateAppearanceSettings: (settings: Partial<AppearanceSettings>) => void;
  toggleTheme: () => void;
}

const defaultAppearanceSettings: AppearanceSettings = {
  theme: 'dark',
  language: 'tr',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24',
  currency: 'TRY',
  primaryColor: '#2196f3',
  companyLogo: null,
  dashboardLayout: 'default'
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

export const CustomThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appearanceSettings, setAppearanceSettings] = useState<AppearanceSettings>(() => {
    const saved = localStorage.getItem('appearanceSettings');
    return saved ? JSON.parse(saved) : defaultAppearanceSettings;
  });

  const createAppTheme = (settings: AppearanceSettings): Theme => {
    return createTheme({
      palette: {
        mode: settings.theme,
        primary: {
          main: settings.primaryColor,
        },
        secondary: {
          main: '#f50057',
        },
        background: {
          default: settings.theme === 'dark' ? '#121212' : '#fafafa',
          paper: settings.theme === 'dark' ? '#1d1d1d' : '#ffffff',
        },
        text: {
          primary: settings.theme === 'dark' ? '#ffffff' : '#000000',
          secondary: settings.theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
        },
      },
      typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
          fontSize: '2.5rem',
          fontWeight: 600,
          lineHeight: 1.2,
          letterSpacing: '-0.01562em',
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
        },
        h2: {
          fontSize: '2rem',
          fontWeight: 600,
          lineHeight: 1.3,
          letterSpacing: '-0.00833em',
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
        },
        h3: {
          fontSize: '1.75rem',
          fontWeight: 600,
          lineHeight: 1.4,
          letterSpacing: '0em',
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
        },
        h4: {
          fontSize: '1.5rem',
          fontWeight: 600,
          lineHeight: 1.4,
          letterSpacing: '0.00735em',
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
        },
        h5: {
          fontSize: '1.25rem',
          fontWeight: 600,
          lineHeight: 1.5,
          letterSpacing: '0em',
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
        },
        h6: {
          fontSize: '1.125rem',
          fontWeight: 600,
          lineHeight: 1.5,
          letterSpacing: '0.0075em',
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
        },
        body1: {
          fontSize: '1rem',
          lineHeight: 1.6,
          letterSpacing: '0.00938em',
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
        },
        body2: {
          fontSize: '0.875rem',
          lineHeight: 1.6,
          letterSpacing: '0.01071em',
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
        },
        subtitle1: {
          fontSize: '1rem',
          fontWeight: 500,
          lineHeight: 1.6,
          letterSpacing: '0.00938em',
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
        },
        subtitle2: {
          fontSize: '0.875rem',
          fontWeight: 500,
          lineHeight: 1.6,
          letterSpacing: '0.00714em',
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
        },
        caption: {
          fontSize: '0.75rem',
          lineHeight: 1.5,
          letterSpacing: '0.03333em',
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
        },
      },
      spacing: 8,
      shape: {
        borderRadius: 8,
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: 'none',
              borderRadius: 8,
              fontWeight: 500,
              whiteSpace: 'normal',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              lineHeight: 1.5,
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 12,
              position: 'relative',
              zIndex: 1,
              marginBottom: 16,
              overflow: 'visible',
            },
          },
        },
        MuiCardContent: {
          styleOverrides: {
            root: {
              padding: 16,
              position: 'relative',
              zIndex: 2,
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              '&:last-child': {
                paddingBottom: 16,
              },
            },
          },
        },
        MuiCardHeader: {
          styleOverrides: {
            root: {
              position: 'relative',
              zIndex: 2,
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
            },
            title: {
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
            },
            subheader: {
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
            },
          },
        },
        MuiTypography: {
          styleOverrides: {
            root: {
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              position: 'relative',
              zIndex: 1,
            },
          },
        },
        MuiListItemText: {
          styleOverrides: {
            root: {
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
            },
            primary: {
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '100%',
            },
            secondary: {
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
            },
          },
        },
        MuiChip: {
          styleOverrides: {
            label: {
              whiteSpace: 'normal',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
            },
          },
        },
        MuiTab: {
          styleOverrides: {
            root: {
              whiteSpace: 'normal',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              minWidth: 'auto',
              textTransform: 'none',
            },
          },
        },
        MuiDrawer: {
          styleOverrides: {
            paper: {
              zIndex: 1200,
              position: 'fixed',
            },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              zIndex: 1201,
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              position: 'relative',
              zIndex: 1,
            },
          },
        },
        MuiTextField: {
          defaultProps: {
            variant: 'outlined',
            InputLabelProps: {
              shrink: undefined, // Let Material-UI handle shrink automatically
            },
          },
          styleOverrides: {
            root: {
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: settings.theme === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                },
                '&:hover fieldset': {
                  borderColor: settings.theme === 'dark' ? 'rgba(255, 255, 255, 0.87)' : 'rgba(0, 0, 0, 0.87)',
                },
                '&.Mui-focused fieldset': {
                  borderWidth: 2,
                  borderColor: settings.primaryColor,
                },
              },
              '& .MuiInputLabel-outlined': {
                '&.MuiInputLabel-shrink': {
                  transform: 'translate(14px, -9px) scale(0.75)',
                  color: settings.primaryColor,
                },
              },
            },
          },
        },
        MuiFormControl: {
          defaultProps: {
            variant: 'outlined',
          },
        },
        MuiSelect: {
          defaultProps: {
            variant: 'outlined',
          },
        },
        MuiInputLabel: {
          styleOverrides: {
            outlined: {
              '&.MuiInputLabel-shrink': {
                transform: 'translate(14px, -9px) scale(0.75)',
                color: settings.primaryColor,
                backgroundColor: settings.theme === 'dark' ? '#1d1d1d' : '#ffffff',
                padding: '0 4px',
              },
            },
          },
        },
      },
    });
  };

  const [theme, setTheme] = useState(() => createAppTheme(appearanceSettings));

  useEffect(() => {
    setTheme(createAppTheme(appearanceSettings));
    localStorage.setItem('appearanceSettings', JSON.stringify(appearanceSettings));
  }, [appearanceSettings]);

  const updateAppearanceSettings = (newSettings: Partial<AppearanceSettings>) => {
    setAppearanceSettings(prev => ({ ...prev, ...newSettings }));
  };

  const toggleTheme = () => {
    updateAppearanceSettings({ 
      theme: appearanceSettings.theme === 'dark' ? 'light' : 'dark' 
    });
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      appearanceSettings,
      updateAppearanceSettings,
      toggleTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext; 