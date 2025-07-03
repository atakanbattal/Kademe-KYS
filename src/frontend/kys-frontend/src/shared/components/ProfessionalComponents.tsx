import React from 'react';
import { styled } from '@mui/material/styles';
import {
  Card,
  Button,
  Chip,
  Accordion,
  Table,
  TableHead,
  TableRow,
  TableCell,
  Paper,
  Typography,
  Box,
  TextField,
  Select,
  Autocomplete
} from '@mui/material';
import {
  PROFESSIONAL_COLORS,
  SHADOWS,
  TRANSITIONS,
  BORDER_RADIUS,
  SPACING,
  STATUS_COLORS
} from './ProfessionalTheme';

// 🎴 PROFESSIONAL CARD COMPONENTS

export const ProfessionalCard = styled(Card)(({ theme }) => ({
  borderRadius: BORDER_RADIUS.xl,
  background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${PROFESSIONAL_COLORS.background.surface})`,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: SHADOWS.card,
  transition: TRANSITIONS.default,
  overflow: 'hidden',
  position: 'relative',
  
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: SHADOWS.cardHover,
    borderColor: theme.palette.primary.light
  }
}));

export const ElevatedCard = styled(ProfessionalCard)(({ theme }) => ({
  boxShadow: SHADOWS.cardElevated,
  background: theme.palette.background.paper,
  
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.18)'
  }
}));

export const StatusCard = styled(ProfessionalCard)<{ status?: 'excellent' | 'good' | 'warning' | 'critical' }>(({ theme, status = 'good' }) => {
  const statusColor = STATUS_COLORS[status];
  
  return {
    borderLeft: `4px solid ${statusColor}`,
    background: `linear-gradient(145deg, ${statusColor}08, ${theme.palette.background.paper})`,
    
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 3,
      background: `linear-gradient(90deg, ${statusColor}, ${statusColor}aa)`,
      opacity: 0.8
    },
    
    '&:hover': {
      background: `linear-gradient(145deg, ${statusColor}12, ${theme.palette.background.paper})`,
      transform: 'translateY(-2px)',
      boxShadow: `0 8px 24px ${statusColor}20`
    }
  };
});

// 🔘 PROFESSIONAL BUTTON COMPONENTS

export const ProfessionalButton = styled(Button)(({ theme }) => ({
  borderRadius: BORDER_RADIUS.md,
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '0.9rem',
  padding: `${SPACING.sm}px ${SPACING.lg}px`,
  boxShadow: SHADOWS.button,
  transition: TRANSITIONS.hover,
  letterSpacing: '0.02em',
  
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: SHADOWS.buttonHover
  },
  
  '&.MuiButton-contained': {
    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
    '&:hover': {
      background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`
    }
  },
  
  '&.MuiButton-outlined': {
    borderWidth: 2,
    '&:hover': {
      borderWidth: 2,
      background: `${theme.palette.primary.main}08`
    }
  }
}));

