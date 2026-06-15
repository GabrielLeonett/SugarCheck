import React from 'react';
import { Dialog, DialogContent, Backdrop, styled } from '@mui/material';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const StyledDialog = styled(Dialog)(() => ({
  '& .MuiPaper-root': {
    borderRadius: '20px',
    padding: '12px',
    backgroundColor: '#EBF2F7',
    maxWidth: '450px',
    width: '100%',
    boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.1)',
  },
}));

export const Modal: React.FC<ModalProps> = ({ open, onClose, children }) => {
  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 500,
          style: { backgroundColor: 'rgba(44, 62, 80, 0.6)' }
        },
      }}
    >
      <DialogContent>{children}</DialogContent>
    </StyledDialog>
  );
};