import { Box, IconButton, Typography, Paper, TextField, InputAdornment, Avatar } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import ScheduleIcon from '@mui/icons-material/Schedule';
import SettingsIcon from '@mui/icons-material/Settings';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import MicIcon from '@mui/icons-material/Mic';
import SendIcon from '@mui/icons-material/Send';

export default function ChatIA() {
  // Mock data for chat history items
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

  // Quick suggestions based on the image
  const suggestions = [
    { text: '¿Cómo está mi energía?', icon: '🔋' },
    { text: '"Me siento cansado!"', icon: '🤕' },
    { text: '"¿Qué puedo comer ahora?"', icon: '🍎' },
  ];

  const sidebarBg = '#9cc2e5';
  const chatBg = '#eef5fc';
  const darkerText = '#333';
  const sidebarWidth = '280px';
  const chatBubbleRadius = '16px';
  const sidebarItemRadius = '20px';

  return (
    <Box sx={{ display: 'flex', width: '100vw', height: '100vh', fontFamily: 'Arial, sans-serif' }}>

      {/* --- SIDEBAR: Historial del chat --- */}
      <Box sx={{
        width: sidebarWidth,
        backgroundColor: sidebarBg,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <IconButton onClick={() => console.log('Volver')} aria-label="regresar" sx={{ color: darkerText }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="body1" sx={{ color: darkerText, ml: 1, fontWeight: 'bold' }}>Atrás</Typography>
          </Box>

          {/* Buscador */}
          <TextField
            fullWidth
            placeholder="Buscar"
            variant="outlined"
            size="small"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ 
              mb: 3,
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                borderRadius: sidebarItemRadius,
                '& fieldset': { border: 'none' },
              },
              '& .MuiInputBase-input': {
                color: darkerText,
              }
            }}
          />

          {/* Contenedor del Historial */}
          <Paper
            elevation={0}
            sx={{
              width: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.4)',
              backdropFilter: 'blur(10px)',
              borderRadius: sidebarItemRadius,
              padding: 2,
              maxHeight: 'calc(100vh - 250px)',
              overflowY: 'auto',
              border: '1px solid rgba(255, 255, 255, 0.4)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', color: darkerText, fontSize: '1rem' }}>
                Recientes
              </Typography>
              <ScheduleIcon sx={{ color: darkerText, opacity: 0.7 }} />
            </Box>

            {/* Mapeo de elementos de historial */}
            <Box sx={{ color: darkerText, '& > *': { mb: 1.5 } }}>
              {historyItems.map((item, index) => (
                <Paper
                  key={index}
                  elevation={0}
                  sx={{
                    backgroundColor: 'rgba(120, 150, 180, 0.5)',
                    borderRadius: sidebarItemRadius,
                    padding: '10px 15px',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    '&:last-child': { mb: 0 },
                    '&:hover': { backgroundColor: 'rgba(120, 150, 180, 0.7)' }
                  }}
                >
                  <Typography variant="body2" sx={{ fontSize: '0.9rem', color: darkerText }}>{item}</Typography>
                </Paper>
              ))}
            </Box>
          </Paper>
        </Box>

        {/* Sección de Ajustes (abajo) */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', pt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SettingsIcon sx={{ color: darkerText, mr: 1 }} />
            <Typography variant="body1" sx={{ color: darkerText, fontWeight: 'bold' }}>Ajustes</Typography>
          </Box>
        </Box>
      </Box>


      {/* --- CHAT AREA: Chat IA --- */}
      <Box sx={{
        flexGrow: 1,
        backgroundColor: chatBg,
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        position: 'relative'
      }}>
        {/* Encabezado del Chat */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Box sx={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#4caf50', mr: 2, display: 'inline-block' }}></Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#9cc2e5', flexGrow: 1 }}>
            Gluco
          </Typography>
          <Avatar sx={{ width: 40, height: 40, bgcolor: '#ffb300' }}>👤</Avatar>
        </Box>

        {/* Mensajes del Chat */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', paddingX: 5 }}>
          {/* User Message (Dark Blue) */}
          <Box sx={{
            alignSelf: 'flex-start',
            width: 'fit-content',
            maxWidth: '50%',
            backgroundColor: '#2c3e50',
            color: 'white',
            borderRadius: chatBubbleRadius,
            padding: 2,
            mb: 2,
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
          }}>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', fontSize: '0.95rem' }}>
              Worem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a, mattis tellus. Sed dignissim, metus nec fringilla accumsan, risus sem sollicitudin lacus, ut interdum tellus elit sed risus. Maecenas eget condimentum velit, sit amet feugiat lectus.
            </Typography>
          </Box>

          {/* AI Response (Light Blue) */}
          <Box sx={{
            alignSelf: 'flex-end',
            width: 'fit-content',
            maxWidth: '50%',
            backgroundColor: '#9cc2e5',
            color: '#333',
            borderRadius: chatBubbleRadius,
            padding: 2,
            mb: 4,
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
          }}>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', fontSize: '0.95rem' }}>
              Worem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a, mattis tellus. Sed dignissim, metus nec fringilla accumsan, risus sem sollicitudin lacus, ut interdum tellus elit sed risus. Maecenas eget condimentum velit, sit amet feugiat lectus.
            </Typography>
          </Box>
        </Box>


        {/* Sección de Sugerencias y Input (abajo) */}
        <Box sx={{ mt: 'auto', mb: 2, px: 5, alignSelf: 'flex-end' }}>
          {/* Sugerencias Rápidas */}
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ color: darkerText, fontWeight: 'bold', mb: 1.5, fontSize: '1rem' }}>
              Sugerencias Rápidas
            </Typography>
            {suggestions.map((suggestion, index) => (
              <Paper
                key={index}
                elevation={0}
                sx={{
                  backgroundColor: 'rgba(156, 194, 229, 0.7)',
                  borderRadius: chatBubbleRadius,
                  padding: '10px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  justifyContent: 'center',
                  mb: 1,
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  '&:last-child': { mb: 0 },
                  '&:hover': { backgroundColor: 'rgba(156, 194, 229, 0.9)' }
                }}
              >
                <Typography variant="body1" sx={{ color: darkerText, mr: 1, fontSize: '0.9rem' }}>
                  {suggestion.text}
                </Typography>
                <Typography variant="body1">{suggestion.icon}</Typography>
              </Paper>
            ))}
          </Box>
        </Box>

        {/* Input de Chat */}
        <Box sx={{ px: 5 }}>
          <TextField
            fullWidth
            placeholder="Escribe tu consulta al Oráculo..."
            variant="outlined"
            size="small"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton sx={{ color: 'rgba(0,0,0,0.5)' }}><PhotoCameraIcon fontSize="small" /></IconButton>
                    <IconButton sx={{ color: 'rgba(0,0,0,0.5)' }}><MicIcon fontSize="small" /></IconButton>
                    <IconButton sx={{ color: 'rgba(0,0,0,0.5)' }}><SendIcon fontSize="small" /></IconButton>
                  </InputAdornment>
                ),
              },
            }}
            sx={{ 
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(156, 194, 229, 0.7)',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                '& fieldset': { border: 'none' },
              },
              '& .MuiInputBase-input': {
                color: darkerText,
              }
            }}
          />
        </Box>

      </Box>
    </Box>
  );
}