export const ElegantButton = styled(ProfessionalButton)(({ theme }) => ({
  borderRadius: BORDER_RADIUS.lg,
  padding: `${SPACING.md}px ${SPACING.xl}px`,
  fontSize: '1rem',
  fontWeight: 600,
  
  '&.MuiButton-contained': {
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 50%, ${theme.palette.primary.main} 100%)`,
    backgroundSize: '200% 100%',
    backgroundPosition: 'left center',
    
    '&:hover': {
      backgroundPosition: 'right center',
      transform: 'translateY(-2px)',
      boxShadow: `0 8px 24px ${theme.palette.primary.main}40`
    }
  }
}));

// 🏷️ PROFESSIONAL CHIP COMPONENTS

export const StatusChip = styled(Chip)<{ statustype?: string }>(({ theme, statustype = 'good' }) => {
  const getStatusColor = () => {
    switch (statustype) {
      case 'excellent': case 'active': case 'completed': case 'pass':
        return { bg: STATUS_COLORS.excellent, color: '#ffffff' };
      case 'good': case 'valid': case 'approved':
        return { bg: STATUS_COLORS.good, color: '#ffffff' };
      case 'warning': case 'pending': case 'due':
        return { bg: STATUS_COLORS.warning, color: '#ffffff' };
      case 'critical': case 'overdue': case 'failed': case 'invalid':
        return { bg: STATUS_COLORS.critical, color: '#ffffff' };
      case 'inactive': case 'cancelled': case 'maintenance':
        return { bg: STATUS_COLORS.neutral, color: '#ffffff' };
      default:
        return { bg: STATUS_COLORS.good, color: '#ffffff' };
    }
  };

  const colors = getStatusColor();
  
  return {
    backgroundColor: colors.bg,
    color: colors.color,
    fontWeight: 600,
    fontSize: '0.75rem',
    borderRadius: BORDER_RADIUS.md,
    height: 24,
    
    '& .MuiChip-label': {
      paddingLeft: SPACING.sm,
      paddingRight: SPACING.sm
    },
    
    '& .MuiChip-icon': {
      color: colors.color,
      fontSize: '1rem'
    }
  };
});

export const ElegantChip = styled(StatusChip)(({ theme }) => ({
  borderRadius: BORDER_RADIUS.lg,
  height: 28,
  fontSize: '0.8rem',
  fontWeight: 500,
  boxShadow: SHADOWS.button,
  transition: TRANSITIONS.quick,
  
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: SHADOWS.buttonHover
  }
}));

// 📋 PROFESSIONAL TABLE COMPONENTS

export const ProfessionalTable = styled(Table)(({ theme }) => ({
  '& .MuiTableHead-root': {
    '& .MuiTableRow-root': {
      '& .MuiTableCell-root': {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        fontWeight: 700,
        fontSize: '0.85rem',
        padding: `${SPACING.md}px ${SPACING.sm}px`,
        borderBottom: `2px solid ${theme.palette.primary.dark}`,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        
        '&:first-of-type': {
          borderTopLeftRadius: BORDER_RADIUS.md
        },
        '&:last-of-type': {
          borderTopRightRadius: BORDER_RADIUS.md
        }
      }
    }
  },
  
  '& .MuiTableBody-root': {
    '& .MuiTableRow-root': {
      transition: TRANSITIONS.quick,
      cursor: 'pointer',
      
      '&:nth-of-type(even)': {
        backgroundColor: PROFESSIONAL_COLORS.background.surface
      },
      
      '&:hover': {
        backgroundColor: `${theme.palette.primary.main}08`,
        transform: 'scale(1.001)',
        boxShadow: `inset 0 0 0 1px ${theme.palette.primary.main}20`
      },
      
      '& .MuiTableCell-root': {
        padding: `${SPACING.md}px ${SPACING.sm}px`,
        fontSize: '0.875rem',
        borderBottom: `1px solid ${theme.palette.divider}`
      }
    }
  }
}));

export const ElegantTableHeader = styled(TableRow)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
  
  '& .MuiTableCell-root': {
    color: theme.palette.primary.contrastText,
    fontWeight: 700,
    fontSize: '0.9rem',
    padding: `${SPACING.lg}px ${SPACING.md}px`,
    textTransform: 'none',
    letterSpacing: '0.02em',
    borderBottom: 'none',
    
    '&:first-of-type': {
      borderTopLeftRadius: BORDER_RADIUS.lg
    },
    '&:last-of-type': {
      borderTopRightRadius: BORDER_RADIUS.lg
    }
  }
}));

// 🗂️ PROFESSIONAL ACCORDION COMPONENTS

export const ProfessionalAccordion = styled(Accordion)(({ theme }) => ({
  marginBottom: SPACING.lg,
  borderRadius: `${BORDER_RADIUS.xl}px !important`,
  backgroundColor: theme.palette.background.paper,
  boxShadow: SHADOWS.card,
  border: `1px solid ${theme.palette.divider}`,
  overflow: 'hidden',
  
  '&:before': {
    display: 'none'
  },
  
  '& .MuiAccordionSummary-root': {
    backgroundColor: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
    color: theme.palette.primary.contrastText,
    borderRadius: `${BORDER_RADIUS.xl}px ${BORDER_RADIUS.xl}px 0 0`,
    minHeight: 64,
    padding: `0 ${SPACING.lg}px`,
    transition: TRANSITIONS.default,
    
    '&.Mui-expanded': {
      minHeight: 64,
      borderRadius: `${BORDER_RADIUS.xl}px ${BORDER_RADIUS.xl}px 0 0`
    },
    
    '& .MuiAccordionSummary-content': {
      margin: `${SPACING.md}px 0`,
      '&.Mui-expanded': {
        margin: `${SPACING.md}px 0`
      }
    },
    
    '& .MuiAccordionSummary-expandIconWrapper': {
      color: theme.palette.primary.contrastText,
      transition: TRANSITIONS.default,
      
      '&.Mui-expanded': {
        transform: 'rotate(180deg)'
      }
    },
    
    '&:hover': {
      background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`
    }
  },
  
  '& .MuiAccordionDetails-root': {
    backgroundColor: theme.palette.background.paper,
    padding: SPACING.xl,
    borderTop: `1px solid ${theme.palette.primary.main}20`
  }
}));

