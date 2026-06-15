import React from 'react';
import { Paper, PaperProps, styled } from '@mui/material';

const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: '#FFFFFF',
  borderRadius: '16px',
  boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.04)',
  padding: theme.spacing(3),
  border: '1px solid rgba(0, 0, 0, 0.02)',
  height: '100%',
}));

interface CardProps extends PaperProps {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, ...props }) => {
  return <StyledPaper elevation={0} {...props}>{children}</StyledPaper>;
};