import { Alert, Box, Slide, Typography, useTheme } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import { useUiStore, type ToastSeverity } from '../../stores/uiStore';

const SEVERITY_SX: Record<ToastSeverity, { bgcolor: string; borderColor: string; iconColor: string }> = {
  success: { bgcolor: '#e8f5e9', borderColor: '#4caf50', iconColor: '#2e7d32' },
  info: { bgcolor: '#e3f2fd', borderColor: '#2196f3', iconColor: '#1565c0' },
  warning: { bgcolor: '#fff8e1', borderColor: '#ff9800', iconColor: '#e65100' },
  error: { bgcolor: '#fdecea', borderColor: '#f44336', iconColor: '#b71c1c' },
  critical: { bgcolor: '#8e0000', borderColor: '#ff5252', iconColor: '#ffffff' },
};

function SeverityIcon({ severity }: { severity: ToastSeverity }) {
  const color = SEVERITY_SX[severity].iconColor;
  switch (severity) {
    case 'success':
      return <CheckCircleIcon sx={{ color }} />;
    case 'warning':
      return <WarningIcon sx={{ color }} />;
    case 'critical':
    case 'error':
      return <ErrorIcon sx={{ color }} />;
    default:
      return <InfoIcon sx={{ color }} />;
  }
}

export default function ToastProvider() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const toasts = useUiStore((s) => s.toasts);
  const dismissToast = useUiStore((s) => s.dismissToast);

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        width: { xs: 'calc(100% - 32px)', sm: 420 },
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => {
        const styles = SEVERITY_SX[toast.severity];
        const isCritical = toast.severity === 'critical';

        return (
          <Slide key={toast.id} direction="up" in mountOnEnter unmountOnExit timeout={{ enter: 250, exit: 200 }}>
            <Alert
              severity={toast.severity === 'critical' ? 'error' : toast.severity}
              icon={<SeverityIcon severity={toast.severity} />}
              onClose={() => dismissToast(toast.id)}
              sx={{
                pointerEvents: 'auto',
                boxShadow: 8,
                border: `2px solid ${styles.borderColor}`,
                borderLeft: `6px solid ${styles.borderColor}`,
                borderRadius: 2,
                fontWeight: 500,
                bgcolor: styles.bgcolor,
                color: isCritical ? '#ffffff' : isDark ? '#1a1a1a' : 'text.primary',
                '& .MuiAlert-icon': {
                  alignItems: 'center',
                  fontSize: 24,
                  color: isCritical ? '#ffffff' : styles.iconColor,
                },
                '& .MuiAlert-action': {
                  color: isCritical ? '#ffffff' : isDark ? '#1a1a1a' : 'inherit',
                },
                animation: 'toast-slide-in 0.25s ease-out',
                '@keyframes toast-slide-in': {
                  from: { opacity: 0, transform: 'translateY(12px)' },
                  to: { opacity: 1, transform: 'translateY(0)' },
                },
              }}
            >
              {toast.title && (
                <Typography variant="subtitle2" component="div" sx={{ fontWeight: 700 }}>
                  {toast.title}
                </Typography>
              )}
              <Typography variant="body2">{toast.message}</Typography>
            </Alert>
          </Slide>
        );
      })}
    </Box>
  );
}