// 📝 PROFESSIONAL FORM COMPONENTS

export const ProfessionalTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: theme.palette.background.paper,
    transition: TRANSITIONS.default,
    
    '&:hover': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.light
      }
    },
    
    '&.Mui-focused': {
      boxShadow: `0 0 0 2px ${theme.palette.primary.main}20`
    }
  },
  
  '& .MuiInputLabel-root': {
    fontWeight: 500,
    '&.Mui-focused': {
      color: theme.palette.primary.main
    }
  }
}));

export const ElegantSelect = styled(Select)(({ theme }) => ({
  borderRadius: BORDER_RADIUS.md,
  backgroundColor: theme.palette.background.paper,
  
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.divider
  },
  
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.light
  },
  
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 0 2px ${theme.palette.primary.main}20`
  }
}));

// 📦 PROFESSIONAL CONTAINER COMPONENTS

export const ProfessionalPaper = styled(Paper)(({ theme }) => ({
  borderRadius: BORDER_RADIUS.xl,
  padding: SPACING.xl,
  boxShadow: SHADOWS.card,
  border: `1px solid ${theme.palette.divider}`,
  background: theme.palette.background.paper,
  transition: TRANSITIONS.default,
  
  '&:hover': {
    boxShadow: SHADOWS.cardHover
  }
}));

export const ElegantContainer = styled(Box)(({ theme }) => ({
  padding: SPACING.xl,
  borderRadius: BORDER_RADIUS.xl,
  background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${PROFESSIONAL_COLORS.background.surface})`,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: SHADOWS.card
}));

// 📊 PROFESSIONAL SECTION HEADER

export const SectionHeader = styled(Typography)(({ theme }) => ({
  fontSize: '1.25rem',
  fontWeight: 600,
  color: theme.palette.primary.main,
  marginBottom: SPACING.lg,
  display: 'flex',
  alignItems: 'center',
  gap: SPACING.sm,
  
  '&::before': {
    content: '""',
    width: 4,
    height: 24,
    backgroundColor: theme.palette.primary.main,
    borderRadius: BORDER_RADIUS.sm
  }
}));

export default {
  ProfessionalCard,
  ElevatedCard,
  StatusCard,
  ProfessionalButton,
  ElegantButton,
  StatusChip,
  ElegantChip,
  ProfessionalTable,
  ElegantTableHeader,
  ProfessionalAccordion,
  ProfessionalTextField,
  ElegantSelect,
  ProfessionalPaper,
  ElegantContainer,
  SectionHeader
}; 