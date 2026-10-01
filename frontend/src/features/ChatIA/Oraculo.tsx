import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Avatar,
  Badge,
  Box,
  Drawer,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import HistoryIcon from '@mui/icons-material/History';
import MenuIcon from '@mui/icons-material/Menu';
import MicIcon from '@mui/icons-material/Mic';
import ScheduleIcon from '@mui/icons-material/Schedule';
import SearchIcon from '@mui/icons-material/Search';
import SendIcon from '@mui/icons-material/Send';
import SettingsIcon from '@mui/icons-material/Settings';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { usePreferenceConfig } from '../../hooks/usePreferenceConfig';
import { AVATAR_MAP } from '../../constants/avatars';
import { Logo } from '../../components/ui/Logo';

interface ChatMessage {
  id: number;
  author: 'user' | 'oracle';
  text: string;
  time: string;
}

const HISTORY_ITEMS = [
  '¿Qué puedo desayunar?',
  'Mi energía esta bajita',
  'Recordatorio de poción',
  '¿Cuánta insulina hoy?',
  'Zona Sagrada alcanzada',
  'Mensaje de motivación',
  '¿Puedo comer dulces?',
  'Resumen de hoy',
];

const SUGGESTIONS = [
  { text: '¿Cómo está mi energía?', icon: '⚡' },
  { text: 'Me siento cansado', icon: '🥱' },
  { text: '¿Qué puedo comer?', icon: '🍎' },
];

const ORACLE_REPLIES = [
  '¡Buenas noticias! Tu energía se mantiene dentro de la Zona Sagrada. ¡Sigue así, pequeño héroe! 💙',
  'Una manzana dorada 🍎 y un vaso de agua serán perfectos para mantener tu energía estable.',
  'Tu última lectura fue muy estable. ¡Estás listo para la aventura de hoy! 🛡️',
  'Recuerda registrar tu poción al mediodía para que el Oráculo pueda ayudarte mejor. ⚗️',
];

