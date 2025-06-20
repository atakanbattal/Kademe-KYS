import React from 'react';
import { Box, Typography, SvgIconTypeMap } from '@mui/material';
import { OverridableComponent } from '@mui/material/OverridableComponent';

interface ModuleHeaderProps {
  title: string;
  icon: React.ElementType;
}

const ModuleHeader: React.FC<ModuleHeaderProps> = ({ title, icon: Icon }) => {
  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.secondary.main} 100%)`,
      color: 'white',
      borderRadius: 4,
      p: 3,
      mb: 4,
      boxShadow: (theme) => theme.shadows[8],
      position: 'relative',
      overflow: 'hidden',
    }}>
      <Icon sx={{ fontSize: 40, mr: 2 }} />
      <Box>
        <Typography variant="h4" fontWeight={700}>
          {title}
        </Typography>
      </Box>
    </Box>
  );
};

export default ModuleHeader; 