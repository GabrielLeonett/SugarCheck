import React from 'react';
import { 
  Card, 
  CardHeader, 
  CardMedia, 
  CardContent, 
  CardActions, 
  Typography 
} from '@mui/material';

export default function CustomCard({
  title,
  subtitle,
  image,
  imageHeight = '140',
  avatar,
  headerAction,
  actions,
  children,
  // Configuraciones de estilo express
  variant = 'elevation', // 'elevation' o 'outlined'
  elevation = 1,         // Intensidad de la sombra (0 a 24)
  bgColor = 'background.paper', // Color de fondo personalizado
  borderColor,           // Color del borde (si usas variant="outlined")
  sx = {},               // Para estilos extra desde afuera
  ...props               // Cualquier otra prop nativa de MUI Card
}) {
  return (
    <Card 
      variant={variant}
      elevation={variant === 'elevation' ? elevation : 0}
      sx={{ 
        maxWidth: 345, 
        bgcolor: bgColor,
        borderRadius: 2,
        ...(variant === 'outlined' && borderColor && { borderColor: borderColor }),
        ...sx // Permite sobrescribir estilos desde el componente padre
      }}
      {...props} // Pasa props nativas (como onClick, component, etc.)
    >
      {/* Renderiza el header solo si hay título, subtítulo o avatar */}
      {(title || subtitle || avatar || headerAction) && (
        <CardHeader
          avatar={avatar}
          action={headerAction}
          title={title}
          subheader={subtitle}
        />
      )}

      {/* Renderiza la imagen solo si se proporciona una URL */}
      {image && (
        <CardMedia
          component="img"
          height={imageHeight}
          image={image}
          alt={title || "card image"}
        />
      )}

      {/* El contenido principal de la tarjeta */}
      {children && (
        <CardContent>
          {typeof children === 'string' ? (
            <Typography variant="body2" color="text.secondary">
              {children}
            </Typography>
          ) : (
            children // Si pasas JSX personalizado, lo renderiza directamente
          )}
        </CardContent>
      )}

      {/* Renderiza las acciones abajo si existen */}
      {actions && (
        <CardActions disableSpacing>
          {actions}
        </CardActions>
      )}
    </Card>
  );
}