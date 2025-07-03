// 🎯 PROFESSIONAL DESIGN SYSTEM EXPORTS

// Import for internal use (must be at top)
import {
  PROFESSIONAL_COLORS as _PROFESSIONAL_COLORS,
  STATUS_COLORS as _STATUS_COLORS,
  SHADOWS as _SHADOWS,
  TRANSITIONS as _TRANSITIONS,
  BORDER_RADIUS as _BORDER_RADIUS,
  SPACING as _SPACING
} from './ProfessionalTheme';

// Theme and colors
export {
  PROFESSIONAL_COLORS,
  SHADOWS,
  TRANSITIONS,
  BORDER_RADIUS,
  SPACING,
  STATUS_COLORS,
  TYPOGRAPHY,
  createProfessionalTheme
} from './ProfessionalTheme';

// Professional Components
export {
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
} from './ProfessionalComponents';

// Helper function for status colors
export const getStatusColor = (status: string) => {
  switch (status) {
    case 'excellent': case 'active': case 'completed': case 'pass':
      return _STATUS_COLORS.excellent;
    case 'good': case 'valid': case 'approved':
      return _STATUS_COLORS.good;
    case 'warning': case 'pending': case 'due':
      return _STATUS_COLORS.warning;
    case 'critical': case 'overdue': case 'failed': case 'invalid':
      return _STATUS_COLORS.critical;
    case 'inactive': case 'cancelled': case 'maintenance':
      return _STATUS_COLORS.neutral;
    default:
      return _STATUS_COLORS.good;
  }
};

// Professional gradients helper
export const getProfessionalGradient = (colorName: 'primary' | 'secondary' | 'success' | 'warning' | 'error') => {
  const color = _PROFESSIONAL_COLORS[colorName];
  if (typeof color === 'object' && 'main' in color && 'dark' in color) {
    return `linear-gradient(135deg, ${color.main}, ${color.dark})`;
  }
  return `linear-gradient(135deg, ${_PROFESSIONAL_COLORS.primary.main}, ${_PROFESSIONAL_COLORS.primary.dark})`;
};

export default {
  PROFESSIONAL_COLORS: _PROFESSIONAL_COLORS,
  SHADOWS: _SHADOWS,
  TRANSITIONS: _TRANSITIONS,
  BORDER_RADIUS: _BORDER_RADIUS,
  SPACING: _SPACING,
  STATUS_COLORS: _STATUS_COLORS,
  getStatusColor,
  getProfessionalGradient
}; 