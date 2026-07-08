import React from 'react';
import { Paper, type PaperProps } from '@mui/material';

export const CardBase: React.FC<PaperProps> = ({ children, sx, ...props }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        backgroundColor: '#DCE4EC', // Color grisáceo/azulado de las tarjetas
        borderRadius: '12px',
        padding: '24px',
        border: '1px solid #CCD5DE',
        boxShadow: '0px 2px 4px rgba(0,0,0,0.05)',
        ...sx, // Permite sobrescribir estilos si es necesario
      }}
      {...props}
    >
      {children}
    </Paper>
  );
};