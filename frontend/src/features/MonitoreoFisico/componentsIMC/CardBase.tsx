import React from 'react';
import { Paper, useTheme, type PaperProps } from '@mui/material';

export const CardBase: React.FC<PaperProps> = ({ children, sx, ...props }) => {
  const theme = useTheme();
  return (
    <Paper
      elevation={0}
      sx={{
        backgroundColor: theme.palette.background.paper,
        borderRadius: '12px',
        padding: '24px',
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: '0px 2px 4px rgba(0,0,0,0.05)',
        ...sx,
      }}
      {...props}
    >
      {children}
    </Paper>
  );
};