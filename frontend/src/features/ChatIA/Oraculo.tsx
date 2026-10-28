import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Avatar,
  Badge,
  Box,
  CircularProgress,
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
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import HistoryIcon from '@mui/icons-material/History';
import MenuIcon from '@mui/icons-material/Menu';
import ScheduleIcon from '@mui/icons-material/Schedule';
import SearchIcon from '@mui/icons-material/Search';
import SendIcon from '@mui/icons-material/Send';
import SettingsIcon from '@mui/icons-material/Settings';
import StopIcon from '@mui/icons-material/Stop';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { usePreferenceConfig } from '../../hooks/usePreferenceConfig';
import { AVATAR_MAP } from '../../constants/avatars';
import i18n from '../../stores/i18n';
import { Logo } from '../../components/ui/Logo';
import { useOraculoChat } from '../../hooks/useOraculoChat';
import type { OraculoMessage } from '../../apis/oraculo';

const SUGGESTIONS = [
  { text: '¿Cómo está mi energía?', icon: '⚡' },
  { text: 'Me siento cansado', icon: '🥱' },
  { text: '¿Qué puedo comer?', icon: '🍎' },
];

const USER_GRADIENT = 'linear-gradient(135deg, #3d586c 0%, #558eb9 100%)';
const ORACLE_GRADIENT = 'linear-gradient(135deg, #95bfdf 0%, #7aafd7 100%)';
const SIDEBAR_GRADIENT = 'linear-gradient(180deg, #2a475e 0%, #3d586c 60%, #46779c 100%)';

/** Id de la burbuja que se está escribiendo en vivo. */
const STREAMING_ID = '__streaming__';

function formatTime(date: Date, locale: string) {
  return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
}

export default function ChatIA() {
  const theme = useTheme();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { preference } = usePreferenceConfig();
  const isDark = theme.palette.mode === 'dark';

  const {
    conversations,
    activeConversationId,
    messages,
    loadingConversations,
    sending,
    error,
    selectConversation,
    startNewConversation,
    sendMessage,
    stopGenerating,
    deleteConversation,
  } = useOraculoChat();

  // `formatTime` sin locale usaba el del navegador, que no siempre es el
  // idioma que eligió el usuario en la app.
  const locale = i18n.language || 'es';

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [input, setInput] = useState('');

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
      conversations.filter((item) =>
        item.title.toLowerCase().includes(search.trim().toLowerCase()),
      ),
    [conversations, search],
  );

  // El scroll sigue a los trozos que van llegando, no solo al cambiar la lista.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, sending]);

  const handleSend = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || sending) return;
    setInput('');
    await sendMessage(content);
  };

  // Mientras el modelo escribe, la burbuja del asistente ya existe: se muestra
  // un cursor parpadeante en vez de los tres puntitos de "pensando".
  const isStreaming = (message: OraculoMessage) => message.id === STREAMING_ID;

  const handleNewChat = async () => {
    setSearch('');
    setDrawerOpen(false);
    setInput('');
    await startNewConversation();
  };

  const handleSelectConversation = async (id: string) => {
    setDrawerOpen(false);
    await selectConversation(id);
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
          onClick={handleNewChat}
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
          {loadingConversations ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={22} sx={{ color: sidebarText }} />
            </Box>
          ) : filteredHistory.length === 0 ? (
            <Typography sx={{ color: alpha(sidebarText, 0.6), fontSize: '0.8rem', py: 2, textAlign: 'center' }}>
              Sin conversaciones
            </Typography>
          ) : (
            filteredHistory.map((item) => (
              <Box
                key={item.id}
                onClick={() => handleSelectConversation(item.id)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: '10px 14px',
                  mb: 1,
                  borderRadius: '14px',
                  backgroundColor:
                    activeConversationId === item.id
                      ? alpha('#ffffff', 0.24)
                      : alpha('#ffffff', 0.1),
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                  '&:hover': { backgroundColor: alpha('#ffffff', 0.2) },
                }}
              >
                <HistoryIcon sx={{ color: alpha(sidebarText, 0.7), fontSize: 18 }} />
                <Typography
                  sx={{
                    color: sidebarText,
                    fontSize: '0.85rem',
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.title}
                </Typography>
                <IconButton
                  size="small"
                  aria-label="eliminar conversación"
                  sx={{ color: alpha(sidebarText, 0.6) }}
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(item.id);
                  }}
                >
                  <DeleteOutlineIcon sx={{ fontSize: 17 }} />
                </IconButton>
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

          <Box
            onClick={handleNewChat}
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
            {messages.length === 0 && !sending ? (
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

                {error && (
                  <Typography sx={{ color: theme.palette.error.main, mt: 2, fontSize: '0.85rem' }}>
                    {error}
                  </Typography>
                )}

                <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1.5, mt: 3 }}>
                  {SUGGESTIONS.map((suggestion) => (
                    <Box
                      key={suggestion.text}
                      onClick={() => handleSend(suggestion.text)}
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
                {error && (
                  <Typography sx={{ color: theme.palette.error.main, mb: 2, fontSize: '0.85rem', textAlign: 'center' }}>
                    {error}
                  </Typography>
                )}

                {messages.map((message: OraculoMessage) => {
                  const isUser = message.role === 'user';
                  const streaming = isStreaming(message);
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
                            {message.content}
                            {streaming && (
                              <Box
                                component="span"
                                sx={{
                                  display: 'inline-block',
                                  width: 2,
                                  height: '1em',
                                  ml: 0.4,
                                  verticalAlign: 'text-bottom',
                                  backgroundColor: theme.palette.primary.main,
                                  animation: 'caret 1s step-end infinite',
                                  '@keyframes caret': {
                                    '0%, 100%': { opacity: 1 },
                                    '50%': { opacity: 0 },
                                  },
                                }}
                              />
                            )}
                          </Typography>
                        </Box>
                        {!streaming && (
                          <Typography
                            variant="caption"
                            sx={{ color: theme.palette.text.disabled, mt: 0.5, fontSize: '0.68rem' }}
                          >
                            {isUser ? 'Tú' : 'Oráculo'} ·{' '}
                            {formatTime(new Date(message.createdAt), locale)}
                          </Typography>
                        )}
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

                {sending && !messages.some((m) => isStreaming(m)) && (
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
                  handleSend();
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
            {sending ? (
              <IconButton
                onClick={stopGenerating}
                aria-label="detener respuesta"
                sx={{
                  width: 44,
                  height: 44,
                  background: 'linear-gradient(135deg, #c25b5b 0%, #d97777 100%)',
                  color: '#fff',
                  borderRadius: '50%',
                  boxShadow: '0 4px 12px rgba(160, 70, 70, 0.35)',
                  '&:hover': { background: 'linear-gradient(135deg, #b34e4e 0%, #c96a6a 100%)' },
                }}
              >
                <StopIcon fontSize="small" />
              </IconButton>
            ) : (
              <IconButton
                onClick={() => handleSend()}
                disabled={!input.trim()}
                aria-label="enviar"
                sx={{
                  width: 44,
                  height: 44,
                  background: USER_GRADIENT,
                  color: '#fff',
                  borderRadius: '50%',
                  boxShadow: '0 4px 12px rgba(43, 78, 108, 0.35)',
                  '&:hover': { background: 'linear-gradient(135deg, #385f7d 0%, #46779c 100%)' },
                  '&.Mui-disabled': {
                    backgroundColor: theme.palette.action.disabledBackground,
                    color: theme.palette.action.disabled,
                    boxShadow: 'none',
                  },
                }}
              >
                <SendIcon fontSize="small" />
              </IconButton>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