const USER_GRADIENT = 'linear-gradient(135deg, #3d586c 0%, #558eb9 100%)';
const ORACLE_GRADIENT = 'linear-gradient(135deg, #95bfdf 0%, #7aafd7 100%)';
const SIDEBAR_GRADIENT = 'linear-gradient(180deg, #2a475e 0%, #3d586c 60%, #46779c 100%)';

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatIA() {
  const theme = useTheme();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { preference } = usePreferenceConfig();
  const isDark = theme.palette.mode === 'dark';

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const sidebarText = '#ffffff';

  const avatarSrc =
    preference?.profileImg && AVATAR_MAP[preference.profileImg]
      ? AVATAR_MAP[preference.profileImg]
      : undefined;

  const userInitials = user?.username
    ? user.username
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
    : '?';

  const filteredHistory = useMemo(
    () =>
      HISTORY_ITEMS.filter((item) =>
        item.toLowerCase().includes(search.trim().toLowerCase()),
      ),
    [search],
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, thinking]);

  const sendMessage = (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || thinking) return;

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), author: 'user', text: content, time: formatTime(new Date()) },
    ]);
    setInput('');
    setThinking(true);

    setTimeout(() => {
      const reply = ORACLE_REPLIES[Math.floor(Math.random() * ORACLE_REPLIES.length)];
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, author: 'oracle', text: reply, time: formatTime(new Date()) },
      ]);
      setThinking(false);
    }, 1100);
  };

  const newChat = () => {
    setMessages([]);
    setSearch('');
    setDrawerOpen(false);
    setInput('');
  };

  const oracleAvatar = (
    <Box
      sx={{
        width: 38,
        height: 38,
        borderRadius: '50%',
        background: ORACLE_GRADIENT,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 10px rgba(70, 119, 156, 0.35)',
        flexShrink: 0,
      }}
    >
      <AutoAwesomeIcon sx={{ fontSize: 20, color: '#fff' }} />
    </Box>
  );

  const sidebarContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: SIDEBAR_GRADIENT,
        p: 2.5,
      }}
    >
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Logo />
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography sx={{ color: sidebarText, fontWeight: 700, fontSize: '1.05rem', lineHeight: 1.2 }}>
                SugarCheck
              </Typography>
              <Typography sx={{ color: alpha(sidebarText, 0.7), fontSize: '0.7rem' }}>
                Gran Oráculo
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={() => navigate('/')}
            aria-label="regresar"
            sx={{ color: sidebarText }}
          >
            <ArrowBackIcon />
          </IconButton>
        </Box>

        <IconButton
          onClick={newChat}
          sx={{
            width: '100%',
            py: 1.25,
            borderRadius: '14px',
            backgroundColor: '#ffffff',
            color: '#3d586c',
            fontWeight: 700,
            gap: 1,
            mb: 2.5,
            '&:hover': { backgroundColor: alpha('#ffffff', 0.92) },
          }}
        >
          <AddIcon fontSize="small" />
          Nueva consulta
        </IconButton>

        <TextField
          fullWidth
          placeholder="Buscar en el historial"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon sx={{ color: alpha(sidebarText, 0.7), fontSize: 20 }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            mb: 2.5,
            '& .MuiOutlinedInput-root': {
              backgroundColor: alpha('#ffffff', 0.14),
              borderRadius: '14px',
              backdropFilter: 'blur(8px)',
              '& fieldset': { border: 'none' },
            },
            '& .MuiInputBase-input': {
              color: sidebarText,
              fontSize: '0.85rem',
              '&::placeholder': { color: alpha(sidebarText, 0.6), opacity: 1 },
            },
          }}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography sx={{ color: sidebarText, fontWeight: 700, fontSize: '0.95rem' }}>
            Recientes
          </Typography>
          <ScheduleIcon sx={{ color: alpha(sidebarText, 0.7), fontSize: 18 }} />
        </Box>

        <Box
          sx={{
            maxHeight: 'calc(100vh - 330px)',
            overflowY: 'auto',
            '&::-webkit-scrollbar': { width: 4 },
            '&::-webkit-scrollbar-thumb': { backgroundColor: alpha('#ffffff', 0.25), borderRadius: 4 },
          }}
        >
          {filteredHistory.length === 0 ? (
            <Typography sx={{ color: alpha(sidebarText, 0.6), fontSize: '0.8rem', py: 2, textAlign: 'center' }}>
              Sin conversaciones
            </Typography>
          ) : (
            filteredHistory.map((item, index) => (
              <Box
                key={`${item}-${index}`}
                onClick={() => sendMessage(item)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: '10px 14px',
                  mb: 1,
                  borderRadius: '14px',
                  backgroundColor: alpha('#ffffff', 0.1),
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                  '&:hover': { backgroundColor: alpha('#ffffff', 0.2) },
                }}
              >
                <HistoryIcon sx={{ color: alpha(sidebarText, 0.7), fontSize: 18 }} />
                <Typography sx={{ color: sidebarText, fontSize: '0.85rem', flex: 1 }}>{item}</Typography>
              </Box>
            ))
          )}
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          pt: 2,
          borderTop: `1px solid ${alpha(sidebarText, 0.18)}`,
        }}
        onClick={() => navigate('/perfil')}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SettingsIcon sx={{ color: sidebarText, fontSize: 20 }} />
          <Typography sx={{ color: sidebarText, fontWeight: 600, fontSize: '0.9rem' }}>Ajustes</Typography>
        </Box>
        <Avatar
          alt="User"
          src={avatarSrc}
          sx={{ width: 32, height: 32, bgcolor: '#ffb300', fontSize: '0.8rem' }}
        >
          {userInitials}
        </Avatar>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh', width: '100%', bgcolor: theme.palette.background.default }}>
      <Box
        sx={{
          width: 300,
          flexShrink: 0,
          display: { xs: 'none', md: 'block' },
        }}
      >
        {sidebarContent}
      </Box>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{ display: { xs: 'block', md: 'none' } }}
        slotProps={{
          paper: {
            sx: { width: 300 },
          },
        }}
      >
        {sidebarContent}
      </Drawer>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          position: 'relative',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: { xs: 2, sm: 4 },
            py: 1.5,
            borderBottom: `1px solid ${theme.palette.divider}`,
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(10px)',
          }}
        >
          <IconButton
            onClick={() => setDrawerOpen(true)}
            sx={{ display: { xs: 'inline-flex', md: 'none' }, color: theme.palette.text.primary }}
          >
            <MenuIcon />
          </IconButton>

          {oracleAvatar}

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Typography sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                Oráculo Azul
              </Typography>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: '#4caf50',
                  boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
                }}
              />
            </Box>
            <Typography
              variant="caption"
              sx={{ color: theme.palette.text.secondary, fontSize: '0.75rem' }}
            >
              Tu asistente inteligente está listo
            </Typography>
          </Box>

          <IconButton
            onClick={newChat}
            sx={{
              display: { xs: 'inline-flex', sm: 'none' },
              color: theme.palette.primary.main,
            }}
            aria-label="nueva consulta"
          >
            <AddIcon />
          </IconButton>

          <Box
            onClick={newChat}
            sx={{
              display: { xs: 'none', sm: 'flex' },
              alignItems: 'center',
              gap: 0.75,
              px: 2,
              py: 1,
              borderRadius: '12px',
              backgroundColor: alpha(theme.palette.primary.main, 0.12),
              color: theme.palette.primary.main,
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.2) },
            }}
          >
            <AddIcon fontSize="small" />
            Nueva consulta
          </Box>

          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <Box
                sx={{
                  width: 11,
                  height: 11,
                  bgcolor: '#4caf50',
                  borderRadius: '50%',
                  border: `2px solid ${theme.palette.background.paper}`,
                }}
              />
            }
          >
            <Avatar
              alt="User"
              src={avatarSrc}
              onClick={() => navigate('/perfil')}
              sx={{ width: 38, height: 38, bgcolor: '#ffb300', fontSize: '0.85rem', cursor: 'pointer' }}
            >
              {userInitials}
            </Avatar>
          </Badge>
        </Box>

        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            px: { xs: 2, sm: 4 },
            py: 3,
            '&::-webkit-scrollbar': { width: 6 },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: theme.palette.divider,
              borderRadius: 3,
            },
          }}
        >
          <Box sx={{ maxWidth: 820, width: '100%', mx: 'auto' }}>
            {messages.length === 0 && !thinking ? (
              <Box
                sx={{
                  minHeight: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  py: 8,
                }}
              >
                <Box
                  sx={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    background: ORACLE_GRADIENT,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 24px rgba(70, 119, 156, 0.35)',
                    mb: 2.5,
                  }}
                >
                  <AutoAwesomeIcon sx={{ fontSize: 36, color: '#fff' }} />
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: '1.4rem', color: theme.palette.text.primary }}>
                  El Gran Oráculo
                </Typography>
                <Typography
                  sx={{ color: theme.palette.text.secondary, maxWidth: 420, mt: 1, lineHeight: 1.6 }}
                >
                  Pregúntame sobre tu energía, qué comer o recibe un mensaje de motivación para tu aventura.
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1.5, mt: 3 }}>
                  {SUGGESTIONS.map((suggestion) => (
                    <Box
                      key={suggestion.text}
                      onClick={() => sendMessage(suggestion.text)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 2,
                        py: 1,
                        borderRadius: '999px',
                        backgroundColor: alpha(theme.palette.primary.main, 0.12),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                        color: theme.palette.text.primary,
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.22),
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      <span>{suggestion.icon}</span>
                      {suggestion.text}
                    </Box>
                  ))}
                </Box>
              </Box>
            ) : (
              <>
                {messages.map((message) => {
                  const isUser = message.author === 'user';
                  return (
                    <Box
                      key={message.id}
                      sx={{
                        display: 'flex',
                        justifyContent: isUser ? 'flex-end' : 'flex-start',
                        mb: 2.5,
                        gap: 1,
                      }}
                    >
                      {!isUser && oracleAvatar}
                      <Box
                        sx={{
                          maxWidth: { xs: '78%', sm: '70%' },
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isUser ? 'flex-end' : 'flex-start',
                        }}
                      >
                        <Box
                          sx={{
                            px: 2,
                            py: 1.4,
                            borderRadius: isUser
                              ? '18px 18px 4px 18px'
                              : '18px 18px 18px 4px',
                            background: isUser
                              ? USER_GRADIENT
                              : isDark
                                ? alpha(theme.palette.primary.main, 0.18)
                                : '#eaf3fb',
                            border: isUser ? 'none' : `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                          }}
                        >
                          <Typography
                            sx={{
                              color: isUser
                                ? '#ffffff'
                                : isDark
                                  ? '#dcebf5'
                                  : '#334155',
                              fontSize: '0.92rem',
                              whiteSpace: 'pre-line',
                              lineHeight: 1.5,
                            }}
                          >
                            {message.text}
                          </Typography>
                        </Box>
                        <Typography
                          variant="caption"
                          sx={{ color: theme.palette.text.disabled, mt: 0.5, fontSize: '0.68rem' }}
                        >
                          {isUser ? 'Tú' : 'Oráculo'} · {message.time}
                        </Typography>
                      </Box>
                      {isUser && (
                        <Avatar
                          alt="User"
                          src={avatarSrc}
                          sx={{ width: 34, height: 34, bgcolor: '#ffb300', fontSize: '0.8rem', flexShrink: 0 }}
                        >
                          {userInitials}
                        </Avatar>
                      )}
                    </Box>
                  );
                })}

                {thinking && (
                  <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, mb: 2 }}>
                    {oracleAvatar}
                    <Box
                      sx={{
                        px: 2.5,
                        py: 1.5,
                        borderRadius: '18px 18px 18px 4px',
                        backgroundColor: isDark
                          ? alpha(theme.palette.primary.main, 0.18)
                          : '#eaf3fb',
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
                        display: 'flex',
                        gap: 0.6,
                      }}
                    >
                      {[0, 1, 2].map((dot) => (
                        <Box
                          key={dot}
                          sx={{
                            width: 7,
                            height: 7,
                            borderRadius: '50%',
                            backgroundColor: theme.palette.primary.main,
                            animation: `pulse 1.2s ease-in-out ${dot * 0.2}s infinite`,
                            '@keyframes pulse': {
                              '0%, 100%': { opacity: 0.3 },
                              '50%': { opacity: 1 },
                            },
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </>
            )}

            <Box ref={bottomRef} />
          </Box>
        </Box>

        <Box
          sx={{
            px: { xs: 2, sm: 4 },
            pb: 3,
            pt: 1,
            background: theme.palette.background.default,
          }}
        >
          <Paper
            elevation={2}
            sx={{
              maxWidth: 820,
              width: '100%',
              mx: 'auto',
              borderRadius: '28px',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              py: 0.75,
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.08)',
            }}
          >
            <TextField
              fullWidth
              multiline
              maxRows={3}
              placeholder="Escribe tu consulta al Oráculo..."
              variant="standard"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              slotProps={{
                input: {
                  disableUnderline: true,
                  sx: {
                    fontSize: '0.92rem',
                    px: 1,
                    color: theme.palette.text.primary,
                    '&::placeholder': { color: theme.palette.text.disabled, opacity: 1 },
                  },
                },
              }}
            />
            <IconButton
              sx={{ color: theme.palette.text.secondary }}
              aria-label="grabar mensaje"
              onClick={() => sendMessage('🎤 (mensaje de voz)')}
            >
              <MicIcon fontSize="small" />
            </IconButton>
            <IconButton
              onClick={() => sendMessage()}
              disabled={!input.trim() || thinking}
              aria-label="enviar"
              sx={{
                width: 44,
                height: 44,
                background: USER_GRADIENT,
                color: '#fff',
                borderRadius: '50%',
                boxShadow: '0 4px 12px rgba(43, 78, 108, 0.35)',
                '&:hover': { background: 'linear-gradient(135deg, #385f7d 0%, #46779c 100%)' },
                '&:disabled': { backgroundColor: theme.palette.action.disabledBackground, color: theme.palette.action.disabled, boxShadow: 'none' },
              }}
            >
              <SendIcon fontSize="small" />
            </IconButton>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}