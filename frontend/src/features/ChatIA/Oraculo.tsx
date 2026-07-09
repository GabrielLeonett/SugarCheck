import { Box, IconButton, Typography, Paper, TextField, InputAdornment, Avatar, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import ScheduleIcon from '@mui/icons-material/Schedule';
import SettingsIcon from '@mui/icons-material/Settings';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import MicIcon from '@mui/icons-material/Mic';
import SendIcon from '@mui/icons-material/Send';
import { useNavigate } from 'react-router-dom';

export default function ChatIA() {
  const theme = useTheme();
  const navigate = useNavigate();
  const sidebarTextColor = theme.palette.getContrastText(theme.palette.primary.main);

  const historyItems = [
    'Historial 1',
    'Historial 2',
    'Historial 3',
    'Historial 4',
    'Historial 5',
    'Historial 6',
    'Historial 7',
    'Historial 8',
    'Historial 9',
  ];

  const suggestions = [
    { text: '¿Cómo está mi energía?', icon: '🔋' },
    { text: '"Me siento cansado!"', icon: '🤕' },
    { text: '"¿Qué puedo comer ahora?"', icon: '🍎' },
  ];

  return (
    <Box sx={{ display: 'flex', width: '100vw', height: '100vh' }}>

      {/* --- SIDEBAR --- */}
      <Box sx={{
        width: '280px',
        backgroundColor: theme.palette.primary.main,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <IconButton onClick={() => navigate('/')} aria-label="regresar" sx={{ color: sidebarTextColor }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="body1" sx={{ color: sidebarTextColor, ml: 1, fontWeight: 'bold' }}>Atrás</Typography>
          </Box>

          <TextField
            fullWidth
            placeholder="Buscar"
            variant="outlined"
            size="small"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon sx={{ color: sidebarTextColor }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ 
              mb: 3,
              '& .MuiOutlinedInput-root': {
                backgroundColor: alpha(theme.palette.common.white, 0.15),
                borderRadius: '20px',
                '& fieldset': { border: 'none' },
              },
              '& .MuiInputBase-input': {
                color: sidebarTextColor,
                '&::placeholder': { color: alpha(sidebarTextColor, 0.6), opacity: 1 },
              }
            }}
          />

          <Paper
            elevation={0}
            sx={{
              width: '100%',
              backgroundColor: alpha(theme.palette.common.white, 0.08),
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              padding: 2,
              maxHeight: 'calc(100vh - 250px)',
              overflowY: 'auto',
              border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', color: sidebarTextColor, fontSize: '1rem' }}>
                Recientes
              </Typography>
              <ScheduleIcon sx={{ color: sidebarTextColor, opacity: 0.7 }} />
            </Box>

            <Box sx={{ '& > *': { mb: 1.5 } }}>
              {historyItems.map((item, index) => (
                <Paper
                  key={index}
                  elevation={0}
                  sx={{
                    backgroundColor: alpha(theme.palette.common.white, 0.1),
                    borderRadius: '20px',
                    padding: '10px 15px',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    '&:last-child': { mb: 0 },
                    '&:hover': { backgroundColor: alpha(theme.palette.common.white, 0.2) }
                  }}
                >
                  <Typography variant="body2" sx={{ fontSize: '0.9rem', color: sidebarTextColor }}>{item}</Typography>
                </Paper>
              ))}
            </Box>
          </Paper>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', pt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SettingsIcon sx={{ color: sidebarTextColor, mr: 1 }} />
            <Typography variant="body1" sx={{ color: sidebarTextColor, fontWeight: 'bold' }}>Ajustes</Typography>
          </Box>
        </Box>
      </Box>


      {/* --- CHAT AREA --- */}
      <Box sx={{
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        position: 'relative'
      }}>
        {/* Encabezado */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, px: 2 }}>
          <Box sx={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#4caf50', mr: 2, display: 'inline-block' }}></Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.primary.main, flexGrow: 1 }}>
            Gluco
          </Typography>
          <Avatar sx={{ width: 40, height: 40, bgcolor: '#ffb300' }}>👤</Avatar>
        </Box>

        {/* Mensajes + Sugerencias + Input (scrollable) */}
        <Box sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          px: 2,
          overflowY: 'auto',
          minHeight: 0,
        }}>
          {/* Mensaje del usuario */}
          <Box sx={{ alignSelf: 'flex-start', mb: 1 }}>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, ml: 1, mb: 0.5, display: 'block', fontWeight: 600 }}>
              Tú
            </Typography>
            <Box sx={{
              width: 'fit-content',
              maxWidth: '75%',
              backgroundColor: theme.palette.primary.dark,
              color: theme.palette.getContrastText(theme.palette.primary.dark),
              borderRadius: '16px 16px 16px 4px',
              padding: 2,
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
            }}>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line', fontSize: '0.95rem' }}>
                Worem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a, mattis tellus. Sed dignissim, metus nec fringilla accumsan, risus sem sollicitudin lacus, ut interdum tellus elit sed risus. Maecenas eget condimentum velit, sit amet feugiat lectus.
              </Typography>
            </Box>
          </Box>

          {/* Mensaje del Oráculo */}
          <Box sx={{ alignSelf: 'flex-end', mb: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mr: 1, mb: 0.5, fontWeight: 600 }}>
              Oráculo
            </Typography>
            <Box sx={{
              width: 'fit-content',
              maxWidth: '75%',
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.getContrastText(theme.palette.primary.main),
              borderRadius: '16px 16px 4px 16px',
              padding: 2,
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
            }}>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line', fontSize: '0.95rem' }}>
                Worem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a, mattis tellus. Sed dignissim, metus nec fringilla accumsan, risus sem sollicitudin lacus, ut interdum tellus elit sed risus. Maecenas eget condimentum velit, sit amet feugiat lectus.
              </Typography>
            </Box>
          </Box>

          {/* Sugerencias */}
          <Box sx={{ mt: 4, mb: 2 }}>
            <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 'bold', mb: 1.5, fontSize: '1rem', textAlign: 'center' }}>
              Sugerencias Rápidas
            </Typography>
            {suggestions.map((suggestion, index) => (
              <Paper
                key={index}
                elevation={0}
                sx={{
                  backgroundColor: theme.palette.action.hover,
                  borderRadius: '16px',
                  padding: '10px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  justifyContent: 'center',
                  mb: 1,
                  border: `1px solid ${theme.palette.divider}`,
                  '&:last-child': { mb: 0 },
                  '&:hover': { backgroundColor: theme.palette.action.selected }
                }}
              >
                <Typography variant="body1" sx={{ color: theme.palette.text.primary, mr: 1, fontSize: '0.9rem' }}>
                  {suggestion.text}
                </Typography>
                <Typography variant="body1">{suggestion.icon}</Typography>
              </Paper>
            ))}
          </Box>
        </Box>

        {/* Input de Chat (fijo abajo) */}
        <Box sx={{ px: 2, mt: 2 }}>
          <TextField
            fullWidth
            placeholder="Escribe tu consulta al Oráculo..."
            variant="outlined"
            size="small"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton sx={{ color: theme.palette.action.active }}><PhotoCameraIcon fontSize="small" /></IconButton>
                    <IconButton sx={{ color: theme.palette.action.active }}><MicIcon fontSize="small" /></IconButton>
                    <IconButton sx={{ color: theme.palette.action.active }}><SendIcon fontSize="small" /></IconButton>
                  </InputAdornment>
                ),
              },
            }}
            sx={{ 
              '& .MuiOutlinedInput-root': {
                backgroundColor: theme.palette.action.hover,
                borderRadius: '24px',
                border: `1px solid ${theme.palette.divider}`,
                '& fieldset': { border: 'none' },
              },
              '& .MuiInputBase-input': {
                color: theme.palette.text.primary,
              }
            }}
          />
        </Box>

      </Box>
    </Box>
  );
}