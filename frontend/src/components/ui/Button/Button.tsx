import React from 'react';
import { Button as MuiButton, type ButtonProps as MuiButtonProps, styled } from '@mui/material';

type ButtonVariant = 'primary' | 'secondary' | 'dark';

interface ButtonProps extends Omit<MuiButtonProps, 'variant'> {
  variant?: ButtonVariant;
}

const StyledButton = styled(MuiButton, {
  shouldForwardProp: (prop) => prop !== 'customVariant',
})<{ customVariant: ButtonVariant }>(({ customVariant }) => {
  if (customVariant === 'dark') {
    return {
      backgroundColor: '#2C3E50',
      color: '#FFFFFF',
      borderRadius: '8px',
      padding: '12px 24px',
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '1rem',
      '&:hover': {
        backgroundColor: '#1A252F',
      },
    };
  }
  if (customVariant === 'secondary') {
    return {
      backgroundColor: 'transparent',
      color: '#4A90E2',
      border: '1px solid #4A90E2',
      borderRadius: '8px',
      padding: '10px 20px',
      textTransform: 'none',
      fontWeight: 600,
      '&:hover': {
        backgroundColor: 'rgba(74, 144, 226, 0.08)',
      },
    };
  }
  // Primary (Azul del modal)
  return {
    backgroundColor: '#5D9CEC',
    color: '#FFFFFF',
    borderRadius: '8px',
    padding: '10px 24px',
    textTransform: 'none',
    fontWeight: 600,
    '&:hover': {
      backgroundColor: '#4A90E2',
    },
  };
});

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, ...props }) => {
  return (
    <StyledButton customVariant={variant} {...props}>
      {children}
    </StyledButton>
  );
};