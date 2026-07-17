import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Badge,
  Divider,
  useTheme,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import InfoIcon from '@mui/icons-material/Info';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '../../stores/notificationStore';
import useLanguage from '../../hooks/useLanguage';
import type { NotificationType } from '../../types/types';

function useTimeAgo() {
  const { t } = useLanguage("notifications");
  return (dateString: string): string => {
    const now = Date.now();
    const diff = now - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return t("timeAgo.now");
    if (minutes < 60) return t("timeAgo.minutes", { count: minutes });
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return t("timeAgo.hours", { count: hours });
    const days = Math.floor(hours / 24);
    if (days < 7) return t("timeAgo.days", { count: days });
    return new Date(dateString).toLocaleDateString();
  };
}

function getNotificationIcon(type: NotificationType) {
  const iconProps = { sx: { fontSize: 20 } };
  switch (type) {
    case 'alert':
      return <NotificationsActiveIcon {...iconProps} sx={{ color: '#e74c3c', fontSize: 20 }} />;
    case 'warning':
      return <WarningAmberIcon {...iconProps} sx={{ color: '#f39c12', fontSize: 20 }} />;
    case 'achievement':
      return <EmojiEventsIcon {...iconProps} sx={{ color: '#f1c40f', fontSize: 20 }} />;
    case 'reminder':
      return <CheckCircleIcon {...iconProps} sx={{ color: '#3498db', fontSize: 20 }} />;
    case 'info':
    default:
      return <InfoIcon {...iconProps} sx={{ color: '#2ecc71', fontSize: 20 }} />;
  }
}

export default function NotificationsDropdown() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t } = useLanguage("notifications");
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const ref = useRef<HTMLDivElement>(null);
  const getTimeAgo = useTimeAgo();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  return (
    <Box ref={ref} sx={{ position: 'relative' }}>
      <IconButton onClick={() => setOpen(!open)} sx={{ color: 'text.primary' }}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      {open && (
        <Paper
          elevation={8}
          sx={{
            position: 'absolute',
            top: '100%',
            right: 0,
            mt: 1,
            width: 380,
            maxWidth: '90vw',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2,
            overflow: 'hidden',
            zIndex: 9999,
            bgcolor: 'background.paper',
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box sx={{ position: 'absolute', top: -8, right: 16, zIndex: 1 }}>
            <ArrowDropUpIcon sx={{ fontSize: 24, color: 'background.paper' }} />
          </Box>

          <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
              {t("title")}
            </Typography>
            {unreadCount > 0 && (
              <Typography
                variant="caption"
                onClick={markAllAsRead}
                sx={{ color: 'primary.main', cursor: 'pointer', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}
              >
                {t("markAllAsRead")}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 1, px: 2, pb: 1 }}>
            <Typography
              variant="body2"
              onClick={() => setFilter('all')}
              sx={{
                cursor: 'pointer',
                fontWeight: filter === 'all' ? 700 : 400,
                color: filter === 'all' ? 'primary.main' : 'text.secondary',
                borderBottom: filter === 'all' ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
                pb: 0.5,
              }}
            >
              {t("tabAll")}
            </Typography>
            <Typography
              variant="body2"
              onClick={() => setFilter('unread')}
              sx={{
                cursor: 'pointer',
                fontWeight: filter === 'unread' ? 700 : 400,
                color: filter === 'unread' ? 'primary.main' : 'text.secondary',
                borderBottom: filter === 'unread' ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
                pb: 0.5,
              }}
            >
              {t("tabUnread")}
            </Typography>
          </Box>

          <Divider />

          <Box sx={{ overflowY: 'auto', flex: 1 }}>
            {filtered.length === 0 ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <NotificationsIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  {t("empty")}
                </Typography>
              </Box>
            ) : (
              filtered.map((notif) => (
                <Box
                  key={notif.id}
                  onClick={() => {
                    markAsRead(notif.id);
                    navigate(notif.link);
                    setOpen(false);
                  }}
                  sx={{
                    display: 'flex',
                    gap: 1.5,
                    px: 2,
                    py: 1.5,
                    cursor: 'pointer',
                    bgcolor: notif.read ? 'transparent' : 'action.hover',
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    '&:hover': { bgcolor: 'action.selected' },
                    transition: 'background-color 0.15s',
                  }}
                >
                  <Box sx={{ mt: 0.5, flexShrink: 0 }}>
                    {getNotificationIcon(notif.type)}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: notif.read ? 400 : 600, lineHeight: 1.3 }}>
                      {notif.message}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.25, display: 'block' }}>
                      {getTimeAgo(notif.createdAt)}
                    </Typography>
                  </Box>
                  {!notif.read && (
                    <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />
                    </Box>
                  )}
                </Box>
              ))
            )}
          </Box>

          <Divider />
          <Box
            onClick={() => { setOpen(false); }}
            sx={{ textAlign: 'center', py: 1.5, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
          >
            <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
              {t("seeAll")}
            </Typography>
          </Box>
        </Paper>
      )}
    </Box>
  );
}
