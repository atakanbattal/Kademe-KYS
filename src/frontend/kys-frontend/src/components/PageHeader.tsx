import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled Components
const HeaderCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.secondary.main} 100%)`,
  color: theme.palette.primary.contrastText,
  marginBottom: theme.spacing(3),
  borderRadius: 16,
  boxShadow: theme.shadows[8],
}));

interface PageHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string; // İsteğe bağlı hale getirdim
}

const PageHeader: React.FC<PageHeaderProps> = ({ icon, title, subtitle }) => {
  return (
    <HeaderCard>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ fontSize: 40, display: 'flex', alignItems: 'center' }}>
            {icon}
          </Box>
          <Box>
            <Typography variant="h4" fontWeight={700}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </HeaderCard>
  );
};

export default PageHeader; 